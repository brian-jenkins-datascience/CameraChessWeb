import { ClockSettingsInput, CornersButton, Sidebar, RecordButton, StopButton, StudyButton, DeviceButton } from "../common";
import { PlayerInfo, SetBoolean, SetNumber, SetPlayer, SetPlayers, SetStringArray, SetStudy, Study } from "../../types";
import BoardNumberInput from "./boardNumberInput";
import PlayerCsvInput from "./playerCsvInput";

const BroadcastSidebar = ({ piecesModelRef, xcornersModelRef, videoRef, canvasRef, sidebarRef, 
  playing, setPlaying, text, setText, study, setStudy, setBoardNumber, players, setPlayers, whitePlayer, setWhitePlayer, blackPlayer, setBlackPlayer }: {
  piecesModelRef: any, xcornersModelRef: any, videoRef: any, canvasRef: any, sidebarRef: any,
  playing: boolean, setPlaying: SetBoolean, 
  text: string[], setText: SetStringArray,
  study: Study | null, setStudy: SetStudy,
  setBoardNumber: SetNumber,
  players: PlayerInfo[], setPlayers: SetPlayers,
  whitePlayer: PlayerInfo | null, setWhitePlayer: SetPlayer,
  blackPlayer: PlayerInfo | null, setBlackPlayer: SetPlayer
}) => {
  const inputStyle = {
    display: playing ? "none": "inline-block"
  }
  return (
    <Sidebar sidebarRef={sidebarRef} playing={playing} text={text} setText={setText} >
      <li className="my-1" style={inputStyle}>
        <DeviceButton videoRef={videoRef} />
      </li>
      <li className="my-1" style={inputStyle}>
        <StudyButton study={study} setStudy={setStudy} onlyBroadcasts={true} />
      </li>
      <li className="my-1" style={inputStyle}>
        <BoardNumberInput setBoardNumber={setBoardNumber} />
      </li>
      <li className="my-1" style={inputStyle}>
        <PlayerCsvInput
          players={players}
          setPlayers={setPlayers}
          whitePlayer={whitePlayer}
          setWhitePlayer={setWhitePlayer}
          blackPlayer={blackPlayer}
          setBlackPlayer={setBlackPlayer}
          setText={setText}
        />
      </li>
      <li className="my-1" style={inputStyle}>
        <CornersButton piecesModelRef={piecesModelRef} xcornersModelRef={xcornersModelRef} videoRef={videoRef} canvasRef={canvasRef} 
        setText={setText} />
      </li>
      <li className="my-1" style={inputStyle}>
        <ClockSettingsInput />
      </li>
      <li className="my-1">
        <div className="btn-group w-100" role="group">
          <RecordButton playing={playing} setPlaying={setPlaying} />
          <StopButton setPlaying={setPlaying} setText={setText} />
        </div>
      </li>
    </Sidebar>
  );
};

export default BroadcastSidebar;