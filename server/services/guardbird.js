const axios = require('axios');
const fxparser = require('fast-xml-parser');
const parser = new fxparser.XMLParser();

const Pilot = require('../models/pilot');
const Drone = require('../models/drone');

const baseUrl = 'https://assignments.reaktor.com/birdnest';

const nestCoordinates = {
  x: 250000,
  y: 250000,
};

const calcDistanceFromNest = (x, y) => {
  // d = sqrt((x2 - x1)^2 + (y2 - y1)^2)
  const distance = Math.sqrt(
    Math.pow(x - nestCoordinates.x, 2) +
      Math.pow(y - nestCoordinates.y, 2)
  );

  return distance / 1000; // Convert to meters
};

const getDronesFromExternal = async () => {
  const request = axios.get(`${baseUrl}/drones`);
  const xmlData = await request.then((response) => response.data);

  const jsonData = parser.parse(xmlData);
  const droneData = jsonData.report.capture.drone;

  return droneData.map((drone) => {
    return {
      serialNumber: drone.serialNumber,
      positionX: drone.positionX,
      positionY: drone.positionY,
      distanceFromNest: calcDistanceFromNest(
        drone.positionX,
        drone.positionY
      ),
    };
  });
};

const getPilotFromExternal = async (serialNumber) => {
  const request = axios.get(`${baseUrl}/pilots/${serialNumber}`);
  const data = await request.then((response) => response.data);

  // Omit createdDt from pilot object
  const { createdDt, ...pilot } = data;

  return pilot;
};

const getDronesFromDB = async () => {
  const query = Drone.find({});

  const drones = await query.then((drones) => drones);

  return drones;
};

const getPilotsFromDB = async () => {
  const query = Pilot.find({});

  const pilots = await query.then((pilots) => pilots);

  return pilots;
};

module.exports = {
  getDronesFromExternal,
  getPilotFromExternal,
  getDronesFromDB,
  getPilotsFromDB,
};
