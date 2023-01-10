const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    redirect: (url) => ipcRenderer.send('app:redirect', url),
    selectFolder: () => ipcRenderer.invoke('dialog:openDirectory')
})