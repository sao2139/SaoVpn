const http = require('http');
const fs = require('fs');

const file = fs.readFileSync('../vpn_node/CLAU_COORDS.txt', 'utf8');
const domArach = file.match(/ARACHNE NEST:\s*http:\/\/(.*?)\//)[1];

console.log(`\n=== TEST HERRAMIENTAS ARACHNE ===\n📌 Dominio: ${domArach}\n`);

async function testRoute(name, path, headers, check) {
    return new Promise(resolve => {
        http.get({ hostname: '127.0.0.1', port: 80, path, headers }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const ok = check(data, res.statusCode, res.headers);
                console.log(`${ok ? '✅' : '❌'} ${name} (${res.statusCode}) — ${ok ? 'OK' : 'FALLO'}`);
                resolve(ok);
            });
        }).on('error', e => { console.log(`❌ ${name} — ERROR: ${e.message}`); resolve(false); });
    });
}

(async () => {
    const auth = { Host: domArach };
    const noAuth = { Host: domArach };

    // Arachne hub
    await testRoute('Arachne Hub (con auth)', '/?u=Sao&p=Sao123', auth,
        (d, s) => s === 200 && d.includes('ARACHNE NEST'));

    // Tool 1 with auth
    await testRoute('Tool1 Entropy Injector (con auth)', '/tool1?u=Sao&p=Sao123', auth,
        (d, s) => s === 200 && d.includes('QUANTUM ENTROPY INJECTOR'));

    // Tool 2 with auth
    await testRoute('Tool2 Port Scanner (con auth)', '/tool2?u=Sao&p=Sao123', auth,
        (d, s) => s === 200 && d.includes('WAVE-FUNCTION COLLAPSE SCANNER'));

    // Tool 3 with auth
    await testRoute('Tool3 Hash Cracker (con auth)', '/tool3?u=Sao&p=Sao123', auth,
        (d, s) => s === 200 && d.includes('ZERO-DAY TENSOR EXPLOIT KIT'));

    // Tool 1 blocked without auth (should redirect to exam)
    await testRoute('Tool1 BLOQUEADO sin auth', '/tool1', noAuth,
        (d, s, h) => s === 302 && h.location && h.location.includes('.clau'));

    // Tool 3 blocked from wrong domain (should 403)
    await testRoute('Tool3 BLOQUEADO desde dominio incorrecto', '/tool3?u=Sao&p=Sao123', { Host: 'google.com' },
        (d, s) => s === 403);

    console.log('\n=== VERIFICACIÓN COMPLETADA ===');
})();
