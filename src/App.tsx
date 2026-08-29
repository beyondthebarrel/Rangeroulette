import { useState } from "react";
import { useAuth } from "./auth/AuthContext";
import { AuthScreen } from "./components/AuthScreen";
import { BillDrillScreen } from "./components/BillDrillScreen";
import { Header } from "./components/Header";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { MatchOverScreen } from "./components/MatchOverScreen";
import { ModeSelectScreen } from "./components/ModeSelectScreen";
import { PlayChallengesScreen } from "./components/PlayChallengesScreen";
import { PlayerSetup } from "./components/PlayerSetup";
import { RoundBuildScreen } from "./components/RoundBuildScreen";
import { RoundResultScreen } from "./components/RoundResultScreen";
import { RulesIntroScreen } from "./components/RulesIntroScreen";
import { SafetyChecklistScreen } from "./components/SafetyChecklistScreen";
import { ScoreScreen } from "./components/ScoreScreen";
import { TrainHistoryScreen } from "./components/TrainHistoryScreen";
import { TrainScreen } from "./components/TrainScreen";
import { GameProvider, useGame } from "./game/GameContext";
import { hasSeenRulesIntro, markRulesIntroSeen } from "./onboarding/rulesIntro";

type View =
  | "modeSelect"
  | "rulesIntro"
  | "safetyCheck"
  | "game"
  | "train"
  | "trainHistory"
  | "leaderboard";
type PendingMode = "game" | "train";

function GameScreen({ onBackToModes }: { onBackToModes: () => void }) {
  const { state } = useGame();
  switch (state.phase) {
    case "setup":
      return <PlayerSetup onBackToModes={onBackToModes} />;
    case "billDrill":
      return <BillDrillScreen />;
    case "playChallenges":
      return <PlayChallengesScreen />;
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
  const [view, setView] = useState<View>(() =>
    hasSeenRulesIntro() ? "modeSelect" : "rulesIntro",
  );
  const [pendingMode, setPendingMode] = useState<PendingMode | null>(null);
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-svh items-center justify-center bg-black text-zinc-400">Loading…</div>;
  }

  if (!session) {
    return <AuthScreen />;
  }

  function selectMode(mode: PendingMode) {
    setPendingMode(mode);
    setView("safetyCheck");
  }

  function closeRulesIntro() {
    markRulesIntroSeen();
    setView("modeSelect");
  }

  return (
    <GameProvider>
      <div className="min-h-svh bg-zinc-950">
        <Header />
        {view === "rulesIntro" && <RulesIntroScreen onDone={closeRulesIntro} />}
        {view === "modeSelect" && (
          <ModeSelectScreen
            onSelectGame={() => selectMode("game")}
            onSelectTrain={() => selectMode("train")}
            onOpenLeaderboard={() => setView("leaderboard")}
            onOpenRules={() => setView("rulesIntro")}
          />
        )}
        {view === "safetyCheck" && pendingMode && (
          <SafetyChecklistScreen
            mode={pendingMode}
            onAcknowledge={() => setView(pendingMode)}
            onBack={() => {
              setView("modeSelect");
              setPendingMode(null);
            }}
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
