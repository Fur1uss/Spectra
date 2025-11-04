import { supabase } from './supabase.js';

// Servicio para manejar los comentarios
export const commentsService = {
  // Obtener todos los comentarios de un caso específico
  async getCommentsByCaseId(caseId) {
    try {
      // Convertir caseId a número si es string
      const caseIdNum = typeof caseId === 'string' ? parseInt(caseId, 10) : caseId;
      
      if (isNaN(caseIdNum)) {
        throw new Error('ID de caso inválido');
      }

      const { data, error } = await supabase
        .from('Comment')
        .select(`
          *,
          User(id, username, first_name, last_name)
        `)
        .eq('caseId', caseIdNum)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Crear un nuevo comentario
  async createComment(caseId, commentText, userId) {
    try {
      if (!commentText || !commentText.trim()) {
        throw new Error('El comentario no puede estar vacío');
      }

      if (!userId) {
        throw new Error('ID de usuario requerido');
      }

      // Convertir caseId a número si es string
      const caseIdNum = typeof caseId === 'string' ? parseInt(caseId, 10) : caseId;
      
      if (isNaN(caseIdNum)) {
        throw new Error('ID de caso inválido');
      }

      // Crear el comentario según la estructura de la tabla SQL
      const { data, error } = await supabase
        .from('Comment')
        .insert([
          {
            caseId: caseIdNum,
            commentText: commentText.trim(),
            user_id: userId,
            likes: 0,
            dislikes: null  // nullable según la tabla SQL
          }
        ])
        .select(`
          *,
          User(id, username, first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  // Actualizar likes de un comentario
  async updateLikes(commentId, likes) {
    try {
      const { data, error } = await supabase
        .from('Comment')
        .update({ likes: likes })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating likes:', error);
      throw error;
    }
  },

  // Actualizar dislikes de un comentario
  async updateDislikes(commentId, dislikes) {
    try {
      // Asegurar que dislikes sea un número válido (no negativo)
      // Si es 0, mantenerlo como 0; si es null/undefined, usar null
      const dislikesValue = dislikes === null || dislikes === undefined 
        ? null 
        : Math.max(0, Number(dislikes));
      
      const { data, error } = await supabase
        .from('Comment')
        .update({ dislikes: dislikesValue })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating dislikes:', error);
      throw error;
    }
  },

  // Eliminar un comentario (solo el autor puede eliminarlo)
  async deleteComment(commentId) {
    try {
      const { error } = await supabase
        .from('Comment')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

