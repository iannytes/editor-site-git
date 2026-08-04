const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('waterGymInstaller', {
  dryRun: () => ipcRenderer.invoke('setup:dry-run'),
  apply: (options) => ipcRenderer.invoke('setup:apply', options || {}),
  openSite: () => ipcRenderer.invoke('app:open-site'),
  healthCheck: () => ipcRenderer.invoke('health:check'),
  credentialsStatus: () => ipcRenderer.invoke('credentials:status'),
  credentialsSave: (apiKey) => ipcRenderer.invoke('credentials:save', apiKey),
  credentialsClear: () => ipcRenderer.invoke('credentials:clear'),
  chooseFolder: () => ipcRenderer.invoke('folders:choose'),
  listAllowedFolders: () => ipcRenderer.invoke('folders:list'),
  addAllowedFolder: (folderPath) => ipcRenderer.invoke('folders:add', folderPath),
  removeAllowedFolder: (folderPath) => ipcRenderer.invoke('folders:remove', folderPath),
  inventoryAllowedFolders: () => ipcRenderer.invoke('folders:inventory'),
  commsSnapshot: (channelId) => ipcRenderer.invoke('comms:snapshot', channelId),
  commsMessages: (channelId, limit) => ipcRenderer.invoke('comms:messages', channelId, limit),
  commsSend: (input) => ipcRenderer.invoke('comms:send', input || {}),
  commsTask: (input) => ipcRenderer.invoke('comms:task', input || {}),
  abilitiesList: () => ipcRenderer.invoke('abilities:list'),
  abilityStart: (input) => ipcRenderer.invoke('abilities:start', input || {}),
  pathsFromDroppedFiles: (files) => Array.from(files || [])
    .map((file) => webUtils.getPathForFile(file))
    .filter(Boolean),
  onLog: (callback) => {
    const listener = (_event, line) => callback(line);
    ipcRenderer.on('setup:log', listener);
    return () => ipcRenderer.removeListener('setup:log', listener);
  },
});
