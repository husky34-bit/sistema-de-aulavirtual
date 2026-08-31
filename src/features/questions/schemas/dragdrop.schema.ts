import { z } from 'zod';

// Unifica los 3 tipos drag&drop de Moodle:
// - ddimageortext: arrastrar textos sobre zonas de una imagen
// - ddmarker:      arrastrar marcadores sobre zonas de una imagen
// - ddwtos:        arrastrar textos sobre una imagen de fondo
// La mecánica es idéntica: items que van a zonas definidas por coordenadas.
export const dragdropSchema = z.object({
  type: z.enum(['ddimageortext', 'ddmarker', 'ddwtos']),
  backgroundImageUrl: z.string().min(1, 'Imagen de fondo requerida'),
  zones: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      // rectángulo sobre la imagen, en % para que sea responsive
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
      width: z.number().min(1).max(100),
      height: z.number().min(1).max(100),
    })
  ).min(1, 'Define al menos una zona'),
  items: z.array(
    z.object({
      id: z.string().min(1),
      text: z.string().min(1),
      correctZoneId: z.string().min(1),
    })
  ).min(1, 'Define al menos un elemento arrastrable'),
});
