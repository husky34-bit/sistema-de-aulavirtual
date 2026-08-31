// Respuesta del estudiante: su forma depende del tipo de pregunta
export type QuestionResponse =
  | { kind: 'choice'; selected: number[] }        // multichoice (índices)
  | { kind: 'boolean'; value: boolean }           // truefalse
  | { kind: 'text'; value: string }               // shortanswer, gapselect parcial
  | { kind: 'number'; value: number }             // numerical, calculated
  | { kind: 'essay'; value: string }              // essay (no auto-calificable)
  | { kind: 'pairs'; assignments: Record<number, number> } // match: izquierda → derecha
  | { kind: 'order'; positions: number[] }        // ordering: orden elegido
  | { kind: 'zones'; placements: Record<string, string[]> } // dragdrop: zona → items
  | { kind: 'gaps'; answers: Record<number, string> };      // cloze: hueco → respuesta

export interface GradeResult {
  fraction: number;           // 0..1
  score: number;              // fraction * defaultScore
  correct: boolean;           // fraction === 1
  feedback?: string;          // retroalimentación automática
  needsManualGrading: boolean; // true para essay
}

export interface GraderContext {
  // Para calculated: valores de variables asignados a este intento
  datasetValues?: Record<string, number>;
}
