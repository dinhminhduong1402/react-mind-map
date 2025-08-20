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
  ReactFlowProvider,
  NodeTypes,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import useMindMapStore from "./store/useMindMapStore";
import { TextUpdaterNode } from "./components/TextUpdaterNode";
import { useEffect, useState, useLayoutEffect} from "react";
import { useUpdateEffect} from "ahooks";
// import { useCallback } from "react";
import './App.css';
import useKeyboardShortcuts from "./hooks/useKeyboardShorcuts";
import { saveMindmapToProject, loadProjectToMindmap } from "@/store/syncLogic";
import useProjectStore from "./store/useProjectStore";

import TopBar from "@/components/TopBar";
import ToastContainer from "@/components/ToastContainer";
import { useToastStore } from "./store/useToastStore";

const nodeTypes: NodeTypes = {textUpdaterNode: TextUpdaterNode}


export default function App() {
  
  const {nodes, setNodes} = useMindMapStore((state) => state.node);
  const {edges, setEdges} = useMindMapStore((state) => state.edge);
  const {updateLayout} = useMindMapStore((state) => state.layout);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const {currentProjectId, initProjects, getCurrentProject} = useProjectStore();

  const {addToast, removeToast} = useToastStore()

  const onNodesChange = (changes: NodeChange<Node>[]) => {
    const updatedNodes = applyNodeChanges(changes, nodes);
    setNodes(updatedNodes);
    updateLayout()
    
    // Lấy node đang được select
    // console.log({updatedNodes})
    const selected = updatedNodes.find((n) => n.selected);
    // console.log({selected})
    setSelectedNode(selected || null);

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
  useKeyboardShortcuts(selectedNode);

  useLayoutEffect(() => {
     const reactFlowPanel = document.querySelector('.react-flow__panel.react-flow__attribution')
      reactFlowPanel?.remove()
      console.log("removed")
  }, [])

  useEffect(() => {
    // load projects
    initProjects().then( () => updateLayout())
  }, [])

   // Khi switch project → load nodes/edges vào mindmap
  let currentProject = getCurrentProject();
  useUpdateEffect(() => {
    if (currentProjectId) {
      const id = addToast("Loaded project", "process");

      loadProjectToMindmap(currentProjectId);

      setTimeout(() => {
        removeToast(id);
        addToast("Loaded project", "success");
      }, 500);
    }
    currentProject = getCurrentProject()
  }, [currentProjectId]);
  
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <TopBar currentProject={currentProject} selectedNode={selectedNode}/>
      <div  style={{ width: "100vw", height: "100vh", paddingTop: "68px"}}>
        <ReactFlowProvider>
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
            <Background gap={12} size={1} />
  
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      <ToastContainer/>
    </div>
  );
}
