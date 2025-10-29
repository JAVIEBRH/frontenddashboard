# Frontend - Dashboard Aguas Ancud (React)

Dashboard completo y moderno para Aguas Ancud construido con React, Vite y Recharts.

## 🚀 Características

- ✅ **Dashboard Principal** con KPIs y gráficos
- ✅ **Gestión de Pedidos** con tabla de datos y estadísticas
- ✅ **Gestión de Clientes** con búsqueda y filtros
- ✅ **Diseño Responsive** para móviles y desktop
- ✅ **Navegación Moderna** con sidebar
- ✅ **Gráficos Interactivos** con Recharts
- ✅ **Tablas Avanzadas** con paginación y búsqueda
- ✅ **Estados de Carga** y manejo de errores

## 🛠️ Tecnologías

- **React 18** - Framework principal
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconos modernos
- **CSS Grid/Flexbox** - Layout responsive

## 📦 Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abrir en navegador:**
   ```
   http://localhost:3000
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Sidebar.jsx     # Navegación lateral
│   ├── KpiCard.jsx     # Tarjetas de métricas
│   ├── DataTable.jsx   # Tabla de datos avanzada
│   └── ChartCard.jsx   # Componente de gráficos
├── pages/              # Páginas principales
│   ├── Home.jsx        # Dashboard principal
│   ├── Pedidos.jsx     # Gestión de pedidos
│   └── Clientes.jsx    # Gestión de clientes
├── services/           # Servicios de API
│   └── api.js          # Funciones para consumir backend
└── styles/             # Estilos CSS
```

## 🎨 Componentes Principales

### KpiCard
- Muestra métricas con iconos y cambios porcentuales
- Formateo automático de valores (K, M para miles/millones)
- Indicadores visuales de tendencia

### DataTable
- Tabla de datos con paginación
- Búsqueda en tiempo real
- Columnas personalizables con render functions
- Responsive design

### ChartCard
- Gráficos de línea y barras
- Tooltips interactivos
- Formateo automático de datos

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build

## 🌐 Configuración de API

El frontend se conecta al backend FastAPI en `http://localhost:8000`. 
Asegúrate de que el backend esté corriendo antes de usar el dashboard.

## 📱 Responsive Design

El dashboard es completamente responsive:
- **Desktop**: Sidebar fijo + contenido principal
- **Tablet**: Layout adaptativo
- **Mobile**: Sidebar colapsable + contenido full-width

## 🎯 Próximas Mejoras

- [ ] Filtros avanzados por fecha
- [ ] Exportación de datos a Excel/PDF
- [ ] Notificaciones en tiempo real
- [ ] Modo oscuro
- [ ] Más tipos de gráficos 