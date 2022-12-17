const pilotsRouter = require('express').Router();
const Pilot = require('../models/pilot');

// Get all pilots
pilotsRouter.get('/', (req, res) => {
  Pilot.find({}).then((pilots) => {
    res.json(pilots);
  });
});

// Get a particular pilot
pilotsRouter.get('/:id', (req, res) => {
  Pilot.findById(req.params.id)
    .then((pilot) => {
      if (pilot) {
        res.json(pilot);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => console.error(error));
});

// Create a new pilot
pilotsRouter.post('/', (req, res) => {
  const body = req.body;

  const pilot = new Pilot({
    pilotId: body.pilotId,
    firstName: body.firstName,
    lastName: body.lastName,
    phoneNumber: body.phoneNumber,
    email: body.email,
    closestDistance: body.closestDistance,
    lastViolated: body.lastViolated,
  });

  pilot
    .save()
    .then((savedPilot) => {
      res.status(201).json(savedPilot);
    })
    .catch((error) => console.error(error));
});

// Update an existing pilot
pilotsRouter.put('/:id', (req, res) => {
  const { closestDistance, lastViolated } = req.body;

  Pilot.findByIdAndUpdate(
    req.params.id,
    { closestDistance, lastViolated },
    { new: true }
  )
    .then((updatedPilot) => {
      res.json(updatedPilot);
    })
    .catch((error) => console.error(error));
});

module.exports = pilotsRouter;
