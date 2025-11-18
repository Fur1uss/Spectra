import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { casesService } from '../../utils/casesService.js';
import { useNavigate } from 'react-router-dom';
import './FeaturedCasesCarousel.css';

const FeaturedCasesCarousel = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      align: 'center',
      slidesToScroll: 1,
      dragFree: true,
      containScroll: 'trimSnaps'
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  // Cargar casos desde la base de datos
  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      // Cargar casos para el carrusel
      const result = await casesService.getCases(1, 20, {});
      const loadedCases = result.cases || [];
      setCases(loadedCases);
    } catch (error) {
      console.error('Error loading cases:', error);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // Obtener imagen principal del caso
  const getCaseImage = (caseData) => {
    if (!caseData.Files || caseData.Files.length === 0) {
      return null;
    }
    
    // Buscar imagen primero
    const image = caseData.Files.find(file => file.type_multimedia === 'image');
    if (image) return image.url;
    
    // Si no hay imagen, buscar video
    const video = caseData.Files.find(file => file.type_multimedia === 'video');
    if (video) return video.url;
    
    return null;
  };

  // Obtener icono según tipo de caso
  const getCaseIcon = (caseTypeName) => {
    if (!caseTypeName) return '🔮';
    const type = caseTypeName.toLowerCase();
    if (type.includes('ovni') || type.includes('ufo') || type.includes('ufología') || type.includes('ufologia')) {
      return '🛸';
    }
    if (type.includes('fantasma') || type.includes('ghost') || type.includes('parapsicología') || type.includes('parapsicologia')) {
      return '👻';
    }
    if (type.includes('cripto') || type.includes('cryptid') || type.includes('criptozoología') || type.includes('criptozoologia')) {
      return '💀';
    }
    return '🔮';
  };

  // Truncar y formatear descripción para mostrar en líneas
  const formatDescription = (text, maxLength = 120) => {
    if (!text) return ['Sin descripción disponible'];
    
    // Limpiar saltos de línea múltiples y espacios
    const cleaned = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (cleaned.length <= maxLength) {
      // Dividir en palabras y crear líneas de máximo 40 caracteres
      const words = cleaned.split(' ');
      const lines = [];
      let currentLine = '';
      
      words.forEach(word => {
        if ((currentLine + word).length <= 40) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
      
      return lines.slice(0, 4); // Máximo 4 líneas
    }
    
    // Si es muy largo, truncar y dividir
    const truncated = cleaned.substring(0, maxLength);
    const words = truncated.split(' ');
    words.pop(); // Quitar última palabra parcial
    const finalText = words.join(' ') + '...';
    
    // Dividir en líneas
    const lines = [];
    const finalWords = finalText.split(' ');
    let currentLine = '';
    
    finalWords.forEach(word => {
      if ((currentLine + word).length <= 40) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    return lines.slice(0, 4);
  };

  // Formatear nombre del tipo de caso
  const formatCaseType = (caseTypeName) => {
    if (!caseTypeName) return 'MYSTERY';
    return caseTypeName.toUpperCase();
  };

  if (loading) {
    return (
      <section className="featured-cases-section">
        <div className="featured-cases-loading">
          <div className="loading-spinner"></div>
          <p>Cargando casos...</p>
        </div>
      </section>
    );
  }

  if (cases.length === 0) {
    return null;
  }

  return (
    <section className="featured-cases-section">
      {/* Título Principal */}
      <div className="featured-cases-title-container">
        <h1 className="featured-cases-title">
          <span className="title-line">LA PLATAFORMA</span>
          <span className="title-line">NÚMERO #1 EN CONTENIDO</span>
          <span className="title-line title-paranormal">
            P<span className="glitch-a">A</span>R<span className="glitch-a">A</span>N<span className="glitch-o">O</span>RM<span className="glitch-a">A</span>L
          </span>
        </h1>
      </div>

      {/* Carrusel */}
      <div className="featured-cases-carousel-wrapper">
        {/* Gradientes de fade en los bordes */}
        <div className="carousel-fade-left"></div>
        <div className="carousel-fade-right"></div>

        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {cases.map((caseData) => {
              const imageUrl = getCaseImage(caseData);
              const icon = getCaseIcon(caseData.Case_Type?.nombre_Caso);
              const caseType = formatCaseType(caseData.Case_Type?.nombre_Caso);

              return (
                <div className="embla__slide" key={caseData.id}>
                  <div className="featured-case-card">
                    <div className="case-card-title">{caseData.caseName || 'SIN TÍTULO'}</div>
                    
                    <div className="case-card-image-container">
                      {imageUrl ? (
                        <>
                          <img 
                            src={imageUrl} 
                            alt={caseData.caseName || caseData.description?.substring(0, 50) || 'Caso paranormal'}
                            className="case-card-image"
                            loading="lazy"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentElement.querySelector('.case-card-image-placeholder');
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="case-card-image-placeholder" style={{ display: 'none' }}>
                            <span className="placeholder-icon">🔮</span>
                          </div>
                        </>
                      ) : (
                        <div className="case-card-image-placeholder">
                          <span className="placeholder-icon">🔮</span>
                        </div>
                      )}
                    </div>

                    <div className="case-card-description">
                      {formatDescription(caseData.description).map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </div>

                    <button 
                      className="case-card-button"
                      onClick={() => navigate(`/case/${caseData.id}`)}
                    >
                      <span className="button-icon">{icon}</span>
                      <span className="button-text">{caseType}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCasesCarousel;

