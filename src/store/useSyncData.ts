import { create } from "zustand";
import type { Project, ProjectMin } from "./useProjectStore";
import {deleteProject, getAllProjects, getProjectData} from '@/helpers/indexDb'
import { ApiProjectStrategy, ProjectContext } from "@/services/projectService";
import useProjectStore from "./useProjectStore";

interface SyncState {
  isOpen: boolean;
  isSyncing: boolean;
  needUpdateProjects: ProjectMin[];
  openSyncModal: () => Promise<void>;
  resolveConflict: (action: "moveToServer" | "ignoreLocal", isDelete?: boolean) => Promise<void>;
}

const apiProjectService = new ProjectContext()
apiProjectService.setStrategy(new ApiProjectStrategy())

export const useSyncDataStore = create<SyncState>((set, get) => ({
  isOpen: false,
  isSyncing: false,
  needUpdateProjects: [],

  openSyncModal: async () => {
    const local = await getAllProjects();
    const remote = await apiProjectService.getProjectList() || [];
    // console.log('================================', {local, remote})
    // So sánh khác biệt (simple: so độ dài / timestamp)
    let isDifferent = false
    const offsets = local.filter(p => !remote.map(p => p.project_id).filter(Boolean).includes(p.project_id))
    if(offsets.length) {
      isDifferent = true
      console.log({offsets})
      set(() => ({needUpdateProjects: offsets}))
    }
    
    if (isDifferent) {
      set({ isOpen: true });
    } else {
      set({ isOpen: false });
    }
  },

  resolveConflict: async (action, isDelete = false) => {
    // const { localProjects, remoteProjects } = get();
    
    if (action === "moveToServer") {
      set(() => ({isSyncing: true}))
      const projects = get().needUpdateProjects
      const toPushPromises: Array<Promise<Project>> = []
      projects.forEach(p => {
        toPushPromises.push(getProjectData(p.project_id))
      })
      const toPush = await Promise.all(toPushPromises)
      console.log({toPush})
      // call api here
      const rs = await apiProjectService.batchInsert(toPush)
      // console.log({rsData: rs})
      /* 
        {
          "acknowledged": true,
          "insertedCount": 1,
          "insertedIds": {
              "0": "68e14360062c738a9a0564ab"
          }
        }
       */
      if(rs) {
        set(() => ({isSyncing: false}))
      }

      useProjectStore.getState().initProjects()
      if(rs && isDelete) {
        projects.forEach(p => deleteProject(p.project_id))
      }
    } else if (action === 'ignoreLocal') {
      console.log('=======unsync')
    }

    set({ isOpen: false });
  },
}));
