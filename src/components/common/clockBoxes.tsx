import { clockBoxSelect } from "../../slices/clockBoxSlice";
import { ClockBoxDict } from "../../types";
import ClockBoxMarker from "./clockBoxMarker";

const ClockBoxes = () => {
  const clockBoxes: ClockBoxDict = clockBoxSelect();
  return (
    <>
      <ClockBoxMarker name="whiteTL" xy={clockBoxes.whiteTL} color="white" />
      <ClockBoxMarker name="whiteBR" xy={clockBoxes.whiteBR} color="white" />
      <ClockBoxMarker name="blackTL" xy={clockBoxes.blackTL} color="black" />
      <ClockBoxMarker name="blackBR" xy={clockBoxes.blackBR} color="black" />
    </>
  );
};

export default ClockBoxes;
