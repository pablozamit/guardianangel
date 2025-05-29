export interface ElectronAPI {
  // Screen capture
  requestScreenPermissions(): Promise<void>;
  captureScreen(): Promise<string>;
  
  // Email notifications
  sendEmailAlert(alert: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void>;
  
  // System control
  shutdownDevice(): Promise<void>;
  
  // App lifecycle
  onUninstallAttempt(callback: () => void): void;
  
  // Stealth mode
  hideFromTaskManager(): Promise<void>;
  enableStealthMode(): Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}