const WebSocket = require('ws');
const server = new WebSocket.Server({ port: process.env.PORT || 8080 });

let clients = {};

server.on('connection', (ws) => {
    let clientId = null;

    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log('JSON parse hatasi: ' + message);
            return;
        }

        if (data.type === 'register') {
            clientId = data.id;
            clients[clientId] = ws;
            console.log('Kayit oldu -> ID: ' + clientId + ', Isim: ' + data.name);
            console.log('Aktif cihazlar: ' + Object.keys(clients).join(', '));
            return;
        }

        if (data.type === 'command' || data.type === 'response' || data.type === 'webrtc' || data.type === 'chat') {
            console.log('Komut/Mesaj geldi -> Kimden: '  + clientId + ' -> Kime (Target): ' + data.targetId + ' | Tip: ' + data.command);
            const target = clients[data.targetId];
            if (target) {
                data.from = clientId;
                target.send(JSON.stringify(data));
                console.log('--> Basariyla iletildi: ' + data.targetId);
            } else {
                console.log('--> HATA: Hedef cihaz bulunamadi! Hedef ID: ' + data.targetId);
            }
        }
    });

    ws.on('close', () => {
        if (clientId) {
            delete clients[clientId];
            console.log('Baglanti koptu / Ayrildi: ' + clientId);
        }
    });
});

console.log('Sunucu calisiyor...');
