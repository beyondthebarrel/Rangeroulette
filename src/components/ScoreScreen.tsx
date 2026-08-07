import { useGame } from "../game/GameContext";
import { resolveParSeconds } from "../game/reducer";
import { ScoreEntryScreen } from "./ScoreEntryScreen";

export function ScoreScreen() {
  const { state, dispatch } = useGame();
  const parSeconds = resolveParSeconds(state.currentDrill);

  return (
    <ScoreEntryScreen
      title={`Round ${state.round} — Score`}
      parSeconds={parSeconds}
      onSubmit={() => dispatch({ type: "SUBMIT_ROUND" })}
      submitLabel="Submit Round"
    />
  );
}
