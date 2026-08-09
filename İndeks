const WebSocket = require('ws');
const server = new WebSocket.Server({ port: process.env.PORT || 8080 });

let clients = {};

server.on('connection', (ws) => {
    let clientId = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'register') {
            clientId = data.id;
            clients[clientId] = ws;
            console.log('Kayit oldu: ' + clientId);
        }

        if (data.type === 'command') {
            const target = clients[data.targetId];
            if (target) {
                target.send(JSON.stringify({ type: 'command', command: data.command }));
            }
        }
    });

    ws.on('close', () => {
        if (clientId) delete clients[clientId];
    });
});

console.log('Sunucu calisiyor');
