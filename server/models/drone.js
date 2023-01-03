const mongoose = require('mongoose');

const droneSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true },
  positionX: { type: Number, required: true },
  positionY: { type: Number, required: true },
  closestDistance: { type: Number, required: true },
  lastViolated: { type: Date, required: true },
  pilot: { type: Object, required: true },
});

droneSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Drone', droneSchema);
