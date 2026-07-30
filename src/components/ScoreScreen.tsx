import { useGame } from "../game/GameContext";
import { ScoreEntryScreen } from "./ScoreEntryScreen";

export function ScoreScreen() {
  const { state, dispatch } = useGame();
  const drill = state.currentDrill;
  const parSeconds = drill?.cards.time?.def.parSeconds;

  return (
    <ScoreEntryScreen
      title={`Round ${state.round} — Score`}
      parSeconds={parSeconds}
      onSubmit={() => dispatch({ type: "SUBMIT_ROUND" })}
      submitLabel="Submit Round"
    />
  );
}
