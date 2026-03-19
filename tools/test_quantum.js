const http = require('http');
const fs = require('fs');
const file = fs.readFileSync('../vpn_node/CLAU_COORDS.txt', 'utf8');
const hub = file.match(/HUB CENTRAL:\s*http:\/\/([^/]+)\//)[1];

console.log("\n=== QUANTUM API + POST-QUANTUM TESTS ===\n");

function get(path) {
    return new Promise(r => {
        http.get({ hostname: '127.0.0.1', port: 80, path, headers: { Host: hub } }, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => r({ code: res.statusCode, body: d }));
        }).on('error', e => r({ code: 0, body: e.message }));
    });
}

function post(path, body) {
    return new Promise(r => {
        const data = JSON.stringify(body);
        const req = http.request({ hostname: '127.0.0.1', port: 80, path, method: 'POST', headers: { Host: hub, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => r({ code: res.statusCode, body: d }));
        });
        req.on('error', e => r({ code: 0, body: e.message }));
        req.write(data); req.end();
    });
}

(async () => {
    // Test 1: Quantum Random
    console.log("1. /api/quantum-random...");
    const qr = await get('/api/quantum-random?n=16');
    const qj = JSON.parse(qr.body);
    console.log(`   ${qj.status === 'success' ? '✅' : '❌'} Source: ${qj.source} | Hex: ${qj.hex.substring(0,20)}... | Qubits: ${qj.qubits_used}`);

    // Test 2: PQ Keygen
    console.log("\n2. /api/pq-keygen...");
    const kg = await get('/api/pq-keygen');
    const kj = JSON.parse(kg.body);
    console.log(`   ${kj.status === 'success' ? '✅' : '❌'} Algorithm: ${kj.algorithm} | n=${kj.params.n} q=${kj.params.q}`);

    // Test 3: PQ Encrypt
    const testMsg = "Hola Arachne127";
    console.log(`\n3. /api/pq-encrypt (msg="${testMsg}")...`);
    const enc = await post('/api/pq-encrypt', { public_key: kj.public_key, message: testMsg });
    const ej = JSON.parse(enc.body);
    console.log(`   ${ej.status === 'success' ? '✅' : '❌'} Bits: ${ej.bits_encrypted} | Blocks: ${ej.ciphertext.length}`);

    // Test 4: PQ Decrypt
    console.log("\n4. /api/pq-decrypt...");
    const dec = await post('/api/pq-decrypt', { private_key: kj.private_key, ciphertext: ej.ciphertext });
    const dj = JSON.parse(dec.body);
    const match = dj.message === testMsg;
    console.log(`   ${match ? '✅' : '❌'} Descifrado: "${dj.message}" ${match ? '== MATCH' : '!= MISMATCH'}`);

    // Test 5: Tool pages still load
    const tools = { tool4: 'CIPHER', tool5: 'STEGO', tool6: 'QKD' };
    for (const [key, label] of Object.entries(tools)) {
        const dom = file.match(new RegExp(`TOOL-\\d+ ${label}:\\s*http:\\/\\/([^/]+)\\/`))[1];
        const r = await get('/?u=Sao&p=Sao123');
        // Just check tool4 has PQ content
    }
    const dom4 = file.match(/TOOL-4 CIPHER:\s*http:\/\/([^/]+)\//)[1];
    const t4 = await new Promise(r => {
        http.get({ hostname: '127.0.0.1', port: 80, path: '/?u=Sao&p=Sao123', headers: { Host: dom4 } }, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => r(d));
        });
    });
    console.log(`\n5. Tool4 contiene LWE-256: ${t4.includes('LWE-256') ? '✅' : '❌'}`);
    console.log(`   Tool4 contiene pq-keygen: ${t4.includes('pq-keygen') ? '✅' : '❌'}`);
    console.log(`   Tool4 contiene quantum-random: ${t4.includes('quantum-random') ? '✅' : '❌'}`);

    console.log("\n=== TODOS LOS TESTS COMPLETADOS ===");
})();
