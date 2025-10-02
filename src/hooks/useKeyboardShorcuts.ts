import { useEffect } from "react";
import useMindMapStore from "../store/useMindMapStore";
import useProjectStore from "@/store/useProjectStore";
import { useToastStore } from "@/store/useToastStore";

export default function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const {addToast, removeToast} = useToastStore.getState()
      const { nodes, currentActiveNodeId} = useMindMapStore.getState().node;

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
        e.preventDefault()

        const {updateCurrentProject,} = useProjectStore.getState()
        const id = addToast("Saving...", "process")
        await updateCurrentProject()
        removeToast(id)
        addToast("Saved!", "success")
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
