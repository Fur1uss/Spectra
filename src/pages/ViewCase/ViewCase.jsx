import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import fullpage from 'fullpage.js'
import 'fullpage.js/dist/fullpage.css'
import './ViewCase.css'

const ViewCase = () => {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const fullpageRef = useRef(null)
  const fullpageApiRef = useRef(null)

  useEffect(() => {
    // Datos placeholder - TODO: Fetch from Supabase
    const caseData = {
      id: caseId,
      title: 'Avistamiento OVNI en La Plata',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      caseType: 'OVNI',
      country: 'Argentina',
      region: 'Buenos Aires',
      address: 'La Plata, Buenos Aires',
      latitude: -34.9211,
      longitude: -57.9545,
      images: [
        '/placeholder-image.webp',
        '/placeholder-image.webp',
        '/placeholder-image.webp'
      ],
      videos: [
        { url: 'https://example.com/video.mp4', description: 'Grabación clara del OVNI' }
      ],
      audios: [
        { url: 'https://example.com/audio.mp3', title: 'Audio 1' },
        { url: 'https://example.com/audio.mp3', title: 'Audio 2' }
      ],
      comments: [
        { 
          id: 1,
          author: 'Usuario 1', 
          avatar: '/placeholder-image.webp',
          date: '27/03/2025',
          text: 'Increíble avistamiento! Yo también lo vi ese día. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          likes: 2300,
          replies: 1000
        },
        { 
          id: 2,
          author: 'Usuario 2', 
          avatar: '/placeholder-image.webp',
          date: '26/03/2025',
          text: 'Yo vi algo similar hace años en el mismo lugar. Esto es muy interesante y merece investigación.',
          likes: 1800,
          replies: 650
        },
        { 
          id: 3,
          author: 'Usuario 3', 
          avatar: '/placeholder-image.webp',
          date: '25/03/2025',
          text: 'Tienen más evidencia? Me gustaría analizar este caso. Podemos conectar offline?',
          likes: 950,
          replies: 420
        }
      ]
    }

    // Inicializar fullPage.js solo si no está ya inicializado
    if (fullpageRef.current && !fullpageApiRef.current) {
      fullpageApiRef.current = new fullpage(fullpageRef.current, {
        licenseKey: 'GPL-v3.0', // GPLv3 para proyectos open source
        autoScrolling: true,
        scrollingSpeed: 700,
        fitToSection: true,
        navigation: true,
        navigationPosition: 'bottom', // Bullets en parte inferior
        navigationTooltips: ['Info del Caso', 'Ubicación & Comentarios'],
        keyboardScrolling: true,
        touchSensitivity: 5,
        css3: true,
        verticalCentered: false,
        scrollOverflow: true,
        recordHistory: true,
        orientation: 'sections', // Scroll horizontal (izquierda/derecha)
        responsiveWidth: 768, // En mobile, deshabilitar fullPage
        afterLoad: (origin, destination, direction, trigger) => {
          console.log('Loaded section:', destination.index)
        },
        onLeave: (origin, destination, direction, trigger) => {
          console.log('Leaving section:', origin.index)
        }
      })
    }

    return () => {
      if (fullpageApiRef.current) {
        fullpageApiRef.current.destroy('all')
        fullpageApiRef.current = null
      }
    }
  }, [caseId])

  return (
    <div id="fullpage" ref={fullpageRef}>
      {/* Botón de volver */}
      <button className="btn-back" onClick={() => navigate('/hub')}>
        ← Volver
      </button>

      {/* SECCIÓN 1: Información del Caso */}
      <div className="section">
        <div className="view-case-content">
          <div className="column column-left">
            <h1 className="case-title">Avistamiento OVNI en La Plata</h1>
            
            <div className="description-section">
              <h2>Descripción</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>

            <div className="audios-section">
              <div className="audios-container">
                <div className="audio-item">
                  <div className="cassette-icon">🎙️</div>
                  <span>Audio 1</span>
                </div>
                <div className="audio-item">
                  <div className="cassette-icon">🎙️</div>
                  <span>Audio 2</span>
                </div>
              </div>
            </div>
          </div>

          <div className="column column-right">
            <div className="images-section">
              <h3>Imágenes</h3>
              <div className="images-gallery">
                <div className="image-polaroid">
                  <img src="/placeholder-image.webp" alt="Imagen 1" />
                </div>
                <div className="image-polaroid">
                  <img src="/placeholder-image.webp" alt="Imagen 2" />
                </div>
                <div className="image-polaroid">
                  <img src="/placeholder-image.webp" alt="Imagen 3" />
                </div>
              </div>
            </div>

            <div className="video-section">
              <h3>Video</h3>
              <p className="video-description">Grabación clara del OVNI</p>
              <button className="btn-see-video">Ver Video</button>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Ubicación y Comentarios */}
      <div className="section">
        <div className="view-case-content">
          <div className="column column-left">
            <div className="case-type-section">
              <h3>Tipo de Caso</h3>
            </div>

            <div className="location-section">
              <h3>Ubicación</h3>
              <div className="map-container">
                <div className="map-placeholder">
                  Mapa - Lat: -34.9211, Lng: -57.9545
                </div>
              </div>
            </div>
          </div>

          <div className="column column-right">
            <div className="comments-section">
              <h3>Comentarios</h3>
              <div className="comments-list">
                {[
                  { 
                    id: 1,
                    author: 'Usuario 1', 
                    avatar: '/placeholder-image.webp',
                    date: '27/03/2025',
                    text: 'Increíble avistamiento! Yo también lo vi ese día. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                    likes: 2300,
                    replies: 1000
                  },
                  { 
                    id: 2,
                    author: 'Usuario 2', 
                    avatar: '/placeholder-image.webp',
                    date: '26/03/2025',
                    text: 'Yo vi algo similar hace años en el mismo lugar. Esto es muy interesante y merece investigación.',
                    likes: 1800,
                    replies: 650
                  },
                  { 
                    id: 3,
                    author: 'Usuario 3', 
                    avatar: '/placeholder-image.webp',
                    date: '25/03/2025',
                    text: 'Tienen más evidencia? Me gustaría analizar este caso. Podemos conectar offline?',
                    likes: 950,
                    replies: 420
                  }
                ].map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar">
                      <img src={comment.avatar} alt={comment.author} />
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">@{comment.author}</span>
                        <span className="comment-date">{comment.date}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      <div className="comment-actions">
                        <button className="comment-action like">
                          <span className="icon">👍</span>
                          <span className="count">{(comment.likes / 1000).toFixed(1)}k</span>
                        </button>
                        <button className="comment-action reply">
                          <span className="icon">💬</span>
                          <span className="count">{(comment.replies / 1000).toFixed(1)}k</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-add-comment">Comentar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewCase
