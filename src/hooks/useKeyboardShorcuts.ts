import { useEffect } from "react";
import useMindMapStore from "../store/useMindMapStore";
import useEditingStore from "@/store/useEditingStore"


export default function useKeyboardShortcuts() {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { nodes, currentActiveNodeId, deleteNode, addChildNode, addSiblingNode, setcurrentActiveNodeId } = useMindMapStore.getState().node;

      // no need selected node
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault(); 
        console.log("update layout")
        const { updateLayout } = useMindMapStore.getState().layout;
        updateLayout()
      }

      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault(); 
        console.log('Crt Z')
        const { undo } = useMindMapStore.getState().history;
        undo()
      }

      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault(); 
        const { redo } = useMindMapStore.getState().history;
        redo()
      }
      
      // need selectedNode
      const selectedNode = nodes.find(n => n.id === currentActiveNodeId);
      // console.log({ selectedNodeId: selectedNode?.id });
      if (!selectedNode) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        deleteNode(selectedNode.id);
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const childNode = addChildNode(selectedNode);
        const { setIsFocus } = useEditingStore.getState();
        setIsFocus(childNode.id, true)
      }

      if (e.key === "Enter") {
        // e.preventDefault();
        setcurrentActiveNodeId(selectedNode.id)
        const siblingNode = addSiblingNode(selectedNode);
        if(siblingNode) {
          const { setIsFocus } = useEditingStore.getState();
          setIsFocus(siblingNode.id, true)
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
