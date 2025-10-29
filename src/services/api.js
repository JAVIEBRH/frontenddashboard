// src/services/api.js
// Funciones para consumir la API del backend (FastAPI)

// URL dinámica que funciona en desarrollo y producción
const API_URL = import.meta.env.VITE_API_URL || 'https://backenddashboard-vh7d.onrender.com';

// Log para debugging
console.log('API_URL configurada:', API_URL);

export async function getPedidos() {
  try {
    console.log('Intentando obtener pedidos desde:', `${API_URL}/pedidos`);
    const res = await fetch(`${API_URL}/pedidos`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Pedidos obtenidos exitosamente:', data.length, 'registros');
    return data;
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    throw error;
  }
}

export async function getPedidosV2() {
  try {
    console.log('Intentando obtener pedidos v2 desde:', `${API_URL}/pedidos-v2`);
    const res = await fetch(`${API_URL}/pedidos-v2`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Pedidos v2 obtenidos exitosamente:', data.length, 'registros');
    return data;
  } catch (error) {
    console.error('Error obteniendo pedidos v2:', error);
    throw error;
  }
}

export async function getClientes() {
  try {
    console.log('Intentando obtener clientes desde:', `${API_URL}/clientes`);
    const res = await fetch(`${API_URL}/clientes`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Clientes obtenidos exitosamente:', data.length, 'registros');
    
    // Buscar específicamente a Walker para debugging
    const walker = data.find(c => c.usuario === 'walker0726@fluvi.cl');
    if (walker) {
      console.log('Walker encontrado en datos:', walker);
    } else {
      console.log('Walker NO encontrado en datos del backend');
    }
    
    return data;
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    throw error;
  }
}

export async function getKpis() {
  try {
    console.log('Intentando obtener KPIs desde:', `${API_URL}/kpis`);
    const res = await fetch(`${API_URL}/kpis`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    console.log('KPIs obtenidos exitosamente');
    return data;
  } catch (error) {
    console.error('Error obteniendo KPIs:', error);
    throw error;
  }
}

export async function getPredictorInteligente(fecha, tipoCliente = 'residencial') {
  try {
    console.log('Intentando obtener predicción inteligente para:', fecha, tipoCliente);
    const res = await fetch(`${API_URL}/predictor-inteligente?fecha=${fecha}&tipo_cliente=${tipoCliente}`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Predicción inteligente obtenida exitosamente:', data);
    return data;
  } catch (error) {
    console.error('Error obteniendo predicción inteligente:', error);
    throw error;
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
    const response = await fetch(`${API_URL}/ventas-diarias`);
    if (!response.ok) {
      throw new Error('Error al obtener ventas diarias');
    }
    const data = await response.json();
    console.log('Ventas diarias obtenidas:', data);
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
    const response = await fetch(`${API_URL}/rentabilidad/avanzado`);
    if (!response.ok) {
      throw new Error('Error al obtener análisis de rentabilidad');
    }
    const data = await response.json();
    console.log('Análisis de rentabilidad obtenido:', data);
    return data;
  } catch (error) {
    console.error('Error obteniendo análisis de rentabilidad:', error);
    return { error: 'Error obteniendo análisis' };
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

 