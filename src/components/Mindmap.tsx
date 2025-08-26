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
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useLayoutEffect, useRef, useMemo} from "react";

import useMindMapStore from "@/store/useMindMapStore";
import { saveMindmapToProject } from "@/store/syncLogic";

import { TextUpdaterNode } from "@/components/TextUpdaterNode";

export default function MindMap () {

  const {nodes, setNodes, setcurrentActiveNodeId, currentActiveNodeId} = useMindMapStore((state) => state.node);
  const {edges, setEdges} = useMindMapStore((state) => state.edge);
  const {updateLayout} = useMindMapStore((state) => state.layout);
  const {setCenter, getViewport } = useReactFlow()

  const nodeTypes: NodeTypes = useMemo(() => (
    {textUpdaterNode: TextUpdaterNode}
  ), [])

  const flowEl = useRef<HTMLDivElement>(null)

  // move node into viewport
  const intoViewport = useCallback((selected: Node) => {
    const { x, y } = selected.position;
    const viewport = getViewport(); // { x, y, zoom }

    if (flowEl.current) {
      const { clientWidth, clientHeight } = flowEl.current;

      // chuyển node position (canvas → screen coords)
      const nodeScreenX = x * viewport.zoom + viewport.x;
      const nodeScreenY = y * viewport.zoom + viewport.y;
      const nodeWidth = selected.width || 150
      const nodeHeight = selected.height || 50

      const margin = 60;
      const insideViewport =
        nodeScreenX > margin &&
        nodeScreenY > margin &&
        nodeScreenX + nodeWidth < clientWidth - margin &&
        nodeScreenY + nodeHeight < clientHeight - margin;

      if (!insideViewport) {
        setCenter(x, y, { zoom: 1, duration: 800 });
      }
    }
  }, [])

  useEffect(() => {
    const selected = nodes.find(n => n.selected)
    if(!selected) return
    intoViewport(selected)
    
  }, [currentActiveNodeId])

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

  useLayoutEffect(() => {
     const reactFlowPanel = document.querySelector('.react-flow__panel.react-flow__attribution')
      reactFlowPanel?.remove()
      console.log("removed")

  }, [])

  
  return (
    <ReactFlow
      ref={flowEl}
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