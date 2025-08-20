import { useEffect } from "react";
import { Node } from "@xyflow/react";
import useMindMapStore from "../store/useMindMapStore";

export default function useKeyboardShortcuts(selectedNode: Node | null) {
  const { nodes,  deleteNode, addChildNode, addSiblingNode } = useMindMapStore(state => state.node);
  const { undo, redo } = useMindMapStore(state => state.history);
  const { updateLayout} = useMindMapStore(state => state.layout);
  const { edges } = useMindMapStore(state => state.edge);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // no need selected node
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault(); 
        console.log("update layout")
        updateLayout()
      }

      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault(); 
        console.log('Crt Z')
        undo()
      }

      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault(); 
        redo()
      }
      
      // need selectedNode
      if (!selectedNode) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        deleteNode(selectedNode.id);
      }

      if (e.key === "Tab") {
        e.preventDefault();
        addChildNode(selectedNode);
      }

      if (e.key === "Enter") {
        e.preventDefault();
        addSiblingNode(selectedNode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode, nodes, edges]);
}
