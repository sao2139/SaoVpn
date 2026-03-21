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
    dom_exam: null,
    dom_arach: null,
    dom_tool1: null,
    dom_tool2: null,
    dom_tool3: null,
    dom_tool4: null,
    dom_tool5: null,
    dom_tool6: null
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

let ACTIVITY_LOGS = [];

function logEvent(user, type, detail) {
    const time = new Date().toLocaleTimeString();
    ACTIVITY_LOGS.unshift({ time, user: user || 'Desconocido', type, detail });

    if (ACTIVITY_LOGS.length > 100) ACTIVITY_LOGS.pop();
    console.log(`[ARACHNE LOG] ${time} | ${user} | ${type} | ${detail}`);
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
                SYSTEM.dom_arach = `${generateDomain(SYSTEM.key + "ARACH")}.arach`;
                SYSTEM.dom_tool1 = `${generateDomain(SYSTEM.key + "ARACH1")}.arach`;
                SYSTEM.dom_tool2 = `${generateDomain(SYSTEM.key + "ARACH2")}.arach`;
                SYSTEM.dom_tool3 = `${generateDomain(SYSTEM.key + "ARACH3")}.arach`;
                SYSTEM.dom_tool4 = `${generateDomain(SYSTEM.key + "ARACH4")}.arach`;
                SYSTEM.dom_tool5 = `${generateDomain(SYSTEM.key + "ARACH5")}.arach`;
                SYSTEM.dom_tool6 = `${generateDomain(SYSTEM.key + "ARACH6")}.arach`;

                const allDomains = [
                    SYSTEM.dom_hub, SYSTEM.dom_liberte, SYSTEM.dom_unknown, SYSTEM.dom_chat, SYSTEM.dom_exam,
                    SYSTEM.dom_arach, SYSTEM.dom_tool1, SYSTEM.dom_tool2, SYSTEM.dom_tool3, SYSTEM.dom_tool4, SYSTEM.dom_tool5, SYSTEM.dom_tool6
                ];
                console.log(`>>DNS::${allDomains.join('::')}::DNS<<`);

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
-------------------------------------------------------------
[RED OCULTA ARACHNE]
7. ARACHNE NEST:    http://${SYSTEM.dom_arach}/
8. TOOL-1 ENTROPY:  http://${SYSTEM.dom_tool1}/
9. TOOL-2 SCANNER:  http://${SYSTEM.dom_tool2}/
10.TOOL-3 CRACKER:  http://${SYSTEM.dom_tool3}/
11.TOOL-4 CIPHER:   http://${SYSTEM.dom_tool4}/
12.TOOL-5 STEGO:    http://${SYSTEM.dom_tool5}/
13.TOOL-6 QKD:      http://${SYSTEM.dom_tool6}/
=============================================================
`;
    fs.writeFile(path.join(__dirname, 'CLAU_COORDS.txt'), contenido, (err) => {
        if (!err) console.log(`✅ Bitácora generada: CLAU_COORDS.txt`);
    });
}

app.use((req, res, next) => {
    const host = req.get('host');
    const isLocalOrIP = host.includes('localhost') || host.match(/^[0-9.]+$/);

    if (!Object.values(SYSTEM).includes(host) && !isLocalOrIP && !host.includes('.dark') && !host.includes('.sgate')) {
        return res.status(403).send("⛔ PROTOCOLO DENEGADO. ACCEDA MEDIANTE CLAU NETWORK O ARACHNE.");
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

    if (req.currentHost === SYSTEM.dom_arach) { logEvent('Guest_Arachne', 'ACCESO', 'Arachne Main Hub'); return res.sendFile(path.join(__dirname, 'views', 'arachne.html')); }
    if (req.currentHost === SYSTEM.dom_tool1) { logEvent('Guest_Arachne', 'EJECUCIÓN', 'Tool 1 (PQ Generator)'); return res.sendFile(path.join(__dirname, 'views', 'arachne_tool1.html')); }
    if (req.currentHost === SYSTEM.dom_tool2) { logEvent('Guest_Arachne', 'EJECUCIÓN', 'Tool 2 (Scanner)'); return res.sendFile(path.join(__dirname, 'views', 'arachne_tool2.html')); }
    if (req.currentHost === SYSTEM.dom_tool3) { logEvent('Guest_Arachne', 'EJECUCIÓN', 'Tool 3 (Exploit Kit)'); return res.sendFile(path.join(__dirname, 'views', 'arachne_tool3.html')); }
    if (req.currentHost === SYSTEM.dom_tool4) { logEvent('Guest_Arachne', 'EJECUCIÓN', 'Tool 4 (LWE Cipher)'); return res.sendFile(path.join(__dirname, 'views', 'arachne_tool4.html')); }
    if (req.currentHost === SYSTEM.dom_tool5) { logEvent('Guest_Arachne', 'EJECUCIÓN', 'Tool 5 (PQ Stego)'); return res.sendFile(path.join(__dirname, 'views', 'arachne_tool5.html')); }
    if (req.currentHost === SYSTEM.dom_tool6) { logEvent('Guest_Arachne', 'EJECUCIÓN', 'Tool 6 (BB84 QKD)'); return res.sendFile(path.join(__dirname, 'views', 'arachne_tool6.html')); }

    if (req.currentHost === SYSTEM.dom_exam) return res.sendFile(path.join(__dirname, 'views', 'exam.html'));
    if (req.currentHost === SYSTEM.dom_liberte) return res.sendFile(path.join(__dirname, 'views', 'liberte.html'));
    if (req.currentHost === SYSTEM.dom_unknown) return res.sendFile(path.join(__dirname, 'views', 'unknown.html'));

    res.sendFile(path.join(__dirname, 'views', 'welcome.html'));
});

function checkAuth(req, res, callback) {
    if (req.authLevel !== 'registered' && !(req.query.u && req.query.u.startsWith('Guest'))) {
        const targetUrl = encodeURIComponent(`http://${req.currentHost}${req.originalUrl}`);
        return res.redirect(`http://${SYSTEM.dom_exam}/?redirect=${targetUrl}`);
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
            arachne: `http://${SYSTEM.dom_arach}/`,
            tool1: `http://${SYSTEM.dom_tool1}/`,
            tool2: `http://${SYSTEM.dom_tool2}/`,
            tool3: `http://${SYSTEM.dom_tool3}/`,
            tool4: `http://${SYSTEM.dom_tool4}/`,
            tool5: `http://${SYSTEM.dom_tool5}/`,
            tool6: `http://${SYSTEM.dom_tool6}/`,
            admin: `http://${SYSTEM.dom_hub}/admin${authQuery}`
        }
    });
});

