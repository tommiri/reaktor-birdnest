const axios = require('axios');
const fxparser = require('fast-xml-parser');

const externalUrl = 'https://assignments.reaktor.com/birdnest';
const baseUrl = 'http://localhost:3001/api';

const calcDistanceFromNest = (x, y) => {
  const nestCoordinates = {
    x: 250000,
    y: 250000,
  };

  // d = sqrt((x2 - x1)^2 + (y2 - y1)^2)
  const distance = Math.sqrt(
    Math.pow(x - nestCoordinates.x, 2) +
      Math.pow(y - nestCoordinates.y, 2)
  );

  return distance / 1000; // Convert to meters
};

const getAllDrones = async () => {
  const request = axios.get(`${externalUrl}/drones`);
  const data = await request.then((response) => response.data);

  const parser = new fxparser.XMLParser();
  const xmlToJson = parser.parse(data);
  const droneData = xmlToJson.report.capture.drone;

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

const addDrone = (drone) => {
  const request = axios.post(`${baseUrl}/violatingDrones`, drone);
  return request.then((response) => response.data);
};

const updateDrone = (drone, id) => {
  const request = axios.put(
    `${baseUrl}/violatingDrones/${id}`,
    drone
  );
  return request.then((response) => response.data);
};

const getPilot = async (serialNumber) => {
  const request = axios.get(`${externalUrl}/pilots/${serialNumber}`);
  const data = await request.then((response) => response.data);

  const { createdDt, ...pilot } = data;

  return pilot;
};

const addPilot = (pilot) => {
  const request = axios.post(`${baseUrl}/pilots`, pilot);
  return request.then((response) => response.data);
};

const updatePilot = (pilot, id) => {
  const request = axios.put(`${baseUrl}/pilots/${id}`, pilot);
  return request.then((response) => response.data);
};

module.exports = {
  getAllDrones,
  addDrone,
  updateDrone,
  getPilot,
  addPilot,
  updatePilot,
};
