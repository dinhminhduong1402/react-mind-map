// db.ts
import { openDB } from 'idb';
import useProjectStore from '@/store/useProjectStore';
import { pickFields } from '@/core/utils';
import {Node, Edge} from '@xyflow/react'

type Project = {
  project_id: string,
  project_title: string,
  nodes?: Node[],
  edges?: Edge[]
}

type ProjectMin = {
  project_id: string,
  project_title?: string,
  nodes?: Node[],
  edges?: Edge[]
}


export const dbPromise = openDB('mindmap-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('projects')) {
      db.createObjectStore('projects', { keyPath: 'project_id' });
    }
  },
});


export async function saveProject(project: unknown) {
  const db = await dbPromise;
  await db.put('projects', project);
}


export async function createProject(project: Project): Promise<Project> {
  const projectId = project.project_id
  const db = await dbPromise;

  // 1. get the current project
  const existing = await db.get('projects', projectId);
  if (existing) {
    throw new Error(`Project with id ${projectId} is exist`);
  }

  await db.put('projects', project);
  return project
}
export async function updateProject(project: ProjectMin) {
  const projectId = project.project_id
  const db = await dbPromise;

  // 1. get the current project
  const existing = await db.get('projects', projectId);
  if (!existing) {
    throw new Error(`Project with id ${projectId} not found`);
  }

  // 2. merge old + new fields
  const updated = { ...existing, ...project };

  // 3. save back
  await db.put('projects', updated);

  return updated;
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await dbPromise;
  const projectList = await db.getAll('projects');
  const result = projectList.map((p) =>
    pickFields(p, ["project_id", "project_title"])
  );
  return result;
}

export async function getProjectData(projectId: string) {
  const db = await dbPromise;
  const project = await db.get('projects', projectId);

  if (!project) {
    throw new Error(`IndexedDB: Project with id ${projectId} not found`);
  }

  return project;
}

export async function deleteProject(id: string) {
  const db = await dbPromise;
  return await db.delete('projects', id);
}
