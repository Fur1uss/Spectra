import React, { useState, useCallback } from 'react';
import { FaPlus, FaTrash, FaVideo, FaImage, FaMusic } from 'react-icons/fa';
import './FileUploader.css';

const FileUploader = ({ onFilesChange, initialFiles = [], errors = {} }) => {
  const [files, setFiles] = useState(initialFiles);

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

  // Manejar selección de archivos
  const handleFileSelect = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files);
    
    if (selectedFiles.length === 0) return;

    // Crear objetos de archivo con preview y tipo automático
    const newFiles = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: getFileTypeFromExtension(file.name),
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Limpiar input
    event.target.value = '';
  }, []);

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
    </div>
  );
};

export default FileUploader;