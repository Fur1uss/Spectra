import { supabase } from './supabase'

/**
 * Registra un nuevo usuario en Supabase Auth
 * NO crea perfil en tabla User (se crea en primer login)
 * @param {Object} userData - Datos { email, password, username, first_name, last_name, birthday }
 * @returns {Promise<Object>} - Respuesta de signUp
 * @throws {Error}
 */
export const registerUser = async (userData) => {
  try {
    const { email, password, username, first_name, last_name, birthday } = userData

    // Validar que el username no exista en tabla User
    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('id')
      .eq('username', username)

    if (existingUser && existingUser.length > 0) {
      throw new Error('El nombre de usuario ya está en uso')
    }

    // Obtener la URL base para redirección
    const redirectTo = `${window.location.origin}/auth/callback`
    
    // Crear usuario en Supabase Auth (con datos en metadata)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          username: username,
          first_name: first_name,
          last_name: last_name,
          birthday: birthday
        }
      }
    })

    if (authError) {
      console.error('Error en signUp:', authError)
      throw new Error(authError.message || 'Error al crear la cuenta')
    }

    if (!authData.user) {
      console.error('No se creó el usuario:', authData)
      throw new Error('Error al registrar usuario')
    }

    // Verificar si el email se envió
    console.log('Usuario creado:', {
      id: authData.user.id,
      email: authData.user.email,
      emailConfirmed: authData.user.email_confirmed_at,
      redirectTo: redirectTo
    })

    // Retornar info del usuario (sin contraseña)
    return {
      id: authData.user.id,
      email: authData.user.email,
      username: username,
      message: 'Revisa tu correo para confirmar tu cuenta',
      emailSent: !authData.user.email_confirmed_at // Indica si el email necesita confirmación
    }
  } catch (error) {
    throw error
  }
}

/**
 * Realiza login de usuario
 * En PRIMER LOGIN: Crea el perfil en tabla User
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} - Datos del usuario
 * @throws {Error}
 */
export const loginUser = async (email, password) => {
  try {
    // 1. Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      throw new Error(authError.message || 'Email o contraseña incorrectos')
    }

    if (!authData.user) {
      throw new Error('Error al obtener datos del usuario')
    }

    const userId = authData.user.id

    // 2. Verificar si ya existe perfil en tabla User (con manejo silencioso de errores)
    let existingProfile = null
    let profileCheckError = null

    try {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .single()
      
      existingProfile = data
      profileCheckError = error
    } catch (err) {
      // Suprimir errores de red/políticas
      console.debug('Profile check error (expected on first login):', err.message)
      profileCheckError = err
    }

    // Si el perfil ya existe, retornarlo
    if (existingProfile) {
      return existingProfile
    }

    // 3. PRIMER LOGIN: Crear perfil en tabla User
    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      // Código PGRST116 = no rows found = primer login
      const userData = {
        id: userId,
        email: authData.user.email,
        username: authData.user.user_metadata?.username || email.split('@')[0],
        first_name: authData.user.user_metadata?.first_name,
        last_name: authData.user.user_metadata?.last_name,
        birthday: authData.user.user_metadata?.birthday
      }

      try {
        const { data: newProfile, error: createError } = await supabase
          .from('User')
          .insert([userData])
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError.message)
          throw new Error('Error al crear perfil')
        }

        return newProfile
      } catch (err) {
        console.error('Profile creation error:', err.message)
        throw err
      }
    }

    // Otro error
    if (profileCheckError) {
      console.warn('Unexpected profile check error:', profileCheckError.message)
      // Si hay otro error pero el usuario está autenticado, retornar datos de auth
      return {
        id: userId,
        email: authData.user.email,
        username: authData.user.user_metadata?.username || email.split('@')[0],
        first_name: authData.user.user_metadata?.first_name,
        last_name: authData.user.user_metadata?.last_name,
        birthday: authData.user.user_metadata?.birthday
      }
    }
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene el usuario actual autenticado
 * @returns {Promise<Object>} - Datos del usuario actual
 */
export const getCurrentUser = async () => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      throw new Error('No hay usuario autenticado')
    }

    // Obtener perfil desde tabla User
    const { data: userProfile, error: profileError } = await supabase
      .from('User')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.warn('Perfil no encontrado:', profileError)
    }

    const userData = {
      id: authData.user.id,
      email: authData.user.email,
      ...userProfile
    }

    return userData
  } catch (error) {
    throw error
  }
}

/**
 * Realiza logout del usuario
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene un usuario por ID
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<Object>} - Datos del usuario
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

    return user
  } catch (error) {
    throw error
  }
}

/**
 * Limpia completamente toda la sesión: localStorage, sessionStorage y cookies
 * @returns {Object} - {success: boolean, error?: string}
 */
export const clearAllStorage = () => {
  try {
    // Limpiar localStorage
    localStorage.clear()

    // Limpiar sessionStorage
    sessionStorage.clear()

    // Limpiar todas las cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error clearing storage:', error.message)
    return { success: false, error: error.message }
  }
}