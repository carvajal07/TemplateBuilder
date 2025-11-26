# 🎨 Universal Template Builder

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![React](https://img.shields.io/badge/react-18.3+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)

**Sistema web avanzado tipo "Drag & Drop Editor" para crear plantillas de PDF y Email marketing**

[Documentación](./docs/ARCHITECTURE.md) • [API Docs](#api) • [Ejemplos](#ejemplos)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API](#-api)
- [Ejemplos](#-ejemplos)
- [Documentación](#-documentación)
- [Desarrollo](#-desarrollo)
- [Contribuir](#-contribuir)

---

## ✨ Características

### Editor Visual Drag & Drop

- 🎯 **Canvas Interactivo**: Arrastra y suelta elementos, redimensiona, rota y alinea con guías inteligentes
- 📐 **Grid y Snap**: Sistema de rejilla configurable con snap automático
- 🔍 **Zoom**: 10% - 500% con zoom to fit
- 📏 **Guías Inteligentes**: Alineación automática y guías personalizadas
- 🎨 **Vista Previa en Tiempo Real**: Preview instantáneo de cambios

### Elementos Disponibles

#### 📝 Texto
- Título, Subtítulo, Párrafo
- Texto enriquecido (HTML)
- Placeholders dinámicos (`{{variable}}`)

#### 🖼️ Imágenes
- Cargar imagen
- Imagen desde URL
- Logo, Iconos predefinidos

#### 📐 Layout
- Contenedores
- Columnas (1-4)
- Secciones completas
- Tablas con filas dinámicas
- Grid flexible

#### 🔷 Formas
- Rectángulo, Círculo, Línea
- Figuras vectoriales (SVG paths)

#### 🔣 Especiales
- **QR Code**: Generación dinámica
- **Código de Barras**: EAN, Code128, Code39
- **Gráficos**: Bar, Line, Pie
- **Campos Dinámicos**: Variables con formato
- **Bloques Reutilizables**: Componentes guardados

#### 📧 Email (Exclusivos)
- Botones CTA
- Layouts compatibles con Outlook
- Safe-fonts
- Responsive design

### Sistema de Capas

- 📂 **Árbol Jerárquico**: Organización visual de elementos
- 👁️ **Visibilidad**: Toggle show/hide por capa
- 🔒 **Bloqueo**: Proteger elementos de edición
- 🔄 **Reordenar**: Drag & drop en el árbol

### Panel de Propiedades

Propiedades específicas por tipo de elemento:
- **Texto**: Fuente, tamaño, color, alineación, espaciado
- **Imágenes**: Ajuste, bordes, opacidad, filtros
- **Contenedores**: Padding, margin, fondo, bordes
- **Formas**: Color, grosor, estilo de línea

### Motor de Renderizado

#### 📄 PDF
- **Engine**: ReportLab
- **Calidad**: DPI configurable (150-300)
- **Elementos**: Soporte completo de todos los elementos
- **Variables**: Resolución dinámica
- **Condicionales**: Contenido condicional
- **Tablas**: Con estilos y bordes
- **Códigos**: QR y Barras integrados

#### 📧 Email HTML
- **Engine**: HTML/CSS con inline styles
- **Compatibilidad**: Outlook, Gmail, Apple Mail
- **Responsive**: Diseño adaptativo
- **Table-based**: Layout compatible
- **Plain Text**: Versión alternativa generada

### Sistema de Plantillas XML

- 📦 **Importar/Exportar**: XML compatible con esquema
- 🔄 **Versiones**: Control de versiones automático
- 📋 **Duplicar**: Clonar plantillas existentes
- 🏷️ **Etiquetas**: Organización por tags

### Colaboración en Tiempo Real

- 👥 **Multi-usuario**: Edición simultánea
- 🎯 **Cursores**: Ver posición de otros usuarios
- 🔄 **Sincronización**: WebSocket en tiempo real
- 💾 **Autoguardado**: Cada 30 segundos

### Historial

- ⏮️ **Undo/Redo**: Ilimitado
- 📜 **Historial**: Registro completo de cambios
- 🔖 **Versiones**: Snapshots guardados

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Toolbox   │  │   Canvas    │  │ Properties  │        │
│  │   Sidebar   │  │   Editor    │  │    Panel    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                               │
│  State Management: Zustand + React Query                     │
└─────────────────────────────────────────────────────────────┘
                          ↕ REST + WebSocket
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ XML Parser  │  │ PDF Engine  │  │Email Engine │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL + Redis)                   │
└─────────────────────────────────────────────────────────────┘
```

Ver [Arquitectura Completa](./docs/ARCHITECTURE.md) y [Diagramas UML](./docs/diagrams/UML_DIAGRAMS.md)

---

## 🛠️ Tecnologías

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3+ | Framework UI |
| Vite | 5.x | Build tool |
| Material-UI | 5.x | Component library |
| Zustand | 4.x | State management |
| React DnD | 16.x | Drag & Drop |
| Fabric.js | 5.x | Canvas manipulation |
| Socket.io | 4.x | WebSocket client |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.11+ | Language |
| FastAPI | 0.110+ | Web framework |
| ReportLab | 4.x | PDF generation |
| SQLAlchemy | 2.x | ORM |
| PostgreSQL | 15+ | Database |
| Redis | 7.x | Cache + Sessions |
| lxml | 5.x | XML processing |

---

## 🚀 Instalación

### Prerequisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Backend

```bash
# Clonar repositorio
git clone <repository-url>
cd TemplateBuilder/backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Crear base de datos
# (Asegúrate de que PostgreSQL esté corriendo)
createdb template_builder

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:socket_app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# El frontend estará disponible en http://localhost:3000
```

### Docker (Alternativa)

```bash
# Desde la raíz del proyecto
docker-compose up -d

# El sistema estará disponible en:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - API Docs: http://localhost:8000/api/docs
```

---

## 📖 Uso

### 1. Crear una Plantilla PDF

```bash
# Desde el frontend
1. Click en "Nueva Plantilla"
2. Seleccionar tipo: "PDF"
3. Configurar tamaño de página (A4, Letter, etc.)
4. Arrastrar elementos desde el Toolbox al Canvas
5. Configurar propiedades de cada elemento
6. Guardar plantilla
```

### 2. Agregar Texto Dinámico

```typescript
// En el elemento de texto, usar placeholders
"Hola {{nombre}}, tu pedido #{{numero_pedido}} está listo"

// Al renderizar, pasar los datos:
{
  "nombre": "Juan Pérez",
  "numero_pedido": "12345"
}
```

### 3. Renderizar PDF

```bash
POST /api/v1/render/pdf

{
  "template_xml": "<WorkFlow>...</WorkFlow>",
  "data": {
    "nombre": "Juan Pérez",
    "numero_pedido": "12345"
  },
  "options": {
    "dpi": 300
  }
}
```

### 4. Crear Plantilla de Email

```bash
1. Click en "Nueva Plantilla"
2. Seleccionar tipo: "Email"
3. Usar elementos compatibles con email
4. Configurar botones CTA
5. Preview en diferentes clientes
6. Exportar HTML
```

### 5. Colaboración en Tiempo Real

```javascript
// El frontend automáticamente conecta via WebSocket
// Cuando otro usuario edita la misma plantilla, verás:
// - Su cursor en el canvas
// - Sus cambios en tiempo real
// - Notificación de quién está editando
```

---

## 📁 Estructura del Proyecto

```
TemplateBuilder/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── Editor/     # Componentes del editor
│   │   │   ├── Toolbox/    # Barra de herramientas
│   │   │   ├── Properties/ # Panel de propiedades
│   │   │   └── Layers/     # Árbol de capas
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API clients
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilidades
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Python Backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   │   ├── templates.py
│   │   │   ├── assets.py
│   │   │   ├── render.py
│   │   │   └── auth.py
│   │   ├── core/           # Configuración core
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/         # SQLAlchemy models
│   │   ├── services/       # Lógica de negocio
│   │   │   ├── xml/       # XML parser/generator
│   │   │   └── rendering/ # PDF/Email renderers
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── docs/                     # Documentación
│   ├── ARCHITECTURE.md      # Arquitectura completa
│   ├── diagrams/           # Diagramas UML
│   └── api/                # Documentación API
│
├── examples/                # Ejemplos de plantillas
│   ├── pdf-templates/      # Plantillas PDF
│   └── email-templates/    # Plantillas Email
│
├── Scheme_Simplified.xml    # Esquema XML de referencia
└── README.md               # Este archivo
```

---

## 🔌 API

### Endpoints Principales

#### Templates

```bash
POST   /api/v1/templates              # Crear plantilla
GET    /api/v1/templates              # Listar plantillas
GET    /api/v1/templates/{id}         # Obtener plantilla
PUT    /api/v1/templates/{id}         # Actualizar plantilla
DELETE /api/v1/templates/{id}         # Eliminar plantilla
POST   /api/v1/templates/{id}/duplicate  # Duplicar
GET    /api/v1/templates/{id}/export  # Exportar XML
POST   /api/v1/templates/import       # Importar XML
```

#### Render

```bash
POST /api/v1/render/pdf      # Renderizar PDF
POST /api/v1/render/email    # Renderizar Email HTML
POST /api/v1/render/preview  # Generar preview
```

#### Assets

```bash
POST   /api/v1/assets/upload  # Subir asset
GET    /api/v1/assets         # Listar assets
GET    /api/v1/assets/{id}    # Obtener asset
DELETE /api/v1/assets/{id}    # Eliminar asset
```

#### Auth

```bash
POST /api/v1/auth/register  # Registrar usuario
POST /api/v1/auth/login     # Login
GET  /api/v1/auth/me        # Usuario actual
```

### Documentación Interactiva

Una vez iniciado el backend, visita:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

---

## 📚 Ejemplos

### Ejemplo 1: Factura PDF

Ver: [`examples/pdf-templates/invoice.xml`](./examples/pdf-templates/invoice.xml)

Plantilla completa de factura con:
- Logo de empresa
- Datos del cliente
- Tabla de productos
- Totales y subtotales
- Código QR para validación
- Pie de página con términos

### Ejemplo 2: Email de Bienvenida

Ver: [`examples/email-templates/welcome.json`](./examples/email-templates/welcome.json)

Email marketing con:
- Header con imagen
- Texto de bienvenida personalizado
- Botón CTA
- Footer con redes sociales
- Compatible con todos los clientes

### Ejemplo 3: Certificado

Ver: [`examples/pdf-templates/certificate.xml`](./examples/pdf-templates/certificate.xml)

Certificado personalizable con:
- Bordes decorativos
- Nombre del participante
- Fecha dinámica
- Firma digital
- Código QR de verificación

---

## 📖 Documentación

- [Arquitectura Completa](./docs/ARCHITECTURE.md)
- [Diagramas UML](./docs/diagrams/UML_DIAGRAMS.md)
- [Esquema XML](./Scheme_Simplified.xml)

---

## 👨‍💻 Desarrollo

### Setup de Desarrollo

```bash
# Instalar pre-commit hooks
pip install pre-commit
pre-commit install

# Ejecutar tests
cd backend
pytest

cd ../frontend
npm run test
```

### Linting y Formateo

```bash
# Backend
black app/
flake8 app/
mypy app/

# Frontend
npm run lint
npm run type-check
```

### Build para Producción

```bash
# Frontend
npm run build

# Backend
# El código Python no requiere build
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

---

## 👥 Autores

- **Tu Nombre** - *Trabajo Inicial* - [GitHub](https://github.com/yourusername)

---

## 🙏 Agradecimientos

- ReportLab por el excelente motor de PDF
- FastAPI por el framework moderno y rápido
- React y Material-UI por los componentes UI
- Fabric.js por la manipulación de canvas

---

## 📞 Soporte

¿Necesitas ayuda?

- 📧 Email: support@templatebuilder.com
- 💬 Discord: [Join our server](https://discord.gg/templatebuilder)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/templatebuilder/issues)

---

<div align="center">

**⭐ Si este proyecto te resultó útil, considera darle una estrella en GitHub ⭐**

</div>
