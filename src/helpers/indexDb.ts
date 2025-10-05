// db.ts
import { openDB } from 'idb';
import { pickFields } from '@/core/utils';
import { Project, ProjectMin } from '@/store/useProjectStore';

export const dbPromise = openDB('mindmap-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('projects')) {
      db.createObjectStore('projects', { keyPath: 'project_id' });
    }
  },
});

export async function createProject(project: Project): Promise<Project> {
  const projectId = project.project_id
  const db = await dbPromise;

  // 1. get the current project
  const existing = await db.get('projects', projectId);
  if (existing) {
    throw new Error(`Project with id ${projectId} is exist`);
  }
  project.createdAt = new Date().toISOString()
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
  project.updatedAt = new Date().toISOString()
  const updated = { ...existing, ...project };

  // 3. save back
  await db.put('projects', updated);

  return updated;
}

export async function getAllProjects(): Promise<ProjectMin[]> {
  const db = await dbPromise;
  const projectList = await db.getAll('projects');
  const result = projectList.map((p) =>
    pickFields(p, ["project_id", "project_title", "updatedAt", "createdAt"])
  );
  return result;
}

export async function getProjectData(projectId: string): Promise<Project> {
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
