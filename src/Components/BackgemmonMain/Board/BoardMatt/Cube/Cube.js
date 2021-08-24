import "./Cube.css";
const Cube = (props) => {
  const indicatorDivstyle = {
    height: `calc(100% / ${Math.floor(props.cube.value / 2) + 1})`,
  };
  const indicatorstyle = {
    height: `calc(100% * ${Math.floor(props.cube.value / 2) + 1} / 3)`,
  };

  const indicator = (
    <span style={indicatorstyle} className="number-indicator">
      *
    </span>
  );

  return (
    <div
      className={
        props.class +
        " cube " +
        (props.cube.playedOnce ? "cube-played-once " : "") +
        (props.cube.playedTwice ? "cube-played-twice" : "")
      }
    >
      <div className="indicators-row" style={indicatorDivstyle}>
        {indicator}
        {props.cube.value > 1 ? indicator : ""}
      </div>
      {props.cube.value > 4 && (
        <div className="indicators-row" style={indicatorDivstyle}>
          {indicator}
          {props.cube.value > 5 ? indicator : ""}
        </div>
      )}
      {props.cube.value > 2 && (
        <div className="indicators-row" style={indicatorDivstyle}>
          {indicator}
          {props.cube.value > 3 ? indicator : ""}
        </div>
      )}
    </div>
  );
};

export default Cube;
