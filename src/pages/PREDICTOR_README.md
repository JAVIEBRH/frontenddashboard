# Predictor de Pedidos - Documentación de Mejoras

## 📋 Resumen de Cambios Implementados

Este documento describe todas las mejoras realizadas en el componente `Predictor.jsx` del dashboard.

## ✅ Mejoras Completadas

### 1. Integración de Datos Históricos Completos
- **Función**: `cargarDatosHistoricos()`
- **Endpoints utilizados**:
  - `getPedidos()` - Todos los pedidos históricos
  - `getVentasHistoricas()` - Ventas históricas agregadas
- **Normalización**: Función `normalizarDatos()` que unifica esquemas entre diferentes endpoints
- **Compatibilidad**: Soporta múltiples formatos de fecha (ISO, YYYY-MM-DD, DD-MM-YYYY)
- **Resultado**: Todos los datos históricos disponibles se combinan y normalizan automáticamente

### 2. Selector de Fecha Arbitraria
- **Mejora**: Permite seleccionar cualquier fecha, incluso futuras
- **Indicadores visuales**:
  - Rango de datos disponibles (fecha mínima - fecha máxima)
  - Última actualización de datos
  - Tooltip informativo sobre el rango disponible
- **Validación**: Muestra advertencias si la fecha seleccionada está fuera del rango de datos

### 3. Métricas de Validación (MAE, RMSE, MAPE)
- **Funciones implementadas**:
  - `calcularMAE()` - Error Absoluto Medio
  - `calcularRMSE()` - Raíz del Error Cuadrático Medio
  - `calcularMAPE()` - Error Porcentual Absoluto Medio
- **Backtesting**: Validación temporal con división 80/20 (entrenamiento/validación)
- **Visualización**: Card unificado que muestra las métricas cuando hay suficientes datos (≥30 registros)

### 4. Motor Predictivo Modernizado
**Modelos de series temporales implementados**:

1. **Promedio Móvil Simple** (`modeloPromedioMovil`)
   - Ventana: 7 días (configurable)
   - Usa los últimos N días para calcular promedio

2. **Promedio Móvil Ponderado** (`modeloPromedioMovilPonderado`)
   - Da más peso a datos más recientes
   - Ventana: 7 días (configurable)

3. **Tendencia Lineal** (`modeloTendenciaLineal`)
   - Calcula pendiente y extrapola
   - Usa regresión lineal simple sobre últimos 14 días

4. **Suavizado Exponencial** (`modeloSuavizadoExponencial`)
   - Alpha: 0.3 (configurable)
   - Suaviza datos históricos con factor de decaimiento

5. **Modelo Día de Semana** (`modeloDiaSemana`)
   - Agrupa por día de la semana (0=domingo, 6=sábado)
   - Calcula promedio histórico para ese día específico

6. **Ensamble de Modelos** (`modeloEnsamble`)
   - Combina múltiples modelos con pesos:
     - Promedio móvil: 40%
     - Tendencia lineal: 30%
     - Día de semana: 30%

### 5. Mejoras de Legibilidad
- **Contraste mejorado**:
  - Títulos: `#f1f5f9` (dark) / `#1e293b` (light)
  - Textos secundarios: `rgba(255,255,255,0.7)` (dark) / `#64748b` (light)
- **Tamaños de fuente**:
  - Títulos principales: 1.75rem (28px)
  - Subtítulos: 1.125rem (18px)
  - Labels: 14px (aumentado de 12-13px)
  - Valores destacados: 1.25rem - 1.75rem (20-28px)
  - Textos secundarios: 13px (aumentado de 12px)
- **Tipografía unificada**: Inter, Roboto, Helvetica Neue, Arial
- **Antialiasing**: WebkitFontSmoothing y MozOsxFontSmoothing aplicados

### 6. Unificación de Pop-ups/Notificaciones
- **Sistema de notificaciones unificado**:
  - Reemplaza `alert()` nativos con Cards de MUI
  - Estilos consistentes con el dashboard
  - Tipos: success, error, warning, info
  - Animación suave de entrada
  - Auto-cierre después de 4 segundos
  - Botón de cierre manual
- **Alert convertidos a Cards**:
  - Información de modo predictor
  - Información de factores reales
  - Recomendaciones del sistema

### 7. Indicadores de Datos
- **Rango de datos disponible**: Muestra fecha mínima y máxima
- **Última actualización**: Timestamp de última carga de datos
- **Métricas de backtesting**: Visible cuando hay suficientes datos

## 🔧 Funciones Nuevas Locales

### Funciones de Normalización
```javascript
parseFechaLocal(fechaStr) // Parsea múltiples formatos de fecha
normalizarDatos(pedidos, ventasHistoricas) // Normaliza esquemas entre endpoints
calcularRangoDatos(datos) // Calcula rango de fechas disponibles
```

### Funciones de Métricas
```javascript
calcularMAE(predicciones, valoresReales)
calcularRMSE(predicciones, valoresReales)
calcularMAPE(predicciones, valoresReales)
```

### Funciones de Modelos
```javascript
modeloPromedioMovil(datos, ventana)
modeloPromedioMovilPonderado(datos, ventana)
modeloTendenciaLineal(datos)
modeloSuavizadoExponencial(datos, alpha)
modeloDiaSemana(datos, fechaObjetivo)
realizarBacktesting(datosHistoricos, modelo)
```

