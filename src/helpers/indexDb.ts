// db.ts
import { openDB } from 'idb';

export const dbPromise = openDB('mindmap-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('projects')) {
      db.createObjectStore('projects', { keyPath: 'project_id' });
    }
  },
});

export async function saveProject(project: any) {
  const db = await dbPromise;
  await db.put('projects', project);
}

export async function getAllProjects() {
  const db = await dbPromise;
  return await db.getAll('projects');
}

export async function deleteProject(id: string) {
  const db = await dbPromise;
  return await db.delete('projects', id);
}
