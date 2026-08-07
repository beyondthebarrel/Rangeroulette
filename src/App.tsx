import { useState } from "react";
import { BillDrillScreen } from "./components/BillDrillScreen";
import { Header } from "./components/Header";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { MatchOverScreen } from "./components/MatchOverScreen";
import { ModeSelectScreen } from "./components/ModeSelectScreen";
import { PlayerSetup } from "./components/PlayerSetup";
import { RoundBuildScreen } from "./components/RoundBuildScreen";
import { RoundResultScreen } from "./components/RoundResultScreen";
import { ScoreScreen } from "./components/ScoreScreen";
import { TrainHistoryScreen } from "./components/TrainHistoryScreen";
import { TrainScreen } from "./components/TrainScreen";
import { GameProvider, useGame } from "./game/GameContext";

type View = "modeSelect" | "game" | "train" | "trainHistory" | "leaderboard";

function GameScreen({ onBackToModes }: { onBackToModes: () => void }) {
  const { state } = useGame();
  switch (state.phase) {
    case "setup":
      return <PlayerSetup onBackToModes={onBackToModes} />;
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
  const [view, setView] = useState<View>("modeSelect");

  return (
    <GameProvider>
      <div className="min-h-svh bg-zinc-950">
        <Header />
        {view === "modeSelect" && (
          <ModeSelectScreen
            onSelectGame={() => setView("game")}
            onSelectTrain={() => setView("train")}
            onOpenLeaderboard={() => setView("leaderboard")}
          />
        )}
        {view === "game" && <GameScreen onBackToModes={() => setView("modeSelect")} />}
        {view === "train" && (
          <TrainScreen
            onBack={() => setView("modeSelect")}
            onOpenHistory={() => setView("trainHistory")}
          />
        )}
        {view === "trainHistory" && <TrainHistoryScreen onBack={() => setView("train")} />}
        {view === "leaderboard" && (
          <LeaderboardScreen onBack={() => setView("modeSelect")} />
        )}
      </div>
    </GameProvider>
  );
}

export default App;
