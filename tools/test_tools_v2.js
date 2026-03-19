const http = require('http');
const fs = require('fs');
const file = fs.readFileSync('../vpn_node/CLAU_COORDS.txt', 'utf8');

const domains = {
    tool1: file.match(/TOOL-1 ENTROPY:\s*http:\/\/([^/]+)\//)[1],
    tool2: file.match(/TOOL-2 SCANNER:\s*http:\/\/([^/]+)\//)[1],
    tool3: file.match(/TOOL-3 CRACKER:\s*http:\/\/([^/]+)\//)[1]
};

console.log("\n=== TEST HERRAMIENTAS v2.0 ===\n");

async function test(name, host, check) {
    return new Promise(resolve => {
        http.get({ hostname: '127.0.0.1', port: 80, path: '/?u=Sao&p=Sao123', headers: { Host: host } }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const ok = check(data, res.statusCode);
                console.log(`${ok ? '✅' : '❌'} ${name} (${res.statusCode})`);
                if (!ok) console.log(`   Missing content in response`);
                resolve(ok);
            });
        }).on('error', e => { console.log(`❌ ${name}: ${e.message}`); resolve(false); });
    });
}

(async () => {
    await test('Tool1 - 6 tabs (HASH,ARCHIVO,PBKDF2,HMAC,GENERADOR,BASE64)', domains.tool1,
        (d, s) => s === 200 && d.includes('PBKDF2') && d.includes('HMAC') && d.includes('BASE64') && d.includes('drop-zone'));

    await test('Tool2 - Concurrencia + Fingerprint + Export', domains.tool2,
        (d, s) => s === 200 && d.includes('concurrent') && d.includes('fingerprint') && d.includes('exportResults'));

    await test('Tool3 - Diccionario + Brute Force + Mutaciones', domains.tool3,
        (d, s) => s === 200 && d.includes('DICCIONARIO') && d.includes('FUERZA BRUTA') && d.includes('MUTACIONES') && d.includes('bruteAttack'));

    console.log("\n=== VERIFICACIÓN COMPLETADA ===");
})();
