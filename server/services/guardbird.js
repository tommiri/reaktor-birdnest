const fetch = require('node-fetch');
const fxparser = require('fast-xml-parser');
const parser = new fxparser.XMLParser();

const Drone = require('../models/drone');
const logger = require('../utils/logger');

const baseUrl = 'https://assignments.reaktor.com/birdnest';

// Birdnest is located at (250000, 250000)
const nestCoordinates = {
  x: 250000,
  y: 250000,
};

const calcDistanceFromNest = (drone) => {
  // d = sqrt((x2 - x1)^2 + (y2 - y1)^2)
  const distance = Math.sqrt(
    Math.pow(drone.positionX - nestCoordinates.x, 2) +
      Math.pow(drone.positionY - nestCoordinates.y, 2)
  );

  return distance / 1000; // Convert to meters
};

const getPilot = async (serialNumber) => {
  try {
    // Get pilot from Reaktor API
    const res = await fetch(`${baseUrl}/pilots/${serialNumber}`);
    if (!res.ok) {
      // If response status not in range 200-299
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // Omit createdDt from pilot object
    const { createdDt, ...pilot } = data;

    return pilot;
  } catch (err) {
    logger.error(err);

    // If pilot was not found, return an unknown pilot to keep track of drone
    const pilot = {
      // Tracking unknown pilots with their drone's S/N
      pilotId: serialNumber,
      firstName: 'Unknown',
      lastName: 'pilot',
      phoneNumber: 'N/A',
      email: 'N/A',
    };
    return pilot;
  }
};

const getDronesFromExternal = async () => {
  try {
    // Get drones from reaktor API
    const res = await fetch(`${baseUrl}/drones`);
    if (!res.ok) {
      // If response status not in range 200-299
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const xmlData = await res.text();
    // Parse XML data to JSON format
    const jsonData = parser.parse(xmlData);
    const droneData = jsonData.report.capture.drone;

    // Get drones that are within 100m of the birdnest
    const violatingDrones = droneData.filter(
      (drone) => calcDistanceFromNest(drone) < 100
    );

    // Wait for all promises to resolve before returning
    return await Promise.all(
      violatingDrones.map(async (drone) => {
        return {
          // Format drones, omitting unused fields
          serialNumber: drone.serialNumber,
          positionX: drone.positionX,
          positionY: drone.positionY,
          distanceFromNest: calcDistanceFromNest(drone),
          // Only get pilots for violating drones
          pilot: await getPilot(drone.serialNumber),
        };
      })
    );
  } catch (err) {
    // In case of error just log it and return
    logger.error(err);
    return;
  }
};

// Get all drones from DB
const getDronesFromDB = async () => {
  const query = Drone.find({});
  const drones = await query.then((drones) => drones);

  return drones;
};

module.exports = {
  getDronesFromExternal,
  getDronesFromDB,
};
