import React from 'react';
import { Link } from 'react-router-dom';
import './LandingFooter.css';

const LandingFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-separator"></div>
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">SPECTRA</h3>
          <p className="footer-description">
            La plataforma número #1 en contenido paranormal
          </p>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-subtitle">NAVEGACIÓN</h4>
          <ul className="footer-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/hub">Hub</Link></li>
            <li><Link to="/upload">Subir Caso</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} SPECTRA. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;

