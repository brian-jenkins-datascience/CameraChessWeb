import SidebarButton from "./sidebarButton";
import { SetBoolean } from "../../types";

const ClockButton = ({ showClockBoxes, setShowClockBoxes }: 
  { showClockBoxes: boolean, setShowClockBoxes: SetBoolean }) => {

  const handleClick = (e: any) => {
    e.preventDefault();
    setShowClockBoxes(!showClockBoxes);
  }

  return (
    <SidebarButton onClick={handleClick}>
      {showClockBoxes ? "Hide Clocks" : "Set Clocks"}
    </SidebarButton>
  );
};

export default ClockButton;
