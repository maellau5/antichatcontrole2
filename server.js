const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir les fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route racine : sert chat_anti_control.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat_anti_control.html'));
});

// Route explicite pour le HTML
app.get('/chat_anti_control.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat_anti_control.html'));
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).send('<h1>404 - Page non trouvée</h1><p>Accédez à / ou /chat_anti_control.html</p>');
});

// Gestion des connexions WebSocket
const clients = new Set();
wss.on('connection', (ws) => {
    console.log('Nouveau client connecté');
    clients.add(ws);

    ws.on('message', (message) => {
        console.log('Message chiffré reçu:', message.toString().substring(0, 50) + '...');
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client déconnecté');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('Erreur WebSocket:', error);
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Accède au chat : http://localhost:${PORT}/`);
});
