/**
 * Utilidades de formato numérico para mantener consistencia en toda la aplicación
 * Formateo coherente de monedas, porcentajes y números
 */

/**
 * Formatea un valor numérico como moneda con formato abreviado
 * @param {number} value - Valor a formatear
 * @param {string} currency - Moneda (por defecto 'CLP')
 * @returns {string} Valor formateado (ej: $880K, $1.2M)
 */
export function formatCurrency(value, currency = 'CLP') {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }

  const numValue = Number(value);
  
  if (numValue === 0) {
    return '$0';
  }

  // Formatear según el tamaño del número
  if (numValue >= 1000000) {
    return `$${(numValue / 1000000).toFixed(1)}M`;
  } else if (numValue >= 1000) {
    return `$${(numValue / 1000).toFixed(0)}K`;
  } else {
    return `$${numValue.toLocaleString('es-CL')}`;
  }
}

/**
 * Formatea un valor numérico como porcentaje
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (por defecto 1)
 * @returns {string} Valor formateado (ej: 27.9%)
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const numValue = Number(value);
  return `${numValue.toFixed(decimals)}%`;
}

/**
 * Formatea un valor numérico como número entero con separadores de miles
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: 1,234)
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const numValue = Number(value);
  return numValue.toLocaleString('es-CL');
}

/**
 * Formatea un valor numérico como decimal con separadores de miles
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (por defecto 2)
 * @returns {string} Valor formateado (ej: 1,234.56)
 */
export function formatDecimal(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }

  const numValue = Number(value);
  return numValue.toLocaleString('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formatea un valor numérico como cambio porcentual con color
 * @param {number} value - Valor a formatear
 * @param {boolean} isPositive - Si el cambio es positivo
 * @returns {object} Objeto con valor formateado y color
 */
export function formatChange(value, isPositive = true) {
  if (value === null || value === undefined || isNaN(value)) {
    return {
      value: '0%',
      color: 'text.secondary'
    };
  }

  const numValue = Number(value);
  const formattedValue = formatPercentage(Math.abs(numValue), 1);
  
  return {
    value: `${isPositive ? '+' : '-'}${formattedValue}`,
    color: isPositive ? 'success.main' : 'error.main'
  };
}

/**
 * Formatea un valor numérico como ticket promedio
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: $6,245)
 */
export function formatTicketAverage(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }

  const numValue = Number(value);
  return `$${numValue.toLocaleString('es-CL')}`;
}

/**
 * Formatea un valor numérico como capacidad utilizada
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: 27.9%)
 */
export function formatCapacity(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const numValue = Number(value);
  return `${numValue.toFixed(1)}%`;
}

/**
 * Formatea un valor numérico como litros
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: 8,360 L)
 */
export function formatLiters(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 L';
  }

  const numValue = Number(value);
  return `${numValue.toLocaleString('es-CL')} L`;
}

/**
 * Formatea un valor numérico como bidones
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: 418 bidones)
 */
export function formatBottles(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 bidones';
  }

  const numValue = Number(value);
  return `${numValue.toLocaleString('es-CL')} bidones`;
}

/**
 * Formatea un valor numérico como clientes
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: 145 clientes)
 */
export function formatClients(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 clientes';
  }

  const numValue = Number(value);
  return `${numValue.toLocaleString('es-CL')} clientes`;
}

/**
 * Formatea un valor numérico como pedidos
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: 141 pedidos)
 */
export function formatOrders(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 pedidos';
  }

  const numValue = Number(value);
  return `${numValue.toLocaleString('es-CL')} pedidos`;
}

/**
 * Formatea un valor numérico como punto de equilibrio
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: 134 bidones)
 */
export function formatBreakEven(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 bidones';
  }

  const numValue = Number(value);
  return `${numValue.toLocaleString('es-CL')} bidones`;
}

/**
 * Formatea un valor numérico como utilidad
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: $594,631)
 */
export function formatProfit(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }

  const numValue = Number(value);
  return `$${numValue.toLocaleString('es-CL')}`;
}

/**
 * Formatea un valor numérico como IVA
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: $163,149)
 */
export function formatTax(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }

  const numValue = Number(value);
  return `$${numValue.toLocaleString('es-CL')}`;
}

/**
 * Formatea un valor numérico como costos
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: $285,368)
 */
export function formatCosts(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }

  const numValue = Number(value);
  return `$${numValue.toLocaleString('es-CL')}`;
}

/**
 * Formatea un valor numérico como ventas
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: $880K)
 */
export function formatSales(value) {
  return formatCurrency(value);
}

/**
 * Formatea un valor numérico como inventario
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: 150 bidones)
 */
export function formatInventory(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 bidones';
  }

  const numValue = Number(value);
  return `${numValue.toLocaleString('es-CL')} bidones`;
}

/**
 * Formatea un valor numérico como días restantes
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: 15 días)
 */
export function formatDays(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 días';
  }

  const numValue = Number(value);
  return `${numValue.toLocaleString('es-CL')} días`;
}

/**
 * Formatea un valor numérico como demanda diaria
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: 14 bidones/día)
 */
export function formatDailyDemand(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 bidones/día';
  }

  const numValue = Number(value);
  return `${numValue.toFixed(1)} bidones/día`;
}

