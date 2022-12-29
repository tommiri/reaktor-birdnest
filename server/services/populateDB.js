const Drone = require('../models/drone');
const Pilot = require('../models/pilot');

const guardbird = require('./guardbird.js');
const logger = require('../utils/logger');

const isExpired = (drone) => {
  // Check if drone made its last violation 10 or more minutes ago
  return new Date() - drone.lastViolated >= 10 * 60 * 1000;
};

const populateDB = async () => {
  // Get all drones from Reaktor API
  const drones = await guardbird.getDronesFromExternal();

  if (!drones) {
    // Error logging is handled in guardbird so just return here
    return;
  }

  // Filter out violating drones
  const violatingDrones = drones.filter((drone) => {
    return drone.distanceFromNest < 100;
  });

  // For each violating drone:
  violatingDrones.forEach(async (drone) => {
    // Get drone's distance from the nest and assign last violation to current time
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

        // If found
        if (foundDrone) {
          // Reassign closestDistance if new distance is smaller
          closestDistance =
            distance < foundDrone.closestDistance
              ? distance
              : foundDrone.closestDistance;

          // Update drone to DB
          Drone.findByIdAndUpdate(
            foundDrone.id,
            { lastViolated, closestDistance },
            { new: true }
          )
            .then((updatedDrone) => {
              logger.info('Updated drone', updatedDrone);
            })
            .catch((error) => logger.error(error));

          return;
        }

        // Else assign closestDistance to be current distance
        closestDistance = distance;

        // Create new drone
        const newDrone = new Drone({
          ...drone,
          lastViolated,
          closestDistance,
        });

        // Add drone to DB
        newDrone
          .save()
          .then((savedDrone) => {
            logger.info('Added drone', savedDrone);
          })
          .catch((error) => logger.error(error));
      }
    );

    // Get pilot with serial number
    let pilot = await guardbird.getPilotFromExternal(
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
        // Update pilot to DB
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

      // Else create new pilot
      const newPilot = new Pilot({
        ...pilot,
        lastViolated,
        closestDistance,
      });

      // Add pilot to DB
      newPilot
        .save()
        .then((savedPilot) => {
          logger.info('Added pilot', savedPilot);
        })
        .catch((error) => logger.error(error));
    });
  });

  // Get all drones from database
  const allDrones = await guardbird.getDronesFromDB();

  // Loop through and remove drones from db if expired
  allDrones.forEach((drone) => {
    if (isExpired(drone)) {
      Drone.findOneAndDelete({
        serialNumber: drone.serialNumber,
      }).then((deletedDrone) => {
        logger.info('Deleted drone', deletedDrone);
      });
    }
  });

  // Get all pilots from database
  const allPilots = await guardbird.getPilotsFromDB();

  // Loop through and remove pilots from db if expired
  allPilots.forEach((pilot) => {
    if (isExpired(pilot)) {
      Pilot.findOneAndDelete({
        pilotId: pilot.pilotId,
      }).then((deletedPilot) => {
        logger.info('Deleted pilot', deletedPilot);
      });
    }
  });
};

module.exports = populateDB;
