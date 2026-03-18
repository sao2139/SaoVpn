const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const platform = os.platform();
const hostsPath = platform === 'win32' ? 'C:\\Windows\\System32\\drivers\\etc\\hosts' : '/etc/hosts';
const SERVER_PATH = path.join(__dirname, '../vpn_node/sao_vpn_router.js');

let mainWindow;
let serverProcess = null;
let currentDomains = [];

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400, height: 480, resizable: false,
        title: "SaoVPN v1.0", backgroundColor: '#050505',
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    mainWindow.setMenu(null);
    mainWindow.loadFile('index.html');
    mainWindow.on('close', () => stopSystem());
}

function startServerAndConnect(event, user, pass) {
    if (serverProcess) stopSystem();
    
    try {
        fs.accessSync(hostsPath, fs.constants.W_OK);
    } catch (err) {
        console.error("⛔ NO HAY PERMISOS DE ESCRITURA.");
        event.reply('vpn-status', { status: 'error', msg: 'REQUIRES ADMIN RIGHTS' });
        dialog.showErrorBox("Error de Acceso", "SaoVPN necesita ejecutarse como ADMINISTRADOR para modificar la red.");
        return;
    }

    serverProcess = spawn('node', [SERVER_PATH], { stdio: ['ignore', 'pipe', 'pipe'] });
    serverProcess.stdout.pipe(process.stdout);

    serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        
        if (output.includes('>>DNS::')) {
            const match = output.match(/>>DNS::(.*)::(.*)::(.*)::(.*)::(.*)::DNS<</);
            
            if (match) {
                const dHub = match[1];
                const dLib = match[2];
                const dUnk = match[3];
                const dChat = match[4];
                const dExam = match[5];
                
                currentDomains = [dHub, dLib, dUnk, dChat, dExam];
                
                try {
                    currentDomains.forEach(d => injectHost(d));
                    event.reply('vpn-status', { status: 'connected' });
                    launchFirefox(dHub, user, pass);
                } catch (e) {
                    event.reply('vpn-status', { status: 'error', msg: 'HOSTS FILE ERROR' });
                }
            }
        }
    });
}

function stopSystem() {
    if (serverProcess) { serverProcess.kill(); serverProcess = null; }
    cleanupHost();
}

function injectHost(domain) {
    let content = fs.readFileSync(hostsPath, 'utf8');
    if (!content.includes(domain)) {
        fs.writeFileSync(hostsPath, content + `\n127.0.0.1 ${domain}`);
    }
}

function cleanupHost() {
    if (currentDomains.length === 0) return;
    try {
        let content = fs.readFileSync(hostsPath, 'utf8');
        currentDomains.forEach(domain => {
            const regex = new RegExp(`\\s*127\\.0\\.0\\.1\\s+${domain}`, 'g');
            content = content.replace(regex, '');
        });
        content = content.replace(/^\s*[\r\n]/gm, "");
        fs.writeFileSync(hostsPath, content);
    } catch (e) { }
}

function launchFirefox(domain, user, pass) {
    const targetUrl = `http://${domain}/?u=${user}&p=${pass}`;
    const cmd = platform === 'win32' ? `start firefox "${targetUrl}"` : `firefox "${targetUrl}"`;
    exec(cmd);
}

app.whenReady().then(createWindow);

ipcMain.on('vpn-action', (event, data) => {
    if (data.type === 'connect') startServerAndConnect(event, data.user, data.pass);
    else if (data.type === 'disconnect') {
        stopSystem();
        event.reply('vpn-status', { status: 'disconnected' });
        setTimeout(() => app.quit(), 1000);
    }
});