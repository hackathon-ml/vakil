import { CaseState } from "../state/case-state.type";
import { EngineDeps } from "./engine-deps.type";

export type NodeFn = (state: CaseState, deps: EngineDeps) => Promise<CaseState>;
