import configs from "@/configs"
import { apiFetch } from "./apiService"
import {getAllProjects, getProjectData, updateProject, createProject} from '@/helpers/indexDb'
import type { ProjectMin, Project } from "@/store/useProjectStore"

interface ProjectStrategy {
  getProjectList: () => Promise<Array<ProjectMin>> 

  getProjectData: (projectId: string) => Promise<Project>

  updateProject: (project: ProjectMin) => void

  create: (project: Project) => Promise<unknown>

  batchInsert: (projects: Project[]) => Promise<unknown>
}

// call api
class ApiProjectStrategy implements ProjectStrategy {
  async getProjectList() {
    const rsJson = await apiFetch(`${configs.apiBaseUrl}/api/project/get-project-list`, {
      method: 'GET'
    }).then(rs => rs.json())
    
    return rsJson.metadata
  }

  async getProjectData(projectId: string) {
    const rsJson = await apiFetch(`${configs.apiBaseUrl}/api/project/get-project-data/${projectId}`, {
      method: 'GET'
    }).then(rs => rs.json())

    return rsJson.metadata
  }

  async updateProject(project: ProjectMin) {
    const rsJson = await apiFetch(`${configs.apiBaseUrl}/api/project/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({project})
    }).then(rs => rs.json())
    return rsJson.metadata
  }

  async create(project: Project) {
    const rsJson = await apiFetch(`${configs.apiBaseUrl}/api/project/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({project})
    }).then(rs => rs.json())
    return rsJson.metadata
  }

  async batchInsert(projects: Project[]) {
    const rsJson = await apiFetch(`${configs.apiBaseUrl}/api/project/batch-insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({projects})
    }).then(rs => rs.json())
    return rsJson.metadata
  }
}

// indexed db
class LocalProjectStrategy implements ProjectStrategy {
  async getProjectList() {
    return await getAllProjects()
  }

  async getProjectData(projectId: string) {
    return await getProjectData(projectId)
  }

  async updateProject(project: ProjectMin) {
    return await updateProject(project)
  }

  async create(project: Project) {
    return await createProject(project)
  }

  async batchInsert(projects: Project[]) {
    console.log('local db strategy ::: batchInsert ', {projects})
  }
}

class ProjectContext {
  private strategy: ProjectStrategy | null = null
  setStrategy(strategy: ProjectStrategy | null) {
    if(!strategy) throw new Error("Strategy is required!")
    this.strategy = strategy
  }

  async getProjectList() {
    return this.strategy?.getProjectList()
  }

  async getProjectData(projectId: string) {
    return this.strategy?.getProjectData(projectId)
  }

  async updateProject(project: ProjectMin) {
    return this.strategy?.updateProject(project)
  }

  async create(project: Project) {
    return this.strategy?.create(project)
  }

  async batchInsert(projects: Project[]) {
    return this.strategy?.batchInsert(projects)
  }

}

export {
  ProjectContext, ApiProjectStrategy, LocalProjectStrategy
}

export type {
  ProjectStrategy
}