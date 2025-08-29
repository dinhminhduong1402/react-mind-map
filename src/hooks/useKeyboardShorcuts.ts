import { useEffect } from "react";
import useMindMapStore from "../store/useMindMapStore";
import { saveProject } from "@/helpers/indexDb";
import useProjectStore from "@/store/useProjectStore";

export default function useKeyboardShortcuts() {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { nodes, currentActiveNodeId} = useMindMapStore.getState().node;
      const { edges} = useMindMapStore.getState().edge;

      // no need selected node
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault(); 
        e.stopPropagation()
        console.log("update layout")
        const { updateLayout } = useMindMapStore.getState().layout;
        updateLayout()
      }

      if (e.ctrlKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault(); 
        e.stopPropagation()
        console.log('Crt Z')
        const { undo } = useMindMapStore.getState().history;
        undo()
      }

      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault(); 
        const { redo } = useMindMapStore.getState().history;
        redo()
      }

      if(e.ctrlKey && e.key === 's') {
        const {updateProject, currentProjectId, projects} = useProjectStore.getState()
        if(currentProjectId) {
          updateProject(currentProjectId, nodes, edges)
          const currentProject = projects.find(p => p.project_id === currentProjectId)
          saveProject(currentProject)
        }
        e.preventDefault()
        return 0
      }
      
      // need selectedNode
      const selectedNode = nodes.find(n => n.id === currentActiveNodeId);
      // console.log({ selectedNodeId: selectedNode?.id });
      if (!selectedNode) return;
      
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
