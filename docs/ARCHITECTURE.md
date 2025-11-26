# 🏗️ Universal Template Builder - Arquitectura Completa

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes Principales](#componentes-principales)
4. [Flujo de Datos](#flujo-de-datos)
5. [Stack Tecnológico](#stack-tecnológico)
6. [Módulos del Sistema](#módulos-del-sistema)
7. [APIs y Comunicación](#apis-y-comunicación)
8. [Esquema XML](#esquema-xml)
9. [Motor de Renderizado](#motor-de-renderizado)
10. [Seguridad](#seguridad)

---

## 🎯 Visión General

**Universal Template Builder** es un sistema web avanzado tipo "Drag & Drop Editor" para crear plantillas de PDF y Email marketing de forma visual e intuitiva.

### Características Principales

- ✅ Editor visual drag & drop
- ✅ Canvas interactivo con zoom, rotación y alineación
- ✅ Sistema de capas jerárquico
- ✅ Propiedades dinámicas por objeto
- ✅ Variables y placeholders dinámicos
- ✅ Renderizado PDF de alta calidad
- ✅ Renderizado HTML para email marketing
- ✅ Sistema de versiones
- ✅ Colaboración en tiempo real
- ✅ Biblioteca de assets y componentes reutilizables
- ✅ Importación/Exportación XML
- ✅ Vista previa en vivo
- ✅ Historial ilimitado (Undo/Redo)

---

## 🏛️ Arquitectura del Sistema

### Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React + Vite + MUI                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │   Toolbox    │  │    Canvas    │  │  Properties  │    │ │
│  │  │   Sidebar    │  │   Editor     │  │    Panel     │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │ Layers Tree  │  │   Preview    │  │  Toolbar     │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  State Management (Zustand)                 │ │
│  │  - Template State    - History State    - UI State         │ │
│  │  - Canvas State      - Assets State     - Collaboration    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND LAYER                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    FastAPI + Python                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │  REST APIs   │  │  WebSocket   │  │    Auth      │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Business Logic Layer                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │ XML Parser   │  │ Validator    │  │  Processor   │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Rendering Engines                        │ │
│  │  ┌──────────────┐           ┌──────────────┐              │ │
│  │  │  PDF Engine  │           │ Email Engine │              │ │
│  │  │  (ReportLab) │           │ (HTML/MJML)  │              │ │
│  │  └──────────────┘           └──────────────┘              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL + SQLAlchemy ORM                    │ │
│  │  - Users        - Templates      - Assets                   │ │
│  │  - Versions     - History        - Permissions              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Redis (Cache + Real-time Sessions)             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              S3/MinIO (Asset Storage)                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes Principales

### 1. Frontend Components

#### 1.1 Toolbox (Barra Lateral Izquierda)

```typescript
interface ToolboxCategory {
  id: string;
  name: string;
  icon: string;
  items: ToolboxItem[];
  collapsed: boolean;
}

interface ToolboxItem {
  id: string;
  type: ElementType;
  name: string;
  icon: string;
  preview: string;
  defaultProps: ElementProperties;
}

Categories:
- Text (Título, Subtítulo, Párrafo, HTML, Placeholder)
- Images (Upload, URL, Logo, Icons)
- Layout (Container, Columns, Section, Box, HR, Table, Grid)
- Shapes (Rectangle, Line, Circle, HR)
- Special (QR, Barcode, Signature, Dynamic Fields, Blocks)
- Buttons (Solo para Email)
- Styles (Colors, Fonts, Backgrounds, Borders)
```

#### 1.2 Canvas (Lienzo Principal)

```typescript
interface CanvasState {
  elements: CanvasElement[];
  selectedIds: string[];
  zoom: number;
  offset: { x: number; y: number };
  gridEnabled: boolean;
  snapToGrid: boolean;
  guides: Guide[];
  mode: 'pdf' | 'email';
  pageSize: PageSize;
}

interface CanvasElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  rotation: number;
  properties: ElementProperties;
  locked: boolean;
  visible: boolean;
  children?: CanvasElement[];
  parentId?: string;
}

Features:
- Drag & Drop desde Toolbox
- Selección múltiple (Ctrl/Cmd + Click)
- Transformación (resize, rotate, move)
- Alineación con guías inteligentes
- Zoom (10% - 500%)
- Grid y Snap
- Shortcuts (Ctrl+C, Ctrl+V, Ctrl+Z, etc.)
```

#### 1.3 Properties Panel (Panel de Propiedades)

```typescript
interface PropertiesPanel {
  selectedElement: CanvasElement | null;
  tabs: PropertiesTab[];
  currentTab: string;
}

interface PropertiesTab {
  id: string;
  name: string;
  sections: PropertySection[];
}

interface PropertySection {
  id: string;
  title: string;
  fields: PropertyField[];
}

Tabs:
- General (Size, Position, Rotation, Opacity)
- Style (Colors, Borders, Shadows, Background)
- Text (Font, Size, Weight, Alignment, Spacing)
- Layout (Padding, Margin, Columns)
- Advanced (Z-index, Blend mode, Filters)
- Data (Variables, Conditions, Dynamic content)
```

#### 1.4 Layers Tree (Árbol de Capas)

```typescript
interface LayersTree {
  root: LayerNode[];
  selectedIds: string[];
  expandedIds: string[];
}

interface LayerNode {
  id: string;
  name: string;
  type: ElementType;
  visible: boolean;
  locked: boolean;
  children: LayerNode[];
  icon: string;
}

Features:
- Vista jerárquica de elementos
- Drag & drop para reorganizar
- Renombrar elementos
- Toggle visibility/lock
- Búsqueda de capas
```

---

### 2. Backend Services

#### 2.1 Template Service

```python
class TemplateService:
    """Gestión de plantillas"""

    async def create_template(template_data: TemplateCreate) -> Template
    async def get_template(template_id: str) -> Template
    async def update_template(template_id: str, data: TemplateUpdate) -> Template
    async def delete_template(template_id: str) -> bool
    async def list_templates(filters: TemplateFilters) -> List[Template]
    async def duplicate_template(template_id: str) -> Template
    async def import_template(xml_data: str) -> Template
    async def export_template(template_id: str) -> str
```

#### 2.2 Rendering Service

```python
class RenderingService:
    """Motor de renderizado"""

    # PDF Rendering
    async def render_pdf(
        template_id: str,
        data: Dict[str, Any],
        options: RenderOptions
    ) -> bytes

    # Email Rendering
    async def render_email(
        template_id: str,
        data: Dict[str, Any],
        options: RenderOptions
    ) -> str

    # Preview
    async def generate_preview(
        template_id: str,
        format: str = 'png'
    ) -> bytes
```

#### 2.3 XML Service

```python
class XMLService:
    """Parser y generador XML"""

    async def parse_xml(xml_string: str) -> TemplateSchema
    async def generate_xml(template: Template) -> str
    async def validate_xml(xml_string: str) -> ValidationResult
    async def transform_xml(xml_string: str, xslt: str) -> str
```

#### 2.4 Asset Service

```python
class AssetService:
    """Gestión de assets (imágenes, fuentes, etc)"""

    async def upload_asset(file: UploadFile, type: AssetType) -> Asset
    async def get_asset(asset_id: str) -> Asset
    async def delete_asset(asset_id: str) -> bool
    async def list_assets(filters: AssetFilters) -> List[Asset]
```

#### 2.5 Collaboration Service

```python
class CollaborationService:
    """Colaboración en tiempo real"""

    async def join_session(template_id: str, user_id: str) -> Session
    async def leave_session(session_id: str, user_id: str) -> bool
    async def broadcast_change(session_id: str, change: Change) -> None
    async def get_active_users(template_id: str) -> List[User]
```

---

## 📊 Flujo de Datos

### Flujo de Creación de Plantilla

```
1. Usuario arrastra elemento desde Toolbox
   ↓
2. Canvas captura evento onDrop
   ↓
3. Se crea nuevo CanvasElement con ID único
   ↓
4. Store (Zustand) actualiza estado
   ↓
5. Canvas re-renderiza con nuevo elemento
   ↓
6. AutoSave envía cambios al backend (debounced)
   ↓
7. Backend actualiza base de datos
   ↓
8. WebSocket notifica a otros usuarios (si hay)
```

### Flujo de Renderizado PDF

```
1. Usuario hace click en "Export PDF"
   ↓
2. Frontend envía template + data al backend
   ↓
3. Backend parsea el template JSON a XML
   ↓
4. XML Parser genera estructura de objetos
   ↓
5. PDF Renderer procesa cada elemento:
   - Page → Crea página PDF
   - FlowArea → Crea área de texto
   - ImageObject → Inserta imagen
   - Table → Crea tabla
   - Barcode → Genera código QR/Barras
   ↓
6. ReportLab genera PDF binario
   ↓
7. Backend devuelve PDF al frontend
   ↓
8. Frontend descarga archivo
```

### Flujo de Renderizado Email

```
1. Usuario hace click en "Export Email HTML"
   ↓
2. Frontend envía template + data al backend
   ↓
3. Backend procesa template y genera HTML
   ↓
4. Email Renderer aplica transformaciones:
   - Inline CSS
   - Table-based layout
   - Safe fonts
   - Max-width 600px
   - Responsive media queries
   ↓
5. Valida compatibilidad con email clients
   ↓
6. Retorna HTML + Plain text version
   ↓
7. Frontend muestra preview o descarga
```

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3+ | Framework UI |
| Vite | 5.x | Build tool |
| Material-UI | 5.x | Component library |
| Zustand | 4.x | State management |
| React DnD | 16.x | Drag & Drop |
| Fabric.js | 5.x | Canvas manipulation |
| React Query | 5.x | Data fetching |
| Axios | 1.x | HTTP client |
| Socket.io Client | 4.x | WebSocket |
| React Router | 6.x | Routing |
| Zod | 3.x | Validation |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.11+ | Language |
| FastAPI | 0.110+ | Web framework |
| SQLAlchemy | 2.x | ORM |
| PostgreSQL | 15+ | Database |
| Redis | 7.x | Cache + Sessions |
| ReportLab | 4.x | PDF generation |
| Pillow | 10.x | Image processing |
| qrcode | 7.x | QR code generation |
| python-barcode | 0.15+ | Barcode generation |
| lxml | 5.x | XML processing |
| Pydantic | 2.x | Data validation |
| python-socketio | 5.x | WebSocket |
| boto3 | 1.x | S3/MinIO |
| Celery | 5.x | Background tasks |

### DevOps

| Tecnología | Propósito |
|------------|-----------|
| Docker | Containerización |
| Docker Compose | Orquestación local |
| Nginx | Reverse proxy |
| GitHub Actions | CI/CD |
| Prometheus | Monitoring |
| Grafana | Dashboards |

---

## 🔧 Módulos del Sistema

### 1. Editor Module (Frontend)

```typescript
// src/modules/editor/

EditorCanvas.tsx          // Canvas principal
ElementRenderer.tsx       // Renderiza cada tipo de elemento
SelectionHandler.tsx      // Manejo de selección
TransformControls.tsx     // Controles de transformación
GridOverlay.tsx           // Grid y guías
ZoomControls.tsx          // Controles de zoom
```

### 2. Toolbox Module (Frontend)

```typescript
// src/modules/toolbox/

ToolboxPanel.tsx          // Panel principal
CategoryList.tsx          // Lista de categorías
ElementItem.tsx           // Item arrastrable
ElementPreview.tsx        // Preview del elemento
```

### 3. Properties Module (Frontend)

```typescript
// src/modules/properties/

PropertiesPanel.tsx       // Panel principal
PropertyGroup.tsx         // Grupo de propiedades
TextProperties.tsx        // Propiedades de texto
ImageProperties.tsx       // Propiedades de imagen
LayoutProperties.tsx      // Propiedades de layout
StyleProperties.tsx       // Propiedades de estilo
DataProperties.tsx        // Propiedades de datos
```

### 4. Layers Module (Frontend)

```typescript
// src/modules/layers/

LayersPanel.tsx           // Panel principal
LayerTree.tsx             // Árbol jerárquico
LayerNode.tsx             // Nodo del árbol
LayerContextMenu.tsx      // Menú contextual
```

### 5. Preview Module (Frontend)

```typescript
// src/modules/preview/

PreviewPanel.tsx          // Panel de preview
DeviceFrame.tsx           // Frame de dispositivo
LivePreview.tsx           // Preview en vivo
```

### 6. XML Module (Backend)

```python
# backend/app/services/xml/

xml_parser.py             # Parser XML → Python objects
xml_generator.py          # Python objects → XML
xml_validator.py          # Validación contra schema
xml_transformer.py        # Transformaciones XSLT
schema_definitions.py     # Definiciones de schema
```

### 7. Rendering Module (Backend)

```python
# backend/app/services/rendering/

pdf_renderer.py           # Motor PDF
email_renderer.py         # Motor Email
preview_generator.py      # Generador de previews
template_processor.py     # Procesador de plantillas
variable_resolver.py      # Resolvedor de variables
condition_evaluator.py    # Evaluador de condiciones
```

### 8. Storage Module (Backend)

```python
# backend/app/services/storage/

asset_storage.py          # Almacenamiento de assets
template_storage.py       # Almacenamiento de plantillas
version_storage.py        # Control de versiones
cache_storage.py          # Cache
```

---

## 🌐 APIs y Comunicación

### REST API Endpoints

#### Templates

```
POST   /api/v1/templates              Create template
GET    /api/v1/templates              List templates
GET    /api/v1/templates/{id}         Get template
PUT    /api/v1/templates/{id}         Update template
DELETE /api/v1/templates/{id}         Delete template
POST   /api/v1/templates/{id}/duplicate  Duplicate template
POST   /api/v1/templates/import       Import XML
GET    /api/v1/templates/{id}/export  Export XML
```

#### Rendering

```
POST   /api/v1/render/pdf             Render PDF
POST   /api/v1/render/email           Render Email
POST   /api/v1/render/preview         Generate preview
```

#### Assets

```
POST   /api/v1/assets/upload          Upload asset
GET    /api/v1/assets                 List assets
GET    /api/v1/assets/{id}            Get asset
DELETE /api/v1/assets/{id}            Delete asset
```

#### Users & Auth

```
POST   /api/v1/auth/register          Register
POST   /api/v1/auth/login             Login
POST   /api/v1/auth/logout            Logout
GET    /api/v1/users/me               Get current user
PUT    /api/v1/users/me               Update profile
```

### WebSocket Events

#### Client → Server

```javascript
// Join editing session
socket.emit('join_template', { templateId, userId });

// Send change
socket.emit('template_change', {
  templateId,
  change: {
    type: 'add' | 'update' | 'delete',
    elementId,
    data
  }
});

// Cursor position
socket.emit('cursor_move', { x, y });

// Leave session
socket.emit('leave_template', { templateId });
```

#### Server → Client

```javascript
// User joined
socket.on('user_joined', ({ userId, username }) => { });

// Template change
socket.on('template_change', ({ change, userId }) => { });

// User cursor
socket.on('cursor_update', ({ userId, x, y }) => { });

// User left
socket.on('user_left', ({ userId }) => { });
```

---

## 📝 Esquema XML

### Estructura Base

```xml
<?xml version="1.0" encoding="UTF-8"?>
<WorkFlow>
  <Layout>
    <Id>Layout1</Id>
    <Name>My Template</Name>
    <Layout>
      <!-- Variables -->
      <Variable>...</Variable>

      <!-- Pages -->
      <Page>...</Page>

      <!-- Elements -->
      <FlowArea>...</FlowArea>
      <ImageObject>...</ImageObject>
      <Table>...</Table>
      <Barcode>...</Barcode>

      <!-- Styles -->
      <Font>...</Font>
      <Color>...</Color>
      <ParaStyle>...</ParaStyle>
      <TextStyle>...</TextStyle>
      <BorderStyle>...</BorderStyle>
    </Layout>
  </Layout>
</WorkFlow>
```

### Mapeo de Elementos

| Editor Element | XML Element | Descripción |
|----------------|-------------|-------------|
| Text Box | FlowArea + Flow | Área de texto con contenido |
| Image | ImageObject + Image | Imagen posicionada |
| Container | ElementObject | Contenedor de elementos |
| Table | Table + RowSet + Cell | Tabla estructurada |
| QR Code | Barcode (Type=QR) | Código QR |
| Barcode | Barcode (Type=Code128) | Código de barras |
| Shape | PathObject | Forma vectorial |
| Chart | Chart | Gráfico |

---

## ⚙️ Motor de Renderizado

### PDF Rendering Pipeline

```python
class PDFRenderer:
    def render(self, template: Template, data: dict) -> bytes:
        # 1. Parse template to XML structure
        xml_structure = self.xml_service.parse_template(template)

        # 2. Resolve variables
        resolved_data = self.variable_resolver.resolve(data)

        # 3. Evaluate conditions
        evaluated_elements = self.condition_evaluator.evaluate(
            xml_structure,
            resolved_data
        )

        # 4. Create PDF canvas
        pdf_canvas = reportlab.pdfgen.canvas.Canvas()

        # 5. Render each page
        for page in evaluated_elements.pages:
            self.render_page(pdf_canvas, page, resolved_data)

        # 6. Generate PDF bytes
        return pdf_canvas.getpdfdata()

    def render_page(self, canvas, page, data):
        # Set page size
        canvas.setPageSize((page.width, page.height))

        # Render elements in order
        for element in sorted(page.elements, key=lambda e: e.z_index):
            self.render_element(canvas, element, data)

        canvas.showPage()

    def render_element(self, canvas, element, data):
        if isinstance(element, FlowArea):
            self.render_text(canvas, element, data)
        elif isinstance(element, ImageObject):
            self.render_image(canvas, element, data)
        elif isinstance(element, Table):
            self.render_table(canvas, element, data)
        elif isinstance(element, Barcode):
            self.render_barcode(canvas, element, data)
        # ... más tipos
```

### Email Rendering Pipeline

```python
class EmailRenderer:
    def render(self, template: Template, data: dict) -> str:
        # 1. Parse template
        structure = self.parse_template(template)

        # 2. Resolve variables
        resolved = self.variable_resolver.resolve(data)

        # 3. Generate table-based layout
        html = self.generate_html_structure(structure)

        # 4. Apply inline CSS
        html_with_css = self.inline_css(html)

        # 5. Apply email compatibility fixes
        compatible_html = self.apply_email_fixes(html_with_css)

        # 6. Generate plain text version
        plain_text = self.generate_plain_text(compatible_html)

        return {
            'html': compatible_html,
            'text': plain_text
        }

    def generate_html_structure(self, structure):
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background-color:#f4f4f4;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0">
                            {self.render_elements(structure.elements)}
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        '''
```

---

## 🔒 Seguridad

### Autenticación y Autorización

```python
# JWT-based authentication
class SecurityService:
    def create_access_token(self, user_id: str) -> str
    def verify_token(self, token: str) -> User
    def check_permission(self, user: User, resource: str, action: str) -> bool
```

### Validación de Datos

```python
# Validación con Pydantic
class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: Literal['pdf', 'email']
    content: dict

    @validator('content')
    def validate_content(cls, v):
        # Validar estructura del template
        return v
```

### Rate Limiting

```python
# Rate limiting por usuario
@app.get("/api/v1/templates")
@limiter.limit("100/minute")
async def list_templates():
    pass
```

### Sanitización

```python
# Sanitización de inputs
def sanitize_xml(xml_string: str) -> str:
    # Eliminar entidades externas
    # Prevenir XXE attacks
    # Limitar profundidad del XML
    pass
```

---

## 📈 Escalabilidad

### Horizontal Scaling

- Load balancer (Nginx) → Múltiples instancias de FastAPI
- Redis para sesiones compartidas
- PostgreSQL con replicación read-replica
- S3/MinIO para assets distribuidos

### Caching Strategy

```python
# Multi-level caching
L1: In-memory cache (functools.lru_cache)
L2: Redis cache (template metadata, user sessions)
L3: CDN cache (rendered previews, static assets)
```

### Background Jobs

```python
# Celery tasks para operaciones pesadas
@celery.task
def render_pdf_async(template_id: str, data: dict):
    # Render PDF in background
    pass

@celery.task
def generate_thumbnails(template_id: str):
    # Generate previews
    pass
```

---

## 🎨 Extensibilidad

### Plugin System

```python
class PluginInterface:
    def register_element_type(self, element_type: Type[Element])
    def register_renderer(self, renderer: Type[Renderer])
    def register_validator(self, validator: Type[Validator])
```

### Custom Elements

```typescript
// Frontend
interface CustomElement extends BaseElement {
  type: 'custom';
  customType: string;
  customProps: Record<string, any>;
}

// Backend
class CustomElementRenderer:
    def render(self, element: CustomElement, context: RenderContext):
        # Custom rendering logic
        pass
```

---

## 📚 Referencias

- [ReportLab Documentation](https://www.reportlab.com/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Documento vivo** - Última actualización: 2025-11-25
