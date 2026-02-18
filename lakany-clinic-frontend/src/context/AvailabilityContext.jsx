import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
// ✅ Use your custom api instance
import api from '../axios'; 

const AvailabilityContext = createContext();
export const useAvailability = () => useContext(AvailabilityContext);

export const AvailabilityProvider = ({ children }) => {
  const [availability, setAvailability] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchAvailability = useCallback(async () => {
    try {
      setLoading(true);
      
      // ✅ No need to manually build config headers here if your 
      // axios interceptor already handles token attachment.
      // Removed hardcoded localhost:5000
      const response = await api.get('/appointments/clinic-status');
      
      setAvailability(response.data?.data?.isAvailable ?? response.data?.isAvailable ?? true);
    } catch (error) {
      console.warn("Availability check failed:", error.response?.status === 401 ? "Unauthorized" : error.message);
      setAvailability(true); // Fallback to open if check fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return (
    <AvailabilityContext.Provider value={{ availability, setAvailability, fetchAvailability, loading }}>
      {children}
    </AvailabilityContext.Provider>
  );
};