import Pilot from './Pilot';

const PilotList = ({ pilots }) => {
  const formattedPilots = pilots.map((pilot) => {
    return {
      ...pilot,
      // Formatting distance and time to more readable formats
      closestDistance: pilot.closestDistance.toFixed(1),
      lastViolated: new Date(pilot.lastViolated).toLocaleString(
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
        {formattedPilots.map((pilot, i) => {
          return <Pilot key={i} pilot={pilot} />;
        })}
      </section>
    </article>
  );
};

export default PilotList;
