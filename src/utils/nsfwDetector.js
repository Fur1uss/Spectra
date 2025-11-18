import * as nsfwjs from 'nsfwjs';

let model = null;
let loadingPromise = null;

/**
 * Carga el modelo NSFW.js de forma lazy
 * @returns {Promise<nsfwjs.NSFWJS>}
 */
const loadModel = async () => {
  if (model) {
    return model;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      // Cargar modelo (usa el modelo por defecto que es más rápido)
      // El modelo se descarga automáticamente la primera vez
      model = await nsfwjs.load();
      return model;
    } catch (error) {
      console.error('Error loading NSFW model:', error);
      throw new Error('No se pudo cargar el modelo de detección NSFW');
    }
  })();

  return loadingPromise;
};

/**
 * Analiza una imagen para detectar contenido NSFW
 * @param {File|HTMLImageElement|HTMLCanvasElement} image - Imagen a analizar
 * @returns {Promise<{isNSFW: boolean, predictions: Array, confidence: number}>}
 */
export const analyzeImage = async (image) => {
  try {
    // Cargar modelo si no está cargado
    const nsfwModel = await loadModel();

    // Convertir File a HTMLImageElement si es necesario
    let imageElement;
    
    if (image instanceof File) {
      imageElement = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(image);
      });
    } else if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
      imageElement = image;
    } else {
      throw new Error('Formato de imagen no soportado');
    }

    // Clasificar la imagen
    const predictions = await nsfwModel.classify(imageElement);

    // Categorías NSFW
    const nsfwCategories = ['Porn', 'Hentai', 'Sexy'];
    
    // Encontrar la categoría con mayor probabilidad
    const topPrediction = predictions.reduce((max, pred) => 
      pred.probability > max.probability ? pred : max
    , predictions[0]);

    // Calcular probabilidad total de contenido NSFW
    const nsfwProbability = predictions
      .filter(pred => nsfwCategories.includes(pred.className))
      .reduce((sum, pred) => sum + pred.probability, 0);

    // Considerar NSFW si:
    // 1. La probabilidad total de NSFW es > 0.5 (50%)
    // 2. O la categoría más probable es NSFW y tiene > 0.4 (40%)
    const isNSFW = nsfwProbability > 0.5 || 
                   (nsfwCategories.includes(topPrediction.className) && topPrediction.probability > 0.4);

    // Limpiar URL del objeto si se creó
    if (image instanceof File && imageElement.src.startsWith('blob:')) {
      URL.revokeObjectURL(imageElement.src);
    }

    return {
      isNSFW,
      predictions,
      confidence: topPrediction.probability,
      category: topPrediction.className,
      nsfwProbability
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    // En caso de error, por seguridad consideramos NSFW
    return {
      isNSFW: true,
      predictions: [],
      confidence: 0,
      category: 'Error',
      nsfwProbability: 1,
      error: error.message
    };
  }
};

/**
 * Verifica si un archivo es una imagen
 * @param {File} file - Archivo a verificar
 * @returns {boolean}
 */
export const isImageFile = (file) => {
  return file.type.startsWith('image/');
};

