import { useRef, useState, useEffect } from "react";
import Video from "../common/video";
import { useOutletContext } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { cornersReset, cornersSelect } from '../../slices/cornersSlice';
import { clockBoxReset, clockBoxSelect } from '../../slices/clockBoxSlice';
import { Container } from "../common";
import LoadModels from "../../utils/loadModels";
import { ClockBoxDict, CornersDict, Mode, ModelRefs, PlayerInfo, Study } from "../../types";
import RecordSidebar from "../record/recordSidebar";
import UploadSidebar from "../upload/uploadSidebar";
import BroadcastSidebar from "../broadcast/broadcastSidebar";
import { gameResetClocks, gameResetFen, gameResetMoves, gameResetStart, gameSelect } from "../../slices/gameSlice";
import { lichessPushRound } from "../../utils/lichess";
import { userSelect } from "../../slices/userSlice";
import { START_FEN } from "../../utils/constants";
import PlaySidebar from "../play/playSidebar";
import { useMediaQuery } from 'react-responsive';

const PortraitWarning = () => {
  return (
    <h1 className="text-white text-center w-100 p-3 h-2">
      Please use your device in landscape mode
    </h1>
  )
}

const pgnTagValue = (value: string) => {
  return value.replace(/\\/g, "\\\\").replace(/\"/g, '\\"');
}

const VideoAndSidebar = ({ mode }: { mode: Mode }) => {
  const context = useOutletContext<ModelRefs>();
  const dispatch = useDispatch();
  const corners: CornersDict = cornersSelect();
  const clockBoxes: ClockBoxDict = clockBoxSelect();
  const token: string = userSelect().token;
  const game = gameSelect();
  const moves: string = game.moves;
  const isPortrait = useMediaQuery({ orientation: 'portrait' });

  const [text, setText] = useState<string[]>([]);
  const [playing, setPlaying] = useState<boolean>(false);
  const [study, setStudy] = useState<Study | null>(null);
  const [boardNumber, setBoardNumber] = useState<number>(-1);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [whitePlayer, setWhitePlayer] = useState<PlayerInfo | null>(null);
  const [blackPlayer, setBlackPlayer] = useState<PlayerInfo | null>(null);
  const [showClockBoxes, setShowClockBoxes] = useState<boolean>(false);
  
  const videoRef = useRef<any>(null);
  const playingRef = useRef<boolean>(playing);
  const canvasRef = useRef<any>(null);
  const sidebarRef = useRef<any>(null);
  const cornersRef = useRef<CornersDict>(corners);
  const clockBoxRef = useRef<ClockBoxDict>(clockBoxes);
  const clocksRef = useRef<string[]>(game.clocks);

  useEffect(() => {
    if (mode !== "broadcast" || (study === null) || (boardNumber === -1)) {
      return;
    }
    
    const whiteName = pgnTagValue(whitePlayer?.name || `White ${boardNumber}`);
    const blackName = pgnTagValue(blackPlayer?.name || `Black ${boardNumber}`);
    const whiteTitle = pgnTagValue(whitePlayer?.title || "");
    const blackTitle = pgnTagValue(blackPlayer?.title || "");
    const whiteElo = pgnTagValue(whitePlayer?.elo || "");
    const blackElo = pgnTagValue(blackPlayer?.elo || "");

    const broadcastPgn = [
      `[Result "*"]`,
      `[FEN "${START_FEN}"]`,
      `[Board "${boardNumber}"]`,
      `[Site "${boardNumber}"]`,
      `[White "${whiteName}"]`,
      `[Black "${blackName}"]`,
      `[WhiteTitle "${whiteTitle}"]`,
      `[BlackTitle "${blackTitle}"]`,
      `[WhiteElo "${whiteElo}"]`,
      `[BlackElo "${blackElo}"]`,
      `[Annotator "ChessCam"]`,
      "",
      moves
    ].join("\r");
    lichessPushRound(token, broadcastPgn, study.id);
  }, [moves])

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    cornersRef.current = corners;
  }, [corners])

  useEffect(() => {
    clockBoxRef.current = clockBoxes;
  }, [clockBoxes])

  useEffect(() => {
    clocksRef.current = game.clocks;
  }, [game.clocks])

  useEffect(() => {
    LoadModels(context.piecesModelRef, context.xcornersModelRef);
    dispatch(cornersReset());
    dispatch(clockBoxReset());
    dispatch(gameResetStart());
    dispatch(gameResetMoves());
    dispatch(gameResetFen());
    dispatch(gameResetClocks());
  }, []);

  const props = {
    "playing": playing,
    "text": text,
    "study": study,
    "setPlaying": setPlaying,
    "setText": setText,
    "setBoardNumber": setBoardNumber,
    "setStudy": setStudy,
    "players": players,
    "setPlayers": setPlayers,
    "whitePlayer": whitePlayer,
    "setWhitePlayer": setWhitePlayer,
    "blackPlayer": blackPlayer,
    "setBlackPlayer": setBlackPlayer,
    "piecesModelRef": context.piecesModelRef,
    "xcornersModelRef": context.xcornersModelRef,
    "videoRef": videoRef,
    "canvasRef": canvasRef,
    "sidebarRef": sidebarRef,
    "cornersRef": cornersRef,
    "playingRef": playingRef,
    "mode": mode,
    "clockBoxRef": clockBoxRef,
    "clocksRef": clocksRef,
    "showClockBoxes": showClockBoxes,
    "setShowClockBoxes": setShowClockBoxes
  }
  const Sidebar = () => {
    switch(mode) {
      case "record": return <RecordSidebar {...props} />
      case "upload": return <UploadSidebar {...props} />
      case "play": return <PlaySidebar {...props} />
      case "broadcast": return <BroadcastSidebar {...props} />
    }
  }

  return (
    <Container>
      {isPortrait ? (
        <PortraitWarning />
      ) : (
        <>
          {Sidebar()}
          <Video {...props} />
        </>
      )}
    </Container>
  );
};

export default VideoAndSidebar;