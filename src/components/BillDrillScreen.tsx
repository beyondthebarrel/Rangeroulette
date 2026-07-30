import { useGame } from "../game/GameContext";
import { ScoreEntryScreen } from "./ScoreEntryScreen";

export function BillDrillScreen() {
  const { dispatch } = useGame();
  return (
    <ScoreEntryScreen
      title="Bill Drill — 10 rounds, 5 yards, A-zone"
      onSubmit={() => dispatch({ type: "FINISH_BILL_DRILL" })}
      submitLabel="Finish Bill Drill"
    />
  );
}
