// Demo live de las 3 herramientas Arachne usando Node.js nativo
const crypto = require('crypto');
const http = require('http');

// ==========================================
// TOOL 1: QUANTUM ENTROPY INJECTOR
// Genera hashes SHA-256 reales de cualquier texto
// ==========================================
console.log("=== TOOL 1: QUANTUM ENTROPY INJECTOR ===\n");

const inputs = ["Sao123", "password", "Clau Network", "arachne127"];
for (const text of inputs) {
    const hash256 = crypto.createHash('sha256').update(text).digest('hex');
    const hash512 = crypto.createHash('sha512').update(text).digest('hex').substring(0,64) + "...";
    console.log(`Input:   "${text}"`);
    console.log(`SHA-256: ${hash256}`);
    console.log(`SHA-512: ${hash512}`);
    console.log();
}

// ==========================================
// TOOL 3: HASH CRACKER (dictionary attack)
// Ejemplo: crackear el hash de "Clau123"
// ==========================================
console.log("=== TOOL 3: ZERO-DAY TENSOR EXPLOIT KIT (Hash Cracker) ===\n");

const targetPlain = "Clau123";
const targetHash = crypto.createHash('sha256').update(targetPlain).digest('hex');
console.log(`Hash objetivo (SHA-256 de "${targetPlain}"):`);
console.log(targetHash);
console.log("\nAtacando con diccionario...");

const wordlist = ["password","123456","qwerty","letmein","admin","testpass","Clau123","Sao123","Dark123"];
let found = false;
for (const word of wordlist) {
    const attempt = crypto.createHash('sha256').update(word).digest('hex');
    process.stdout.write(`Intentando: ${word.padEnd(12)} -> ${attempt.substring(0,20)}...`);
    if (attempt === targetHash) {
        console.log(`  ⚡ MATCH!`);
        console.log(`\n✅ HASH CRACKEADO: "${word}"`);
        found = true;
        break;
    } else {
        console.log('  ✗');
    }
}

// ==========================================
// TOOL 2: PORT SCANNER
// Intenta conectar a puertos conocidos en localhost
// ==========================================
console.log("\n=== TOOL 2: WAVE-FUNCTION COLLAPSE SCANNER (Port Scanner) ===\n");
console.log("Escaneando 127.0.0.1 en puertos: 80, 443, 3000, 8080, 8443, 5000, 22...\n");

const portsToScan = [80, 443, 3000, 8080, 8443, 5000, 22, 3306, 5432];
const net = require('net');

function scanPort(port) {
    return new Promise((resolve) => {
        const sock = new net.Socket();
        sock.setTimeout(400);
        sock.connect(port, '127.0.0.1', () => {
            sock.destroy();
            resolve({ port, open: true });
        });
        sock.on('error', () => { sock.destroy(); resolve({ port, open: false }); });
        sock.on('timeout', () => { sock.destroy(); resolve({ port, open: false }); });
    });
}

const SVCMAP = {80:'HTTP',443:'HTTPS',3000:'HTTP-Dev',8080:'HTTP-Alt',8443:'HTTPS-Alt',5000:'HTTP-Dev',22:'SSH',3306:'MySQL',5432:'PostgreSQL'};
(async () => {
    for (const port of portsToScan) {
        const res = await scanPort(port);
        const svc = SVCMAP[port] || '?';
        if (res.open) {
            console.log(`  ✅ ABIERTO  Puerto ${port} (${svc})`);
        } else {
            console.log(`  ✗  cerrado  Puerto ${port} (${svc})`);
        }
    }
    console.log("\n=== FIN DEL DEMO ===");
})();
