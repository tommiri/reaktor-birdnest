import axios from 'axios';

const dronesUrl = 'http://localhost:3001/api/violatingDrones';
const externalApi = 'https://assignments.reaktor.com/birdnest';

const getDrones = () => {
  const request = axios.get(dronesUrl);
  return request.then((response) => response.data);
};

const getPilotInformation = (serialNumber) => {
  const request = axios.get(`${externalApi}/pilots/${serialNumber}`);
  return request.then((response) => response.data);
};

const exports = { getDrones, getPilotInformation };

export default exports;
