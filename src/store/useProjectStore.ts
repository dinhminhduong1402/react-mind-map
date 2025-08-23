// useProjectStore.ts
import { create } from 'zustand';
import { saveProject, getAllProjects, deleteProject } from '@/helpers/indexDb';
import { Node, Edge } from '@xyflow/react';

export interface Project {
  project_id: string;
  project_title: string;
  nodes: Node[];
  edges: Edge[];
  lastUpdated: string; // luôn lưu ISO string để dễ persist
}

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;

  getCurrentProject: () => Project | null;
  initProjects: () => Promise<void>;
  createProject: (title: string) => void;
  loadProject: (id: string) => void;
  updateProject: (id: string, nodes: Node[], edges: Edge[]) => void;
  updateProjectTitle: (id: string, title: string) => void;
  removeProject: (id: string) => void;

  isSaving: boolean,
  setIsSaving: (value: boolean) => void
}

const defaultProject: Project = {
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
    },
  ],
  edges: [],
  lastUpdated: new Date().toISOString(),
};

const LAST_PROJECT_ID_KEY = "mindmap-last-project-id";

const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProjectId: null,
  isSaving: false,
  setIsSaving: (value: boolean) => {
    set(s => ({...s, isSaving: !!value}))
  },
  loadProject: (id) => {
    set({ currentProjectId: id });
    localStorage.setItem(LAST_PROJECT_ID_KEY, id ?? "");
  },

  getCurrentProject: () => {
    const { projects, currentProjectId } = get();
    return projects.find((p) => p.project_id === currentProjectId) || null;
  },

  initProjects: async () => {
    const projects = await getAllProjects();
    const lastProjectId = localStorage.getItem(LAST_PROJECT_ID_KEY);

    if (projects.length === 0) {
      await saveProject(defaultProject);
      set({
        projects: [defaultProject],
        currentProjectId: defaultProject.project_id,
      });
      localStorage.setItem(LAST_PROJECT_ID_KEY, defaultProject.project_id);
    } else {
      // Nếu có project trước đó thì chọn nó, không thì lấy project đầu tiên
      const validProjectId = projects.find(p => p.project_id === lastProjectId)
        ? lastProjectId
        : projects[0].project_id;
      set({
        projects,
        currentProjectId: validProjectId,
      });
      localStorage.setItem(LAST_PROJECT_ID_KEY, validProjectId ?? "");
    }
  },

  createProject: (title) => {
    const newProject: Project = {...defaultProject, project_title: title}
    set((state) => ({
      projects: [...state.projects, newProject],
      currentProjectId: newProject.project_id,
    }));
    saveProject(newProject);
    localStorage.setItem(LAST_PROJECT_ID_KEY, newProject.project_id);
  },

  updateProjectTitle: (id, title) => {
    set((state) => {
      const updatedProjects = state.projects.map((p) =>
        p.project_id === id ? { ...p, project_title: title } : p
      );

      const updated = updatedProjects.find((p) => p.project_id === id);
      if (updated) saveProject(updated);

      return { projects: updatedProjects };
    });
  },

  updateProject: (id, nodes, edges) => {
    set((state) => {
      const updatedProjects = state.projects.map((p) =>
        p.project_id === id
          ? { ...p, nodes, edges, lastUpdated: new Date().toISOString() }
          : p
      );

      const updated = updatedProjects.find((p) => p.project_id === id);
      if (updated) saveProject(updated);

      return { projects: updatedProjects };
    });
  },

  removeProject: (id: string) => {
    set((state) => {
      const filtered = state.projects.filter((p) => p.project_id !== id);
      let newCurrentId = state.currentProjectId;
      if (state.currentProjectId === id) {
        newCurrentId = filtered.length > 0 ? filtered[0].project_id : null;
        localStorage.setItem(LAST_PROJECT_ID_KEY, newCurrentId ?? "");
      }
      return {
        projects: filtered,
        currentProjectId: newCurrentId,
      };
    });
    deleteProject(id)
  },
  
}));

export default useProjectStore;
