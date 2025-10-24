import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

/**
 * Hashea una contraseña con salt
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Contraseña hasheada
 */
export const hashPassword = async (password) => {
  const saltRounds = 10 // Número de rounds para generar el salt (más alto = más seguro pero más lento)
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verifica una contraseña contra su hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado en la BD
 * @returns {Promise<boolean>} - True si la contraseña es correcta
 */
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

/**
 * Realiza login de usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<Object>} - Datos del usuario si es exitoso
 * @throws {Error} - Si las credenciales son inválidas
 */
export const loginUser = async (username, password) => {
  try {
    // Buscar usuario por username
    const { data: users, error: fetchError } = await supabase
      .from('User')
      .select('*')
      .eq('username', username)

    if (fetchError || !users || users.length === 0) {
      throw new Error('Usuario o contraseña incorrectos')
    }

    const user = users[0]

    // Verificar contraseña
    const isPasswordValid = await verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      throw new Error('Usuario o contraseña incorrectos')
    }

    // Retornar datos del usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    throw error
  }
}

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario { username, password, email, first_name, last_name, birthday }
 * @returns {Promise<Object>} - Datos del usuario creado
 * @throws {Error} - Si el usuario ya existe o hay error en la creación
 */
export const registerUser = async (userData) => {
  try {
    const { username, password, email, first_name, last_name, birthday } = userData

    // Validar que el usuario no exista
    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('id')
      .eq('username', username)

    if (existingUser && existingUser.length > 0) {
      throw new Error('El nombre de usuario ya está en uso')
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password)

    // Crear usuario
    const { data: newUser, error: createError } = await supabase
      .from('User')
      .insert([
        {
          username,
          password: hashedPassword,
          email,
          first_name,
          last_name,
          birthday,
        },
      ])
      .select()
      .single()

    if (createError) {
      throw new Error(createError.message)
    }

    // Retornar sin la contraseña
    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene un usuario por ID
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} - Datos del usuario sin contraseña
 */
export const getUserById = async (userId) => {
  try {
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      throw new Error('Usuario no encontrado')
    }

    // Retornar sin contraseña
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    throw error
  }
}
