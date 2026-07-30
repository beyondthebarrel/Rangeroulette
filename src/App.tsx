import { BillDrillScreen } from "./components/BillDrillScreen";
import { Header } from "./components/Header";
import { MatchOverScreen } from "./components/MatchOverScreen";
import { PlayerSetup } from "./components/PlayerSetup";
import { RoundBuildScreen } from "./components/RoundBuildScreen";
import { RoundResultScreen } from "./components/RoundResultScreen";
import { ScoreScreen } from "./components/ScoreScreen";
import { GameProvider, useGame } from "./game/GameContext";

function Screen() {
  const { state } = useGame();
  switch (state.phase) {
    case "setup":
      return <PlayerSetup />;
    case "billDrill":
      return <BillDrillScreen />;
    case "build":
      return <RoundBuildScreen />;
    case "score":
      return <ScoreScreen />;
    case "roundResult":
      return <RoundResultScreen />;
    case "matchOver":
      return <MatchOverScreen />;
    default:
      return null;
  }
}

function App() {
  return (
    <GameProvider>
      <div className="min-h-svh bg-zinc-950">
        <Header />
        <Screen />
      </div>
    </GameProvider>
  );
}

export default App;
