// autoSync.ts
import useMindmapStore from "@/store/useMindMapStore";
// import { saveMindmapToProject } from "@/store/syncLogic";

// Lắng nghe thay đổi nodes/edges và sync tự động
export function initAutoSync() {
  const unsubscribeNodes = useMindmapStore.subscribe(
    (state) => state.node.nodes,
    // () => saveMindmapToProject()
  );

  const unsubscribeEdges = useMindmapStore.subscribe(
    (state) => state.edge.edges,
    // () => saveMindmapToProject()
  );

  return () => {
    unsubscribeNodes();
    unsubscribeEdges();
  };
}
