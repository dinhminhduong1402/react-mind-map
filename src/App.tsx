import './App.css';
import { useEffect} from "react";
import { useUpdateEffect} from "ahooks";

import TopBar from "@/components/TopBar";
import ToastContainer from "@/components/ToastContainer";
import ShortcutBar from "./components/ShortcutHelp";
import MindMap from "./components/Mindmap";

import { loadProjectToMindmap } from "@/store/syncLogic";
import { useToastStore } from "./store/useToastStore";
import useProjectStore from "./store/useProjectStore";
import { ReactFlowProvider } from '@xyflow/react';


export default function App() {
  
  const {currentProjectId, initProjects, getCurrentProject} = useProjectStore();
  const {addToast, removeToast} = useToastStore()

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
      <div  style={{ width: "100vw", height: "100vh"}}>
        <ReactFlowProvider><MindMap/></ReactFlowProvider>
        <ShortcutBar/>
      </div>
      <ToastContainer/>
    </div>
  );
}
