const express = require('express');
const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 80;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

const VERSION = "3.0-DARK_PYTHON_CORE";
let HORA_DEL_CAMBIO = 20;

let DB_USERS = { 
    'Sao': 'Sao123',
    'Laetar': 'Clau123',
    'H4xx0rz': 'Dark123',
    'BC': 'Stellar123'
};

let BLACKLIST = new Set();
let SYSTEM = { 
    key: null, 
    dom_hub: null, 
    dom_liberte: null, 
    dom_unknown: null, 
    dom_chat: null, 
    dom_exam: null 
};

let CHAT_HISTORY = [{ user: 'SYSTEM', msg: 'Clau-Core online over DarkVPN.', time: '00:00' }];

function generateDomain(seed) {
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
    let res = '', bits = '';
    for (let i = 0; i < hash.length; i++) bits += parseInt(hash[i], 16).toString(2).padStart(4, '0');
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.substring(i, Math.min(i + 5, bits.length));
        if (chunk.length < 5) break;
        res += alphabet[parseInt(chunk, 2)];
    }
    return res.substring(0, 56);
}

function bootSystem() {
    console.log(`\n🔵 INICIANDO NODO CLAU NETWORK v${VERSION}...`);
    console.log(`⏳ Enlazando con el Núcleo Cuántico en Python...`);
    
    const pythonCorePath = path.join(__dirname, '../quantum_core/quantum_keygen.py');
    const py = spawn('python', [pythonCorePath]);
    
    let pyStdoutBuffer = "";
    
    py.stdout.on('data', (data) => {
        pyStdoutBuffer += data.toString();
    });

    py.stdout.on('end', () => {
        try {
            const res = JSON.parse(pyStdoutBuffer);
            if (res.status === 'success') {
                SYSTEM.key = res.quantum_key;
                console.log(`✅ Entropía Cuántica validada.`);
                
                SYSTEM.dom_hub = `${generateDomain(SYSTEM.key + "HUB")}.clau`;
                SYSTEM.dom_liberte = `${generateDomain(SYSTEM.key + "FREE")}.clau`;
                SYSTEM.dom_unknown = `${generateDomain(SYSTEM.key + "VOID")}.clau`;
                SYSTEM.dom_chat = `${generateDomain(SYSTEM.key + "CHAT")}.clau`;
                SYSTEM.dom_exam = `${generateDomain(SYSTEM.key + "EXAM")}.clau`;

                console.log(`>>DNS::${SYSTEM.dom_hub}::${SYSTEM.dom_liberte}::${SYSTEM.dom_unknown}::${SYSTEM.dom_chat}::${SYSTEM.dom_exam}::DNS<<`);
                
                saveLinksToFile();
            } else {
                console.error(`❌ Python Core Error: ${res.message}`);
            }
        } catch (e) { 
            console.error("❌ Error en la comunicación con el núcleo Python: " + e.message);
        }
    });

    py.stderr.on('data', (data) => {
        console.error(`⚠️ Python Core Warning: ${data}`);
    });
}

function saveLinksToFile() {
    const fecha = new Date().toLocaleString();
    const contenido = `
=============================================================
        CLAU NETWORK - HOSTED ON DARKVPN INFRASTRUCTURE
=============================================================
GENERADO: ${fecha}
NÚCLEO: PYTHON QUANTUM CORE [v${VERSION}]

ENLACES DE ACCESO LIMPIOS (.clau)
(Cada nodo requiere autenticación manual de usuario)

1. HUB CENTRAL:  http://${SYSTEM.dom_hub}/
2. LA LIBERTÉ:   http://${SYSTEM.dom_liberte}/
3. DATOS UNKNOWN:http://${SYSTEM.dom_unknown}/
4. CHAT SEGURO:  http://${SYSTEM.dom_chat}/
5. GATEKEEPER:   http://${SYSTEM.dom_exam}/
6. ADMIN ROOT:   http://${SYSTEM.dom_hub}/admin
=============================================================
`;
    fs.writeFile(path.join(__dirname, 'CLAU_COORDS.txt'), contenido, (err) => {
        if (!err) console.log(`✅ Bitácora generada: CLAU_COORDS.txt`);
    });
}

