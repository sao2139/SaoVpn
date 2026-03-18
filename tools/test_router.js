const http = require('http');

async function testVpn() {
    console.log("🌐 PROBANDO SAO VPN ENTORNO LOCAL (EMULANDO VPS)");
    const fs = require('fs');
    if (!fs.existsSync('../vpn_node/CLAU_COORDS.txt')) {
        console.log("❌ ERROR: CLAU_COORDS.txt NO ENCONTRADO. DEBES INICIAR EL NODO PRIMERO.");
        process.exit(1);
    }
    
    const file = fs.readFileSync('../vpn_node/CLAU_COORDS.txt', 'utf8');
    const domChat = file.match(/CHAT SEGURO:\s*http:\/\/(.*?)\//)[1];
    const domHub = file.match(/HUB CENTRAL:\s*http:\/\/(.*?)\//)[1];
    const domExm = file.match(/GATEKEEPER:\s*http:\/\/(.*?)\//)[1];

    console.log(`📌 Dominios extraídos:\nHUB: ${domHub}\nCHAT: ${domChat}\nEXAM: ${domExm}`);

    const makeRequest = (host, path = '/') => {
        return new Promise((resolve) => {
            http.get({
                hostname: 'localhost',
                port: 80,
                path: path,
                headers: { 'Host': host }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, data }));
            });
        });
    };

    console.log("\n🧪 TEST 1: Acceder al HUB...");
    let hubRes = await makeRequest(domHub);
    console.log(`↳ HUB Response Status: ${hubRes.status}`);
    console.log(`↳ ¿Es welcome.html?: ${hubRes.data.includes('NODE LOCKED') ? '✅ SÍ' : '❌ NO'}`);

    console.log("\n🧪 TEST 2: API Login de 'Sao'...");
    let loginRes = await makeRequest('localhost', '/api/status?u=Sao&p=Sao123');
    let loginJson = JSON.parse(loginRes.data);
    console.log(`↳ Links generados: ${Object.keys(loginJson.links).length} items ✅`);

    console.log("\n🧪 TEST 3: Auth Examen (Incorrecto)...");
    let exRes = await makeRequest(domChat, '/?u=Guest&p=wrong');
    console.log(`↳ Chat sin login redirige?: ${exRes.status === 302 || exRes.data.includes('window.location') ? '✅ SÍ' : '❌ NO (Status: ' + exRes.status + ')'}`);

    console.log("\n🧪 TEST 4: Chat Login 'Sao'...");
    let chatRes = await makeRequest(domChat, '/?u=Sao&p=Sao123');
    console.log(`↳ Chat de Sao carga el historial?: ${chatRes.data.includes('CHAT_CONTENT') || chatRes.data.includes('class="msg"') ? '✅ SÍ' : '❌ NO'}`);

    console.log("\n✨ TODOS LOS TESTS FINALIZADOS.");
    process.exit(0);
}

testVpn();
