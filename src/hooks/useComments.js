import { useState, useEffect, useCallback } from 'react';
import { commentsService } from '../utils/commentsService.js';

export const useComments = (caseId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar comentarios
  const loadComments = useCallback(async () => {
    if (!caseId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await commentsService.getCommentsByCaseId(caseId);
      setComments(data || []);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  // Crear comentario
  const createComment = useCallback(async (caseIdParam, commentText, userId) => {
    try {
      setError(null);
      
      // Validaciones
      if (!commentText || !commentText.trim()) {
        throw new Error('El comentario no puede estar vacío');
      }
      
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }
      
      // Usar el caseId del parámetro o el del hook
      const targetCaseId = caseIdParam || caseId;
      
      if (!targetCaseId) {
        throw new Error('ID de caso requerido');
      }
      
      const newComment = await commentsService.createComment(targetCaseId, commentText, userId);
      setComments(prev => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      console.error('Error creating comment:', err);
      setError(err.message);
      throw err;
    }
  }, [caseId]);

  // Actualizar likes
  const updateLikes = useCallback(async (commentId, newLikes) => {
    try {
      await commentsService.updateLikes(commentId, newLikes);
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId ? { ...comment, likes: newLikes } : comment
        )
      );
    } catch (err) {
      console.error('Error updating likes:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Actualizar dislikes
  const updateDislikes = useCallback(async (commentId, newDislikes) => {
    try {
      await commentsService.updateDislikes(commentId, newDislikes);
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId ? { ...comment, dislikes: newDislikes } : comment
        )
      );
    } catch (err) {
      console.error('Error updating dislikes:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Eliminar comentario
  const deleteComment = useCallback(async (commentId) => {
    try {
      await commentsService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Cargar comentarios al montar o cambiar caseId
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    loading,
    error,
    createComment,
    updateLikes,
    updateDislikes,
    deleteComment,
    refetch: loadComments
  };
};

