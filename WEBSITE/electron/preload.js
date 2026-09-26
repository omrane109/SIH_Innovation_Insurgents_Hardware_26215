const { contextBridge, ipcRenderer } = require("electron")

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // File operations
  saveFile: (data, filename) => ipcRenderer.invoke("save-file", data, filename),

  // Bluetooth operations
  scanBluetooth: () => ipcRenderer.invoke("scan-bluetooth"),
  connectBluetooth: (deviceId) => ipcRenderer.invoke("connect-bluetooth", deviceId),

  // Menu actions
  onMenuAction: (callback) => ipcRenderer.on("menu-action", callback),
  removeMenuActionListener: (callback) => ipcRenderer.removeListener("menu-action", callback),

  // System info
  platform: process.platform,

  // App info
  getVersion: () => ipcRenderer.invoke("get-version"),
})

// Security: Remove Node.js globals
delete window.require
delete window.exports
delete window.module
