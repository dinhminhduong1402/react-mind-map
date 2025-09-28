// syncLogic.ts
import useMindmapStore from "@/store/useMindMapStore";
import useProjectStore from "./useProjectStore";

export async function loadProjectToMindmap() {
  const {currentProject} = useProjectStore.getState();
  
  if (!currentProject) return;

  // set vào mindmap store
  if(currentProject.nodes && currentProject.edges) {
    useMindmapStore.getState().node.setNodes(currentProject.nodes);
    useMindmapStore.getState().edge.setEdges(currentProject.edges);
  }
}

export function saveMindmapToProject() {
  useProjectStore.getState().updateCurrentProject();
}
