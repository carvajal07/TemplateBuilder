# 📐 Universal Template Builder - Diagramas UML

## Índice

1. [Diagrama de Clases](#diagrama-de-clases)
2. [Diagrama de Componentes](#diagrama-de-componentes)
3. [Diagrama de Secuencia](#diagrama-de-secuencia)
4. [Diagrama de Estados](#diagrama-de-estados)
5. [Diagrama de Despliegue](#diagrama-de-despliegue)
6. [Diagrama de Actividades](#diagrama-de-actividades)

---

## 🏛️ Diagrama de Clases

### Frontend - Core Classes

```mermaid
classDiagram
    class CanvasElement {
        +string id
        +ElementType type
        +Position position
        +Size size
        +number rotation
        +ElementProperties properties
        +boolean locked
        +boolean visible
        +string parentId
        +CanvasElement[] children
        +clone() CanvasElement
        +toXML() string
        +fromXML(xml) CanvasElement
    }

    class TextElement {
        +string content
        +TextStyle style
        +string fontFamily
        +number fontSize
        +string color
        +TextAlign alignment
    }

    class ImageElement {
        +string src
        +ImageFit fit
        +number opacity
        +BorderStyle border
    }

    class ContainerElement {
        +LayoutType layout
        +number columns
        +Spacing spacing
        +Background background
    }

    class TableElement {
        +number rows
        +number columns
        +TableCell[][] cells
        +BorderStyle border
    }

    class BarcodeElement {
        +BarcodeType type
        +string data
        +BarcodeOptions options
    }

    CanvasElement <|-- TextElement
    CanvasElement <|-- ImageElement
    CanvasElement <|-- ContainerElement
    CanvasElement <|-- TableElement
    CanvasElement <|-- BarcodeElement

    class EditorStore {
        +CanvasElement[] elements
        +string[] selectedIds
        +HistoryState history
        +CanvasState canvasState
        +addElement(element)
        +updateElement(id, changes)
        +deleteElement(id)
        +selectElement(id)
        +undo()
        +redo()
    }

    class HistoryManager {
        +Action[] past
        +Action[] future
        +number maxHistory
        +push(action)
        +undo() Action
        +redo() Action
        +clear()
    }

    class TemplateService {
        +createTemplate(data)
        +getTemplate(id)
        +updateTemplate(id, data)
        +deleteTemplate(id)
        +exportXML(id)
        +importXML(xml)
    }

    EditorStore --> HistoryManager
    EditorStore --> TemplateService
```

### Backend - Core Classes

```mermaid
classDiagram
    class Template {
        +string id
        +string name
        +TemplateType type
        +string content
        +User owner
        +datetime created_at
        +datetime updated_at
        +toDict() dict
        +fromDict(data) Template
    }

    class XMLParser {
        +parse(xml_string) TemplateSchema
        +validate(xml_string) ValidationResult
        +extract_variables(xml) Variable[]
    }

    class XMLGenerator {
        +generate(template) string
        +prettify(xml) string
        +compress(xml) string
    }

    class PDFRenderer {
        +canvas Canvas
        +render(template, data) bytes
        +renderPage(page, data)
        +renderElement(element, data)
        +renderText(element, data)
        +renderImage(element, data)
        +renderTable(element, data)
        +renderBarcode(element, data)
    }

    class EmailRenderer {
        +render(template, data) EmailOutput
        +generateHTML(structure) string
        +inlineCSS(html) string
        +applyEmailFixes(html) string
        +generatePlainText(html) string
    }

    class VariableResolver {
        +resolve(data, context) dict
        +evaluateExpression(expr, context) any
        +formatValue(value, format) string
    }

    class ConditionEvaluator {
        +evaluate(condition, context) boolean
        +evaluateInline(template, context) string
    }

    Template --> XMLParser
    Template --> XMLGenerator
    PDFRenderer --> VariableResolver
    PDFRenderer --> ConditionEvaluator
    EmailRenderer --> VariableResolver
    EmailRenderer --> ConditionEvaluator
```

---

## 🧩 Diagrama de Componentes

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Components]
        Store[Zustand Store]
        Services[API Services]

        subgraph "Editor Module"
            Canvas[Canvas Component]
            Toolbox[Toolbox Component]
            Properties[Properties Panel]
            Layers[Layers Tree]
        end

        subgraph "Core Module"
            ElementRenderer[Element Renderer]
            TransformHandler[Transform Handler]
            SelectionManager[Selection Manager]
        end
    end

    subgraph "Backend Layer"
        API[FastAPI]

        subgraph "Business Logic"
            TemplateService[Template Service]
            XMLService[XML Service]
            RenderService[Render Service]
            AssetService[Asset Service]
        end

        subgraph "Rendering Engine"
            PDFEngine[PDF Engine]
            EmailEngine[Email Engine]
            PreviewEngine[Preview Engine]
        end
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Cache[(Redis)]
        Storage[(S3/MinIO)]
    end

    UI --> Store
    Store --> Services
    Services --> API

    Canvas --> ElementRenderer
    Canvas --> TransformHandler
    Canvas --> SelectionManager

    API --> TemplateService
    API --> XMLService
    API --> RenderService
    API --> AssetService

    RenderService --> PDFEngine
    RenderService --> EmailEngine
    RenderService --> PreviewEngine

    TemplateService --> DB
    AssetService --> Storage
    API --> Cache
```

---

## 🔄 Diagrama de Secuencia

### Secuencia: Crear y Renderizar Plantilla PDF

```mermaid
sequenceDiagram
    participant User
    participant Canvas
    participant Store
    participant API
    participant TemplateService
    participant XMLService
    participant PDFRenderer
    participant DB

    User->>Canvas: Drag element to canvas
    Canvas->>Store: addElement(element)
    Store->>Store: Update state
    Store-->>Canvas: Re-render

    User->>Canvas: Configure properties
    Canvas->>Store: updateElement(id, props)
    Store->>API: autoSave (debounced)
    API->>TemplateService: updateTemplate(id, data)
    TemplateService->>DB: Save template
    DB-->>TemplateService: Saved
    TemplateService-->>API: Success
    API-->>Store: Confirmation

    User->>Canvas: Click "Export PDF"
    Canvas->>API: POST /api/v1/render/pdf
    API->>TemplateService: getTemplate(id)
    TemplateService->>DB: Query template
    DB-->>TemplateService: Template data

    API->>XMLService: parseTemplate(template)
    XMLService-->>API: XML Structure

    API->>PDFRenderer: render(structure, data)

    loop For each page
        PDFRenderer->>PDFRenderer: renderPage(page)
        loop For each element
            PDFRenderer->>PDFRenderer: renderElement(element)
        end
    end

    PDFRenderer-->>API: PDF bytes
    API-->>Canvas: PDF file
    Canvas->>User: Download PDF
```

### Secuencia: Colaboración en Tiempo Real

```mermaid
sequenceDiagram
    participant User1
    participant User2
    participant Canvas1
    participant Canvas2
    participant WebSocket
    participant Server

    User1->>Canvas1: Open template
    Canvas1->>WebSocket: join_template(templateId)
    WebSocket->>Server: Register connection
    Server-->>WebSocket: user_joined event

    User2->>Canvas2: Open same template
    Canvas2->>WebSocket: join_template(templateId)
    WebSocket->>Server: Register connection
    Server->>WebSocket: Broadcast to User1
    WebSocket->>Canvas1: user_joined (User2)
    Canvas1->>Canvas1: Show User2 cursor

    User1->>Canvas1: Move element
    Canvas1->>WebSocket: template_change event
    WebSocket->>Server: Process change
    Server->>Server: Validate change
    Server->>WebSocket: Broadcast to User2
    WebSocket->>Canvas2: template_change event
    Canvas2->>Canvas2: Apply change

    User2->>Canvas2: Move cursor
    Canvas2->>WebSocket: cursor_move event
    WebSocket->>Server: Forward
    Server->>WebSocket: Broadcast to User1
    WebSocket->>Canvas1: cursor_update event
    Canvas1->>Canvas1: Update User2 cursor position
```

---

## 🔀 Diagrama de Estados

### Estados del Editor

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Selecting: Click element
    Idle --> Dragging: Start drag from toolbox
    Idle --> Panning: Middle mouse drag

    Selecting --> Transforming: Start resize/rotate
    Selecting --> Moving: Start drag element
    Selecting --> Idle: Click canvas

    Transforming --> Idle: Release mouse
    Moving --> Idle: Release mouse
    Dragging --> Idle: Drop element
    Panning --> Idle: Release mouse

    Idle --> EditingText: Double click text
    EditingText --> Idle: Click outside

    state Transforming {
        [*] --> Resizing
        [*] --> Rotating
        Resizing --> [*]
        Rotating --> [*]
    }
```

### Estados de una Plantilla

```mermaid
stateDiagram-v2
    [*] --> Draft

    Draft --> Editing: Open in editor
    Draft --> Published: Publish
    Draft --> Archived: Archive

    Editing --> Draft: Save changes
    Editing --> Published: Publish

    Published --> Editing: Edit
    Published --> Archived: Archive

    Archived --> Draft: Restore

    Published --> Rendering: Render request
    Rendering --> Published: Complete
    Rendering --> Error: Failed
    Error --> Published: Retry
```

---

## 🚀 Diagrama de Despliegue

```mermaid
graph TB
    subgraph "Client Browser"
        React[React App]
    end

    subgraph "CDN"
        StaticAssets[Static Assets]
    end

    subgraph "Load Balancer"
        Nginx[Nginx]
    end

    subgraph "App Servers"
        API1[FastAPI Instance 1]
        API2[FastAPI Instance 2]
        API3[FastAPI Instance N]
    end

    subgraph "Background Workers"
        Worker1[Celery Worker 1]
        Worker2[Celery Worker 2]
    end

    subgraph "Data Services"
        PostgreSQL[(PostgreSQL Primary)]
        PostgreSQL_Replica[(PostgreSQL Replica)]
        Redis[(Redis)]
        RabbitMQ[RabbitMQ]
    end

    subgraph "Storage"
        S3[(S3/MinIO)]
    end

    React -->|HTTPS| Nginx
    React -->|Static Assets| StaticAssets

    Nginx --> API1
    Nginx --> API2
    Nginx --> API3

    API1 --> PostgreSQL
    API2 --> PostgreSQL
    API3 --> PostgreSQL

    API1 --> Redis
    API2 --> Redis
    API3 --> Redis

    API1 --> RabbitMQ
    API2 --> RabbitMQ
    API3 --> RabbitMQ

    RabbitMQ --> Worker1
    RabbitMQ --> Worker2

    Worker1 --> PostgreSQL
    Worker2 --> PostgreSQL

    PostgreSQL -.->|Replication| PostgreSQL_Replica

    API1 --> S3
    API2 --> S3
    API3 --> S3
    Worker1 --> S3
    Worker2 --> S3
```

---

## 📊 Diagrama de Actividades

### Actividad: Exportar Plantilla como PDF

```mermaid
flowchart TD
    Start([Usuario hace click en Export PDF]) --> GetTemplate[Obtener plantilla del store]
    GetTemplate --> ValidateTemplate{Plantilla válida?}

    ValidateTemplate -->|No| ShowError[Mostrar error de validación]
    ShowError --> End([Fin])

    ValidateTemplate -->|Sí| ShowDataDialog[Mostrar diálogo de datos]
    ShowDataDialog --> UserInputsData[Usuario ingresa datos variables]
    UserInputsData --> ValidateData{Datos válidos?}

    ValidateData -->|No| ShowDataError[Mostrar error de datos]
    ShowDataError --> ShowDataDialog

    ValidateData -->|Sí| ShowLoading[Mostrar loading]
    ShowLoading --> SendToAPI[Enviar a API /render/pdf]

    SendToAPI --> APIProcessing{API procesa}

    APIProcessing -->|Error| HandleError[Manejar error]
    HandleError --> ShowErrorMessage[Mostrar mensaje de error]
    ShowErrorMessage --> HideLoading[Ocultar loading]
    HideLoading --> End

    APIProcessing -->|Success| ReceivePDF[Recibir PDF bytes]
    ReceivePDF --> CreateBlob[Crear Blob con PDF]
    CreateBlob --> TriggerDownload[Iniciar descarga]
    TriggerDownload --> HideLoadingSuccess[Ocultar loading]
    HideLoadingSuccess --> ShowSuccess[Mostrar mensaje de éxito]
    ShowSuccess --> End
```

### Actividad: Procesar XML en Backend

```mermaid
flowchart TD
    Start([Recibir XML]) --> ParseXML[Parsear XML a dict]
    ParseXML --> ValidateStructure{Estructura válida?}

    ValidateStructure -->|No| ReturnError1[Retornar error de estructura]
    ReturnError1 --> End([Fin])

    ValidateStructure -->|Sí| ExtractVariables[Extraer variables]
    ExtractVariables --> ExtractPages[Extraer páginas]
    ExtractPages --> ExtractElements[Extraer elementos]

    ExtractElements --> BuildTree[Construir árbol jerárquico]
    BuildTree --> ResolveReferences[Resolver referencias]
    ResolveReferences --> ValidateReferences{Referencias válidas?}

    ValidateReferences -->|No| ReturnError2[Retornar error de referencias]
    ReturnError2 --> End

    ValidateReferences -->|Sí| CreateObjects[Crear objetos Python]
    CreateObjects --> ApplyStyles[Aplicar estilos]
    ApplyStyles --> ProcessConditions[Procesar condiciones]

    ProcessConditions --> BuildRenderTree[Construir árbol de renderizado]
    BuildRenderTree --> ReturnSuccess[Retornar estructura procesada]
    ReturnSuccess --> End
```

---

## 🎨 Diagrama de Arquitectura de Canvas

```mermaid
graph TB
    subgraph "Canvas Component"
        MainCanvas[Main Canvas Container]

        subgraph "Layers"
            BackgroundLayer[Background Layer]
            GridLayer[Grid Layer]
            ElementsLayer[Elements Layer]
            SelectionLayer[Selection Layer]
            GuidelinesLayer[Guidelines Layer]
            CursorsLayer[Cursors Layer]
        end

        subgraph "Interaction"
            DragHandler[Drag Handler]
            ResizeHandler[Resize Handler]
            RotateHandler[Rotate Handler]
            SelectionHandler[Selection Handler]
            KeyboardHandler[Keyboard Handler]
        end

        subgraph "Rendering"
            ElementRenderer[Element Renderer]
            TextRenderer[Text Renderer]
            ImageRenderer[Image Renderer]
            ShapeRenderer[Shape Renderer]
        end
    end

    MainCanvas --> BackgroundLayer
    MainCanvas --> GridLayer
    MainCanvas --> ElementsLayer
    MainCanvas --> SelectionLayer
    MainCanvas --> GuidelinesLayer
    MainCanvas --> CursorsLayer

    ElementsLayer --> ElementRenderer
    ElementRenderer --> TextRenderer
    ElementRenderer --> ImageRenderer
    ElementRenderer --> ShapeRenderer

    MainCanvas --> DragHandler
    MainCanvas --> ResizeHandler
    MainCanvas --> RotateHandler
    MainCanvas --> SelectionHandler
    MainCanvas --> KeyboardHandler
```

---

## 📦 Diagrama de Módulos

```mermaid
graph LR
    subgraph "Core Modules"
        Editor[Editor Module]
        Renderer[Renderer Module]
        Storage[Storage Module]
    end

    subgraph "Feature Modules"
        Templates[Templates Module]
        Assets[Assets Module]
        Collaboration[Collaboration Module]
        Export[Export Module]
    end

    subgraph "Shared Modules"
        Utils[Utils Module]
        Types[Types Module]
        Constants[Constants Module]
    end

    Editor --> Renderer
    Editor --> Storage
    Templates --> Editor
    Templates --> Storage
    Assets --> Storage
    Collaboration --> Editor
    Export --> Renderer

    Editor --> Utils
    Renderer --> Utils
    Storage --> Utils

    Editor --> Types
    Renderer --> Types
    Templates --> Types
```

---

## 🔐 Diagrama de Seguridad

```mermaid
sequenceDiagram
    participant Client
    participant LoadBalancer
    participant API
    participant Auth
    participant DB

    Client->>LoadBalancer: HTTPS Request + JWT
    LoadBalancer->>API: Forward Request
    API->>Auth: Verify JWT

    Auth->>Auth: Decode token
    Auth->>Auth: Check expiration

    alt Token valid
        Auth-->>API: User info
        API->>API: Check permissions

        alt Has permission
            API->>DB: Execute query
            DB-->>API: Result
            API-->>Client: 200 + Data
        else No permission
            API-->>Client: 403 Forbidden
        end
    else Token invalid
        Auth-->>API: Invalid token
        API-->>Client: 401 Unauthorized
    end
```

---

**Última actualización:** 2025-11-25
