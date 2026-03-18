const http = require('http');
const fs = require('fs');

const file = fs.readFileSync('../vpn_node/CLAU_COORDS.txt', 'utf8');
const domHub = file.match(/HUB CENTRAL:\s*http:\/\/(.*?)\//)[1];
const domLiberte = file.match(/LA LIBERTÉ:\s*http:\/\/(.*?)\//)[1];
const domUnknown = file.match(/DATOS UNKNOWN:\s*http:\/\/(.*?)\//)[1];
const domExam = file.match(/GATEKEEPER:\s*http:\/\/(.*?)\//)[1];
const domChat = file.match(/CHAT SEGURO:\s*http:\/\/(.*?)\//)[1];

console.log('=== VERIFICACIÓN COMPLETA DE TODAS LAS PÁGINAS ===\n');

function testPage(name, domain, checkFn) {
    return new Promise((resolve) => {
        http.get({
            hostname: '127.0.0.1', port: 80,
            path: '/?u=Sao&p=Sao123',
            headers: { 'Host': domain }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const ok = checkFn(data, res.statusCode);
                console.log(`${ok ? '✅' : '❌'} ${name} (${res.statusCode}) - ${ok ? 'CORRECTO' : 'FALLO'}`);
                resolve(ok);
            });
        }).on('error', (e) => {
            console.log(`❌ ${name} - ERROR: ${e.message}`);
            resolve(false);
        });
    });
}

function testStaticFile(name, domain, filePath) {
    return new Promise((resolve) => {
        http.get({
            hostname: '127.0.0.1', port: 80,
            path: '/' + filePath,
            headers: { 'Host': domain }
        }, (res) => {
            let chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const size = Buffer.concat(chunks).length;
                const ok = res.statusCode === 200 && size > 1000;
                console.log(`${ok ? '✅' : '❌'} ${name} (${res.statusCode}, ${size} bytes) - ${ok ? 'IMAGEN CARGA' : 'FALLO'}`);
                resolve(ok);
            });
        }).on('error', (e) => {
            console.log(`❌ ${name} - ERROR: ${e.message}`);
            resolve(false);
        });
    });
}

(async () => {
    const results = [];

    // Test 1: Welcome/Hub
    results.push(await testPage('WELCOME (HUB)', domHub,
        (data, code) => code === 200 && data.includes('unlockHub')));

    // Test 2: Liberte
    results.push(await testPage('LA LIBERTÉ', domLiberte,
        (data, code) => code === 200 && data.includes('TERMINAL DE ACCESO RESTRINGIDO') && data.includes('liberty_painting.png')));

    // Test 3: Unknown
    results.push(await testPage('UNKNOWN', domUnknown,
        (data, code) => code === 200 && data.includes('ENCRYPTED STREAM')));

    // Test 4: Exam
    results.push(await testPage('GATEKEEPER EXAM', domExam,
        (data, code) => code === 200 && data.includes('verify-exam')));

    // Test 5: Chat (auth)
    results.push(await testPage('CHAT (con auth Sao)', domChat,
        (data, code) => code === 200 && data.includes('CHAT_CONTENT') === false && data.includes('send-chat')));

    // Test 6: Static image
    results.push(await testStaticFile('IMAGEN liberty_painting.png', domHub, 'liberty_painting.png'));

    // Test 7: Passwords - verify Sao/Sao123 gets registered auth
    results.push(await new Promise((resolve) => {
        http.get({
            hostname: '127.0.0.1', port: 80,
            path: '/api/status?u=Sao&p=Sao123',
            headers: { 'Host': domHub }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const ok = json.links && json.links.chat && json.links.liberte;
                    console.log(`${ok ? '✅' : '❌'} AUTH Sao/Sao123 - ${ok ? 'LINKS GENERADOS CORRECTAMENTE' : 'FALLO'}`);
                    resolve(ok);
                } catch(e) {
                    console.log(`❌ AUTH - Parse error`);
                    resolve(false);
                }
            });
        }).on('error', () => resolve(false));
    }));

    // Test 8: Wrong password should NOT get admin
    results.push(await new Promise((resolve) => {
        http.get({
            hostname: '127.0.0.1', port: 80,
            path: '/admin?u=Sao&p=WRONG',
            headers: { 'Host': domHub }
        }, (res) => {
            const ok = res.statusCode === 403;
            console.log(`${ok ? '✅' : '❌'} AUTH DENEGADO con contraseña incorrecta (${res.statusCode}) - ${ok ? 'CORRECTO' : 'FALLO'}`);
            res.resume();
            resolve(ok);
        }).on('error', () => resolve(false));
    }));

    console.log(`\n${'='.repeat(50)}`);
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`RESULTADO: ${passed}/${total} tests pasaron ${passed === total ? '🏆 PERFECTO' : '⚠️ HAY FALLOS'}`);
    console.log('='.repeat(50));

    process.exit(passed === total ? 0 : 1);
})();
