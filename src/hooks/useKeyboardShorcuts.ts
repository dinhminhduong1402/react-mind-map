import { useEffect } from "react";
import useMindMapStore from "../store/useMindMapStore";

export default function useKeyboardShortcuts() {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { nodes, currentActiveNodeId, deleteNode, addChildNode, addSiblingNode, setcurrentFocusNodeId, addParentNode} = useMindMapStore.getState().node;

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

      if (e.key === "Tab" && !e.shiftKey) {
        addChildNode(selectedNode);
        return 0
      }

      if(e.shiftKey && e.key === 'Tab') {
        addParentNode(selectedNode)
        return 0
      }

      if (e.key === "Enter") {
        addSiblingNode(selectedNode);
        return 0
      }

      if (e.key === 'F2') {
        setcurrentFocusNodeId('')
        setTimeout(() => setcurrentFocusNodeId(selectedNode.id), 0) // Force update - Tránh trường hợp currentFocusNodeId trước đó trùng với selected node id hiện tại (=>>>>>> Thật nghệ thuật)
        return 0
      }

      
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
