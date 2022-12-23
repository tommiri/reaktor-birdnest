const Pilot = ({ pilot, className }) => {
  return (
    <div className={className}>
      <div>{`${pilot.firstName} ${pilot.lastName}`}</div>
      <div>{pilot.email}</div>
      <div>{pilot.phoneNumber}</div>
      <div>{pilot.closestDistance} m</div>
      <div>{pilot.lastViolated}</div>
    </div>
  );
};

export default Pilot;
