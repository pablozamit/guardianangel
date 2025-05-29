'use client';

import { detectContent } from '@/ai/flows/detect-content-flow';

export interface MonitoringConfig {
  screenAnalysisInterval: number; // in milliseconds
  keyboardMonitoringEnabled: boolean;
  strictMode: boolean;
  guardianEmail: string;
}

export interface DetectionResult {
  type: 'screen' | 'keyboard' | 'network' | 'uninstall';
  isInappropriate: boolean;
  confidence: number;
  reason: string;
  timestamp: Date;
  content?: string;
}

class MonitoringService {
  private config: MonitoringConfig | null = null;
  private screenCaptureInterval: NodeJS.Timeout | null = null;
  private keyboardBuffer: string = '';
  private inappropriateKeywords: string[] = [
    // Spanish inappropriate search terms
    'porno', 'porn', 'xxx', 'sexo', 'desnudo', 'desnuda', 'erotico', 'erotica',
    'masturbacion', 'masturbar', 'pornografia', 'pornhub', 'xvideos', 'redtube',
    'youporn', 'tube8', 'amateur', 'webcam', 'cam4', 'chaturbate', 'onlyfans',
    'nude', 'naked', 'strip', 'stripper', 'escort', 'prostituta', 'fetish',
    'bondage', 'bdsm', 'anal', 'oral', 'vaginal', 'penis', 'vagina', 'clitoris'
  ];
  private lastNetworkCheck: Date = new Date();
  private isOfflineAlertSent: boolean = false;

  async initialize(config: MonitoringConfig): Promise<void> {
    this.config = config;
    
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Initialize Electron-specific monitoring
      await this.initializeElectronMonitoring();
    }
    
    this.startScreenMonitoring();
    this.startKeyboardMonitoring();
    this.startNetworkMonitoring();
    