app.get('/api/quantum-random', (req, res) => {
    const n = Math.min(parseInt(req.query.n) || 32, 256);
    const py = spawn('python', [path.join(__dirname, '..', 'quantum_core', 'quantum_random.py'), n.toString()]);
    let out = '';
    py.stdout.on('data', d => out += d);
    py.stderr.on('data', () => { });
    py.on('close', () => {
        try { res.json(JSON.parse(out)); }
        catch { res.json({ status: 'error', hex: require('crypto').randomBytes(n).toString('hex'), source: 'fallback_node' }); }
    });
});

app.get('/api/pq-keygen', (req, res) => {
    const py = spawn('python', [path.join(__dirname, '..', 'quantum_core', 'post_quantum.py'), 'keygen']);
    let out = '';
    py.stdout.on('data', d => out += d);
    py.stderr.on('data', () => { });
    py.on('close', () => {
        try { res.json(JSON.parse(out)); }
        catch { res.status(500).json({ status: 'error', message: 'keygen failed' }); }
    });
});

app.post('/api/pq-encrypt', express.json({ limit: '5mb' }), (req, res) => {
    const { public_key, message } = req.body;
    if (!public_key || !message) return res.status(400).json({ status: 'error', message: 'public_key y message requeridos' });
    const py = spawn('python', [
        path.join(__dirname, '..', 'quantum_core', 'post_quantum.py'),
        'encrypt', JSON.stringify(public_key), message
    ]);
    let out = '';
    py.stdout.on('data', d => out += d);
    py.stderr.on('data', () => { });
    py.on('close', () => {
        try { res.json(JSON.parse(out)); }
        catch { res.status(500).json({ status: 'error', message: 'encrypt failed' }); }
    });
});

