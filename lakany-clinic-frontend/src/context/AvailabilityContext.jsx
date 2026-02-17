import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AvailabilityContext = createContext();
export const useAvailability = () => useContext(AvailabilityContext);

export const AvailabilityProvider = ({ children }) => {
  const [availability, setAvailability] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchAvailability = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Setup config - only add Authorization if token exists
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await axios.get('http://localhost:5000/api/appointments/clinic-status', config);
      
      // Adjust based on your actual API response structure
      setAvailability(response.data?.data?.isAvailable ?? response.data?.isAvailable ?? true);
    } catch (error) {
      console.warn("Availability check failed:", error.response?.status === 401 ? "Unauthorized" : error.message);
      setAvailability(true); // Fallback
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