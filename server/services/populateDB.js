const Drone = require('../models/drone');
const Pilot = require('../models/pilot');

const guardbird = require('./guardbird');
const logger = require('../utils/logger');
const { all } = require('axios');

const isExpired = (drone) => {
  return new Date() - drone.lastViolated >= 10 * 60 * 1000;
};

// Get all drones from Reaktor API
const populateDB = async () => {
  const drones = await guardbird.getDronesFromExternal();

  // Filter out violating drones
  const violatingDrones = drones.filter((drone) => {
    return drone.distanceFromNest < 100;
  });

  // For each violating drone:
  violatingDrones.forEach(async (drone) => {
    // Grab their distance and reassign lastViolated
    const distance = drone.distanceFromNest;
    const lastViolated = new Date();
    let closestDistance;

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
          const newDrone = new Drone({
            ...drone,
            lastViolated,
            closestDistance,
          });

          // Add drone to database
          newDrone
            .save()
            .then((savedDrone) => {
              logger.info('Added drone', savedDrone);
            })
            .catch((error) => logger.error(error));

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
        Drone.findByIdAndUpdate(foundDrone.id, updatedDrone, {
          new: true,
        })
          .then((updatedDrone) => {
            logger.info('Updated drone', updatedDrone);
          })
          .catch((error) => logger.error(error));
      }
    );

    // Get pilot with serial number
    const pilot = await guardbird.getPilotFromExternal(
      drone.serialNumber
    );

    // Check if pilot is found in DB
    Pilot.find({ pilotId: pilot.pilotId }, (err, [foundPilot]) => {
      if (err) {
        logger.error(err);
        return;
      }

      // If found
      if (foundPilot) {
        // Update pilot to the DB
        Pilot.findByIdAndUpdate(
          foundPilot.id,
          { closestDistance, lastViolated },
          { new: true }
        )
          .then((updatedPilot) => {
            logger.info('Updated pilot', updatedPilot);
          })
          .catch((error) => logger.error(error));
        return;
      }

      // Else create new pilot with new values
      const newPilot = new Pilot({
        ...pilot,
        lastViolated,
        closestDistance,
      });

      // Add pilot to the DB
      newPilot
        .save()
        .then((savedPilot) => {
          logger.info('Added pilot', savedPilot);
        })
        .catch((error) => logger.error(error));
    });
  });

  const allDrones = await guardbird.getDronesFromDB();

  allDrones.forEach((drone) => {
    if (isExpired(drone)) {
      Drone.findOneAndDelete({
        serialNumber: drone.serialNumber,
      }).then((deletedDrone) => {
        console.log(`Deleted drone @ ${new Date()}`, deletedDrone);
      });
    }
  });

  const allPilots = await guardbird.getPilotsFromDB();

  allPilots.forEach((pilot) => {
    if (isExpired(pilot)) {
      Pilot.findOneAndDelete({
        serialNumber: pilot.serialNumber,
      }).then((deletedPilot) => {
        console.log(`Deleted pilot @ ${new Date()}`, deletedPilot);
      });
    }
  });
};

module.exports = populateDB;