    console.log('Monitoring service initialized with config:', config);
  }

  private async initializeElectronMonitoring(): Promise<void> {
    try {
      // Request screen capture permissions
      await window.electronAPI.requestScreenPermissions();
      
      // Setup uninstall detection
      window.electronAPI.onUninstallAttempt(() => {
        this.handleDetection({
          type: 'uninstall',
          isInappropriate: true,
          confidence: 1.0,
          reason: 'Attempted to uninstall Ángel Guardián',
          timestamp: new Date()
        });
      });

    } catch (error) {
      console.error('Failed to initialize Electron monitoring:', error);
    }
  }

  private startScreenMonitoring(): void {
    if (!this.config) return;

    this.screenCaptureInterval = setInterval(async () => {
      await this.captureAndAnalyzeScreen();
    }, this.config.screenAnalysisInterval);
  }

  private async captureAndAnalyzeScreen(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Use Electron's screen capture
        const screenshot = await window.electronAPI.captureScreen();
        await this.analyzeScreenshot(screenshot);
      } else {
        // Fallback for web environment (limited functionality)
        console.warn('Screen capture not available in web environment');
      }
    } catch (error) {
      console.error('Screen capture failed:', error);
    }
  }

  private async analyzeScreenshot(screenshot: string): Promise<void> {
    try {
      // Convert screenshot to description using AI vision (if available)
      const imageDescription = await this.extractImageDescription(screenshot);
      
      // Analyze content using existing AI flow
      const result = await detectContent({ imageDescription });
      
      if (result.isInappropriate) {
        await this.handleDetection({
          type: 'screen',
          isInappropriate: true,
          confidence: result.confidence,
          reason: result.reason,
          timestamp: new Date(),
          content: `Screen content detected: ${imageDescription.substring(0, 100)}...`
        });
      }
    } catch (error) {
      console.error('Screen analysis failed:', error);
    }
  }

  private async extractImageDescription(screenshot: string): Promise<string> {
    // This would typically use OCR or vision AI to extract text/description from image
    // For now, we'll simulate this functionality
    
    // In a real implementation, you'd use services like:
    // - Google Vision API
    // - Tesseract.js for OCR
    // - Convert image to text description
    
    return `Screenshot captured at ${new Date().toISOString()}. Contains visual content that requires analysis.`;
  }

  private startKeyboardMonitoring(): void {
    if (!this.config?.keyboardMonitoringEnabled || typeof window === 'undefined') return;

    // Global keyboard listener
    document.addEventListener('keydown', (event) => {
      this.handleKeyPress(event.key);
    });

    // Monitor input fields
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target && (target.type === 'text' || target.type === 'search' || target.tagName === 'TEXTAREA')) {
        this.analyzeInputContent(target.value);
      }
    });
  }

  private handleKeyPress(key: string): void {
    if (key.length === 1) {
      this.keyboardBuffer += key.toLowerCase();
      
      // Keep buffer size manageable
      if (this.keyboardBuffer.length > 1000) {
        this.keyboardBuffer = this.keyboardBuffer.slice(-500);
      }
      
      this.checkForInappropriateKeywords();
    }
  }

  private analyzeInputContent(content: string): void {
    const words = content.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      if (this.inappropriateKeywords.includes(word)) {
        this.handleDetection({
          type: 'keyboard',
          isInappropriate: true,
          confidence: 0.9,
          reason: `Inappropriate search term detected: "${word}"`,
          timestamp: new Date(),
          content: content.substring(0, 100)
        });
        break;
      }
    }
  }

  private checkForInappropriateKeywords(): void {
    for (const keyword of this.inappropriateKeywords) {
      if (this.keyboardBuffer.includes(keyword)) {
        this.handleDetection({
          type: 'keyboard',
          isInappropriate: true,
          confidence: 0.8,
          reason: `Inappropriate keyword detected in typing: "${keyword}"`,
          timestamp: new Date(),
          content: this.keyboardBuffer.slice(-50)
        });
        
        // Clear buffer to avoid repeated alerts for same content
        this.keyboardBuffer = '';
        break;
      }
    }
  }

  private startNetworkMonitoring(): void {
    setInterval(() => {
      this.checkNetworkStatus();
    }, 60000); // Check every minute
  }

  private checkNetworkStatus(): void {
    if (navigator.onLine) {
      this.lastNetworkCheck = new Date();
      this.isOfflineAlertSent = false;
    } else {
      const offlineTime = Date.now() - this.lastNetworkCheck.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (offlineTime >= twentyFourHours && !this.isOfflineAlertSent) {
        this.handleDetection({
          type: 'network',
          isInappropriate: true,
          confidence: 1.0,
          reason: 'Device has been offline for more than 24 hours',
          timestamp: new Date()
        });
        this.isOfflineAlertSent = true;
      }
    }
  }

  private async handleDetection(detection: DetectionResult): Promise<void> {
    try {
      // Log detection
      console.log('Inappropriate content detected:', detection);
      
      // Update blocked attempts counter
      this.incrementBlockedAttempts();
      
      // Send alert to guardian
      if (this.config?.guardianEmail) {
        await this.sendGuardianAlert(detection);
      }
      
      // Handle strict mode
      if (this.config?.strictMode && detection.isInappropriate) {
        await this.handleStrictMode(detection);
      }
      
      // Show blocking overlay (if not in stealth mode)
      this.showBlockingOverlay(detection);
      
    } catch (error) {
      console.error('Failed to handle detection:', error);
    }
  }

  private incrementBlockedAttempts(): void {
    const currentAttempts = parseInt(localStorage.getItem('guardian_angel_blocked_attempts') || '0');
    localStorage.setItem('guardian_angel_blocked_attempts', (currentAttempts + 1).toString());
  }

  private async sendGuardianAlert(detection: DetectionResult): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.sendEmailAlert({
          to: this.config!.guardianEmail,
          subject: `🚨 Alerta de Ángel Guardián - ${detection.type}`,
          body: this.generateAlertEmailBody(detection)
        });
      }
    } catch (error) {
      console.error('Failed to send guardian alert:', error);
    }
  }

  private generateAlertEmailBody(detection: DetectionResult): string {
    const deviceInfo = `${navigator.platform} - ${navigator.userAgent}`;
    const timestamp = detection.timestamp.toLocaleString('es-ES');
    
    return `
    🚨 ALERTA DE ÁNGEL GUARDIÁN
    
    Se ha detectado contenido inapropiado en el dispositivo protegido.
    
    📊 DETALLES DE LA DETECCIÓN:
    • Tipo: ${detection.type.toUpperCase()}
    • Fecha y Hora: ${timestamp}
    • Nivel de Confianza: ${Math.round(detection.confidence * 100)}%
    • Razón: ${detection.reason}
    ${detection.content ? `• Contenido: ${detection.content}` : ''}
    
    💻 INFORMACIÓN DEL DISPOSITIVO:
    • Sistema: ${deviceInfo}
    • IP: [Se detectará automáticamente]
    
    🔧 ACCIONES TOMADAS:
    • Contenido bloqueado
    • Incidente registrado
    ${this.config?.strictMode ? '• Dispositivo apagado automáticamente' : ''}
    
    Este es un mensaje automático del sistema Ángel Guardián.
    No responder a este correo.
    `;
  }

  private async handleStrictMode(detection: DetectionResult): Promise<void> {
    try {
      // Wait 5 seconds to ensure alert is sent
      setTimeout(async () => {
        if (typeof window !== 'undefined' && window.electronAPI) {
          await window.electronAPI.shutdownDevice();
        }
      }, 5000);
    } catch (error) {
      console.error('Failed to shutdown device:', error);
    }
  }

  private showBlockingOverlay(detection: DetectionResult): void {
    // Trigger blocking overlay - this would be handled by the UI component
    const event = new CustomEvent('contentBlocked', { 
      detail: detection 
    });
    window.dispatchEvent(event);
  }

  stop(): void {
    if (this.screenCaptureInterval) {
      clearInterval(this.screenCaptureInterval);
      this.screenCaptureInterval = null;
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyPress);
    document.removeEventListener('input', this.analyzeInputContent);
    
    console.log('Monitoring service stopped');
  }
}

export const monitoringService = new MonitoringService();