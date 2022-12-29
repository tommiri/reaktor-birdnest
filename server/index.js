const WebSocket = require('ws');
const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger');
const guardbird = require('./services/guardbird');
const populateDB = require('./services/populateDB');

// Creating http and websocket servers
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  setInterval(async () => {
    /*  Getting pilots from DB and sending them to
        client in JSON format every 2 seconds */
    const pilots = await guardbird.getPilotsFromDB();

    ws.send(JSON.stringify(pilots));
  }, 2000);
});

// Checking and updating database every 2 seconds
setInterval(populateDB, 2000);

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
