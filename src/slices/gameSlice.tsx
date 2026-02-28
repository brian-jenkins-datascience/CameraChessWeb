import { createSlice } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux';
import { Game, RootState } from '../types';
import { START_FEN } from '../utils/constants';
import { Chess } from 'chess.js';

const initialState: Game = {
  "moves": "",
  "fen": START_FEN,
  "start": START_FEN,
  "lastMove": "",
  "greedy": false,
  "clocks": []
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
    gameResetMoves(state) {
      state.moves = initialState.moves;
    },
    gameResetFen(state) {
      state.fen = initialState.fen;
    },
    gameResetStart(state) {
      state.start = initialState.start;
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
        "clocks": action.payload.clocks ?? state.clocks
      }
      return newState
    },
    gameResetClocks(state) {
      state.clocks = initialState.clocks;
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
  let moves = game.moves;
  
  // Inject clock annotations if we have them
  if (game.clocks.length > 0) {
    moves = injectClockAnnotations(moves, game.clocks);
  }
  
  return `[FEN "${game.start}"]` + "\n \n" + moves;
}

/**
 * Inject clock annotations into the move string.
 * Input moves: "1. e4 e5 2. Nf3 Nc6"
 * Input clocks: ["00:20:28", "00:20:25", "00:19:50", "00:19:45"]
 * Output: "1. e4 { [%clk 00:20:28] } e5 { [%clk 00:20:25] } 2. Nf3 { [%clk 00:19:50] } Nc6 { [%clk 00:19:45] }"
 */
const injectClockAnnotations = (movesStr: string, clocks: string[]): string => {
  // Parse the moves string to find individual SAN moves
  // Tokenize: move numbers like "1." or "1..." and SAN moves
  const tokens = movesStr.trim().split(/\s+/);
  const result: string[] = [];
  let halfMoveIndex = 0;

  for (const token of tokens) {
    // Skip move numbers (e.g., "1.", "2.", "1...")
    if (/^\d+\./.test(token)) {
      result.push(token);
      continue;
    }
    
    // This is a SAN move
    result.push(token);
    if (halfMoveIndex < clocks.length && clocks[halfMoveIndex]) {
      result.push(`{ [%clk ${clocks[halfMoveIndex]}] }`);
    }
    halfMoveIndex++;
  }

  return result.join(' ');
}

export const makeUpdatePayload = (board: Chess, greedy: boolean=false) => {
  const history = board.history({ "verbose": true });

  const moves = getMovesFromPgn(board);
  const fen = board.fen();
  const lastMove = (history.length === 0) ? "" : history[history.length - 1].lan;

  const payload = {
    "moves": moves,
    "fen": fen,
    "lastMove": lastMove,
    "greedy": greedy
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
  gameSetLastMove, gameResetLastMove, gameUpdate, gameResetClocks
} = gameSlice.actions
export default gameSlice.reducer