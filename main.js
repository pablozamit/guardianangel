const { app, BrowserWindow, desktopCapturer, ipcMain, systemPreferences } = require('electron');
const path = require('path');
const nodemailer = require('nodemailer');
const { exec } = require('child_process');
const os = require('os');

let mainWindow;
const isDev = !app.isPackaged;

// Email configuration
let emailTransporter = null;

// Initialize email service
function initializeEmailService() {
  // Using a temporary email service for demonstration
  // In production, you'd want to use a proper SMTP service
  emailTransporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GUARDIAN_EMAIL_USER || '',
      pass: process.env.GUARDIAN_EMAIL_PASS || ''
    }
  });
}

app.on('ready', () => {
  // Request permissions
  if (process.platform === 'darwin') {
    systemPreferences.askForMediaAccess('screen');
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    // Stealth mode configurations
    show: !process.env.STEALTH_MODE,
    skipTaskbar: !!process.env.STEALTH_MODE,
    minimizable: !process.env.STEALTH_MODE,
    closable: !process.env.STEALTH_MODE
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    const indexPath = path.join(__dirname, 'out', 'index.html');
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('Error loading index.html:', err);
    });
  }

  // Initialize services
  initializeEmailService();
  
  // Hide window in stealth mode
  if (process.env.STEALTH_MODE) {
    mainWindow.hide();
  }
});

// IPC Handlers
ipcMain.handle('request-screen-permissions', async () => {
  try {
    if (process.platform === 'darwin') {
      const hasPermission = systemPreferences.getMediaAccessStatus('screen');
      if (hasPermission !== 'granted') {
        await systemPreferences.askForMediaAccess('screen');
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to request screen permissions:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('capture-screen', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });
    
    if (sources.length > 0) {
      // Return the thumbnail as base64 data URL
      return sources[0].thumbnail.toDataURL();
    }
    
    throw new Error('No screen sources available');
  } catch (error) {
    console.error('Screen capture failed:', error);
    throw error;
  }
});

ipcMain.handle('send-email-alert', async (event, { to, subject, body }) => {
  try {
    if (!emailTransporter) {
      throw new Error('Email service not initialized');
    }
    
    const mailOptions = {
      from: process.env.GUARDIAN_EMAIL_USER || 'guardian@angelguardian.app',
      to: to,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    };
    
    await emailTransporter.sendMail(mailOptions);
    console.log('Guardian alert sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email alert:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('shutdown-device', async () => {
  try {
    const platform = os.platform();
    let command;
    
    switch (platform) {
      case 'win32':
        command = 'shutdown /s /t 0';
        break;
      case 'darwin':
        command = 'sudo shutdown -h now';
        break;
      case 'linux':
        command = 'sudo shutdown -h now';
        break;
      default:
        throw new Error('Unsupported platform for shutdown');
    }
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Shutdown failed:', error);
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to shutdown device:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('enable-stealth-mode', async () => {
  try {
    // Hide from taskbar
    mainWindow.setSkipTaskbar(true);
    
    // Hide window
    mainWindow.hide();
    
    // Minimize to system tray (if implemented)
    // mainWindow.setShowInTaskbar(false);
    
    console.log('Stealth mode enabled');
    return { success: true };
  } catch (error) {
    console.error('Failed to enable stealth mode:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hide-from-task-manager', async () => {
  try {
    // This is platform-specific and requires additional implementation
    // For Windows, this might involve modifying process visibility
    // For macOS/Linux, different approaches are needed
    
    console.log('Attempting to hide from task manager...');
    // Implementation would go here based on platform
    
    return { success: true };
  } catch (error) {
    console.error('Failed to hide from task manager:', error);
    return { success: false, error: error.message };
  }
});

// Uninstall detection
app.on('before-quit', (event) => {
  // Send alert about app termination
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('uninstall-attempt');
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!process.env.STEALTH_MODE) {
        mainWindow.focus();
      }
    }
  });
}

app.on('window-all-closed', () => {
  // In stealth mode, don't quit when all windows are closed
  if (process.platform !== 'darwin' && !process.env.STEALTH_MODE) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0 && !process.env.STEALTH_MODE) {
    // Recreate window if needed (macOS behavior)
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});