import React, { createContext, useState, useEffect, useCallback } from 'react';
import { clearAllStorage } from '../utils/auth.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función para cargar el estado de autenticación
    const loadAuthState = useCallback(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsLoggedIn(true);
            } catch (err) {
                console.error('Error parsing stored user:', err);
                setIsLoggedIn(false);
                setUser(null);
            }
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
        setLoading(false);
    }, []);

    // Cargar estado inicial
    useEffect(() => {
        loadAuthState();
    }, [loadAuthState]);

    // Escuchar cambios en localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            loadAuthState();
        };

        // Escuchar evento personalizado
        window.addEventListener('sessionChange', handleStorageChange);
        // También escuchar cambios de storage
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('sessionChange', handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadAuthState]);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userData.id);
        setUser(userData);
        setIsLoggedIn(true);
        window.dispatchEvent(new Event('sessionChange'));
    };

    const logout = () => {
        // Limpiar todo: localStorage, sessionStorage y cookies
        clearAllStorage();
        
        setUser(null);
        setIsLoggedIn(false);
        window.dispatchEvent(new Event('sessionChange'));
        
        // Recargar la página después de logout para asegurar limpieza completa
        setTimeout(() => {
            window.location.href = '/';
        }, 300);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout, loadAuthState }}>
            {children}
        </AuthContext.Provider>
    );
};
