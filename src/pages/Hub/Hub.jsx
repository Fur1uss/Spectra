import React, { useState } from "react";
import { FaVideo, FaImage, FaMusic } from "react-icons/fa";
import "./Hub.css";

const Hub = () => {
    const [showFilters, setShowFilters] = useState(false);

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    return(
        <div className="hub-page-container">
            <div className="hub-navegation-container">
                <div className="navegation-searching-filters-container">
                    <h3 className="search-title">Buscador</h3>
                    <div className="search-container">
                        <input 
                            type="text" 
                            placeholder="Buscar casos..." 
                            className="search-input"
                        />
                        <button 
                            className="filter-button" 
                            onClick={toggleFilters}
                        >
                            FILTRAR
                        </button>
                        <div className={`filter-dropdown ${showFilters ? 'show' : ''}`}>
                            <div className="filter-option">
                                <input type="checkbox" id="video-filter" />
                                <label htmlFor="video-filter">Video</label>
                            </div>
                            <div className="filter-option">
                                <input type="checkbox" id="image-filter" />
                                <label htmlFor="image-filter">Imagen</label>
                            </div>
                            <div className="filter-option">
                                <input type="checkbox" id="audio-filter" />
                                <label htmlFor="audio-filter">Audio</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="navegation-text-case-type-container"></div>
            </div>
            <div className="hub-content-display">
                <div className="hub-grid-container">
                    <div className="hub-box hub-box-1">
                        Box 1
                        <div className="hub-box-badges">
                            <div className="hub-badge">
                                <FaVideo className="hub-badge-icon" />
                                <span>Video</span>
                            </div>
                            <div className="hub-badge">
                                <FaImage className="hub-badge-icon" />
                                <span>Imagen</span>
                            </div>
                        </div>
                        <button className="hub-box-button">INVESTIGAR</button>
                    </div>
                    <div className="hub-box hub-box-2">
                        Box 2
                        <div className="hub-box-badges">
                            <div className="hub-badge">
                                <FaMusic className="hub-badge-icon" />
                                <span>Audio</span>
                            </div>
                        </div>
                        <button className="hub-box-button">INVESTIGAR</button>
                    </div>
                    <div className="hub-box hub-box-3">
                        Box 3
                        <div className="hub-box-badges">
                            <div className="hub-badge">
                                <FaVideo className="hub-badge-icon" />
                                <span>Video</span>
                            </div>
                        </div>
                        <button className="hub-box-button">INVESTIGAR</button>
                    </div>
                    <div className="hub-box hub-box-4">
                        Box 4
                        <div className="hub-box-badges">
                            <div className="hub-badge">
                                <FaImage className="hub-badge-icon" />
                                <span>Imagen</span>
                            </div>
                            <div className="hub-badge">
                                <FaMusic className="hub-badge-icon" />
                                <span>Audio</span>
                            </div>
                        </div>
                        <button className="hub-box-button">INVESTIGAR</button>
                    </div>
                    <div className="hub-box hub-box-5">
                        Box 5
                        <div className="hub-box-badges">
                            <div className="hub-badge">
                                <FaVideo className="hub-badge-icon" />
                                <span>Video</span>
                            </div>
                            <div className="hub-badge">
                                <FaImage className="hub-badge-icon" />
                                <span>Imagen</span>
                            </div>
                            <div className="hub-badge">
                                <FaMusic className="hub-badge-icon" />
                                <span>Audio</span>
                            </div>
                        </div>
                        <button className="hub-box-button">INVESTIGAR</button>
                    </div>
                    <div className="hub-box hub-box-6">
                        Box 6
                        <div className="hub-box-badges">
                            <div className="hub-badge">
                                <FaImage className="hub-badge-icon" />
                                <span>Imagen</span>
                            </div>
                        </div>
                        <button className="hub-box-button">INVESTIGAR</button>
                    </div>
                </div>
            </div>
            <div className="hub-navegator-display">
                <div className="hub-pagination-dots">
                    <div className="hub-dot active"></div>
                    <div className="hub-dot"></div>
                    <div className="hub-dot"></div>
                </div>
                <div className="hub-pagination-number">
                    <span>01-23</span>
                </div>
            </div>
        </div>
    )
}

export default Hub;
