"use client";

import { useState, useEffect, useCallback } from 'react';

const LOCAL_NOTIFICATIONS_KEY = 'guardian_angel_local_notifications';
const STRICT_MODE_KEY = 'guardian_angel_strict_mode';
const MONITORING_ENABLED_KEY = 'guardian_angel_monitoring_enabled';

type AppSettingsStore = {
  localNotificationsEnabled: boolean;
  strictModeEnabled: boolean;
  monitoringEnabled: boolean;
  isInitialized: boolean;
  toggleLocalNotifications: () => void;
  toggleStrictMode: () => void;
  toggleMonitoring: () => void;
};

export function useAppSettingsStore(): AppSettingsStore {
  const [localNotificationsEnabled, setLocalNotificationsEnabled] = useState<boolean>(true);
  const [strictModeEnabled, setStrictModeEnabled] = useState<boolean>(false);
  const [monitoringEnabled, setMonitoringEnabled] = useState<boolean>(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLocalNotifications = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
      const storedStrictMode = localStorage.getItem(STRICT_MODE_KEY);
      const storedMonitoring = localStorage.getItem(MONITORING_ENABLED_KEY);
      
      if (storedLocalNotifications !== null) {
        setLocalNotificationsEnabled(storedLocalNotifications === 'true');
      }
      if (storedStrictMode !== null) {
        setStrictModeEnabled(storedStrictMode === 'true');
      }
      if (storedMonitoring !== null) {
        setMonitoringEnabled(storedMonitoring === 'true');
      }
      setInitialized(true);
    }
  }, []);

  const toggleLocalNotifications = useCallback(() => {
    setLocalNotificationsEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, newValue.toString());
      return newValue;
    });
  }, []);

  const toggleStrictMode = useCallback(() => {
    setStrictModeEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(STRICT_MODE_KEY, newValue.toString());
      return newValue;
    });
  }, []);

  const toggleMonitoring = useCallback(() => {
    setMonitoringEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(MONITORING_ENABLED_KEY, newValue.toString());
      return newValue;
    });
  }, []);

  return {
    localNotificationsEnabled: initialized ? localNotificationsEnabled : true,
    strictModeEnabled: initialized ? strictModeEnabled : false,
    monitoringEnabled: initialized ? monitoringEnabled : true,
    isInitialized: initialized,
    toggleLocalNotifications,
    toggleStrictMode,
    toggleMonitoring,
  };
}