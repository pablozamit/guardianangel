const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Screen capture methods
  requestScreenPermissions: () => ipcRenderer.invoke('request-screen-permissions'),
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  
  // Email notification methods
  sendEmailAlert: (alert) => ipcRenderer.invoke('send-email-alert', alert),
  
  // System control methods
  shutdownDevice: () => ipcRenderer.invoke('shutdown-device'),
  
  // Stealth mode methods
  enableStealthMode: () => ipcRenderer.invoke('enable-stealth-mode'),
  hideFromTaskManager: () => ipcRenderer.invoke('hide-from-task-manager'),
  
  // App lifecycle methods
  onUninstallAttempt: (callback) => {
    ipcRenderer.on('uninstall-attempt', callback);
  },
  
  // Utility methods
  getPlatform: () => process.platform,
  getVersion: () => process.env.npm_package_version || '1.0.0'
});