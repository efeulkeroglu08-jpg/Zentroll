const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();

// Express sunucu
const PORT = process.env.PORT || 8080;
const httpServer = app.listen(PORT, () => {
    console.log('HTTP Sunucu ' + PORT + ' portunda çalışıyor...');
});

// WebSocket sunucu aynı porta bağla
const wss = new WebSocket.Server({ server: httpServer });

let clients = {};

wss.on('connection', (ws) => {
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

// APK indirme endpoint'i
app.get('/download/apk', (req, res) => {
    try {
        const apkPath = path.join(__dirname, 'app-debug.apk');
        res.download(apkPath, 'Zentroll.apk', (err) => {
            if (err) {
                console.log('İndirme hatası: ' + err);
                res.status(500).send('İndirme başarısız');
            }
        });
    } catch (e) {
        res.status(404).send('APK bulunamadı');
    }
});

// Version bilgisi endpoint'i
app.get('/api/version', (req, res) => {
    res.json({
        version: 2,
        changelog: "Yenilikler ve iyileştirmeler yapıldı.",
        downloadUrl: "https://zentroll.onrender.com/download/apk"
    });
});

console.log('Sunucu çalışıyor...');
