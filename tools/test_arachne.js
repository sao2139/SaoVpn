const http = require('http');
const fs = require('fs');

const file = fs.readFileSync('../vpn_node/CLAU_COORDS.txt', 'utf8');
const domArach = file.match(/ARACHNE NEST:\s*http:\/\/(.*?)\//)[1];

console.log(`📌 Dominio ARACHNE extraído: ${domArach}\n`);

async function testArachne() {
    // 1. Sin Auth (debe redirigir a exam.clau)
    console.log("🧪 TEST 1: Acceso a Arachne SIN AUTH...");
    await new Promise(resolve => {
        http.get({
            hostname: '127.0.0.1', port: 80,
            path: '/',
            headers: { 'Host': domArach }
        }, res => {
            console.log(`↳ Status: ${res.statusCode} (Esperado 302 Redirección)`);
            console.log(`↳ Location: ${res.headers.location}`);
            if(res.statusCode === 302 && res.headers.location.includes('EXAM')) {
                console.log("✅ Bloqueo y Redirección Correcta.\n");
            } else {
                console.log("❌ FALLO DE SEGURIDAD.\n");
            }
            res.resume(); resolve();
        });
    });

    // 2. Con Auth (debe mostrar el ASCII)
    console.log("🧪 TEST 2: Acceso a Arachne CON AUTH (Sao)...");
    await new Promise(resolve => {
        http.get({
            hostname: '127.0.0.1', port: 80,
            path: '/?u=Sao&p=Sao123',
            headers: { 'Host': domArach }
        }, res => {
            console.log(`↳ Status: ${res.statusCode} (Esperado 200)`);
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if(data.includes('ARACHNE NEST // 127') && data.includes('QUANTUM ENTROPY INJECTOR')) {
                    console.log("✅ Contenido Arachne Cargado Correctamente.\n");
                } else {
                    console.log("❌ FALLO AL CARGAR ARTEFACTOS ARACHNE.\n");
                }
                resolve();
            });
        });
    });

    console.log("⚙️ VERIFICACIÓN FINALIZADA.");
}

testArachne();
