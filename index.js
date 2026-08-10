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
            return;
        }

        if (data.type === 'register') {
            clientId = data.id;
            clients[clientId] = ws;
            console.log('Kayit oldu: ' + clientId);
            return;
        }

        if (data.type === 'command' || data.type === 'response' || data.type === 'webrtc' || data.type === 'chat') {
            const target = clients[data.targetId];
            if (target) {
                data.from = clientId;
                target.send(JSON.stringify(data));
            }
        }
    });

    ws.on('close', () => {
        if (clientId) delete clients[clientId];
    });
});

console.log('Sunucu calisiyor');
