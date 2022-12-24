const Pilot = ({ pilot, className }) => {
  return (
    <div className={className}>
      <div>{`${pilot.firstName} ${pilot.lastName}`}</div>
      <a href={`mailto:${pilot.email}`}>{pilot.email}</a>
      <a href={`tel:${pilot.phoneNumber}`}>{pilot.phoneNumber}</a>
      <div>{pilot.closestDistance} m</div>
      <div>{pilot.lastViolated}</div>
    </div>
  );
};

export default Pilot;
