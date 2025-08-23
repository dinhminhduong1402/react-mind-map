// db.ts
import { openDB } from 'idb';
import useProjectStore from '@/store/useProjectStore';

export const dbPromise = openDB('mindmap-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('projects')) {
      db.createObjectStore('projects', { keyPath: 'project_id' });
    }
  },
});

let timeoutId:NodeJS.Timeout|null = null
export async function saveProject(project: any) {
  if(timeoutId) clearTimeout(timeoutId)
  const {setIsSaving} = useProjectStore.getState()
  setIsSaving(true)
  const db = await dbPromise;
  await db.put('projects', project);
  timeoutId = setTimeout(() => {
    setIsSaving(false)
  }, 800) //Nghệ thuật đánh lừa thị giác
}

export async function getAllProjects() {
  const db = await dbPromise;
  return await db.getAll('projects');
}

export async function deleteProject(id: string) {
  const db = await dbPromise;
  return await db.delete('projects', id);
}
