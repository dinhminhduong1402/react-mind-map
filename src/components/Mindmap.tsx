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
  EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useMemo} from "react";

import useMindMapStore from "@/store/useMindMapStore";
import { saveMindmapToProject } from "@/store/syncLogic";

import { TextUpdaterNode } from "@/components/TextUpdaterNode";
import {debounce} from '@/core/utils'
import MyEdge from "./MyEdge";

export default function MindMap () {

  const {nodes, setNodes, setcurrentActiveNodeId, currentActiveNodeId} = useMindMapStore((state) => state.node);
  const {edges, setEdges} = useMindMapStore((state) => state.edge);
  const {setCenter, getViewport } = useReactFlow()
  

  const nodeTypes: NodeTypes = useMemo(() => (
    {textUpdaterNode: TextUpdaterNode}
  ), [])
  const edgeTypes: EdgeTypes = useMemo(() => (
    {myEdge: MyEdge}
  ), [])

  const flowEl = useRef<HTMLDivElement>(null)

  // move node into viewport
  const intoViewport = useCallback((selected: Node) => {
    const { x, y } = selected.position;
    const viewport = getViewport(); // { x, y, zoom }

    if (flowEl.current) {
      console.log({selected})
      const { clientWidth, clientHeight } = flowEl.current;

      // chuyển node position (canvas → screen coords)
      const nodeScreenX = x * viewport.zoom + viewport.x;
      const nodeScreenY = y * viewport.zoom + viewport.y;
      const nodeWidth = selected?.measured?.width || 150
      const nodeHeight = selected?.measured?.height || 50

      const margin = 60;
      const insideViewport =
        nodeScreenX > margin &&
        nodeScreenY > margin &&
        nodeScreenX + nodeWidth < clientWidth - margin &&
        nodeScreenY + nodeHeight < clientHeight - margin;

      if (!insideViewport) {
        console.log({nodeHeight, nodeWidth, x, y})
        setCenter(x + nodeWidth/2, y + nodeHeight/2, { zoom: 1, duration: 600 });
      }
    }
  }, [])

  
  useEffect(() => {
    const selected = nodes.find(n => n.selected)
    if(!selected) return
    intoViewport(selected)
    
  }, [currentActiveNodeId])

  const debouncedSave = useMemo(
    () => debounce(saveMindmapToProject, 1000),
    [saveMindmapToProject]
  );
  const onNodesChange = (changes: NodeChange<Node>[]) => {
    console.log('=========on node change')
    const updatedNodes = applyNodeChanges(changes, nodes);
    setNodes(updatedNodes);

    const selected = updatedNodes.find(n => n.selected)
    if(selected) {
      setcurrentActiveNodeId(selected.id)
    }
      // sync vào project
    debouncedSave()
    // saveMindmapToProject();
  };
  const onEdgesChange = (changes: EdgeChange<Edge>[]) => {
    console.log('==========on edge change')
    const updatedEdges = applyEdgeChanges(changes, edges);
    setEdges(updatedEdges)
    // sync vào project
    debouncedSave()
    // saveMindmapToProject();
  };

  useLayoutEffect(() => {
     const reactFlowPanel = document.querySelector('.react-flow__panel.react-flow__attribution')
      reactFlowPanel?.remove()
      console.log("removed")

  }, [])

  const onNodeDragStop = (
    event: React.MouseEvent<Element, MouseEvent>,
    draggedNode: Node
  ) => {
    console.log({event})
    const nodes = useMindMapStore.getState().node.nodes;
    const edges = useMindMapStore.getState().edge.edges;

    // tìm parent của draggedNode
    const parentEdge = edges.find((e) => e.target === draggedNode.id);
    const parentId = parentEdge?.source ?? null;

    // lấy danh sách sibling nodes (cùng cha)
    const siblingIds = edges
      .filter((e) => e.source === parentId)
      .map((e) => e.target);

    const siblings = nodes.filter(
      (n) => siblingIds.includes(n.id) && n.id !== draggedNode.id
    );

    // tìm vị trí mới trong sibling theo trục Y
    const sortedSiblings = [...siblings].sort(
      (a, b) => a.position.y - b.position.y
    );

    let newIndex = sortedSiblings.findIndex(
      (n) => draggedNode.position.y < n.position.y
    );
    if (newIndex === -1) newIndex = sortedSiblings.length; // nằm cuối

    // remove draggedNode khỏi danh sách
    const withoutDragged = nodes.filter((n) => n.id !== draggedNode.id);

    // chèn draggedNode lại vào đúng vị trí index
    const targetIndex = withoutDragged.findIndex(
      (n) => n.id === sortedSiblings[newIndex]?.id
    );
    if (targetIndex !== -1) {
      withoutDragged.splice(targetIndex, 0, draggedNode);
    } else {
      withoutDragged.push(draggedNode);
    }
    
    // cập nhật nodes
    useMindMapStore.getState().node.setNodes(withoutDragged);
    useMindMapStore.getState().layout.updateLayout();

    // optional: saveHistory();

    // === remove isDragging flag
    const nodeStore = nodes.find(n => n.id === draggedNode.id)
    if(nodeStore) {
      nodeStore.data.isDragging = false
    }
    const relatedEdges = edges.filter(e => {
      return e.target === draggedNode.id || e.source === draggedNode.id
    })
    relatedEdges.forEach(e => {
      if(!e.data) {
        e.data = {}
      }
      e.data.isDragging = false
    })
    // setNodes(nodes)
    // setEdges(edges)

    
  };

  const onNodeDragStart = (event: React.MouseEvent, node: Node) => {
    console.log({event, node})
    // set node data isDragging = true to prevent react flow render node many time and edge unexpected animation 
    const nodeStore = nodes.find(n => n.id === node.id)
    if(nodeStore) {
      nodeStore.data.isDragging = true
    }
    const relatedEdges = edges.filter(e => {
      return e.target === node.id || e.source === node.id
    })
    relatedEdges.forEach(e => {
      if(!e.data) {
        e.data = {}
      }
      e.data.isDragging = true
    })

    // setNodes(nodes)
    // setEdges(edges)
    // 
  }

  
  return (
    <ReactFlow
      ref={flowEl}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      // onNodeDragStart={(event, node) => debounce(onNodeDragStart, 50)(event, node)}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      onEdgesChange={onEdgesChange}
      // onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes} 
      // nodesSelectable={true}
      deleteKeyCode={[]}
      fitView={false}
    >
      <Controls />
      <MiniMap />
      <Background gap={12} size={1} variant={BackgroundVariant.Cross}/>

    </ReactFlow>
  )
}