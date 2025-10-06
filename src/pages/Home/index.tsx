
import { useEffect, useState, useRef } from "react";
import { useUpdateEffect} from "ahooks";

import TopBar from "@/components/TopBar";
import ToastContainer from "@/components/ToastContainer";
import MindMap from "@/components/Mindmap";
import LoginModal from "@/components/LoginModal";

import { loadProjectToMindmap } from "@/store/syncLogic";
import useProjectStore from "@/store/useProjectStore";
import { ReactFlowProvider } from '@xyflow/react';
import useKeyboardShortcuts from '@/hooks/useKeyboardShorcuts';
import useUserStore from "@/store/useUserStore";
import { useSyncDataStore } from "@/store/useSyncData";
import { SyncDataModal } from "@/components/SyncDataModal";
import LoadingPage from "@/components/loadingPage";

export default function Home() {
  const [isLoading, setisLoading] = useState(false)
  const [isOpenLoginModal, setIsOpenLoginModal] = useState(false)

  const {currentProject, initProjects} = useProjectStore();
  const {setCurrentUser} = useUserStore()
  const {openSyncModal} = useSyncDataStore()
  
  const effectRan = useRef(false);
  useEffect(() => {
    if (effectRan.current === true) {
      console.log("Effect runs only once");
      return
    }
    setisLoading(true)
    setCurrentUser()
    .then(user => {
      if(!user) {
        setIsOpenLoginModal(true)
      } else {
        openSyncModal()
      }
      console.log({user})
      // load projects
      return initProjects()
    })
    .finally(() => {
      setisLoading(false)
    })

    return () => {
      effectRan.current = true;
    };
    
  }, [])
  

  useKeyboardShortcuts()

   // Khi switch project → load nodes/edges vào mindmap
  useUpdateEffect(() => {
    if (currentProject) {
      console.log({currentProject})
      loadProjectToMindmap();
    }
    
  }, [currentProject]);
  
  return !isLoading? (
    <div style={{ width: "100vw", height: "100vh" }}>
      <TopBar />
      <div  style={{ width: "100vw", height: "100vh"}}>
        <ReactFlowProvider><MindMap/></ReactFlowProvider>
      </div>
      <ToastContainer/>
      <LoginModal isOpen={isOpenLoginModal} onClose={() => {setIsOpenLoginModal(false)}}/>
      <SyncDataModal/>
    </div>
  ) : <LoadingPage/>
}