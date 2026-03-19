const http = require('http');
const fs = require('fs');
const file = fs.readFileSync('../vpn_node/CLAU_COORDS.txt', 'utf8');
const hub = file.match(/HUB CENTRAL:\s*http:\/\/([^/]+)\//)[1];

function get(path) {
    return new Promise((resolve, reject) => {
        const req = http.get({ hostname: '127.0.0.1', port: 80, path, headers: { Host: hub }, timeout: 15000 }, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        });
        req.on('error', e => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
}

function post(path, body) {
    const data = JSON.stringify(body);
    return new Promise((resolve, reject) => {
        const req = http.request({ hostname: '127.0.0.1', port: 80, path, method: 'POST', headers: { Host: hub, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }, timeout: 30000 }, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        });
        req.on('error', e => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.write(data); req.end();
    });
}

(async () => {
    try {
        console.log("Hub:", hub);

        // Test quantum-random
        console.log("\n1. Quantum Random...");
        const qr = JSON.parse(await get('/api/quantum-random?n=8'));
        console.log(`   ${qr.status === 'success' ? '✅' : '❌'} Source: ${qr.source} Hex: ${qr.hex}`);

        // Test pq-keygen
        console.log("2. PQ Keygen...");
        const kg = JSON.parse(await get('/api/pq-keygen'));
        console.log(`   ${kg.status === 'success' ? '✅' : '❌'} ${kg.algorithm}`);

        // Test encrypt + decrypt round-trip
        const msg = "Arachne127";
        console.log(`3. PQ Encrypt "${msg}"...`);
        const enc = JSON.parse(await post('/api/pq-encrypt', { public_key: kg.public_key, message: msg }));
        console.log(`   ${enc.status === 'success' ? '✅' : '❌'} bits=${enc.bits_encrypted}`);

        console.log("4. PQ Decrypt...");
        const dec = JSON.parse(await post('/api/pq-decrypt', { private_key: kg.private_key, ciphertext: enc.ciphertext }));
        console.log(`   ${dec.message === msg ? '✅' : '❌'} Descifrado: "${dec.message}"`);

    } catch(e) { console.log("ERROR:", e.message); }
    process.exit(0);
})();
