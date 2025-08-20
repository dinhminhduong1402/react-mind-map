// syncLogic.ts
import useMindmapStore from "@/store/useMindMapStore";
import useProjectStore from "./useProjectStore";

export function loadProjectToMindmap(projectId: string) {
  const projectStore = useProjectStore.getState();
  const mindmapStore = useMindmapStore.getState();

  const project = projectStore.projects.find(p => p.project_id === projectId);
  console.log({loadedProject: project})
  if (!project) return;

  // set vào mindmap store
  mindmapStore.node.setNodes(project.nodes);
  mindmapStore.edge.setEdges(project.edges);

  // set current project
  projectStore.loadProject(projectId);
}

export function saveMindmapToProject() {
  const projectStore = useProjectStore.getState();
  const mindmapStore = useMindmapStore.getState();

  if (!projectStore.currentProjectId) return;

  projectStore.updateProject(
    projectStore.currentProjectId,
    mindmapStore.node.nodes,
    mindmapStore.edge.edges
  );
}
