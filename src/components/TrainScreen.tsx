import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { CATEGORY_ORDER, SCORING, type CategoryKey } from "../data/cards";
import {
  deleteSavedDrill,
  listSavedDrills,
  saveDrill,
  type SavedDrill,
} from "../training/savedDrills";
import { getLastTraineeName, recordTrainingSession, setLastTraineeName } from "../training/storage";
import type { TrainingDrill } from "../training/types";
import { useTrainingDrill } from "../training/useTrainingDrill";
import { HeroBackdrop } from "./HeroBackdrop";
import { Panel } from "./Panel";
import { PlayingCard } from "./PlayingCard";
import { Stepper } from "./Stepper";
import { TitleFrame } from "./TitleFrame";

function computeFinalSeconds(
  rawSeconds: number,
  zoneMisses: number,
  completeMisses: number,
  parSeconds: number | undefined,
): number {
  let total = rawSeconds;
  total += zoneMisses * SCORING.zoneMissPenalty;
  total += completeMisses * SCORING.completeMissPenalty;
  if (parSeconds != null && rawSeconds > parSeconds) {
    total += SCORING.overParPenalty;
  }
  return Math.round(total * 100) / 100;
}

export function TrainScreen({
  onBack,
  onOpenHistory,
}: {
  onBack: () => void;
  onOpenHistory: () => void;
}) {
  const { user } = useAuth();
  const { drill, drawNew } = useTrainingDrill();
  const [trainee, setTrainee] = useState(() => getLastTraineeName());
  const [rawSeconds, setRawSeconds] = useState<number | null>(null);
  const [zoneMisses, setZoneMisses] = useState(0);
  const [completeMisses, setCompleteMisses] = useState(0);
  const [lastLogged, setLastLogged] = useState<number | null>(null);
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  const [savedDrills, setSavedDrills] = useState<SavedDrill[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState("");
  const [saveName, setSaveName] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedDrillError, setSavedDrillError] = useState<string | null>(null);

  const refreshSaved = useCallback(async () => {
    if (!user) return;
    setSavedDrills(await listSavedDrills(user.id));
  }, [user]);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  const selectedSaved = savedDrills.find((d) => d.id === selectedSavedId) ?? null;

  const randomSnapshot: TrainingDrill = {
    time: { cardId: drill.time.def.id, label: drill.time.def.label, detail: drill.time.def.detail },
    distance: {
      cardId: drill.distance.def.id,
      label: drill.distance.def.label,
      detail: drill.distance.def.detail,
    },
    startPosition: {
      cardId: drill.startPosition.def.id,
      label: drill.startPosition.def.label,
      detail: drill.startPosition.def.detail,
    },
    target: {
      cardId: drill.target.def.id,
      label: drill.target.def.label,
      detail: drill.target.def.detail,
    },
    courseOfFire: {
      cardId: drill.courseOfFire.def.id,
      label: drill.courseOfFire.def.label,
      detail: drill.courseOfFire.def.detail,
    },
    parSeconds: drill.time.def.parSeconds,
  };

  const activeDrill: TrainingDrill = selectedSaved ? selectedSaved.drill : randomSnapshot;
  const parSeconds = activeDrill.parSeconds;
  const canLog = trainee.trim().length > 0 && rawSeconds != null && !logging && !!user;

  function resetScoreFields() {
    setRawSeconds(null);
    setZoneMisses(0);
    setCompleteMisses(0);
  }

  function handleNewDrill() {
    setSelectedSavedId("");
    drawNew();
    resetScoreFields();
    setLastLogged(null);
    setLogError(null);
    setSavedDrillError(null);
  }

  async function handleSaveDrill() {
    if (!user || saveName.trim().length === 0) return;
    setSaving(true);
    setSavedDrillError(null);
    const saved = await saveDrill(user.id, saveName.trim(), activeDrill);
    setSaving(false);
    if (!saved) {
      setSavedDrillError("Couldn't save that drill — check your connection and try again.");
      return;
    }
    setSaveName("");
    setShowSave(false);
    await refreshSaved();
    setSelectedSavedId(saved.id);
  }

  async function handleDeleteSaved() {
    if (!selectedSaved) return;
    setSavedDrillError(null);
    const deleted = await deleteSavedDrill(selectedSaved.id);
    if (!deleted) {
      setSavedDrillError("Couldn't delete that drill — check your connection and try again.");
      return;
    }
    setSelectedSavedId("");
    await refreshSaved();
  }

  async function handleLog() {
    if (!canLog || rawSeconds == null || !user) return;
    const name = trainee.trim();
    setLastTraineeName(name);

    const finalSeconds = computeFinalSeconds(rawSeconds, zoneMisses, completeMisses, parSeconds);
    setLogging(true);
    setLogError(null);
    setLastLogged(null);
    const saved = await recordTrainingSession(
      {
        trainee: name,
        drill: activeDrill,
        rawSeconds,
        zoneMisses,
        completeMisses,
        finalSeconds,
      },
      user.id,
    );
    setLogging(false);

    if (!saved) {
      setLogError("Couldn't save that result — check your connection and try again.");
      return;
    }

    setLastLogged(finalSeconds);
    if (!selectedSaved) drawNew();
    resetScoreFields();
  }

  return (
    <HeroBackdrop>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <TitleFrame>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-red-500">
            Train Mode
          </h1>

          <input
            value={trainee}
            onChange={(e) => setTrainee(e.target.value)}
            placeholder="Trainee name"
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-red-600 focus:outline-none"
          />
        </TitleFrame>

        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-zinc-300">
              {selectedSaved ? `Saved Drill — ${selectedSaved.name}` : "The Drill"}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSave((v) => !v);
                  setSavedDrillError(null);
                }}
                className="rounded border border-zinc-600 px-3 py-1 text-xs uppercase tracking-wide text-zinc-300 hover:bg-zinc-800"
              >
                Save Drill
              </button>
              <button
                onClick={handleNewDrill}
                className="rounded border border-red-700 px-3 py-1 text-xs uppercase tracking-wide text-red-400 hover:bg-red-950"
              >
                New Drill
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSavedId}
              onChange={(e) => {
                setSelectedSavedId(e.target.value);
                resetScoreFields();
                setLastLogged(null);
                setSavedDrillError(null);
              }}
              className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
            >
              <option value="">Random draw</option>
              {savedDrills.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {selectedSaved && (
              <button
                onClick={handleDeleteSaved}
                className="rounded border border-zinc-700 px-3 py-2 text-xs uppercase tracking-wide text-zinc-400 hover:bg-zinc-800"
              >
                Delete
              </button>
            )}
          </div>

          {showSave && (
            <div className="flex gap-2">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Drill name"
                className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
              />
              <button
                disabled={saving || saveName.trim().length === 0 || !user}
                onClick={handleSaveDrill}
                className="rounded bg-red-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white enabled:hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}

          {savedDrillError != null && (
            <div className="text-sm text-amber-400">{savedDrillError}</div>
          )}

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {CATEGORY_ORDER.map((cat: CategoryKey) => (
              <PlayingCard key={cat} cardId={activeDrill[cat].cardId} />
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={rawSeconds ?? ""}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                setRawSeconds(Number.isNaN(n) ? null : n);
              }}
              placeholder="seconds"
              className="w-28 rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-white"
            />
            <span className="text-sm text-zinc-500">
              seconds{parSeconds != null ? ` — par ${parSeconds}s` : ""}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stepper label="Zone misses (+0.5s)" value={zoneMisses} onChange={setZoneMisses} />
            <Stepper
              label="Complete misses (+1.0s)"
              value={completeMisses}
              onChange={setCompleteMisses}
            />
          </div>

          {logError != null && (
            <div className="text-sm text-amber-400">{logError}</div>
          )}

          {lastLogged != null && (
            <div className="text-sm text-red-400">
              Logged: {lastLogged.toFixed(2)}s
            </div>
          )}

          <button
            disabled={!canLog}
            onClick={handleLog}
            className="w-full rounded-md bg-red-700 px-4 py-3 font-semibold uppercase tracking-wide text-white enabled:hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {logging ? "Logging…" : "Log Result"}
          </button>
        </Panel>

        <div className="flex gap-2">
          <button
            onClick={onOpenHistory}
            className="flex-1 rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            History &amp; Personal Bests
          </button>
          <button
            onClick={onBack}
            className="rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            ← Modes
          </button>
        </div>
      </div>
    </HeroBackdrop>
  );
}
