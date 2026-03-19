const http = require('http');
const fs = require('fs');
const f = fs.readFileSync('../vpn_node/CLAU_COORDS.txt', 'utf8');

const tools = {
    tool1: { domain: f.match(/TOOL-1 ENTROPY:\s*http:\/\/([^/]+)\//)[1], check: 'PBKDF2' },
    tool2: { domain: f.match(/TOOL-2 SCANNER:\s*http:\/\/([^/]+)\//)[1], check: 'concurrent' },
    tool3: { domain: f.match(/TOOL-3 CRACKER:\s*http:\/\/([^/]+)\//)[1], check: 'FUERZA BRUTA' },
    tool4: { domain: f.match(/TOOL-4 CIPHER:\s*http:\/\/([^/]+)\//)[1], check: 'AES-256-GCM' },
    tool5: { domain: f.match(/TOOL-5 STEGO:\s*http:\/\/([^/]+)\//)[1], check: 'STEGANOGRAPHY' },
    tool6: { domain: f.match(/TOOL-6 QKD:\s*http:\/\/([^/]+)\//)[1], check: 'BB84' },
};

console.log("\n=== TEST 6 HERRAMIENTAS ARACHNE ===\n");

async function test(name, host, keyword) {
    return new Promise(resolve => {
        http.get({ hostname: '127.0.0.1', port: 80, path: '/?u=Sao&p=Sao123', headers: { Host: host } }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const ok = res.statusCode === 200 && data.includes(keyword);
                console.log(`${ok ? '✅' : '❌'} ${name} (${res.statusCode}) [${keyword}]`);
                resolve(ok);
            });
        }).on('error', e => { console.log(`❌ ${name}: ${e.message}`); resolve(false); });
    });
}

(async () => {
    for (const [key, val] of Object.entries(tools)) {
        await test(key.toUpperCase(), val.domain, val.check);
    }
    console.log("\n=== VERIFICACIÓN COMPLETADA ===");
})();
