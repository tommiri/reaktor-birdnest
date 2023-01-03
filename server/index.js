const WebSocket = require('ws');
const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger');
const guardbird = require('./services/guardbird');
const processViolations = require('./services/processViolations');

// Create http and websocket servers
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  setInterval(async () => {
    /*  Get drones from DB and send them to
        client in JSON format every 2 seconds */
    const drones = await guardbird.getDronesFromDB();

    ws.send(JSON.stringify(drones));
  }, 2000);
});

// Process violations, checking and updating database every 2 seconds
setInterval(processViolations, 2000);

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
