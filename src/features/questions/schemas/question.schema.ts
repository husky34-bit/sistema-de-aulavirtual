import { z } from 'zod';
import { multichoiceSchema } from './multichoice.schema';
import { truefalseSchema } from './truefalse.schema';
import { shortanswerSchema } from './shortanswer.schema';
import { numericalSchema } from './numerical.schema';
import { calculatedSchema } from './calculated.schema';
import { essaySchema } from './essay.schema';
import { matchSchema } from './match.schema';
import { orderingSchema } from './ordering.schema';
import { dragdropSchema } from './dragdrop.schema';
import { gapselectSchema } from './gapselect.schema';

// Enunciado + metadatos comunes a toda pregunta
export const questionBaseSchema = z.object({
  name: z.string().min(1, 'Nombre interno requerido').max(60),
  text: z.string().min(1, 'El enunciado es requerido'),
  defaultScore: z.number().positive().default(1),
  categoryId: z.string().min(1),
});

// Union discriminada: el campo "type" decide qué schema de datos aplica
export const questionDataSchema = z.discriminatedUnion('type', [
  multichoiceSchema,
  truefalseSchema,
  shortanswerSchema,
  numericalSchema,
  calculatedSchema,
  essaySchema,
  matchSchema,
  orderingSchema,
  dragdropSchema,   // cubre ddimageortext, ddmarker, ddwtos
  gapselectSchema,  // cubre gapselect y multianswer (cloze)
]);

export const createQuestionSchema = questionBaseSchema.extend({
  data: questionDataSchema,
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type QuestionData = z.infer<typeof questionDataSchema>;
