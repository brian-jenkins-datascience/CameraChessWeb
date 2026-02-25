import { createSlice } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux';
import { Game, RootState } from '../types';
import { START_FEN } from '../utils/constants';
import { Chess } from 'chess.js';

const DEFAULT_INITIAL_MINUTES = 10;
const DEFAULT_INCREMENT_SECONDS = 0;
const DEFAULT_DELAY_SECONDS = 0;

const getInitialClockMs = (minutes: number) => {
  return Math.max(0, Math.floor(minutes * 60 * 1000));
}

const resetClockRuntime = (state: Game) => {
  const initialClockMs = getInitialClockMs(state.initialMinutes);
  state.whiteTimeMs = initialClockMs;
  state.blackTimeMs = initialClockMs;
  state.activeClockColor = null;
  state.lastClockSwitchMs = null;
}

const formatClock = (timeMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = `${hours}`.padStart(2, '0');
  const mm = `${minutes}`.padStart(2, '0');
  const ss = `${seconds}`.padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

const initialState: Game = {
  "moves": "",
  "fen": START_FEN,
  "start": START_FEN,
  "lastMove": "",
  "greedy": false,
  "initialMinutes": DEFAULT_INITIAL_MINUTES,
  "incrementSeconds": DEFAULT_INCREMENT_SECONDS,
  "delaySeconds": DEFAULT_DELAY_SECONDS,
  "whiteTimeMs": getInitialClockMs(DEFAULT_INITIAL_MINUTES),
  "blackTimeMs": getInitialClockMs(DEFAULT_INITIAL_MINUTES),
  "activeClockColor": null,
  "lastClockSwitchMs": null
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    gameSetMoves(state, action) {
      state.moves = action.payload
    },
    gameSetFen(state, action) {
      state.fen = action.payload;
    },
    gameSetStart(state, action) {
      state.start = action.payload;
    },
    gameSetLastMove(state, action) {
      state.lastMove = action.payload;
    },
    gameSetInitialMinutes(state, action) {
      state.initialMinutes = Math.max(0, Number(action.payload) || 0);
      resetClockRuntime(state);
    },
    gameSetIncrementSeconds(state, action) {
      state.incrementSeconds = Math.max(0, Number(action.payload) || 0);
      resetClockRuntime(state);
    },
    gameSetDelaySeconds(state, action) {
      state.delaySeconds = Math.max(0, Number(action.payload) || 0);
      resetClockRuntime(state);
    },
    gameResetClock(state) {
      resetClockRuntime(state);
    },
    gameResetMoves(state) {
      state.moves = initialState.moves;
      state.lastMove = initialState.lastMove;
      state.greedy = initialState.greedy;
      resetClockRuntime(state);
    },
    gameResetFen(state) {
      state.fen = initialState.fen;
      resetClockRuntime(state);
    },
    gameResetStart(state) {
      state.start = initialState.start;
      resetClockRuntime(state);
    },
    gameResetLastMove(state) {
      state.lastMove = initialState.lastMove;
    },
    gameUpdate(state, action) {
      const newState: Game = {
        "start": state.start,
        "moves": action.payload.moves,
        "fen": action.payload.fen,
        "lastMove": action.payload.lastMove,
        "greedy": action.payload.greedy,
        "initialMinutes": state.initialMinutes,
        "incrementSeconds": state.incrementSeconds,
        "delaySeconds": state.delaySeconds,
        "whiteTimeMs": action.payload.whiteTimeMs,
        "blackTimeMs": action.payload.blackTimeMs,
        "activeClockColor": action.payload.activeClockColor,
        "lastClockSwitchMs": action.payload.lastClockSwitchMs
      }
      return newState
    }
  }
})

const getMovesFromPgn = (board: Chess) => {
  const pgn = board.pgn();

  // Get rid of the headers (strings beginning with "[" and ending with "]")
  // Get rid of newline characters
  const moves = pgn.replace(/\[.*?\]/g, '').replace(/\r?\n|\r/g, '');
  return moves
}

export const gameSelect = () => {
  return useSelector((state: RootState) => state.game)
}

export const makePgn = (game: Game) => {
  return `[FEN "${game.start}"]` + "\n \n" + game.moves;
}

export const makeUpdatePayload = (
  board: Chess,
  game: Game,
  greedy: boolean=false,
  moveTimestampMs: number=Date.now()
) => {
  const history = board.history({ "verbose": true });
  const hasMoves = history.length > 0;

  let whiteTimeMs = game.whiteTimeMs;
  let blackTimeMs = game.blackTimeMs;
  let activeClockColor = game.activeClockColor;
  let lastClockSwitchMs = game.lastClockSwitchMs;

  if (hasMoves) {
    const move = history[history.length - 1] as any;
    const moverColor = move.color;
    const incrementMs = Math.round(game.incrementSeconds * 1000);
    const delayMs = Math.round(game.delaySeconds * 1000);
    const clockWasRunning = (activeClockColor === moverColor) && (lastClockSwitchMs !== null);

    if (clockWasRunning && lastClockSwitchMs !== null) {
      const elapsedMs = Math.max(0, moveTimestampMs - lastClockSwitchMs);
      const spentMs = Math.max(0, elapsedMs - delayMs);

      if (moverColor === 'w') {
        whiteTimeMs = Math.max(0, whiteTimeMs - spentMs + incrementMs);
      } else {
        blackTimeMs = Math.max(0, blackTimeMs - spentMs + incrementMs);
      }

      if (typeof (board as any).setComment === 'function') {
        const remaining = moverColor === 'w' ? whiteTimeMs : blackTimeMs;
        (board as any).setComment(`[%clk ${formatClock(remaining)}]`);
      }
    }

    activeClockColor = board.turn();
    lastClockSwitchMs = moveTimestampMs;
  }

  const moves = getMovesFromPgn(board);
  const fen = board.fen();
  const lastMove = (history.length === 0) ? "" : history[history.length - 1].lan;

  const payload = {
    "moves": moves,
    "fen": fen,
    "lastMove": lastMove,
    "greedy": greedy,
    "whiteTimeMs": whiteTimeMs,
    "blackTimeMs": blackTimeMs,
    "activeClockColor": activeClockColor,
    "lastClockSwitchMs": lastClockSwitchMs
  }

  return payload
}

export const makeBoard = (game: Game): Chess => {
  const board = new Chess(game.start);
  board.loadPgn(makePgn(game));
  return board;
}

export const { 
  gameSetMoves, gameResetMoves,
  gameSetFen, gameResetFen, 
  gameSetStart, gameResetStart,
  gameSetLastMove, gameResetLastMove,
  gameSetInitialMinutes, gameSetIncrementSeconds, gameSetDelaySeconds,
  gameResetClock, gameUpdate
} = gameSlice.actions
export default gameSlice.reducer