import { useEffect } from "react";
import { Node, Edge } from "@xyflow/react";
import useMindMapStore from "../store/useMindMapStore";

export default function useKeyboardShortcuts(selectedNode: Node | null) {
  const { nodes, setNodes, setcurrentActiveNodeId } = useMindMapStore(state => state.node);
  const { edges, setEdges } = useMindMapStore(state => state.edge);

  // thêm node con
  const addChildNode = () => {
    if (!selectedNode) return;

    const newNodeId = `node-${Date.now()}`;
    const childPosition = {
      x: (selectedNode.position?.x || 0) + 200,
      y: selectedNode.position?.y || 0,
    };

    const newNode: Node = {
      id: newNodeId,
      type: "textUpdaterNode",
      position: childPosition,
      data: { content: "New child" },
      selected: false,
    };

    const newEdge: Edge = {
      id: `edge-${selectedNode.id}-${newNodeId}`,
      source: selectedNode.id,
      target: newNodeId,
    };

    setNodes([...nodes, newNode]);
    setEdges([...edges, newEdge]);
    setcurrentActiveNodeId(newNodeId);
  };

  // thêm node cùng cấp
  const addSiblingNode = () => {
    if (!selectedNode) return;

    const newNodeId = `node-${Date.now()}`;
    const siblingPosition = {
      x: selectedNode.position?.x || 0,
      y: (selectedNode.position?.y || 0) + 100,
    };

    const newNode: Node = {
      id: newNodeId,
      type: "textUpdaterNode",
      position: siblingPosition,
      data: { content: "New sibling" },
      selected: false,
    };

    setNodes([...nodes, newNode]);
    setcurrentActiveNodeId(newNodeId);

    // tìm parent
    const parentEdge = edges.find((e) => e.target === selectedNode.id);
    if (parentEdge) {
      const newEdge: Edge = {
        id: `edge-${parentEdge.source}-${newNodeId}`,
        source: parentEdge.source,
        target: newNodeId,
      };
      setEdges([...edges, newEdge]);
    }
  };

  // xóa node (trừ root)
  const deleteNode = () => {
    if (!selectedNode) return;
    
    if (selectedNode.id === "root") {
      console.warn("⚠️ Không thể xóa node gốc (root)!");
      return;
    }

    setNodes(nodes.filter((n) => n.id !== selectedNode.id));
    setEdges(
      edges.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
      )
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedNode) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteNode();
      }

      if (e.key === "Tab") {
        e.preventDefault();
        addChildNode();
      }

      if (e.key === "Enter") {
        e.preventDefault();
        addSiblingNode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode, nodes, edges]);
}
