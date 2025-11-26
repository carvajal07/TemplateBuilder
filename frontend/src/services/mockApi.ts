/**
 * Mock API Services - Simula el backend para demo
 */

import { Template, Asset, User } from '../types';

// Simular delay de red
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Storage keys
const STORAGE_KEYS = {
  TEMPLATES: 'utb_templates',
  ASSETS: 'utb_assets',
  USER: 'utb_user',
};

// ============================================================================
// USER SERVICE
// ============================================================================

export const mockAuthService = {
  async login(email: string, password: string) {
    await delay(800);

    const user: User = {
      id: 'demo-user-123',
      name: 'Usuario Demo',
      email: email,
      role: 'editor',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('Usuario Demo')}&background=1976d2&color=fff`,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return {
      user,
      token: 'demo-token-' + Date.now(),
    };
  },

  async logout() {
    await delay(300);
    localStorage.removeItem(STORAGE_KEYS.USER);
    return { success: true };
  },

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  },
};

// ============================================================================
// TEMPLATES SERVICE
// ============================================================================

// Plantillas de ejemplo iniciales
const getInitialTemplates = (): Template[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  if (stored) {
    return JSON.parse(stored);
  }

  return [
    {
      id: 'template-1',
      name: 'Factura Comercial',
      description: 'Plantilla de factura profesional con logo y código QR',
      type: 'pdf',
      pageSize: {
        width: 210,
        height: 297,
        unit: 'mm',
        name: 'A4',
      },
      content: [
        {
          id: 'elem-1',
          type: 'text',
          properties: {
            id: 'elem-1',
            type: 'text',
            name: 'Título',
            position: { x: 50, y: 50 },
            size: { width: 500, height: 60 },
            opacity: 1,
            visible: true,
            locked: false,
            zIndex: 1,
            content: 'FACTURA',
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fontStyle: 'normal',
            color: '#1976d2',
            textAlign: 'left',
            lineHeight: 1.2,
            letterSpacing: 0,
          },
        },
      ],
      variables: [
        {
          id: 'var-1',
          name: 'numero_factura',
          type: 'string',
          defaultValue: '001',
          required: true,
        },
        {
          id: 'var-2',
          name: 'cliente_nombre',
          type: 'string',
          defaultValue: 'Cliente Ejemplo',
          required: true,
        },
      ],
      styles: [],
      metadata: {
        version: '1.0',
        author: 'Usuario Demo',
        category: 'Facturas',
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      ownerId: 'demo-user-123',
      tags: ['factura', 'comercial'],
    },
    {
      id: 'template-2',
      name: 'Email de Bienvenida',
      description: 'Email marketing para nuevos usuarios',
      type: 'email',
      pageSize: {
        width: 600,
        height: 800,
        unit: 'px',
        name: 'Custom',
      },
      content: [
        {
          id: 'elem-2',
          type: 'text',
          properties: {
            id: 'elem-2',
            type: 'text',
            name: 'Saludo',
            position: { x: 20, y: 100 },
            size: { width: 560, height: 50 },
            opacity: 1,
            visible: true,
            locked: false,
            zIndex: 1,
            content: '¡Hola {{nombre}}!',
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fontStyle: 'normal',
            color: '#333333',
            textAlign: 'center',
            lineHeight: 1.5,
            letterSpacing: 0,
          },
        },
      ],
      variables: [
        {
          id: 'var-3',
          name: 'nombre',
          type: 'string',
          defaultValue: 'Usuario',
          required: true,
        },
      ],
      styles: [],
      metadata: {
        version: '1.0',
        author: 'Usuario Demo',
        category: 'Email Marketing',
      },
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-05'),
      ownerId: 'demo-user-123',
      tags: ['email', 'bienvenida', 'marketing'],
    },
    {
      id: 'template-3',
      name: 'Certificado de Participación',
      description: 'Certificado elegante con bordes decorativos',
      type: 'pdf',
      pageSize: {
        width: 297,
        height: 210,
        unit: 'mm',
        name: 'A4',
      },
      content: [],
      variables: [
        {
          id: 'var-4',
          name: 'nombre_participante',
          type: 'string',
          defaultValue: 'Juan Pérez',
          required: true,
        },
        {
          id: 'var-5',
          name: 'curso',
          type: 'string',
          defaultValue: 'Curso de Ejemplo',
          required: true,
        },
      ],
      styles: [],
      metadata: {
        version: '1.0',
        author: 'Usuario Demo',
        category: 'Certificados',
      },
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-12'),
      ownerId: 'demo-user-123',
      tags: ['certificado', 'educación'],
    },
  ];
};

export const mockTemplatesService = {
  async getAll(filters?: { type?: string; search?: string }): Promise<Template[]> {
    await delay(600);

    let templates = getInitialTemplates();

    if (filters?.type) {
      templates = templates.filter(t => t.type === filters.type);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }

    return templates;
  },

  async getById(id: string): Promise<Template | null> {
    await delay(400);

    const templates = getInitialTemplates();
    return templates.find(t => t.id === id) || null;
  },

  async create(template: Partial<Template>): Promise<Template> {
    await delay(700);

    const newTemplate: Template = {
      id: 'template-' + Date.now(),
      name: template.name || 'Nueva Plantilla',
      description: template.description,
      type: template.type || 'pdf',
      pageSize: template.pageSize || {
        width: 210,
        height: 297,
        unit: 'mm',
        name: 'A4',
      },
      content: template.content || [],
      variables: template.variables || [],
      styles: template.styles || [],
      metadata: {
        version: '1.0',
        author: 'Usuario Demo',
        ...template.metadata,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: 'demo-user-123',
      tags: template.tags || [],
    };

    const templates = getInitialTemplates();
    templates.push(newTemplate);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));

    return newTemplate;
  },

  async update(id: string, updates: Partial<Template>): Promise<Template> {
    await delay(500);

    const templates = getInitialTemplates();
    const index = templates.findIndex(t => t.id === id);

    if (index === -1) {
      throw new Error('Template not found');
    }

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date(),
    };

    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));

    return templates[index];
  },

  async delete(id: string): Promise<void> {
    await delay(400);

    const templates = getInitialTemplates();
    const filtered = templates.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
  },

  async duplicate(id: string): Promise<Template> {
    await delay(600);

    const original = await this.getById(id);
    if (!original) {
      throw new Error('Template not found');
    }

    const duplicate: Template = {
      ...original,
      id: 'template-' + Date.now(),
      name: `${original.name} (Copia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const templates = getInitialTemplates();
    templates.push(duplicate);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));

    return duplicate;
  },

  async exportXML(id: string): Promise<string> {
    await delay(500);

    const template = await this.getById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    // Simulación de XML export
    return `<?xml version="1.0" encoding="UTF-8"?>
<WorkFlow>
  <Layout>
    <Id>${template.id}</Id>
    <Name>${template.name}</Name>
  </Layout>
</WorkFlow>`;
  },
};

