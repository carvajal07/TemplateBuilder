/**
 * Universal Template Builder - Type Definitions
 *
 * Este archivo contiene todas las definiciones de tipos TypeScript
 * para el sistema de construcción de plantillas.
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export enum ElementType {
  // Texto
  TEXT = 'text',
  TITLE = 'title',
  SUBTITLE = 'subtitle',
  PARAGRAPH = 'paragraph',
  HTML_TEXT = 'html_text',
  PLACEHOLDER = 'placeholder',

  // Imágenes
  IMAGE = 'image',
  LOGO = 'logo',
  ICON = 'icon',

  // Layout
  CONTAINER = 'container',
  COLUMNS = 'columns',
  SECTION = 'section',
  BOX = 'box',
  HR = 'hr',
  TABLE = 'table',
  GRID = 'grid',

  // Formas
  RECTANGLE = 'rectangle',
  LINE = 'line',
  CIRCLE = 'circle',
  PATH = 'path',

  // Especiales
  QR_CODE = 'qr_code',
  BARCODE = 'barcode',
  SIGNATURE = 'signature',
  DYNAMIC_FIELD = 'dynamic_field',
  REUSABLE_BLOCK = 'reusable_block',
  BUTTON = 'button',
  CHART = 'chart',
}

export enum TemplateType {
  PDF = 'pdf',
  EMAIL = 'email',
}

export enum TextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

export enum VerticalAlign {
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom',
}

export enum FontWeight {
  NORMAL = 'normal',
  BOLD = 'bold',
  LIGHTER = 'lighter',
  BOLDER = 'bolder',
}

export enum FontStyle {
  NORMAL = 'normal',
  ITALIC = 'italic',
  OBLIQUE = 'oblique',
}

export enum BarcodeType {
  QR = 'QR',
  EAN8 = 'EAN8',
  EAN13 = 'EAN13',
  EAN128 = 'EAN128',
  CODE39 = 'Code39',
  CODE128 = 'Code128',
}

export enum ChartType {
  BAR = 'Bar',
  LINE = 'Line',
  PIE = 'Pie',
  AREA = 'Area',
}

export enum ImageFit {
  FILL = 'fill',
  CONTAIN = 'contain',
  COVER = 'cover',
  NONE = 'none',
  SCALE_DOWN = 'scale-down',
}

export enum BorderStyle {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  DOUBLE = 'double',
  NONE = 'none',
}

// ============================================================================
// INTERFACES BASE
// ============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Spacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Border {
  width: number;
  style: BorderStyle;
  color: string;
  radius?: number;
}

export interface Shadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface Transform {
  rotation: number;
  scaleX: number;
  scaleY: number;
  skewX?: number;
  skewY?: number;
}

// ============================================================================
// PROPIEDADES DE ELEMENTOS
// ============================================================================

export interface BaseElementProperties {
  id: string;
  type: ElementType;
  name: string;
  position: Position;
  size: Size;
  transform?: Transform;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  parentId?: string;
  children?: string[];
}

export interface TextProperties extends BaseElementProperties {
  type: ElementType.TEXT | ElementType.TITLE | ElementType.SUBTITLE | ElementType.PARAGRAPH;
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  color: string;
  textAlign: TextAlign;
  verticalAlign?: VerticalAlign;
  lineHeight: number;
  letterSpacing: number;
  textDecoration?: 'none' | 'underline' | 'line-through';
  padding?: Spacing;
  backgroundColor?: string;
  border?: Border;
}

export interface PlaceholderProperties extends BaseElementProperties {
  type: ElementType.PLACEHOLDER;
  variableName: string;
  defaultValue?: string;
  format?: string;
  fontFamily: string;
  fontSize: number;
  color: string;
}

export interface ImageProperties extends BaseElementProperties {
  type: ElementType.IMAGE | ElementType.LOGO | ElementType.ICON;
  src: string;
  alt?: string;
  fit: ImageFit;
  border?: Border;
  shadow?: Shadow;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    grayscale?: number;
    blur?: number;
  };
}

export interface ContainerProperties extends BaseElementProperties {
  type: ElementType.CONTAINER | ElementType.SECTION | ElementType.BOX;
  backgroundColor?: string;
  backgroundImage?: string;
  padding: Spacing;
  margin?: Spacing;
  border?: Border;
  shadow?: Shadow;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
}

export interface ColumnsProperties extends BaseElementProperties {
  type: ElementType.COLUMNS;
  columnCount: number;
  gap: number;
  backgroundColor?: string;
  padding?: Spacing;
}

export interface TableProperties extends BaseElementProperties {
  type: ElementType.TABLE;
  rows: number;
  columns: number;
  cells: TableCell[][];
  borderCollapse: boolean;
  cellSpacing: number;
  cellPadding: number;
  border?: Border;
  headerRow?: boolean;
  alternateRowColor?: string;
}

export interface TableCell {
  id: string;
  content: string;
  colspan?: number;
  rowspan?: number;
  backgroundColor?: string;
  textAlign?: TextAlign;
  verticalAlign?: VerticalAlign;
  padding?: Spacing;
  border?: Border;
}

export interface ShapeProperties extends BaseElementProperties {
  type: ElementType.RECTANGLE | ElementType.CIRCLE | ElementType.LINE;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: BorderStyle;
}

export interface PathProperties extends BaseElementProperties {
  type: ElementType.PATH;
  pathData: string; // SVG path data
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface BarcodeProperties extends BaseElementProperties {
  type: ElementType.QR_CODE | ElementType.BARCODE;
  barcodeType: BarcodeType;
  data: string;
  variableId?: string;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  foregroundColor?: string;
  backgroundColor?: string;
}

export interface ChartProperties extends BaseElementProperties {
  type: ElementType.CHART;
  chartType: ChartType;
  title?: string;
  data: ChartData;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

export interface ButtonProperties extends BaseElementProperties {
  type: ElementType.BUTTON;
  text: string;
  href?: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: FontWeight;
  padding: Spacing;
  border?: Border;
  borderRadius: number;
}

// Union type de todas las propiedades
export type ElementProperties =
  | TextProperties
  | PlaceholderProperties
  | ImageProperties
  | ContainerProperties
  | ColumnsProperties
  | TableProperties
  | ShapeProperties
  | PathProperties
  | BarcodeProperties
  | ChartProperties
  | ButtonProperties;

// ============================================================================
// CANVAS Y EDITOR
// ============================================================================

export interface CanvasElement {
  id: string;
  type: ElementType;
  properties: ElementProperties;
}

export interface CanvasState {
  elements: CanvasElement[];
  selectedIds: string[];
  hoveredId: string | null;
  zoom: number;
  offset: Position;
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  guides: Guide[];
  mode: 'select' | 'pan' | 'draw';
}

export interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color?: string;
}

export interface Guideline {
  type: 'vertical' | 'horizontal';
  position: number;
}

export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================================
// TEMPLATE
// ============================================================================

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: TemplateType;
  pageSize?: PageSize;
  content: CanvasElement[];
  variables: Variable[];
  styles: StyleDefinition[];
  metadata: TemplateMetadata;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  tags?: string[];
}

export interface PageSize {
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'in';
  name?: 'A4' | 'Letter' | 'Legal' | 'Custom';
}

export interface Variable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  defaultValue?: any;
  description?: string;
  required?: boolean;
  validation?: ValidationRule;
}

export interface ValidationRule {
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  enum?: any[];
}

export interface StyleDefinition {
  id: string;
  name: string;
  type: 'text' | 'paragraph' | 'border' | 'color' | 'font';
  properties: Record<string, any>;
}

export interface TemplateMetadata {
  author?: string;
  version: string;
  category?: string;
  thumbnailUrl?: string;
  previewUrls?: string[];
}

// ============================================================================
// HISTORY Y UNDO/REDO
// ============================================================================

export interface HistoryState {
  past: HistoryAction[];
  future: HistoryAction[];
  maxHistory: number;
}

export interface HistoryAction {
  id: string;
  type: 'add' | 'update' | 'delete' | 'move' | 'resize' | 'rotate' | 'group' | 'ungroup';
  timestamp: Date;
  elementIds: string[];
  before: any;
  after: any;
}

// ============================================================================
// LAYERS
// ============================================================================

export interface LayerNode {
  id: string;
  name: string;
  type: ElementType;
  visible: boolean;
  locked: boolean;
  children: LayerNode[];
  icon?: string;
  level: number;
}

// ============================================================================
// TOOLBOX
// ============================================================================

export interface ToolboxCategory {
  id: string;
  name: string;
  icon: string;
  items: ToolboxItem[];
  collapsed: boolean;
}

export interface ToolboxItem {
  id: string;
  type: ElementType;
  name: string;
  icon: string;
  preview?: string;
  defaultProperties: Partial<ElementProperties>;
}

// ============================================================================
// ASSETS
// ============================================================================

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'font' | 'icon' | 'template';
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// RENDER OPTIONS
// ============================================================================

export interface RenderOptions {
  format: 'pdf' | 'html' | 'png' | 'jpeg';
  quality?: number;
  dpi?: number;
  includeBleed?: boolean;
  cropMarks?: boolean;
  colorProfile?: 'RGB' | 'CMYK';
}

export interface RenderResult {
  success: boolean;
  data?: Blob | string;
  error?: string;
  metadata?: {
    pageCount?: number;
    fileSize?: number;
    renderTime?: number;
  };
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TemplateFilters {
  type?: TemplateType;
  search?: string;
  tags?: string[];
  ownerId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// COLLABORATION
// ============================================================================

export interface CollaborationSession {
  id: string;
  templateId: string;
  users: CollaborationUser[];
  startedAt: Date;
}

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: Position;
  selectedIds?: string[];
}

export interface CollaborationChange {
  id: string;
  userId: string;
  type: 'add' | 'update' | 'delete' | 'move';
  elementId: string;
  data: any;
  timestamp: Date;
}

// ============================================================================
// WEBSOCKET EVENTS
// ============================================================================

export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface JoinTemplateEvent {
  templateId: string;
  userId: string;
}

export interface TemplateChangeEvent {
  templateId: string;
  change: CollaborationChange;
}

export interface CursorMoveEvent {
  userId: string;
  position: Position;
}

// ============================================================================
// USER & AUTH
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportConfig {
  format: 'pdf' | 'html' | 'xml' | 'json';
  includeAssets: boolean;
  compressImages: boolean;
  embedFonts: boolean;
}

export interface ImportConfig {
  format: 'xml' | 'json';
  preserveIds: boolean;
  mergeWithExisting: boolean;
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// PREFERENCES
// ============================================================================

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  autoSave: boolean;
  autoSaveInterval: number;
  gridSize: number;
  snapToGrid: boolean;
  showRulers: boolean;
  showGuides: boolean;
  units: 'px' | 'mm' | 'in';
}

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_PAGE_SIZES: Record<string, PageSize> = {
  A4: { width: 210, height: 297, unit: 'mm', name: 'A4' },
  Letter: { width: 8.5, height: 11, unit: 'in', name: 'Letter' },
  Legal: { width: 8.5, height: 14, unit: 'in', name: 'Legal' },
  Email: { width: 600, height: 800, unit: 'px', name: 'Custom' },
};

export const DEFAULT_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
];

export const SAFE_EMAIL_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
];
