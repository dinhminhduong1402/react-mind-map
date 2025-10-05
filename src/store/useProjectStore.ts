// useProjectStore.ts
import { create } from 'zustand';
import { deleteProject } from '@/helpers/indexDb';
import { Node, Edge } from '@xyflow/react';
import {ProjectContext, ApiProjectStrategy, LocalProjectStrategy} from '@/services/projectService'
import useUserStore from '@/store/useUserStore';
import useMindMapStore from './useMindMapStore';

export type ProjectMin = {
  project_id: string,
  project_title: string,
  nodes?: Node[],
  edges?: Edge[],
//   lastUpdated: string; // luôn lưu ISO string để dễ persist
}

export type Project = {
  project_id: string,
  project_title: string,
  nodes: Node[],
  edges: Edge[],
}

interface ProjectState {
  projectList: ProjectMin[];
  updateProjectList: () => Promise<void>;
  currentProject: Project | null,
  setCurrentProject: (projectId: string) => Promise<Project | undefined>,

  initProjects: () => Promise<unknown>,
  createProject: (project_title: string) => Promise<Project>,
  updateCurrentProject: () => Promise<void>,
  udpateProjectData: (projectUpdateData: ProjectMin) => Promise<void>,
  removeProject: (id: string) => Promise<void>,

  isSaving: boolean;
  setIsSaving: (value: boolean) => void,

  projectService: () => ProjectContext,
}

const getDefaultProject: () => Project = () => ({
  project_id: crypto.randomUUID(),
  project_title: 'New Project',
  nodes: [
    {
      id: 'root',
      position: {
        x: 50,
        y: (window.innerHeight - 80)/2
      },
      data: { content: 'New Topic' },
      type: 'textUpdaterNode',
      selected: true
    },
  ],
  edges: [],
  // lastUpdated: new Date().toISOString(),
});

const LAST_PROJECT_ID_KEY = "mindmap-last-project-id";

const useProjectStore = create<ProjectState>((set, get) => {
  const getCurrentUser = () => useUserStore.getState().currentUser

  return {
    isSaving: false,
    setIsSaving: (value: boolean) => {
      set(() => ({ isSaving: !!value }))
    },

    projectService: () => {
      const projectService = new ProjectContext()
      projectService.setStrategy(
        getCurrentUser() ? new ApiProjectStrategy() : new LocalProjectStrategy()
      )
      return projectService
    },
    projectList: [],
    updateProjectList: async () => {
      const projects = await get().projectService().getProjectList()
      set(() => ({projectList: projects}))
    },
    currentProject: null,
    
    initProjects: async () => {
      const projects = await get().projectService().getProjectList()
      const lastProjectId = localStorage.getItem(LAST_PROJECT_ID_KEY)

      if (projects?.length === 0) {
        const defaultProject = getDefaultProject()
        await get().projectService().create(defaultProject)
        await get().setCurrentProject(defaultProject.project_id)
        set({ projectList: [defaultProject] })
        localStorage.setItem(LAST_PROJECT_ID_KEY, defaultProject.project_id)
      } else {
        if (!Array.isArray(projects)) throw new Error("Invalid projects")
        set({projectList: projects})
        const validProjectId =
          projects?.findIndex(p => p.project_id === lastProjectId) > -1
            ? lastProjectId
            : projects?.[0].project_id

        if (validProjectId) {
          await get().setCurrentProject(validProjectId)
          localStorage.setItem(LAST_PROJECT_ID_KEY, validProjectId ?? "")
        }
      }
    },

    setCurrentProject: async (projectId) => {
      const project = await get().projectService().getProjectData(projectId)
      if (project) {
        set({ currentProject: project })
        localStorage.setItem(LAST_PROJECT_ID_KEY, projectId ?? "")
      }
      return project
    },

    createProject: async (title) => {
      // udpate to store
      const newProject: Project = { ...getDefaultProject(), project_title: title }
      set(state => ({
        projectList: [...state.projectList, newProject],
        currentProject: newProject,
      }))
      // update to databsae
      await get().projectService().create(newProject)
      localStorage.setItem(LAST_PROJECT_ID_KEY, newProject.project_id)
      return newProject
    },

    updateCurrentProject: async () => {
      get().setIsSaving(true)
      const currentProject = get().currentProject
      if (currentProject) {
        const nodes = useMindMapStore.getState().node.nodes
        const edges = useMindMapStore.getState().edge.edges

        const updatedProject = { ...currentProject, nodes, edges }
        await get().projectService().updateProject(updatedProject)
      }
      setTimeout(() => {
        get().setIsSaving(false)
      }, 1000)
    },

    udpateProjectData: async (updateData) => {
      await get().projectService().updateProject(updateData)
      await get().updateProjectList()
    },

    removeProject: async (id: string) => {
      set(state => {
        const filtered = state.projectList.filter(p => p.project_id !== id)
        let newCurrentId = state.currentProject?.project_id
        if (newCurrentId === id) {
          newCurrentId =
            filtered.length > 0 ? filtered[0].project_id : undefined
          localStorage.setItem(LAST_PROJECT_ID_KEY, newCurrentId ?? "")
        }
        return { projectList: filtered }
      })
      await deleteProject(id)
    },
  }
})


export default useProjectStore;
