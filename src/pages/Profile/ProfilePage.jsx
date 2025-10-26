import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase.js";
import { logoutUser, clearAllStorage } from "../../utils/auth.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import "./ProfilePage.css";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (!storedUser) {
                    navigate('/login');
                    return;
                }

                const userData = JSON.parse(storedUser);
                
                // Obtener datos actualizados del usuario desde Supabase
                const { data, error } = await supabase
                    .from('user')
                    .select('*')
                    .eq('id', userData.id);

                if (error) throw error;
                if (data && data.length > 0) {
                    setUser(data[0]);
                } else {
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            // Suprimir errores de Supabase
            const originalWarn = console.warn;
            const originalError = console.error;
            console.warn = () => {};
            console.error = () => {};

            // Logout de Supabase Auth
            await logoutUser();

            // Limpiar todo: localStorage, sessionStorage y cookies
            clearAllStorage();

            // Restaurar console
            console.warn = originalWarn;
            console.error = originalError;

            // Limpiar contexto (esto también redirige a /)
            logout();
        } catch (error) {
            console.error('Error during logout:', error);
            // Aún así limpia el contexto local
            clearAllStorage();
            logout();
        }
    };

    const handleBackHome = () => {
        navigate('/');
    };

    if (loading) {
        return <div className="profile-page-container"><div className="loading">Cargando...</div></div>;
    }

    if (!user) {
        return <div className="profile-page-container"><div className="loading">No se pudo cargar el perfil</div></div>;
    }

    return (
        <div className="profile-page-container">
            <button className="btn-volver-top" onClick={handleBackHome}>←</button>

            <div className="profile-left-panel">
                <div className="profile-avatar-container">
                    <img src="/ghost.webp" alt="avatar" className="avatar" />
                    <div className="avatar-glow"></div>
                </div>
                <h1 className="username">{user.username}</h1>
                <p className="member-since">Miembro desde {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : "—"}</p>
            </div>

            <div className="profile-right-panel">
                <div className="profile-field">
                    <label>Nombre</label>
                    <span>{user.first_name || "—"}</span>
                </div>
                <div className="profile-field">
                    <label>Apellido</label>
                    <span>{user.last_name || "—"}</span>
                </div>
                <div className="profile-field">
                    <label>Email</label>
                    <span>{user.email}</span>
                </div>
                <div className="profile-field">
                    <label>Fecha de Nacimiento</label>
                    <span>{user.birthday ? new Date(user.birthday).toLocaleDateString('es-ES') : "—"}</span>
                </div>
            </div>

            <button className="btn-logout" onClick={handleLogout}>CERRAR SESIÓN</button>
        </div>
    );
};

export default ProfilePage;
