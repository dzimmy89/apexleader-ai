import { FLOW_DEFINITIONS } from "@/lib/flow-definitions";

/** Static catalog for admin/docs — no database reads */
export function getFlowCatalog() {
  return Object.entries(FLOW_DEFINITIONS).map(([flowType, steps]) => ({
    flowType,
    steps: steps.map((s) => ({
      stepId: s.stepId,
      delayHours: Math.round(s.delayMs / (60 * 60 * 1000)),
    })),
  }));
}
