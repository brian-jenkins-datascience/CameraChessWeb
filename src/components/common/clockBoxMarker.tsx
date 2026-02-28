import Draggable from 'react-draggable';
import React from "react";
import { MARKER_DIAMETER } from "../../utils/constants";
import { useDispatch } from 'react-redux';
import { clockBoxSet } from '../../slices/clockBoxSlice';
import { ClockBoxKey, ClockBoxPayload } from '../../types';

const ClockBoxMarker = ({ name, xy, color }: { name: ClockBoxKey, xy: number[], color: string }) => {
  const boxStyle: React.CSSProperties = {
    "height": MARKER_DIAMETER,
    "width": MARKER_DIAMETER,
    "backgroundColor": color,
    "borderRadius": "25%",
    "textAlign": "center",
    "position": "absolute",
    "userSelect": "none",
    "opacity": 0.5
  };
  const cursorStyle: React.CSSProperties = {
    "display": "flex",
    "height": "100%",
    "width": "100%",
    "textAlign": "center",
    "justifyContent": "center",
    "alignItems": "center",
    "fontSize": "10px"
  }
  const nodeRef = React.useRef(null);
  const dispatch = useDispatch();

  const label = name.startsWith("white") ? "W" : "B";
  const corner = name.endsWith("TL") ? "↖" : "↘";

  return (
    <Draggable
      handle="strong"
      bounds="parent"
      position={{"x": xy[0], "y": xy[1]}}
      defaultPosition={{"x": xy[0], "y": xy[1]}}
      nodeRef={nodeRef}
      onStop={(_, data) => {
        const payload: ClockBoxPayload = {
          "xy": [data.x, data.y],
          "key": name
        }
        dispatch(clockBoxSet(payload))
      }}
    >
      <div className="box no-cursor" style={boxStyle} ref={nodeRef}>
        <strong className="cursor" style={cursorStyle}>{label}{corner}</strong>
      </div>
    </Draggable>
  );
};

export default ClockBoxMarker;
