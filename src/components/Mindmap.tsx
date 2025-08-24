import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  NodeChange,
  Node,
  EdgeChange,
  Edge,
  NodeTypes,
  BackgroundVariant,
  useReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useEffect, useLayoutEffect} from "react";

import useMindMapStore from "@/store/useMindMapStore";
import { saveMindmapToProject } from "@/store/syncLogic";

import useKeyboardShortcuts from "@/hooks/useKeyboardShorcuts";

import { TextUpdaterNode } from "@/components/TextUpdaterNode";

const nodeTypes: NodeTypes = {textUpdaterNode: TextUpdaterNode}

export default function MindMap () {

  const {nodes, setNodes, setcurrentActiveNodeId} = useMindMapStore((state) => state.node);
  const {edges, setEdges} = useMindMapStore((state) => state.edge);
  const {updateLayout} = useMindMapStore((state) => state.layout);

  const {setViewport} = useReactFlow()
  
  const onNodesChange = (changes: NodeChange<Node>[]) => {
    const updatedNodes = applyNodeChanges(changes, nodes);
    setNodes(updatedNodes);

    updateLayout()
    const selected = updatedNodes.find(n => n.selected)
    if(selected) {
      setcurrentActiveNodeId(selected.id)
    }
      // sync vào project
    saveMindmapToProject();
  };

  const onEdgesChange = (changes: EdgeChange<Edge>[]) => {
    const updatedEdges = applyEdgeChanges(changes, edges);
    setEdges(updatedEdges)
    updateLayout()
    // sync vào project
    saveMindmapToProject();
  };

   // hook phím tắt
  useKeyboardShortcuts();

  useLayoutEffect(() => {
     const reactFlowPanel = document.querySelector('.react-flow__panel.react-flow__attribution')
      reactFlowPanel?.remove()
      console.log("removed")

  }, [])

  useEffect(() => {
    setViewport({x: 0, y: 0, zoom: 1}, {duration: 1.2, interpolate: 'smooth'})
    // setCenter(0, 0)
  }, [])
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      // onConnect={onConnect}
      nodeTypes={nodeTypes}
      // nodesSelectable={true}
      deleteKeyCode={[]}
      fitView={false}
    >
      <Controls />
      <MiniMap />
      <Background gap={12} size={1} variant={BackgroundVariant.Dots}/>

    </ReactFlow>
  )
}