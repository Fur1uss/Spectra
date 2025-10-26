import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import "./NavBar.css"

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Ocultar NavBar en la página de upload y en la vista de caso
    if (location.pathname === '/upload' || location.pathname.startsWith('/case/')) {
        return null;
    }

    const handleUploadCase = () => {
        navigate('/upload');
        setIsMenuOpen(false);
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setIsMenuOpen(false);
    };

    const handleNavClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav>
            <Link to="/" onClick={handleNavClick}>
                <img src="/logoletras.webp" alt="Spectra" />
            </Link>
            
            <button className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <span></span>
                <span></span>
                <span></span>
            </button>

            <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                {!isLoggedIn && <li><Link to="/" onClick={handleNavClick}>Home</Link></li>}
                <li><Link to="/hub" onClick={handleNavClick}>Casos</Link></li>
                {isLoggedIn ? (
                    <>
                        <li><button className="btn-upload-case" onClick={handleUploadCase}><b>SUBIR CASO</b></button></li>
                        <li><button className="btn-profile-icon" onClick={handleProfileClick}>
                            <img src="/ghost.webp" alt="Perfil" />
                        </button></li>
                    </>
                ) : (
                    <li><Link to="/login" onClick={handleNavClick}><b>Ingresar</b></Link></li>
                )}
            </ul>
        </nav>
    );
}   


export default NavBar;