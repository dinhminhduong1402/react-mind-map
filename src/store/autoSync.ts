// autoSync.ts
import useMindmapStore from "@/store/useMindmapStore";
import { saveMindmapToProject } from "./syncLogic";

// Lắng nghe thay đổi nodes/edges và sync tự động
export function initAutoSync() {
  const unsubscribeNodes = useMindmapStore.subscribe(
    (state) => state.nodes,
    () => saveMindmapToProject()
  );

  const unsubscribeEdges = useMindmapStore.subscribe(
    (state) => state.edges,
    () => saveMindmapToProject()
  );

  return () => {
    unsubscribeNodes();
    unsubscribeEdges();
  };
}
