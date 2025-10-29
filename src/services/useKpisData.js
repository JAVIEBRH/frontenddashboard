/**
 * Hook personalizado para gestionar datos de KPIs con caché local
 * Sincroniza con la duración de caché del backend (30 minutos)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getKpis } from './api';

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos

export function useKpisData() {
  const [kpisData, setKpisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const cacheRef = useRef(null);
  const intervalRef = useRef(null);

  // Función para verificar si el caché es válido
  const isCacheValid = useCallback(() => {
    if (!cacheRef.current || !lastFetch) {
      return false;
    }
    
    const now = Date.now();
    const cacheAge = now - lastFetch;
    return cacheAge < CACHE_DURATION;
  }, [lastFetch]);

  // Función para obtener datos de KPIs
  const fetchKpis = useCallback(async (forceRefresh = false) => {
    // Si el caché es válido y no se fuerza la actualización, usar caché
    if (isCacheValid() && !forceRefresh && cacheRef.current) {
      setKpisData(cacheRef.current);
      setLoading(false);
      return cacheRef.current;
    }

    try {
      setLoading(true);
      setError(null);
      
      const startTime = Date.now();
      const data = await getKpis();
      const fetchTime = Date.now() - startTime;
      
      // Actualizar caché
      cacheRef.current = data;
      setKpisData(data);
      setLastFetch(Date.now());
      setLoading(false);
      
      console.log(`KPIs obtenidos en ${fetchTime}ms`);
      return data;
      
    } catch (err) {
      console.error('Error obteniendo KPIs:', err);
      setError(err.message);
      setLoading(false);
      
      // Si hay error pero tenemos caché, usar caché como fallback
      if (cacheRef.current) {
        setKpisData(cacheRef.current);
        console.log('Usando caché como fallback debido a error');
      }
      
      throw err;
    }
  }, [isCacheValid]);

  // Función para forzar actualización
  const refreshKpis = useCallback(() => {
    return fetchKpis(true);
  }, [fetchKpis]);

  // Función para limpiar caché
  const clearCache = useCallback(() => {
    cacheRef.current = null;
    setLastFetch(null);
    setKpisData(null);
  }, []);

  // Función para obtener estadísticas del caché
  const getCacheStats = useCallback(() => {
    if (!lastFetch) {
      return {
        hasCache: false,
        age: 0,
        isValid: false
      };
    }
    
    const now = Date.now();
    const age = now - lastFetch;
    const isValid = age < CACHE_DURATION;
    
    return {
      hasCache: !!cacheRef.current,
      age: Math.floor(age / 1000), // en segundos
      isValid,
      expiresIn: Math.max(0, Math.floor((CACHE_DURATION - age) / 1000)) // en segundos
    };
  }, [lastFetch]);

  // Función para configurar actualización automática
  const startAutoRefresh = useCallback((intervalMinutes = 2) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const intervalMs = intervalMinutes * 60 * 1000;
    intervalRef.current = setInterval(() => {
      if (!isCacheValid()) {
        console.log('Caché expirado, actualizando KPIs automáticamente');
        fetchKpis(true);
      }
    }, intervalMs);
    
    console.log(`Actualización automática configurada cada ${intervalMinutes} minutos`);
  }, [fetchKpis, isCacheValid]);

  // Función para detener actualización automática
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Actualización automática detenida');
    }
  }, []);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchKpis();
    
    // Configurar actualización automática cada 2 minutos (optimizado)
    startAutoRefresh(2);
    
    // Cleanup al desmontar
    return () => {
      stopAutoRefresh();
    };
  }, [fetchKpis, startAutoRefresh, stopAutoRefresh]);

  // Efecto para limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    kpisData,
    loading,
    error,
    refreshKpis,
    clearCache,
    getCacheStats,
    startAutoRefresh,
    stopAutoRefresh,
    isCacheValid: isCacheValid()
  };
}

// Hook para obtener datos de KPIs específicos con formato
export function useFormattedKpis() {
  const { kpisData, loading, error, refreshKpis } = useKpisData();
  
  const formattedKpis = kpisData ? {
    // Ventas
    ventas: {
      mes: kpisData.ventas_mes,
      mesPasado: kpisData.ventas_mes_pasado,
      cambio: kpisData.cambio_ventas_porcentaje
    },
    
    // Pedidos
    pedidos: {
      mes: kpisData.total_pedidos_mes,
      mesPasado: kpisData.total_pedidos_mes_pasado
    },
    
    // Bidones
    bidones: {
      mes: kpisData.total_bidones_mes,
      mesPasado: kpisData.total_bidones_mes_pasado,
      cambio: kpisData.cambio_bidones_porcentaje
    },
    
    // Litros
    litros: {
      mes: kpisData.total_litros_mes,
      mesPasado: kpisData.litros_vendidos_mes_pasado
    },
    
    // Financiero
    financiero: {
      costos: kpisData.costos_reales,
      iva: kpisData.iva,
      utilidad: kpisData.utilidad,
      puntoEquilibrio: kpisData.punto_equilibrio
    },
    
    // Clientes
    clientes: {
      activos: kpisData.clientes_activos,
      activosMesPasado: kpisData.clientes_activos_mes_pasado,
      inactivosMesPasado: kpisData.clientes_inactivos_mes_pasado
    },
    
    // Capacidad
    capacidad: {
      utilizada: kpisData.capacidad_utilizada,
      total: kpisData.capacidad_total,
      litrosVendidos: kpisData.litros_vendidos
    }
  } : null;
  
  return {
    formattedKpis,
    loading,
    error,
    refreshKpis
  };
}
