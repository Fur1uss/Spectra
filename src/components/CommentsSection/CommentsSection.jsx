import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useComments } from '../../hooks/useComments';
import './CommentsSection.css';

const CommentsSection = ({ caseId }) => {
  const { isLoggedIn, user } = useContext(AuthContext);
  const { comments, loading, error, createComment, updateLikes, updateDislikes, deleteComment } = useComments(caseId);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState(new Set());
  const [dislikedComments, setDislikedComments] = useState(new Set());

  // Manejar envío de comentario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn || !user) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    if (!commentText.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }

    try {
      setSubmitting(true);
      await createComment(caseId, commentText, user.id);
      setCommentText('');
    } catch (err) {
      alert('Error al crear el comentario: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar like
  const handleLike = async (commentId, currentLikes) => {
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    const wasLiked = likedComments.has(commentId);
    // Asegurar que los likes no sean negativos
    const newLikes = wasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
    
    // Actualizar estado local
    if (wasLiked) {
      setLikedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      // Si tenía dislike, también quitarlo
      if (dislikedComments.has(commentId)) {
        setDislikedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }
    } else {
      setLikedComments(prev => new Set(prev).add(commentId));
      // Si tenía dislike, quitarlo
      if (dislikedComments.has(commentId)) {
        setDislikedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }
    }

    try {
      await updateLikes(commentId, newLikes);
    } catch (err) {
      // Revertir cambio si falla
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(commentId);
        } else {
          newSet.delete(commentId);
        }
        return newSet;
      });
      alert('Error al actualizar el like: ' + err.message);
    }
  };

  // Manejar dislike
  const handleDislike = async (commentId, currentDislikes) => {
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para dar dislike');
      return;
    }

    const wasDisliked = dislikedComments.has(commentId);
    // Manejar null correctamente según la estructura de la tabla SQL
    const currentDislikesValue = currentDislikes === null || currentDislikes === undefined ? 0 : currentDislikes;
    // Calcular nuevos dislikes, asegurando que no sean negativos
    const newDislikes = wasDisliked 
      ? Math.max(0, currentDislikesValue - 1) 
      : currentDislikesValue + 1;
    
    // Actualizar estado local
    if (wasDisliked) {
      setDislikedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      // Si tenía like, también quitarlo
      if (likedComments.has(commentId)) {
        setLikedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }
    } else {
      setDislikedComments(prev => new Set(prev).add(commentId));
      // Si tenía like, quitarlo
      if (likedComments.has(commentId)) {
        setLikedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }
    }

    try {
      await updateDislikes(commentId, newDislikes);
    } catch (err) {
      // Revertir cambio si falla
      setDislikedComments(prev => {
        const newSet = new Set(prev);
        if (wasDisliked) {
          newSet.add(commentId);
        } else {
          newSet.delete(commentId);
        }
        return newSet;
      });
      alert('Error al actualizar el dislike: ' + err.message);
    }
  };

  // Manejar eliminación de comentario
  const handleDelete = async (commentId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      await deleteComment(commentId);
    } catch (err) {
      alert('Error al eliminar el comentario: ' + err.message);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Obtener iniciales del usuario
  const getInitials = (user) => {
    if (!user) return '?';
    const firstName = user.first_name || user.username || '';
    const lastName = user.last_name || '';
    const firstInitial = firstName.charAt(0).toUpperCase();
    const secondInitial = lastName.charAt(0).toUpperCase();
    return firstInitial + (secondInitial || '');
  };

  if (loading) {
    return (
      <div className="comments-section">
        <h3>Comentarios</h3>
        <div className="comments-loading">
          <div className="loading-spinner"></div>
          <p>Cargando comentarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <h3>Comentarios</h3>

      {/* Formulario para agregar comentario */}
      {isLoggedIn ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            className="comment-input"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escribe tu comentario..."
            rows="3"
            maxLength={500}
          />
          <div className="comment-form-footer">
            <span className="comment-char-count">{commentText.length}/500</span>
            <button
              type="submit"
              className="btn-submit-comment"
              disabled={submitting || !commentText.trim()}
            >
              {submitting ? 'Publicando...' : 'Comentar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-login-message">
          <p>Inicia sesión para comentar</p>
        </div>
      )}

      {/* Lista de comentarios */}
      {error && (
        <div className="comments-error">
          <p>Error al cargar comentarios: {error}</p>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="comments-empty">
          <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => {
            const isAuthor = user && comment.user_id === user.id;
            const isLiked = likedComments.has(comment.id);
            const isDisliked = dislikedComments.has(comment.id);

            return (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar">
                  <div className="comment-avatar-initials">
                    {getInitials(comment.User)}
                  </div>
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.User?.username || comment.User?.first_name || 'Usuario anónimo'}
                    </span>
                    <span className="comment-date">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="comment-text">{comment.commentText}</p>
                  <div className="comment-actions">
                    <button
                      className={`comment-action ${isLiked ? 'active' : ''}`}
                      onClick={() => handleLike(comment.id, comment.likes || 0)}
                      title="Me gusta"
                    >
                      <span className="icon">👍</span>
                      <span className="count">{comment.likes || 0}</span>
                    </button>
                    <button
                      className={`comment-action ${isDisliked ? 'active' : ''}`}
                      onClick={() => handleDislike(comment.id, comment.dislikes)}
                      title="No me gusta"
                    >
                      <span className="icon">👎</span>
                      <span className="count">{comment.dislikes ?? 0}</span>
                    </button>
                    {isAuthor && (
                      <button
                        className="comment-action comment-delete"
                        onClick={() => handleDelete(comment.id)}
                        title="Eliminar comentario"
                      >
                        <span className="icon">🗑️</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;

