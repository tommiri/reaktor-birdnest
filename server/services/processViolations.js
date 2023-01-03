const Drone = require('../models/drone');
const guardbird = require('./guardbird.js');
const logger = require('../utils/logger');

const isExpired = (drone) => {
  // Check if drone made its last violation 10 or more minutes ago
  return new Date() - drone.lastViolated >= 10 * 60 * 1000;
};

const deleteExpired = async () => {
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
};

const processDrone = (drone) => {
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
};

const processViolations = async () => {
  // Get violating drones
  const violatingDrones = await guardbird.getDronesFromExternal();

  if (!violatingDrones) {
    // Error logging is handled in guardbird so just return here
    return;
  }

  violatingDrones.forEach((drone) => {
    // Check if drone exists in database, update if exists and create new if doesn't
    processDrone(drone);
  });

  // Check for expired drones
  await deleteExpired();
};

module.exports = processViolations;
