import React, { useState, useCallback } from 'react';
import { FaPlus, FaTrash, FaVideo, FaImage, FaMusic } from 'react-icons/fa';
import NSFWAnalysisModal from '../NSFWAnalysisModal/NSFWAnalysisModal';
import { analyzeImage, isImageFile } from '../../utils/nsfwDetector';
import './FileUploader.css';

const FileUploader = ({ onFilesChange, initialFiles = [], errors = {} }) => {
  const [files, setFiles] = useState(initialFiles);
  const [analysisModal, setAnalysisModal] = useState({
    isOpen: false,
    status: 'analyzing', // 'analyzing' | 'safe' | 'nsfw' | 'error'
    fileName: ''
  });

  // Obtener tipo de archivo por extensión
  const getFileTypeFromExtension = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
    
    if (imageTypes.includes(extension)) return 'image';
    if (videoTypes.includes(extension)) return 'video';
    if (audioTypes.includes(extension)) return 'audio';
    return 'unknown';
  };

  // Analizar imagen con NSFW.js
  const analyzeFileForNSFW = useCallback(async (file) => {
    // Solo analizar imágenes
    if (!isImageFile(file)) {
      return { isNSFW: false, skip: true };
    }

    try {
      const result = await analyzeImage(file);
      return result;
    } catch (error) {
      console.error('Error en análisis NSFW:', error);
      return { isNSFW: true, error: error.message };
    }
  }, []);

  // Procesar un archivo individual
  const processFile = useCallback(async (file) => {
    const fileType = getFileTypeFromExtension(file.name);
    
    // Si es imagen, analizar con NSFW.js
    if (fileType === 'image') {
      // Mostrar modal de análisis
      setAnalysisModal({
        isOpen: true,
        status: 'analyzing',
        fileName: file.name
      });

      // Analizar imagen
      const analysisResult = await analyzeFileForNSFW(file);

      if (analysisResult.skip) {
        // No es imagen o no se puede analizar, agregar directamente
        const newFile = {
          id: Date.now() + Math.random(),
          file,
          type: fileType,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        };
        setFiles(prev => [...prev, newFile]);
        setAnalysisModal({ isOpen: false, status: 'analyzing', fileName: '' });
      } else {
        // Mostrar resultados en consola
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📸 ANÁLISIS NSFW: ${file.name}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Mostrar porcentajes de cada categoría
        if (analysisResult.predictions && analysisResult.predictions.length > 0) {
          console.log('\n📊 Porcentajes por categoría:');
          analysisResult.predictions.forEach(pred => {
            const percentage = (pred.probability * 100).toFixed(2);
            const bar = '█'.repeat(Math.floor(pred.probability * 20));
            const category = pred.className.padEnd(10);
            console.log(`  ${category}: ${percentage.padStart(6)}% ${bar}`);
          });
        }
        
        // Calcular porcentaje de aceptación (100% - NSFW%)
        const nsfwPercentage = (analysisResult.nsfwProbability * 100).toFixed(2);
        const acceptancePercentage = ((1 - analysisResult.nsfwProbability) * 100).toFixed(2);
        
        console.log('\n📈 Resumen:');
        console.log(`  NSFW Total:     ${nsfwPercentage}%`);
        console.log(`  Aceptación:     ${acceptancePercentage}%`);
        console.log(`  Categoría Top:  ${analysisResult.category} (${(analysisResult.confidence * 100).toFixed(2)}%)`);
        
        if (analysisResult.isNSFW) {
          // Contenido NSFW detectado
          console.log('\n❌ RESULTADO: RECHAZADO (Contenido NSFW detectado)');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          
          setAnalysisModal({
            isOpen: true,
            status: 'nsfw',
            fileName: file.name
          });
          
          // Esperar 3 segundos antes de cerrar y procesar siguiente
          await new Promise(resolve => setTimeout(resolve, 3000));
          setAnalysisModal({ isOpen: false, status: 'analyzing', fileName: '' });
          
          // NO agregar el archivo
        } else {
          // Imagen segura
          console.log('\n✅ RESULTADO: APROBADO (Contenido seguro)');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          
          setAnalysisModal({
            isOpen: true,
            status: 'safe',
            fileName: file.name
          });

          // Esperar 2 segundos para mostrar mensaje de éxito
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Agregar archivo
          const newFile = {
            id: Date.now() + Math.random(),
            file,
            type: fileType,
            preview: URL.createObjectURL(file),
            name: file.name,
            size: file.size
          };
          setFiles(prev => [...prev, newFile]);
          setAnalysisModal({ isOpen: false, status: 'analyzing', fileName: '' });
        }
      }
    } else {
      // No es imagen, agregar directamente (videos, audios)
      const newFile = {
        id: Date.now() + Math.random(),
        file,
        type: fileType,
        preview: fileType === 'video' || fileType === 'audio' 
          ? URL.createObjectURL(file) 
          : null,
        name: file.name,
        size: file.size
      };
      setFiles(prev => [...prev, newFile]);
    }
  }, [analyzeFileForNSFW]);

  // Manejar selección de archivos
  const handleFileSelect = useCallback(async (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    if (selectedFiles.length === 0) return;

    // Procesar archivos secuencialmente
    for (const file of selectedFiles) {
      await processFile(file);
    }

    // Limpiar input
    event.target.value = '';
  }, [processFile]);

  // Eliminar archivo
  const handleRemoveFile = useCallback((fileId) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== fileId);
      onFilesChange(updatedFiles);
      return updatedFiles;
    });
  }, [onFilesChange]);

  // Notificar cambios al componente padre
  React.useEffect(() => {
    onFilesChange(files);
  }, [files, onFilesChange]);

  // Obtener icono según tipo de archivo
  const getFileIcon = (file) => {
    if (file.type === 'video') return <FaVideo className="file-icon video" />;
    if (file.type === 'audio') return <FaMusic className="file-icon audio" />;
    if (file.type === 'image') return <FaImage className="file-icon image" />;
    return <FaMusic className="file-icon unknown" />;
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-uploader">
      <div className="file-uploader-header">
        <h3>Archivos Multimedia</h3>
        <p>Selecciona archivos - el tipo se detecta automáticamente</p>
      </div>

      {/* Input de archivos */}
      <div className="file-input-container">
        <input
          type="file"
          id="file-input"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        <label htmlFor="file-input" className="file-input-label">
          <FaPlus className="add-icon" />
          <span>Seleccionar Archivos</span>
        </label>
      </div>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="files-list">
          <h4>Archivos Seleccionados ({files.length})</h4>
          <div className="files-grid">
            {files.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-preview">
                  {file.type === 'image' && (
                    <img src={file.preview} alt={file.name} />
                  )}
                  {file.type === 'video' && (
                    <video src={file.preview} controls />
                  )}
                  {file.type === 'audio' && (
                    <div className="audio-preview">
                      <FaMusic className="audio-icon" />
                      <audio src={file.preview} controls />
                    </div>
                  )}
                  {file.type === 'unknown' && (
                    <div className="unknown-preview">
                      {getFileIcon(file)}
                      <span>Tipo desconocido</span>
                    </div>
                  )}
                </div>

                <div className="file-info">
                  <div className="file-name" title={file.name}>
                    {file.name}
                  </div>
                  <div className="file-size">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="file-type">
                    <span className={`type-badge ${file.type}`}>
                      {getFileIcon(file)}
                      {file.type}
                    </span>
                  </div>
                </div>

                <button
                  className="remove-file-btn"
                  onClick={() => handleRemoveFile(file.id)}
                  title="Eliminar archivo"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errores */}
      {errors.files && (
        <div className="error-message">{errors.files}</div>
      )}

      {/* Modal de análisis NSFW */}
      <NSFWAnalysisModal
        isOpen={analysisModal.isOpen}
        status={analysisModal.status}
        fileName={analysisModal.fileName}
      />
    </div>
  );
};

export default FileUploader;