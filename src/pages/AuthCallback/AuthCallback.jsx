import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { AuthContext } from '../../context/AuthContext';
import './AuthCallback.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [status, setStatus] = useState('Verificando...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener los tokens del hash de la URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        // Si hay un error, mostrarlo
        if (error) {
          setStatus(`Error: ${errorDescription || error}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Si hay tokens, establecer la sesión
        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            throw new Error(sessionError.message);
          }

          if (sessionData?.user) {
            // Obtener el email del usuario autenticado
            const email = sessionData.user.email;
            
            // Intentar hacer login para crear el perfil si es necesario
            try {
              // Obtener la contraseña del usuario (no la tenemos, pero podemos usar el token)
              // En este caso, el usuario ya está autenticado, solo necesitamos crear el perfil
              const userId = sessionData.user.id;
              
              // Verificar si existe perfil
              const { data: existingProfile } = await supabase
                .from('User')
                .select('*')
                .eq('id', userId)
                .single();

              if (existingProfile) {
                // Perfil existe, hacer login
                login(existingProfile);
                setStatus('¡Cuenta verificada! Redirigiendo...');
                setTimeout(() => navigate('/hub'), 1500);
              } else {
                // Crear perfil con datos de metadata
                const userData = {
                  id: userId,
                  email: sessionData.user.email,
                  username: sessionData.user.user_metadata?.username || email.split('@')[0],
                  first_name: sessionData.user.user_metadata?.first_name,
                  last_name: sessionData.user.user_metadata?.last_name,
                  birthday: sessionData.user.user_metadata?.birthday
                };

                const { data: newProfile, error: createError } = await supabase
                  .from('User')
                  .insert([userData])
                  .select()
                  .single();

                if (createError) {
                  throw new Error('Error al crear perfil');
                }

                login(newProfile);
                setStatus('¡Cuenta verificada! Redirigiendo...');
                setTimeout(() => navigate('/hub'), 1500);
              }
            } catch (err) {
              console.error('Error processing user:', err);
              setStatus('Error al procesar usuario. Redirigiendo al login...');
              setTimeout(() => navigate('/login'), 3000);
            }
          }
        } else {
          // No hay tokens, redirigir al login
          setStatus('No se encontraron tokens de autenticación');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (error) {
        console.error('Error en callback:', error);
        setStatus(`Error: ${error.message}`);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, login]);

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-content">
        <div className="auth-callback-spinner"></div>
        <p className="auth-callback-status">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallback;

