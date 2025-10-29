import React, { createContext, useContext, useState, useCallback } from 'react';

const RefreshContext = createContext();

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh debe ser usado dentro de un RefreshProvider');
  }
  return context;
};

export const RefreshProvider = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    
    // Delay mínimo para mostrar la animación de actualización
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Disparar evento personalizado para que todas las páginas se actualicen
    window.dispatchEvent(new CustomEvent('globalRefresh'));
    
    setIsRefreshing(false);
  }, []);

  return (
    <RefreshContext.Provider value={{ isRefreshing, handleRefresh, lastRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}; 