const WebSocket = require('ws');
const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger');
const guardbird = require('./services/guardbird');
const populateDB = require('./services/populateDB');

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  setInterval(async () => {
    const pilots = await guardbird.getPilotsFromDB();

    ws.send(JSON.stringify(pilots));
  }, 2000);
});

setInterval(populateDB, 2000);

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
