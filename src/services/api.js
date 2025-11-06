// src/services/api.js
// Funciones para consumir la API del backend (FastAPI)

// URL dinámica que funciona en desarrollo y producción
const API_URL = import.meta.env.VITE_API_URL || 'https://backenddashboard-vh7d.onrender.com';

// Modo desarrollo (solo loguear en desarrollo)
const IS_DEV = import.meta.env.DEV;

// Log para debugging solo en desarrollo
if (IS_DEV) {
  console.log('API_URL configurada:', API_URL);
}

// Helper para hacer fetch con retry automático
async function fetchWithRetry(url, options = {}, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(90000) // Timeout de 90 segundos (Render free puede tardar en despertar)
      });
      
      if (response.ok) {
        if (attempt > 1 && IS_DEV) {
          console.log(`✅ Request exitoso después de ${attempt} intentos`);
        }
        return response;
      }
      
      // Si es 4xx (error del cliente), no reintentar
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Si es 5xx (error del servidor), reintentar
      throw new Error(`Error del servidor ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      lastError = error;
      
      // Si es error de aborto (timeout), reintentar
      if (error.name === 'AbortError') {
        if (IS_DEV) {
          console.warn(`⏱️ Timeout en intento ${attempt}/${maxRetries}, reintentando...`);
        }
      } else if (error.message?.includes('Error del servidor')) {
        if (IS_DEV) {
          console.warn(`⚠️ Error del servidor en intento ${attempt}/${maxRetries}, reintentando...`);
        }
      } else {
        // Error de red u otro error, no reintentar si es el último intento
        if (attempt === maxRetries) {
          throw error;
        }
        if (IS_DEV) {
          console.warn(`⚠️ Error de red en intento ${attempt}/${maxRetries}, reintentando...`);
        }
      }
      
      // Esperar antes de reintentar (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}

export async function getPedidos() {
  try {
    if (IS_DEV) {
      console.log('Intentando obtener pedidos desde:', `${API_URL}/pedidos`);
    }
    const res = await fetchWithRetry(`${API_URL}/pedidos`);
    const data = await res.json();
    
    // Validar estructura de datos
    if (!Array.isArray(data)) {
      if (IS_DEV) {
        console.warn('⚠️ Respuesta de pedidos no es un array, retornando array vacío');
      }
      return [];
    }
    
    if (IS_DEV) {
      console.log('Pedidos obtenidos exitosamente:', data.length, 'registros');
    }
    return data;
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    // Retornar array vacío en lugar de lanzar error para evitar crashes
    return [];
  }
}

export async function getPedidosV2() {
  try {
    if (IS_DEV) {
      console.log('Intentando obtener pedidos v2 desde:', `${API_URL}/pedidos-v2`);
    }
    const res = await fetchWithRetry(`${API_URL}/pedidos-v2`);
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      if (IS_DEV) {
        console.warn('⚠️ Respuesta de pedidos v2 no es un array, retornando array vacío');
      }
      return [];
    }
    
    if (IS_DEV) {
      console.log('Pedidos v2 obtenidos exitosamente:', data.length, 'registros');
    }
    return data;
  } catch (error) {
    console.error('Error obteniendo pedidos v2:', error);
    return [];
  }
}

export async function getClientes() {
  try {
    if (IS_DEV) {
      console.log('Intentando obtener clientes desde:', `${API_URL}/clientes`);
    }
    const res = await fetchWithRetry(`${API_URL}/clientes`);
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      if (IS_DEV) {
        console.warn('⚠️ Respuesta de clientes no es un array, retornando array vacío');
      }
      return [];
    }
    
    if (IS_DEV) {
      console.log('Clientes obtenidos exitosamente:', data.length, 'registros');
      // Buscar específicamente a Walker solo en desarrollo
      const walker = data.find(c => c.usuario === 'walker0726@fluvi.cl' || c.correo === 'walker0726@fluvi.cl');
      if (walker) {
        console.log('Walker encontrado en datos:', walker);
      } else {
        console.log('Walker NO encontrado en datos del backend');
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    return [];
  }
}

export async function getKpis() {
  try {
    if (IS_DEV) {
      console.log('Intentando obtener KPIs desde:', `${API_URL}/kpis`);
    }
    const res = await fetchWithRetry(`${API_URL}/kpis`);
    const data = await res.json();
    
    // Validar estructura básica de KPIs
    if (!data || typeof data !== 'object') {
      if (IS_DEV) {
        console.warn('⚠️ Respuesta de KPIs inválida, retornando valores por defecto');
      }
      return {
        ventas_mes: 0,
        ventas_mes_pasado: 0,
        total_pedidos_mes: 0,
        total_pedidos_mes_pasado: 0,
        total_litros_mes: 0,
        litros_vendidos_mes_pasado: 0,
        costos_reales: 0,
        iva: 0,
        punto_equilibrio: 0,
        clientes_activos: 0,
      };
    }
    
    if (IS_DEV) {
      console.log('KPIs obtenidos exitosamente');
    }
    return data;
  } catch (error) {
    console.error('Error obteniendo KPIs:', error);
    // Retornar valores por defecto en lugar de lanzar error
    return {
      ventas_mes: 0,
      ventas_mes_pasado: 0,
      total_pedidos_mes: 0,
      total_pedidos_mes_pasado: 0,
      total_litros_mes: 0,
      litros_vendidos_mes_pasado: 0,
      costos_reales: 0,
      iva: 0,
      punto_equilibrio: 0,
      clientes_activos: 0,
    };
  }
}

export async function getPredictorInteligente(fecha, tipoCliente = 'residencial') {
  try {
    if (IS_DEV) {
      console.log('Intentando obtener predicción inteligente para:', fecha, tipoCliente);
    }
    const res = await fetchWithRetry(`${API_URL}/predictor-inteligente?fecha=${fecha}&tipo_cliente=${tipoCliente}`);
    const data = await res.json();
    
    if (IS_DEV) {
      console.log('Predicción inteligente obtenida exitosamente:', data);
    }
    return data;
  } catch (error) {
    console.error('Error obteniendo predicción inteligente:', error);
    // Retornar predicción vacía en lugar de lanzar error
    return {
      fecha: fecha,
      tipo_cliente: tipoCliente,
      pedidos_predichos: 0,
      confianza: 0,
      factores: {}
    };
  }
}

export async function getValidacionPredictor(diasTest = 7) {
  try {
    console.log('Obteniendo validación del predictor...');
    const res = await fetch(`${API_URL}/validacion-predictor?dias_test=${diasTest}`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Validación del predictor obtenida:', data);
    return data;
  } catch (error) {
    console.error('Error obteniendo validación del predictor:', error);
    throw error;
  }
}

export const getFactoresPrediccion = async () => {
  try {
    const response = await fetch(`${API_URL}/factores-prediccion`);
    if (!response.ok) {
      throw new Error('Error al obtener factores de predicción');
    }
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo factores de predicción:', error);
    return {};
  }
};

export const getVentasHistoricas = async () => {
  try {
    const response = await fetch(`${API_URL}/ventas-historicas`);
    if (!response.ok) {
      throw new Error('Error al obtener ventas históricas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo ventas históricas:', error);
    return [];
  }
};

export const getVentasTotalesHistoricas = async () => {
  try {
    const response = await fetch(`${API_URL}/ventas-totales-historicas`);
    if (!response.ok) {
      throw new Error('Error al obtener ventas totales históricas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo ventas totales históricas:', error);
    return { ventas_totales: 0, total_pedidos: 0 };
  }
}; 

export async function getTrackingMetricas() {
  try {
    const res = await fetch(`${API_URL}/tracking/metricas`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo métricas de tracking:', error);
    throw error;
  }
}

export async function getTrackingReporte() {
  try {
    const res = await fetch(`${API_URL}/tracking/reporte`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo reporte de tracking:', error);
    throw error;
  }
}

export async function registrarPedidosReales(fecha, pedidosReales, tipoCliente = 'general') {
  try {
    const params = new URLSearchParams({
      fecha: fecha,
      pedidos_reales: pedidosReales,
      tipo_cliente: tipoCliente
    });
    
    const res = await fetch(`${API_URL}/tracking/registrar-pedidos-reales?${params}`, {
      method: 'POST'
    });
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error registrando pedidos reales:', error);
    throw error;
  }
}

export async function getUltimasPredicciones(dias = 7) {
  try {
    const res = await fetch(`${API_URL}/tracking/ultimas-predicciones?dias=${dias}`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo últimas predicciones:', error);
    throw error;
  }
} 

export const getVentasDiarias = async () => {
  try {
    const response = await fetchWithRetry(`${API_URL}/ventas-diarias`);
    const data = await response.json();
    
    // Validar estructura de respuesta
    if (!data || typeof data !== 'object') {
      if (IS_DEV) {
        console.warn('⚠️ Respuesta de ventas diarias inválida');
      }
      throw new Error('Respuesta inválida');
    }
    
    if (IS_DEV) {
      console.log('Ventas diarias obtenidas:', data);
    }
    return data;
  } catch (error) {
    console.error('Error obteniendo ventas diarias:', error);
    return {
      ventas_hoy: 0,
      ventas_mismo_dia_mes_anterior: 0,
      porcentaje_cambio: 0,
      es_positivo: true,
      fecha_comparacion: '',
      tendencia_7_dias: [],
      tipo_comparacion: 'mensual'
    };
  }
};

export const getVentasSemanales = async () => {
  try {
    const response = await fetch(`${API_URL}/ventas-semanales`);
    if (!response.ok) {
      throw new Error('Error al obtener ventas semanales');
    }
    const data = await response.json();
    console.log('Ventas semanales obtenidas:', data);
    return data;
  } catch (error) {
    console.error('Error obteniendo ventas semanales:', error);
    return {
      ventas_semana_actual: 0,
      ventas_semana_pasada: 0,
      pedidos_semana_actual: 0,
      pedidos_semana_pasada: 0,
      porcentaje_cambio: 0,
      es_positivo: true
    };
  }
}; 

export const getPedidosPorHorario = async () => {
  try {
    const response = await fetch(`${API_URL}/pedidos-por-horario`);
    if (!response.ok) {
      throw new Error('Error al obtener pedidos por horario');
    }
    const data = await response.json();
    console.log('Pedidos por horario obtenidos:', data);
    console.log('📊 Valores específicos del endpoint:', {
      pedidos_manana: data.pedidos_manana,
      pedidos_tarde: data.pedidos_tarde,
      total: data.total,
      total_mes: data.total_mes,
      porcentaje_manana: data.porcentaje_manana,
      porcentaje_tarde: data.porcentaje_tarde
    });
    return data;
  } catch (error) {
    console.error('Error obteniendo pedidos por horario:', error);
    return {
      pedidos_manana: 0,
      pedidos_tarde: 0,
      total: 0,
      porcentaje_manana: 0,
      porcentaje_tarde: 0
    };
  }
}; 

export const getEstadoInventario = async () => {
  try {
    const response = await fetch(`${API_URL}/inventario/estado`);
    if (!response.ok) {
      throw new Error('Error al obtener estado de inventario');
    }
    const data = await response.json();
    console.log('Estado de inventario obtenido:', data);
    return data;
  } catch (error) {
    console.error('Error obteniendo estado de inventario:', error);
    return {
      stock_actual: 0,
      stock_minimo: 50,
      stock_maximo: 200,
      demanda_diaria_promedio: 0,
      dias_restantes: 0,
      estado: "error",
      alertas: [],
      recomendaciones: []
    };
  }
};

export const getPrediccionInventario = async (dias = 7) => {
  try {
    const response = await fetch(`${API_URL}/inventario/prediccion?dias=${dias}`);
    if (!response.ok) {
      throw new Error('Error al obtener predicción de inventario');
    }
    const data = await response.json();
    console.log('Predicción de inventario obtenida:', data);
    return data;
  } catch (error) {
    console.error('Error obteniendo predicción de inventario:', error);
    return { error: 'Error obteniendo predicción' };
  }
}; 

export const getReporteEjecutivo = async () => {
  try {
    const response = await fetch(`${API_URL}/reportes/ejecutivo`);
    if (!response.ok) {
      throw new Error('Error al obtener reporte ejecutivo');
    }
    const data = await response.json();
    console.log('Reporte ejecutivo obtenido:', data);
    return data;
  } catch (error) {
    console.error('Error obteniendo reporte ejecutivo:', error);
    return { error: 'Error obteniendo reporte' };
  }
};

export const generarReporteEmail = async (email) => {
  try {
    const response = await fetch(`${API_URL}/reportes/email?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error('Error al generar reporte por email');
    }
    const data = await response.json();
    console.log('Reporte email generado:', data);
    return data;
  } catch (error) {
    console.error('Error generando reporte email:', error);
    return { error: 'Error generando reporte email' };
  }
}; 