app.use((req, res, next) => {
    const host = req.get('host');
    const isLocalOrIP = host.includes('localhost') || host.match(/^[0-9.]+$/);
    
    if (!Object.values(SYSTEM).includes(host) && !isLocalOrIP && !host.includes('.dark')) {
        return res.status(403).send("⛔ PROTOCOLO DENEGADO. ACCEDA MEDIANTE CLAU NETWORK.");
    }
    
    if (BLACKLIST.has(req.ip)) {
        return res.status(403).sendFile(path.join(__dirname, 'views', 'blocked.html'));
    }
    
    const user = req.query.u;
    const pass = req.query.p;
    req.authLevel = 'guest'; 
    
    if (user && DB_USERS[user] && DB_USERS[user] === pass) {
        req.authLevel = 'registered';
        req.currentUser = user;
    }
    
    req.currentHost = host;
    next();
});

app.get('/', (req, res) => {
    if (req.currentHost === SYSTEM.dom_chat) return checkAuth(req, res, () => serveChat(res));
    if (req.currentHost === SYSTEM.dom_exam) return res.sendFile(path.join(__dirname, 'views', 'exam.html'));
    if (req.currentHost === SYSTEM.dom_liberte) return res.sendFile(path.join(__dirname, 'views', 'liberte.html'));
    if (req.currentHost === SYSTEM.dom_unknown) return res.sendFile(path.join(__dirname, 'views', 'unknown.html'));
    
    res.sendFile(path.join(__dirname, 'views', 'welcome.html'));
});

function checkAuth(req, res, callback) {
    if (req.authLevel !== 'registered' && !(req.query.u && req.query.u.startsWith('Guest'))) {
        return res.redirect(`http://${SYSTEM.dom_exam}`);
    }
    callback();
}

function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function serveChat(res) {
    fs.readFile(path.join(__dirname, 'views', 'chat.html'), 'utf8', (err, html) => {
        let msgList = CHAT_HISTORY.map(m => {
            const safeUser = escapeHTML(m.user);
            const safeMsg = escapeHTML(m.msg);
            return `<div class="msg"><span class="time">[${m.time}]</span> <span class="user">${safeUser}:</span> ${safeMsg}</div>`;
        }).join('');
        res.send(html.replace('{{CHAT_CONTENT}}', msgList));
    });
}

app.get('/api/status', (req, res) => {
    const u = req.query.u || '';
    const p = req.query.p || '';
    const authQuery = u ? `?u=${u}&p=${p}` : '';

    res.json({
        links: {
            liberte: `http://${SYSTEM.dom_liberte}/${authQuery}`,
            unknown: `http://${SYSTEM.dom_unknown}/`,
            chat: `http://${SYSTEM.dom_chat}/${authQuery}`,
            exam: `http://${SYSTEM.dom_exam}/`,
            admin: `http://${SYSTEM.dom_hub}/admin${authQuery}`
        }
    });
});

app.get('/admin', (req, res) => {
    if (req.authLevel !== 'registered' || req.currentUser !== 'Sao') {
        return res.status(403).send("⛔ ACCESO ROOT DENEGADO.");
    }
    fs.readFile(path.join(__dirname, 'views', 'admin.html'), 'utf8', (err, html) => {
        res.send(html.replace('{{USER_LIST}}', '').replace('{{BAN_LIST}}', '').replace('{{CURRENT_TIME}}', HORA_DEL_CAMBIO));
    });
});

app.post('/verify-exam', (req, res) => {
    if (req.body.p1 === "traicionar") {
        res.redirect(`http://${SYSTEM.dom_chat}/?u=Guest_Approved&p=temp`);
    } else {
        BLACKLIST.add(req.ip);
        res.redirect(`http://${SYSTEM.dom_hub}`);
    }
});

app.post('/send-chat', (req, res) => {
    const { message, u, p } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.redirect(`http://${SYSTEM.dom_chat}/?u=${u}&p=${p}&rt=${Date.now()}`);
    }

    const label = (DB_USERS[u]) ? `Agente ${u}` : 'Invitado';
    
    CHAT_HISTORY.push({ 
        user: label, 
        msg: message.trim(), 
        time: new Date().toLocaleTimeString() 
    });
    
    if (CHAT_HISTORY.length > 50) CHAT_HISTORY.shift();
    
    res.redirect(`http://${SYSTEM.dom_chat}/?u=${u}&p=${p}&rt=${Date.now()}`);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 CLAU NODE LISTENING ON PORT ${PORT}`);
    bootSystem();
});