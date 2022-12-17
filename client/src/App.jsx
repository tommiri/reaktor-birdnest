import { useState, useEffect } from 'react';
import guardbird from './services/guardbird';

import PilotList from './components/PilotList';

const App = () => {
  const [drones, setDrones] = useState([]);

  const getAllDrones = () => {
    guardbird
      .getDrones()
      .then((drones) => {
        setDrones(drones);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(getAllDrones, []);

  return (
    <div className="App">
      <PilotList drones={drones}></PilotList>
    </div>
  );
};

export default App;