export const getAnalisisRentabilidad = async () => {
  try {
    if (IS_DEV) {
      console.log('Obteniendo análisis de rentabilidad avanzado...');
    }
    const response = await fetchWithRetry(`${API_URL}/rentabilidad/avanzado`);
    const data = await response.json();
    
    // Validar estructura de respuesta
    if (!data || typeof data !== 'object') {
      if (IS_DEV) {
        console.warn('⚠️ Respuesta de análisis de rentabilidad inválida');
      }
      return {
        error: 'Respuesta inválida',
        metricas_principales: {},
        analisis_avanzado: {},
        insights: [],
        recomendaciones: []
      };
    }
    
    if (IS_DEV) {
      console.log('Análisis de rentabilidad avanzado obtenido:', data);
    }
    return data;
  } catch (error) {
    console.error('Error obteniendo análisis de rentabilidad:', error);
    // Retornar estructura por defecto en lugar de error
    return {
      error: 'Error obteniendo análisis',
      metricas_principales: {
        ventas_mes: 0,
        costos_totales: 0,
        margen_neto_porcentaje: 0
      },
      analisis_avanzado: {
        crecimiento: { mensual: 0, trimestral: 0, ventas_trimestre: 0 },
        estacionalidad: { factor_estacional: 1, promedio_verano: 0, promedio_invierno: 0 },
        proyecciones: { mes_1: 0, mes_2: 0, mes_3: 0, tendencia_mensual: 0 },
        punto_equilibrio_dinamico: { actual: 0, optimista: 0, pesimista: 0 },
        roi: { actual: 0, proyectado: 0 },
        escenarios_rentabilidad: {
          optimista: { margen: 0 },
          actual: { margen: 0 },
          pesimista: { margen: 0 }
        }
      },
      datos_reales: {
        precio_venta_bidon: 2000,
        total_bidones_mes: 0,
        punto_equilibrio_bidones: 0
      },
      insights: [],
      recomendaciones: []
    };
  }
};

export async function getVentasLocales() {
  try {
    console.log('Intentando obtener ventas locales desde:', `${API_URL}/ventas-locales`);
    const res = await fetch(`${API_URL}/ventas-locales`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Ventas locales obtenidas exitosamente:', data);
    return data;
  } catch (error) {
    console.error('Error obteniendo ventas locales:', error);
    throw error;
  }
}

 