// ============================================================================
// ASSETS SERVICE
// ============================================================================

const getInitialAssets = (): Asset[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.ASSETS);
  if (stored) {
    return JSON.parse(stored);
  }

  return [
    {
      id: 'asset-1',
      name: 'logo-empresa.png',
      type: 'image',
      url: 'https://via.placeholder.com/200x100/1976d2/ffffff?text=Logo+Empresa',
      thumbnailUrl: 'https://via.placeholder.com/100x50/1976d2/ffffff?text=Logo',
      size: 15420,
      mimeType: 'image/png',
      metadata: {
        width: 200,
        height: 100,
      },
      tags: ['logo', 'empresa'],
      uploadedAt: new Date('2024-01-10'),
      uploadedBy: 'demo-user-123',
    },
    {
      id: 'asset-2',
      name: 'banner-email.jpg',
      type: 'image',
      url: 'https://via.placeholder.com/600x200/dc004e/ffffff?text=Banner+Email',
      thumbnailUrl: 'https://via.placeholder.com/150x50/dc004e/ffffff?text=Banner',
      size: 45680,
      mimeType: 'image/jpeg',
      metadata: {
        width: 600,
        height: 200,
      },
      tags: ['banner', 'email'],
      uploadedAt: new Date('2024-02-01'),
      uploadedBy: 'demo-user-123',
    },
  ];
};

export const mockAssetsService = {
  async getAll(filters?: { type?: string }): Promise<Asset[]> {
    await delay(500);

    let assets = getInitialAssets();

    if (filters?.type) {
      assets = assets.filter(a => a.type === filters.type);
    }

    return assets;
  },

  async upload(file: File): Promise<Asset> {
    await delay(1000);

    // Crear URL temporal para la imagen
    const url = URL.createObjectURL(file);

    const newAsset: Asset = {
      id: 'asset-' + Date.now(),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'font',
      url: url,
      thumbnailUrl: url,
      size: file.size,
      mimeType: file.type,
      metadata: {},
      tags: [],
      uploadedAt: new Date(),
      uploadedBy: 'demo-user-123',
    };

    const assets = getInitialAssets();
    assets.push(newAsset);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));

    return newAsset;
  },

  async delete(id: string): Promise<void> {
    await delay(300);

    const assets = getInitialAssets();
    const filtered = assets.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(filtered));
  },
};

// ============================================================================
// RENDER SERVICE
// ============================================================================

export const mockRenderService = {
  async renderPDF(templateId: string, data: Record<string, any>): Promise<Blob> {
    await delay(1500);

    // Simulación: crear un PDF dummy
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Demo PDF - Template ${templateId}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000262 00000 n
0000000341 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
439
%%EOF`;

    return new Blob([pdfContent], { type: 'application/pdf' });
  },

  async renderEmail(templateId: string, data: Record<string, any>): Promise<{ html: string; text: string }> {
    await delay(1000);

    return {
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Preview</title>
</head>
<body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#fff;padding:40px;border-radius:8px;">
        <h1 style="color:#1976d2;">Email de Ejemplo</h1>
        <p>Esta es una vista previa del email generado para el template: <strong>${templateId}</strong></p>
        <p>Datos: ${JSON.stringify(data)}</p>
    </div>
</body>
</html>`,
      text: `Email de Ejemplo\n\nEsta es una vista previa del email generado para el template: ${templateId}\n\nDatos: ${JSON.stringify(data)}`,
    };
  },

  async generatePreview(templateId: string): Promise<string> {
    await delay(800);

    // Retornar URL de imagen placeholder
    return `https://via.placeholder.com/400x600/f4f4f4/333333?text=Preview+${templateId}`;
  },
};
