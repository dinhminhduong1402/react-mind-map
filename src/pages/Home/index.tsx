
import { useEffect, useState} from "react";
import { useUpdateEffect} from "ahooks";

import TopBar from "@/components/TopBar";
import ToastContainer from "@/components/ToastContainer";
import MindMap from "@/components/Mindmap";
import LoginModal from "@/components/LoginModal";

import { loadProjectToMindmap } from "@/store/syncLogic";
import { useToastStore } from "@/store/useToastStore";
import useProjectStore from "@/store/useProjectStore";
import { ReactFlowProvider } from '@xyflow/react';
import useKeyboardShortcuts from '@/hooks/useKeyboardShorcuts';
import useUserStore from "@/store/useUserStore";

export default function Home() {
  const [isOpenLoginModal, setIsOpenLoginModal] = useState(false)

  const {currentProjectId, initProjects, getCurrentProject} = useProjectStore();
  const {addToast, removeToast} = useToastStore()
  const {setCurrentUser} = useUserStore()
  
  useEffect(() => {
    //check user
    setCurrentUser(localStorage.getItem('userId')).then(
      user => {
        console.log({user})
        if(!user) {
            setIsOpenLoginModal(true)
        }
      }
    )
    
    // load projects
    initProjects()
  }, [])

  useKeyboardShortcuts()

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
      </div>
      <ToastContainer/>
      <LoginModal isOpen={isOpenLoginModal} onClose={() => {setIsOpenLoginModal(false)}}/>
    </div>
  )
}