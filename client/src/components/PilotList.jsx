import { useState, useEffect } from 'react';
import guardbird from '../services/guardbird';

import Pilot from './Pilot';

const PilotList = ({ drones }) => {
  const [pilots, setPilots] = useState([]);

  const hook = () => {
    drones.forEach((drone) => {
      guardbird
        .getPilotInformation(drone.serialNumber)
        .then((pilot) => {
          const lastViolated = new Date(
            drone.lastViolated
          ).toLocaleString('en-GB');

          const closestDistance = Math.floor(
            drone.closestDistance / 1000
          );

          const newPilot = {
            ...pilot,
            lastViolated: lastViolated,
            closestDistance: closestDistance,
          };

          setPilots((pilots) => [...pilots, newPilot]);
        });
    });
  };

  useEffect(hook, []);

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <th colSpan={5}>Violating pilots</th>
          </tr>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone number</th>
            <th>Closest distance</th>
            <th>Last violated</th>
          </tr>

          {pilots.map((pilot, i) => {
            return <Pilot key={i} pilot={pilot} />;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PilotList;