### Funciones de UI
```javascript
mostrarNotificacion(mensaje, tipo) // Sistema de notificaciones unificado
```

## 📊 Normalización de Datos

### Esquemas Normalizados
Los datos de diferentes endpoints se normalizan a:
```javascript
{
  fecha: 'YYYY-MM-DD',
  pedidos: number,
  total: number,
  promedio: number
}
```

### Campos Mapeados

**Desde `getPedidos()`**:
- `fecha` → `fecha || createdAt || deliveryDate || fecha_creacion`
- `precio` → `precio || price || total || monto`

**Desde `getVentasHistoricas()`**:
- `fecha` → `fecha || date || fecha_venta`
- `pedidos` → `pedidos || cantidad_pedidos`
- `total` → `total || ventas || monto`

## ⚠️ Limitaciones Detectadas

### 1. Modelos Avanzados No Disponibles
- **ARIMA/SARIMAX**: Requieren librerías especializadas (statsmodels, etc.) no disponibles en frontend
- **LSTM/Deep Learning**: Requieren TensorFlow.js o similar, no implementado
- **Prophet**: Requiere librería externa específica para series temporales

**Solución actual**: Se implementaron modelos estadísticos simples que funcionan sin dependencias externas.

### 2. Requisitos de Datos
- **Backtesting**: Requiere mínimo 30 registros para ser efectivo
- **Modelos de tendencia**: Requieren mínimo 14 días de datos
- **Modelos de día de semana**: Requieren múltiples ocurrencias del mismo día

### 3. Esquemas de Datos
- Algunos endpoints pueden tener campos inconsistentes
- La normalización maneja múltiples variantes, pero puede haber casos edge no cubiertos
- Fechas en diferentes formatos se normalizan automáticamente

### 4. Performance
- **Carga de datos**: Se cargan todos los pedidos y ventas históricas en paralelo
- **Procesamiento**: Normalización y cálculo de rangos se hace en el cliente
- **Optimización futura**: Podría beneficiarse de paginación o carga diferida para datasets muy grandes

## 🧪 Pruebas Realizadas

### Backtesting
- **División**: 80% entrenamiento, 20% validación
- **Ventanas probadas**: 7, 14, 30 días
- **Modelos probados**: Promedio móvil, Tendencia, Ensamble
- **Métricas calculadas**: MAE, RMSE, MAPE

### Validación Temporal
- Se usa time-series cross-validation (no se mezclan datos futuros con pasados)
- Los modelos se evalúan solo con datos históricos disponibles hasta el punto de predicción

## 📝 Notas de Implementación

### Sin Modificaciones al Backend
- Todas las mejoras se implementaron solo en el frontend
- No se crearon nuevos endpoints
- No se modificaron controladores o modelos del backend
- Los datos se procesan localmente en el componente

### Sin Dependencias Nuevas
- No se instalaron librerías nuevas
- Se usaron solo componentes y utilidades de MUI y React existentes
- Los modelos se implementaron con JavaScript vanilla

### Compatibilidad
- Compatible con modo claro y oscuro
- Responsive en diferentes tamaños de pantalla
- Usa el sistema de temas existente del dashboard

## 🎨 Estilos Unificados

### Cards
```javascript
{
  bgcolor: 'background.paper',
  boxShadow: theme.shadows[1],
  borderRadius: 3,
  border: `1px solid ${theme.palette.divider}`
}
```

### Tipografía
```javascript
{
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility'
}
```

### Colores Principales
- **Primary**: `#3b82f6`
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`
- **Info**: `#0ea5e9`

## 🔄 Flujo de Datos

1. **Carga inicial**: `getPedidos()` + `getVentasHistoricas()` en paralelo
2. **Normalización**: Esquemas se unifican en formato estándar
3. **Cálculo de rango**: Se identifica fecha mínima y máxima
4. **Backtesting automático**: Se ejecuta si hay ≥30 registros
5. **Visualización**: Métricas y rangos se muestran en la UI

## 📈 Métricas de Validación

Las métricas se calculan usando:
- **MAE**: Promedio de errores absolutos
- **RMSE**: Raíz del promedio de errores cuadráticos (penaliza más los errores grandes)
- **MAPE**: Error porcentual absoluto medio (útil para comparar escalas diferentes)

## 🚀 Próximas Mejoras Potenciales

1. **Caché de predicciones**: Guardar predicciones calculadas para evitar recálculos
2. **Visualización de series temporales**: Gráfico de tendencias históricas
3. **Selección de modelo**: Permitir al usuario elegir qué modelo usar
4. **Intervalos de confianza dinámicos**: Calcular intervalos basados en volatilidad histórica
5. **Detección de anomalías**: Identificar valores atípicos en datos históricos

## 📞 Soporte

Si detectas algún problema o limitación no documentada, por favor reporta:
- Qué datos faltan
- Qué comportamiento se esperaba vs. qué ocurrió
- Capturas de pantalla si es posible

---
**Última actualización**: ${new Date().toISOString().split('T')[0]}
**Versión**: 2.0.0 (Mejoras de Legibilidad y Motor Predictivo)

