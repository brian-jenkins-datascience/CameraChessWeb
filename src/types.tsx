interface Study {
  id: string,
  name: string
}

interface PlayerInfo {
  name: string,
  title: string,
  elo: string
}

interface ModelRefs {
  piecesModelRef: any,
  xcornersModelRef: any
}

interface MovesData {
  sans: string[],
  from: number[],
  to: number[],
  targets: number[]
}
interface MovesPair {
  "move1": MovesData,
  "move2": MovesData | null,
  "moves": MovesData | null
}

type CornersKey = "h1" | "a1" | "a8" | "h8"; 
interface CornersPayload {
  key: CornersKey,
  xy: number[]
}
type CornersDict = {[key in CornersKey]: number[]};

interface Game {
  fen: string,
  moves: string,
  start: string,
  lastMove: string,
  greedy: boolean,
  initialMinutes: number,
  incrementSeconds: number,
  delaySeconds: number,
  whiteTimeMs: number,
  blackTimeMs: number,
  activeClockColor: "w" | "b" | null,
  lastClockSwitchMs: number | null
}

interface User {
  token: string,
  username: string
}

interface RootState {
  game: Game
  corners: CornersDict,
  user: User
}

type Mode = "record" | "upload" | "broadcast" | "play";

type SetBoolean = React.Dispatch<React.SetStateAction<boolean>>
type SetString = React.Dispatch<React.SetStateAction<string>>
type SetStringArray = React.Dispatch<React.SetStateAction<string[]>>
type SetNumber = React.Dispatch<React.SetStateAction<number>>
type SetStudy = React.Dispatch<React.SetStateAction<Study | null>>
type SetPlayers = React.Dispatch<React.SetStateAction<PlayerInfo[]>>
type SetPlayer = React.Dispatch<React.SetStateAction<PlayerInfo | null>>

export type { 
  RootState, Study, ModelRefs, MovesData, MovesPair, 
  CornersDict, CornersKey, CornersPayload, Game,
  SetBoolean, SetString, SetStringArray, SetNumber, Mode,
  SetStudy, PlayerInfo, SetPlayers, SetPlayer
}