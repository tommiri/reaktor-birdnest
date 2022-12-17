const dronesRouter = require('express').Router();
const Drone = require('../models/drone');

// Get all drones
dronesRouter.get('/', async (req, res) => {
  const drones = await Drone.find({});
  res.json(drones);
});

// Get a particular drone
dronesRouter.get('/:id', (req, res) => {
  Drone.findById(req.params.id)
    .then((drone) => {
      if (drone) {
        res.json(drone);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => console.error(error));
});

// Create a new drone
dronesRouter.post('/', (req, res) => {
  const body = req.body;

  const drone = new Drone({
    serialNumber: body.serialNumber,
    positionX: body.positionX,
    positionY: body.positionY,
    closestDistance: body.closestDistance,
    lastViolated: body.lastViolated,
  });

  drone
    .save()
    .then((savedDrone) => {
      res.status(201).json(savedDrone);
    })
    .catch((error) => console.error(error));
});

// Update an existing drone
dronesRouter.put('/:id', (req, res) => {
  const { positionX, positionY, closestDistance, lastViolated } =
    req.body;

  Drone.findByIdAndUpdate(
    req.params.id,
    { positionX, positionY, closestDistance, lastViolated },
    { new: true }
  )
    .then((updatedDrone) => {
      res.json(updatedDrone);
    })
    .catch((error) => console.error(error));
});

dronesRouter.delete('/:id', (req, res) => {
  Drone.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => console.error(error));
});

module.exports = dronesRouter;
