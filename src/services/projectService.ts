import configs from "@/configs"
import { apiFetch } from "./apiService"
import {Node, Edge} from '@xyflow/react'

type Project = {
  _id: string,
  project_title: string,
}

type ProjectData = {
  nodes: Array<Node>,
  edges: Array<Edge>,
}

export default class ProjectService {
  static async getProjectListByUserId(): Promise<Array<Project>> {
    const rsJson = await apiFetch(`${configs.apiBaseUrl}/api/project/get-project-list`, {
      method: 'GET'
    }).then(rs => rs.json())
    
    return rsJson.metadata
  }

  static async getProjectData(projectId: string): Promise<ProjectData> {
    const rsJson = await apiFetch(`${configs.apiBaseUrl}/api/project/get-project-data/${projectId}`, {
      method: 'GET'
    }).then(rs => rs.json())

    return rsJson.metadata
  }

  static async updateProjectData(projectId: string, projectData: ProjectData) {
    const rsJson = await apiFetch(`${configs.apiBaseUrl}/api/project/update-project-data/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    }).then(rs => rs.json())
    return rsJson.metadata
  }

  static async updateProject(project: Project) {
    const rsJson = await apiFetch(`${configs.apiBaseUrl}/api/project/update/${project._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(project)
    }).then(rs => rs.json())
    return rsJson.metadata
  }
}