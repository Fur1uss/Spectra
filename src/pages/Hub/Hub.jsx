import React, { useState } from "react";
import { FaVideo, FaImage, FaMusic, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import TextPressure from "../../components/TextPressure/TextPressure";
import { useCases } from "../../hooks/useCases";
import "./Hub.css";

const Hub = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    
    const navigate = useNavigate();
    const { 
        cases, 
        loading, 
        error, 
        pagination, 
        caseTypes,
        searchCases, 
        applyFilters, 
        nextPage, 
        prevPage,
        goToPage
    } = useCases(1, 6);

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            searchCases(searchTerm.trim());
        } else {
            applyFilters({ search: '', type: selectedType });
        }
    };

    const handleTypeFilter = (type) => {
        const newType = selectedType === type ? '' : type;
        setSelectedType(newType);
        applyFilters({ type: newType, search: searchTerm });
    };

    const handleCaseClick = (caseId) => {
        navigate(`/case/${caseId}`);
    };

    const getTypeIcon = (typeName) => {
        const type = typeName?.toLowerCase();
        switch (type) {
            case 'video': return <FaVideo className="hub-badge-icon" />;
            case 'image': return <FaImage className="hub-badge-icon" />;
            case 'audio': return <FaMusic className="hub-badge-icon" />;
            default: return <FaVideo className="hub-badge-icon" />;
        }
    };

    // Texto dinámico para el encabezado de tipo
    const displayedTypeText = selectedType
        ? (caseTypes.find(t => t.id.toString() === selectedType)?.nombre_Caso || 'TODOS')
        : 'TODOS'

    return(
        <div className="hub-page-container">
            <div className="hub-navegation-container">
                <div className="navegation-searching-filters-container">
                    <h3 className="search-title">Buscador</h3>
                    <form className="search-container" onSubmit={handleSearch}>
                        <input 
                            type="text" 
                            placeholder="Buscar casos..." 
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button 
                            type="button"
                            className="filter-button" 
                            onClick={toggleFilters}
                        >
                            FILTRAR
                        </button>
                        <div className={`filter-dropdown ${showFilters ? 'show' : ''}`}>
                            {caseTypes.map((type) => (
                                <div key={type.id} className="filter-option">
                                    <input 
                                        type="checkbox" 
                                        id={`${type.nombre_Caso}-filter`}
                                        checked={selectedType === type.id.toString()}
                                        onChange={() => handleTypeFilter(type.id.toString())}
                                    />
                                    <label htmlFor={`${type.nombre_Caso}-filter`}>{type.nombre_Caso}</label>
                                </div>
                            ))}
                        </div>
                    </form>
                </div>
                <div className="navegation-text-case-type-container">
                    <TextPressure
                        text={displayedTypeText.toUpperCase()}
                        width={true}
                        weight={true}
                        italic={false}
                        alpha={false}
                        stroke={false}
                        flex={true}
                        textColor="var(--accent-color)"
                        minFontSize={16}
                    />
                </div>
            </div>
            <div className="hub-content-display">
                <button 
                    className="hub-nav-button hub-nav-left"
                    onClick={prevPage}
                    disabled={!pagination.hasPrevPage}
                >
                    <FaChevronLeft />
                </button>
                
                {loading ? (
                    <div className="hub-grid-container">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div 
                                key={`skeleton-${index}`} 
                                className={`hub-box hub-box-${index + 1} hub-box-skeleton`}
                                aria-hidden="true"
                            >
                                <div className="hub-skeleton-shimmer"></div>
                                <div className="hub-skel-title"></div>
                                <div className="hub-skel-badges">
                                    <div className="hub-skel-badge"></div>
                                    <div className="hub-skel-badge" style={{ width: '110px' }}></div>
                                    <div className="hub-skel-badge" style={{ width: '90px' }}></div>
                                </div>
                                <div className="hub-skel-button"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="hub-error">
                        <p>Error: {error}</p>
                    </div>
                ) : (
                    <div className="hub-grid-container">
                        {cases.map((caseItem, index) => {
                            const coverImage = (caseItem?.Files || []).find(f => f.type_multimedia === 'image')
                            const coverUrl = coverImage?.url || ''
                            const hasCover = Boolean(coverUrl)
                            // Primera imagen visible tiene prioridad alta, resto lazy loading
                            const isFirstVisible = index < 3
                            return (
                            <div 
                                key={caseItem.id} 
                                className={`hub-box hub-box-${index + 1}`}
                                onClick={() => handleCaseClick(caseItem.id)}
                            >
                                {hasCover && (
                                    <div className="hub-box-bg">
                                        <img
                                            src={coverUrl}
                                            alt=""
                                            className="hub-box-bg-img"
                                            aria-hidden="true"
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                            loading={isFirstVisible ? "eager" : "lazy"}
                                            fetchPriority={isFirstVisible ? "high" : "auto"}
                                            width="800"
                                            height="450"
                                            decoding="async"
                                            onError={(e) => {
                                                // Si la imagen falla al cargar, ocultarla
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="hub-box-title">{caseItem.caseName || 'Sin nombre'}</div>
                                <div className="hub-box-badges">
                                    <div className="hub-badge">
                                        {getTypeIcon(caseItem.Case_Type?.nombre_Caso)}
                                        <span>{caseItem.Case_Type?.nombre_Caso || 'Sin tipo'}</span>
                                    </div>
                                    {caseItem.Location?.address && (
                                        <div className="hub-badge">
                                            <span>📍 {caseItem.Location.address}</span>
                                        </div>
                                    )}
                                    {caseItem.Files && caseItem.Files.length > 0 && (
                                        <div className="hub-badge">
                                            <span>📎 {caseItem.Files.length} archivo(s)</span>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    className="hub-box-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCaseClick(caseItem.id);
                                    }}
                                >
                                    INVESTIGAR
                                </button>
                            </div>
                        )})}
                        
                        {/* Rellenar espacios vacíos si hay menos de 6 casos */}
                        {Array.from({ length: Math.max(0, 6 - cases.length) }).map((_, index) => (
                            <div 
                                key={`empty-${index}`} 
                                className={`hub-box hub-box-${cases.length + index + 1} hub-box-empty`}
                            >
                                <div className="hub-box-empty-content">
                                    <p>No hay más casos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <button 
                    className="hub-nav-button hub-nav-right"
                    onClick={nextPage}
                    disabled={!pagination.hasNextPage}
                >
                    <FaChevronRight />
                </button>
            </div>
            <div className="hub-navegator-display">
                <div className="hub-pagination-dots">
                    {Array.from({ length: pagination.totalPages || 1 }).map((_, index) => (
                        <button
                            key={`dot-${index}`}
                            type="button"
                            className={`hub-dot ${pagination.currentPage === (index + 1) ? 'active' : ''}`}
                            onClick={() => goToPage(index + 1)}
                            aria-label={`Ir a la página ${index + 1}`}
                        />
                    ))}
                </div>
                <div className="hub-pagination-number">
                    <span>
                        {String(pagination.currentPage || 1).padStart(2, '0')}-
                        {String(pagination.totalPages || 1).padStart(2, '0')}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Hub;
