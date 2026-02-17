import { useState, useEffect } from 'react';

const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isClinicClosed, setIsClinicClosed] = useState(false);

  // In a real app, you'd fetch this from an API
  useEffect(() => {
    // Mock data
    const mockNotifications = [
      { id: 1, message: 'Welcome to the new patient portal!', type: 'info' },
    ];
    setNotifications(mockNotifications);
    setIsClinicClosed(new Date().getDay() === 5); // Example: Clinic closed on Fridays
  }, []);

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return { notifications, isClinicClosed, dismissNotification };
};

export default useNotification;
