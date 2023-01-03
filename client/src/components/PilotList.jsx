import Pilot from './Pilot';

const PilotList = ({ drones }) => {
  const pilots = drones.map((drone) => {
    return {
      ...drone.pilot,
      // Formatting distance and time to more readable formats
      closestDistance: drone.closestDistance.toFixed(1),
      lastViolated: new Date(drone.lastViolated).toLocaleString(
        'en-gb'
      ),
    };
  });

  return (
    <article className="pilot-list">
      <header className="list-header">
        <div>Name</div>
        <div>Email</div>
        <div>Phone</div>
        <div>Closest distance</div>
        <div>Last violated</div>
      </header>

      <section className="list-body">
        {pilots.map((pilot, i) => {
          return <Pilot key={i} pilot={pilot} />;
        })}
      </section>
    </article>
  );
};

export default PilotList;
