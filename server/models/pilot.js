const mongoose = require('mongoose');

const pilotSchema = new mongoose.Schema({
  pilotId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  closestDistance: { type: Number, required: true },
  lastViolated: { type: Date, required: true },
});

pilotSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Pilot', pilotSchema);
