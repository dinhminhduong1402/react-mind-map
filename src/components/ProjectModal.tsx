import { useState } from "react";
import useProjectStore from "@/store/useProjectStore";
import { X, Plus, Trash2, Edit2, Save, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const { projectList, createProject, removeProject, setCurrentProject } =
    useProjectStore();
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const { udpateProjectData } = useProjectStore()

  const handleAdd = () => {
    if (newTitle.trim()) {
      createProject(newTitle.trim());
      setNewTitle("");
    }
  };

  const handleUpdate = (id: string) => {
    if (editingTitle.trim()) {
      udpateProjectData({project_id: id, project_title: editingTitle.trim()});
      setEditingId(null);
      setEditingTitle("");
    }
  };

  const handleOpen = (id: string) => {
    setCurrentProject(id);   // ✅ đổi currentProjectId trong store
    onClose();         // ✅ đóng modal
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white w-3/4 h-4/5 rounded-2xl shadow-xl flex flex-col"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Projects</h2>
              <button onClick={onClose}>
                <X size={22} className="text-gray-600 hover:text-black cursor-pointer" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {projectList.length === 0 && (
                <p className="text-gray-500">No projects yet.</p>
              )}
              {projectList.map((p) => (
                <div
                  key={p.project_id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-xl shadow-sm"
                >
                  {editingId === p.project_id ? (
                    <input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-1 border px-2 py-1 rounded mr-2"
                    />
                  ) : (
                    <span className="font-medium">{p.project_title}</span>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpen(p.project_id)}
                      className="bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <FolderOpen size={16} /> Open
                    </button>

                    {editingId === p.project_id ? (
                      <button
                        onClick={() => handleUpdate(p.project_id)}
                        className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Save size={16} /> Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(p.project_id);
                          setEditingTitle(p.project_title);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                    )}
                    <button
                      onClick={() => removeProject(p.project_id)}
                      className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Add Project */}
            <div className="px-6 py-4 border-t flex gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="New project title..."
                className="flex-1 border px-3 py-2 rounded"
              />
              <button
                onClick={handleAdd}
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
