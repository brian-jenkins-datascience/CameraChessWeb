import { ChangeEvent } from "react";
import { useDispatch } from "react-redux";
import { gameSelect, gameSetDelaySeconds, gameSetIncrementSeconds, gameSetInitialMinutes } from "../../slices/gameSlice";

const ClockSettingsInput = () => {
  const dispatch = useDispatch();
  const game = gameSelect();

  const onInitialChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) {
      return;
    }
    dispatch(gameSetInitialMinutes(value));
  }

  const onIncrementChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) {
      return;
    }
    dispatch(gameSetIncrementSeconds(value));
  }

  const onDelayChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) {
      return;
    }
    dispatch(gameSetDelaySeconds(value));
  }

  return (
    <div className="text-white text-start">
      <div className="form-label mb-1">Clock</div>
      <div className="mb-1">
        <label className="form-label mb-1" htmlFor="clockInitialMinutes">Initial (minutes)</label>
        <input
          className="form-control form-control-sm"
          type="number"
          id="clockInitialMinutes"
          min={0}
          step={1}
          value={game.initialMinutes}
          onChange={onInitialChange}
        />
      </div>
      <div className="mb-1">
        <label className="form-label mb-1" htmlFor="clockIncrementSeconds">Increment (seconds)</label>
        <input
          className="form-control form-control-sm"
          type="number"
          id="clockIncrementSeconds"
          min={0}
          step={1}
          value={game.incrementSeconds}
          onChange={onIncrementChange}
        />
      </div>
      <div>
        <label className="form-label mb-1" htmlFor="clockDelaySeconds">Delay (seconds)</label>
        <input
          className="form-control form-control-sm"
          type="number"
          id="clockDelaySeconds"
          min={0}
          step={1}
          value={game.delaySeconds}
          onChange={onDelayChange}
        />
      </div>
    </div>
  );
}

export default ClockSettingsInput;
