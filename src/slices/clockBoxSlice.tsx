import { createSlice } from '@reduxjs/toolkit';
import { ClockBoxDict, ClockBoxPayload, RootState } from "../types";
import { useSelector } from 'react-redux';

const initialState: ClockBoxDict = {
  "whiteTL": [0, -200],
  "whiteBR": [30, -180],
  "blackTL": [50, -200],
  "blackBR": [80, -180]
}

interface Action {
  payload: ClockBoxPayload,
  type: string
}

const clockBoxSlice = createSlice({
  name: 'clockBox',
  initialState,
  reducers: {
    clockBoxSet(state, action: Action) {
      state[action.payload.key] = action.payload.xy;
    },
    clockBoxReset() {
      return initialState
    }
  }
})

export const clockBoxSelect = () => {
  return useSelector((state: RootState) => state.clockBox)
}

export const { clockBoxSet, clockBoxReset } = clockBoxSlice.actions
export default clockBoxSlice.reducer
