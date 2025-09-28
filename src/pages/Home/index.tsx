
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

  const {currentProject, initProjects} = useProjectStore();
  const {addToast, removeToast} = useToastStore()
  const {setCurrentUser} = useUserStore()
  
  useEffect(() => {
    setCurrentUser()
    .then(user => {
      if(!user) {
        setIsOpenLoginModal(true)
      }
      console.log({user})
      // load projects
      initProjects()
    })
    
  }, [])

  useKeyboardShortcuts()

   // Khi switch project → load nodes/edges vào mindmap
  useUpdateEffect(() => {
    if (currentProject) {
      console.log({currentProject})
      loadProjectToMindmap();
    }
    
  }, [currentProject]);
  
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <TopBar />
      <div  style={{ width: "100vw", height: "100vh"}}>
        <ReactFlowProvider><MindMap/></ReactFlowProvider>
      </div>
      <ToastContainer/>
      <LoginModal isOpen={isOpenLoginModal} onClose={() => {setIsOpenLoginModal(false)}}/>
    </div>
  )
}