import { useState, useEffect } from 'react';

import PilotList from './components/PilotList';

const HOST = location.origin.replace(/^http/, 'ws');

// Establish a new socket connection
const socket = new WebSocket(HOST);

const App = () => {
  const [drones, setDrones] = useState([]);

  // Get drones from server
  useEffect(() => {
    socket.onmessage = (message) => {
      setDrones(JSON.parse(message.data));
    };
  }, [socket]);

  return (
    <div className="app">
      <h1>Pilots violating NDZ</h1>
      <PilotList drones={drones}></PilotList>
    </div>
  );
};

export default App;
