import type { RunnerState } from "./t-rex-runner";

export type RunnerSession = { requestId: number; visible: boolean; snapshot: RunnerState };
type RunnerSessionAction =
  | { type: "start"; requestId: number; snapshot: RunnerState }
  | { type: "hide"; requestId: number; snapshot: RunnerState }
  | { type: "show"; requestId: number }
  | { type: "end"; requestId: number };

export function runnerSessionReducer(state: RunnerSession | null, action: RunnerSessionAction): RunnerSession | null {
  if (action.type === "start") return { requestId: action.requestId, visible: true, snapshot: action.snapshot };
  if (!state || state.requestId !== action.requestId) return state;
  if (action.type === "end") return null;
  if (action.type === "hide") return { ...state, visible: false, snapshot: action.snapshot };
  return { ...state, visible: true };
}
