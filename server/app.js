const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const pilotsRouter = require('./controllers/pilots');
const dronesRouter = require('./controllers/drones');
const logger = require('./utils/logger');
const mongoose = require('mongoose');
const guardbird = require('./services/guardbird');
const Drone = require('./models/drone');
const Pilot = require('./models/pilot');

logger.info('connecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB!');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message);
  });

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

app.use('/api/violatingDrones', dronesRouter);
app.use('/api/pilots', pilotsRouter);

// Get all drones from Reaktor API
const func = async () => {
  const drones = await guardbird.getAllDrones();

  // Filter out violating drones
  const violatingDrones = drones.filter((drone) => {
    return drone.distanceFromNest < 100;
  });

  // For each violating drone:
  violatingDrones.forEach(async (drone) => {
    // Grab their distance and reassign lastViolated
    const distance = drone.distanceFromNest;
    const lastViolated = new Date();
    let closestDistance, timeout;

    // Check if drone is found in DB
    Drone.find(
      { serialNumber: drone.serialNumber },
      (err, [foundDrone]) => {
        if (err) {
          logger.error(err);
          return;
        }

        // If not found
        if (!foundDrone) {
          closestDistance = distance;

          // Create new drone with new values
          const newDrone = {
            ...drone,
            lastViolated,
            closestDistance,
          };

          // Add drone to database
          guardbird.addDrone(newDrone).then((addedDrone) => {
            logger.info('Added drone', addedDrone);
            timeout = scheduleDeletion(addedDrone);
          });

          return;
        }

        // Reassign closestDistance if new distance is smaller
        closestDistance =
          distance < foundDrone.closestDistance
            ? distance
            : foundDrone.closestDistance;

        // Create new drone object with updated fields
        const updatedDrone = {
          ...foundDrone,
          lastViolated,
          closestDistance,
        };

        // Update database
        guardbird
          .updateDrone(updatedDrone, foundDrone.id)
          .then((returnedDrone) => {
            logger.info('Updated drone', returnedDrone);
            clearTimeout(timeout);
            timeout = scheduleDeletion(returnedDrone);
          });
      }
    );

    // Get pilot with serial number
    const pilot = await guardbird.getPilot(drone.serialNumber);

    // Check if pilot is found in DB
    Pilot.find({ pilotId: pilot.pilotId }, (err, found) => {
      const [foundPilot] = found;

      if (err) {
        logger.error(err);
        return;
      }

      // If found
      if (foundPilot) {
        // Create new pilot object with updated fields
        const updatedPilot = {
          ...foundPilot,
          lastViolated,
          closestDistance,
        };

        // Update pilot to the DB
        guardbird
          .updatePilot(updatedPilot, foundPilot.id)
          .then((returnedPilot) => {
            logger.info('Updated pilot', returnedPilot);
          });
        return;
      }

      // Else create new pilot with new values
      const newPilot = {
        ...pilot,
        lastViolated,
        closestDistance,
      };

      // Add pilot to the DB
      guardbird.addPilot(newPilot).then((addedPilot) => {
        logger.info('Added pilot', addedPilot);
      });
    });
  });
};

setInterval(func, 2000);

const scheduleDeletion = (drone) => {
  const timeout = setTimeout(() => {
    Drone.findOneAndDelete({ serialNumber: drone.serialNumber }).then(
      () => {
        logger.info('Deleted drone', drone);
      }
    );
  }, 20 * 1000);

  return timeout;
};

module.exports = app;
