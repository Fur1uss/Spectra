import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/LoginForm/LoginForm';
import './LoginPage.css';

const LoginPage = () => {
    return(
        <div className='login-page-container'>
            <Link to="/" className='btn-volver'>← Volver</Link>
            <div className='login-content-container'>
                <div className='login-logo-container'>
                    <img src="/completeLogo.png" alt="Logo" />
                </div>
                <div className='login-form-container'> 
                    <LoginForm />
                </div>
                <div className='login-buttons-container'>
                    <p className='login-text-register'>¿No tienes una <br /> cuenta?</p>
                    <p className='login-register-button'><Link to="/registration">Registrarme</Link></p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;