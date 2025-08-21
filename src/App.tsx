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
import { useEffect, useLayoutEffect} from "react";
import { useUpdateEffect} from "ahooks";
// import { useCallback } from "react";
import './App.css';
import useKeyboardShortcuts from "./hooks/useKeyboardShorcuts";
import { saveMindmapToProject, loadProjectToMindmap } from "@/store/syncLogic";
import useProjectStore from "./store/useProjectStore";
// import useEditingStore from "./store/useEditingStore";

import TopBar from "@/components/TopBar";
import ToastContainer from "@/components/ToastContainer";
import ShortcutBar from "./components/ShortcutHelp";
import { useToastStore } from "./store/useToastStore";

const nodeTypes: NodeTypes = {textUpdaterNode: TextUpdaterNode}


export default function App() {
  
  const {nodes, setNodes, setcurrentActiveNodeId} = useMindMapStore((state) => state.node);
  const {edges, setEdges} = useMindMapStore((state) => state.edge);
  const {currentProjectId, initProjects, getCurrentProject} = useProjectStore();

  const {addToast, removeToast} = useToastStore()

  const onNodesChange = (changes: NodeChange<Node>[]) => {
    const updatedNodes = applyNodeChanges(changes, nodes);
    setNodes(updatedNodes);
    
    const selected = nodes.find((n) => n.selected);
    // console.log({selected})
    if(selected) {
      setcurrentActiveNodeId(selected.id);
    }

     // sync vào project
    saveMindmapToProject();
  };

  const onEdgesChange = (changes: EdgeChange<Edge>[]) => {
    const updatedEdges = applyEdgeChanges(changes, edges);
    setEdges(updatedEdges)
    // updateLayout()

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
    // load projects
    initProjects()
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
      <TopBar currentProject={currentProject} />
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

        <ShortcutBar/>
      </div>
      <ToastContainer/>
    </div>
  );
}
