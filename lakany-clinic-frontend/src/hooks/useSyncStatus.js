import { useState, useEffect, useCallback } from 'react';

const useSyncStatus = () => {
  const getStatusFromStorage = useCallback(() => {
    try {
      const item = localStorage.getItem('clinic_availability');
      if (item) {
        const { isClosed } = JSON.parse(item);
        return isClosed;
      }
      return false; // Default to open if not set
    } catch (error) {
      console.error("Error parsing clinic_availability from localStorage", error);
      return false;
    }
  }, []);

  const [isClosed, setIsClosed] = useState(getStatusFromStorage);

  useEffect(() => {
    // Event listener for real-time, cross-tab updates
    const handleStorageChange = (event) => {
      if (event.key === 'clinic_availability') {
        setIsClosed(getStatusFromStorage());
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Polling as a fallback, in case the storage event doesn't fire
    const intervalId = setInterval(() => {
      setIsClosed(getStatusFromStorage());
    }, 2500); // Check every 2.5 seconds

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [getStatusFromStorage]);

  return { isClosed };
};

export default useSyncStatus;