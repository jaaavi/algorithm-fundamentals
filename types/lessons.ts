// ─── Content block types ──────────────────────────────────────────────────────

export type BlockType =
  | 'texto'
  | 'subtitulo'
  | 'alerta'
  | 'codigo'
  | 'lista'
  | 'lista-numerada'
  | 'tabla'
  | 'formula'
  | 'comparacion'
  | 'tip'
  | 'error-frecuente'
  | 'ejemplo'
  | 'visualizacion';

export type AlertLevel = 'info' | 'warning' | 'tip' | 'danger' | 'success';

export interface TextoBlock      { tipo: 'texto';            contenido: string }
export interface SubtituloBlock  { tipo: 'subtitulo';        contenido: string; nivel?: 2 | 3 }
export interface AlertaBlock     { tipo: 'alerta';           nivel: AlertLevel; titulo?: string; contenido: string }
export interface CodigoBlock     { tipo: 'codigo';           titulo?: string; lenguaje: string; contenido: string; explicacion?: string }
export interface ListaBlock      { tipo: 'lista';            items: string[] }
export interface ListaNumBlock   { tipo: 'lista-numerada';   items: string[] }
export interface TablaBlock      { tipo: 'tabla';            cabeceras: string[]; filas: string[][] }
export interface FormulaBlock    { tipo: 'formula';          contenido: string; explicacion?: string }
export interface ComparacionBlock { tipo: 'comparacion';     lado1: { titulo: string; items: string[] }; lado2: { titulo: string; items: string[] } }
export interface TipBlock        { tipo: 'tip';              titulo?: string; contenido: string }
export interface ErrorBlock      { tipo: 'error-frecuente'; titulo: string; malo: string; bien: string; explicacion: string }
export interface EjemploBlock      { tipo: 'ejemplo';       titulo: string; bloques: ContentBlock[] }
export interface VisualizacionBlock { tipo: 'visualizacion'; vizId: string; titulo?: string }

export type ContentBlock =
  | TextoBlock | SubtituloBlock | AlertaBlock | CodigoBlock
  | ListaBlock | ListaNumBlock  | TablaBlock  | FormulaBlock
  | ComparacionBlock | TipBlock | ErrorBlock  | EjemploBlock
  | VisualizacionBlock;

// ─── Section ──────────────────────────────────────────────────────────────────

export type SectionTipo = 'intro' | 'concepto' | 'ejemplo' | 'errores' | 'resumen' | 'tests';

export interface LessonSection {
  id:      string;
  titulo:  string;
  tipo:    SectionTipo;
  icono?:  string;           // emoji
  bloques: ContentBlock[];
}

// ─── Full lesson ──────────────────────────────────────────────────────────────

export interface Lesson {
  id:           number;
  titulo:       string;
  subtitulo:    string;
  descripcion:  string;
  color:        string;     // Tailwind gradient classes
  icono:        string;     // emoji
  topicKey:     string;     // matches question topicKey prefix
  duracion:     string;     // e.g. "45 min"
  sections:     LessonSection[];
}