app.post('/api/pq-decrypt', express.json({ limit: '50mb' }), (req, res) => {
    const { private_key, ciphertext } = req.body;
    if (!private_key || !ciphertext) return res.status(400).json({ status: 'error', message: 'private_key y ciphertext requeridos' });
    const py = spawn('python', [
        path.join(__dirname, '..', 'quantum_core', 'post_quantum.py'),
        'decrypt', JSON.stringify(private_key), JSON.stringify(ciphertext)
    ]);
    let out = '';
    py.stdout.on('data', d => out += d);
    py.stderr.on('data', () => { });
    py.on('close', () => {
        try { res.json(JSON.parse(out)); }
        catch { res.status(500).json({ status: 'error', message: 'decrypt failed' }); }
    });
});

app.get('/tool1', (req, res) => {
    if (req.currentHost !== SYSTEM.dom_arach) return res.status(403).send('⛔ PROTOCOLO DENEGADO.');
    return res.sendFile(path.join(__dirname, 'views', 'arachne_tool1.html'));
});

app.get('/tool2', (req, res) => {
    if (req.currentHost !== SYSTEM.dom_arach) return res.status(403).send('⛔ PROTOCOLO DENEGADO.');
    return res.sendFile(path.join(__dirname, 'views', 'arachne_tool2.html'));
});

app.get('/tool3', (req, res) => {
    if (req.currentHost !== SYSTEM.dom_arach) return res.status(403).send('⛔ PROTOCOLO DENEGADO.');
    return res.sendFile(path.join(__dirname, 'views', 'arachne_tool3.html'));
});

app.get('/tool4', (req, res) => {
    if (req.currentHost !== SYSTEM.dom_arach) return res.status(403).send('⛔ PROTOCOLO DENEGADO.');
    return res.sendFile(path.join(__dirname, 'views', 'arachne_tool4.html'));
});

app.get('/tool5', (req, res) => {
    if (req.currentHost !== SYSTEM.dom_arach) return res.status(403).send('⛔ PROTOCOLO DENEGADO.');
    return res.sendFile(path.join(__dirname, 'views', 'arachne_tool5.html'));
});

app.get('/tool6', (req, res) => {
    if (req.currentHost !== SYSTEM.dom_arach) return res.status(403).send('⛔ PROTOCOLO DENEGADO.');
    return res.sendFile(path.join(__dirname, 'views', 'arachne_tool6.html'));
});

app.get('/admin', (req, res) => {
    if (req.authLevel !== 'registered' || req.currentUser !== 'Sao') {
        return res.status(403).send("⛔ ACCESO ROOT DENEGADO.");
    }

    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

function checkRootAPI(req, res, next) {
    const u = req.body.u || req.query.u;
    const p = req.body.p || req.query.p;
    if (u === 'Sao' && DB_USERS['Sao'] === p) {
        next();
    } else {
        res.status(403).json({ error: "⛔ REQUIERE PRIVILEGIOS ROOT" });
    }
}

app.get('/api/admin/data', checkRootAPI, (req, res) => {
    res.json({
        users: DB_USERS,
        blacklist: Array.from(BLACKLIST),
        hora: HORA_DEL_CAMBIO,
        chatCount: CHAT_HISTORY.length,
        logs: ACTIVITY_LOGS 
    });
});

app.post('/api/admin/action', express.json(), checkRootAPI, (req, res) => {
    const { action, target, value } = req.body;

    if (action === 'add_user') {
        if (target && value) DB_USERS[target] = value;
    }
    else if (action === 'del_user') {
        if (target && target !== 'Sao') delete DB_USERS[target]; 
    }
    else if (action === 'unban') {
        if (target) BLACKLIST.delete(target);
    }
    else if (action === 'clear_chat') {
        CHAT_HISTORY = [{ user: 'SYSTEM', msg: 'Historial purgado por ROOT.', time: new Date().toLocaleTimeString() }];
    }
    else if (action === 'set_time') {
        if (value) HORA_DEL_CAMBIO = value;
    }

    res.json({ success: true });
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