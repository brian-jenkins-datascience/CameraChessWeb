import { ChangeEvent } from "react";
import { PlayerInfo, SetPlayer, SetPlayers, SetStringArray } from "../../types";

const splitCsvLine = (line: string) => {
  const result: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let idx = 0; idx < line.length; idx++) {
    const char = line[idx];

    if (char === '"') {
      const isEscapedQuote = inQuotes && line[idx + 1] === '"';
      if (isEscapedQuote) {
        value += '"';
        idx++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(value.trim());
      value = "";
      continue;
    }

    value += char;
  }

  result.push(value.trim());
  return result;
}

const parsePlayersCsv = (csvText: string) => {
  const rows = csvText
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  if (rows.length < 2) {
    return [];
  }

  const headers = splitCsvLine(rows[0]).map((header: string) => header.toLowerCase());
  const nameIndex = headers.indexOf("name");
  const titleIndex = headers.indexOf("title");
  const eloIndex = headers.indexOf("elo");

  if (nameIndex === -1) {
    throw new Error("CSV must include a 'name' column");
  }

  const players: PlayerInfo[] = rows.slice(1).map((row: string) => {
    const cells = splitCsvLine(row);
    const name = cells[nameIndex] || "";
    const title = titleIndex > -1 ? (cells[titleIndex] || "") : "";
    const elo = eloIndex > -1 ? (cells[eloIndex] || "") : "";

    return {
      name,
      title,
      elo
    };
  }).filter((player: PlayerInfo) => player.name.length > 0);

  return players;
}

const makePlayerLabel = (player: PlayerInfo) => {
  const title = player.title === "" ? "" : `${player.title} `;
  const elo = player.elo === "" ? "" : ` (${player.elo})`;
  return `${title}${player.name}${elo}`;
}

const PlayerCsvInput = ({
  players,
  setPlayers,
  whitePlayer,
  setWhitePlayer,
  blackPlayer,
  setBlackPlayer,
  setText
}: {
  players: PlayerInfo[],
  setPlayers: SetPlayers,
  whitePlayer: PlayerInfo | null,
  setWhitePlayer: SetPlayer,
  blackPlayer: PlayerInfo | null,
  setBlackPlayer: SetPlayer,
  setText: SetStringArray
}) => {
  const onCsvFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const csvText = await file.text();
      const parsedPlayers = parsePlayersCsv(csvText);
      setPlayers(parsedPlayers);
      setWhitePlayer(parsedPlayers.length > 0 ? parsedPlayers[0] : null);
      setBlackPlayer(parsedPlayers.length > 1 ? parsedPlayers[1] : null);
      setText([`Loaded ${parsedPlayers.length} player(s)`]);
    } catch (err) {
      setPlayers([]);
      setWhitePlayer(null);
      setBlackPlayer(null);
      const message = err instanceof Error ? err.message : `${err}`;
      setText([message]);
    }
  }

  const onSelectWhite = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value, 10);
    const selectedPlayer = selectedIndex > -1 ? players[selectedIndex] : null;
    setWhitePlayer(selectedPlayer);
  }

  const onSelectBlack = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value, 10);
    const selectedPlayer = selectedIndex > -1 ? players[selectedIndex] : null;
    setBlackPlayer(selectedPlayer);
  }

  return (
    <div className="text-white">
      <div className="mb-1 text-start">
        <label className="form-label mb-1" htmlFor="playersCsv">
          Players CSV:
        </label>
        <input
          className="form-control form-control-sm"
          type="file"
          id="playersCsv"
          accept=".csv,text/csv"
          onChange={onCsvFileChange}
        />
        <div className="form-text text-light">
          Header: <strong>name,title,elo</strong>. Example row: Magnus Carlsen,GM,2830
        </div>
      </div>
      <div className="mb-1 text-start">
        <label className="form-label mb-1" htmlFor="whitePlayer">
          White:
        </label>
        <select
          className="form-select form-select-sm"
          id="whitePlayer"
          disabled={players.length === 0}
          onChange={onSelectWhite}
          value={whitePlayer ? players.indexOf(whitePlayer) : -1}
        >
          <option value={-1}>Select white player</option>
          {players.map((player: PlayerInfo, index: number) => (
            <option value={index} key={`${player.name}-${index}`}>
              {makePlayerLabel(player)}
            </option>
          ))}
        </select>
      </div>
      <div className="text-start">
        <label className="form-label mb-1" htmlFor="blackPlayer">
          Black:
        </label>
        <select
          className="form-select form-select-sm"
          id="blackPlayer"
          disabled={players.length === 0}
          onChange={onSelectBlack}
          value={blackPlayer ? players.indexOf(blackPlayer) : -1}
        >
          <option value={-1}>Select black player</option>
          {players.map((player: PlayerInfo, index: number) => (
            <option value={index} key={`${player.name}-${index}`}>
              {makePlayerLabel(player)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default PlayerCsvInput;
