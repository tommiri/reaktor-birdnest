import { useState, useEffect } from 'react';

import PilotList from './components/PilotList';

const socket = new WebSocket('ws://localhost:3001');

const App = () => {
  const [pilots, setPilots] = useState([]);

  useEffect(() => {
    socket.onmessage = (message) => {
      setPilots(JSON.parse(message.data));
    };
  }, [socket]);

  return (
    <div className='app'>
      <h1>Violating Pilots</h1>
      <PilotList className='pilot-list' pilots={pilots}></PilotList>
    </div>
  );
};

export default App;
