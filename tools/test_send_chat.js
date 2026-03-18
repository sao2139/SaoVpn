const http = require('http');

async function testChat() {
    const fs = require('fs');
    if (!fs.existsSync('../vpn_node/CLAU_COORDS.txt')) {
        console.log("❌ ERROR: CLAU_COORDS.txt NO ENCONTRADO.");
        process.exit(1);
    }
    
    const file = fs.readFileSync('../vpn_node/CLAU_COORDS.txt', 'utf8');
    const domChat = file.match(/CHAT SEGURO:\s*http:\/\/(.*?)\//)[1];

    console.log(`📌 Dominio CHAT extraído: ${domChat}`);

    const postData = new URLSearchParams({
        message: 'HELLO TERMINAL',
        u: 'Sao',
        p: 'Sao123'
    }).toString();

    const options = {
        hostname: '127.0.0.1',
        port: 80,
        path: '/send-chat',
        method: 'POST',
        headers: {
            'Host': domChat,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
            
            // Now verify if the chat history includes the message
            http.get({
                hostname: '127.0.0.1',
                port: 80,
                path: '/?u=Sao&p=Sao123',
                headers: { 'Host': domChat }
            }, (res2) => {
                let data = '';
                res2.on('data', chunk => data += chunk);
                res2.on('end', () => {
                    console.log(`↳ ¿Aparece el mensaje en el historial?: ${data.includes('HELLO TERMINAL') ? '✅ SÍ' : '❌ NO'}`);
                    process.exit(0);
                });
            });
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

testChat();
