import Pilot from './Pilot';

const PilotList = ({ pilots, className }) => {
  const formattedPilots = pilots.map((pilot) => {
    return {
      ...pilot,
      closestDistance: Math.floor(pilot.closestDistance),
      lastViolated: new Date(pilot.lastViolated).toLocaleString(
        'en-gb'
      ),
    };
  });

  return (
    <div className={className}>
      <div className='list-item list-header'>
        <div>Name</div>
        <div>Email</div>
        <div>Phone</div>
        <div>Closest distance</div>
        <div>Last violated</div>
      </div>

      <div className='list-body'>
        {formattedPilots.map((pilot, i) => {
          return (
            <Pilot className='list-item' key={i} pilot={pilot} />
          );
        })}
      </div>
    </div>
  );
};

export default PilotList;
