# Life OS v3

Una aplicación de gestión personal tipo dashboard con tarjetas arrastrables y redimensionables para organizar tu vida.

## Características

- **Dashboard personalizable**: Tarjetas arrastrables y redimensionables estilo grid
- **Tipos de tarjetas**:
  - Contador de eventos (días hasta una fecha)
  - Contador de objetivos (veces que hiciste algo)
  - Checklist diario (tareas que se resetean cada día)
  - Metas con progreso (peso, dinero ahorrado, etc.)
- **Tema oscuro/claro**: Modo oscuro por defecto con soporte para tema claro
- **Autenticación**: Sistema de usuarios con Supabase Auth
- **Sincronización en tiempo real**: Cambios instantáneos con Supabase Realtime

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS v4
- **Backend**: Supabase (Auth + PostgreSQL + Realtime)
- **Drag & Drop**: react-grid-layout
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd life-os-v3
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a SQL Editor y ejecuta el contenido de `supabase/schema.sql`
3. Copia las credenciales del proyecto

### 4. Configurar variables de entorno

Crea un archivo `.env.local` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (Button, Input, Modal, etc.)
│   ├── layout/         # Layout components (Sidebar, Header, etc.)
│   ├── cards/          # Tipos de tarjetas específicas
│   ├── grid/           # Grid system con react-grid-layout
│   └── modals/         # Modales de la aplicación
├── contexts/           # React contexts (Auth, Theme)
├── hooks/              # Custom hooks
├── lib/                # Utilidades y configuraciones
├── pages/              # Páginas de la aplicación
├── router/             # Configuración de rutas
├── services/           # Servicios de API
├── styles/             # Estilos CSS
└── types/              # Tipos TypeScript
```

## Scripts

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run lint` - Ejecuta el linter
- `npm run preview` - Vista previa de producción

## Licencia

MIT