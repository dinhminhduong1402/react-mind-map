import { useState, useMemo } from "react";
import useProjectStore from "@/store/useProjectStore";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  FolderOpen,
  List,
  LayoutGrid,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { formatDate } from "@/core/utils";

interface ProjectOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectOffcanvas({
  isOpen,
  onClose,
}: ProjectOffcanvasProps) {
  const {
    projectList,
    createProject,
    removeProject,
    setCurrentProject,
    udpateProjectData,
    currentProject,
  } = useProjectStore();

  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [layoutMode, setLayoutMode] = useState<"list" | "card">(localStorage.getItem('project-list-layout-mode') === 'list' ? 'list' : 'card');
  const [search, setSearch] = useState("");

  const handleAdd = async () => {
    if (newTitle.trim()) {
      const newProject = await createProject(newTitle.trim());
      setNewTitle("");
      
      setCurrentProject(newProject.project_id)
    }
  };

  const handleUpdate = async (id: string) => {
    if (editingTitle.trim()) {
      await udpateProjectData({
        project_id: id,
        project_title: editingTitle.trim(),
      });
      setEditingId(null);
      setEditingTitle("");
      if (currentProject?.project_id === id) setCurrentProject(id);
    }
  };

  const handleOpen = (id: string) => {
    setCurrentProject(id);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      removeProject(id);
    }
  };

  // Lọc và highlight kết quả tìm kiếm
  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projectList;
    const lower = search.toLowerCase();
    return projectList.filter((p) =>
      p.project_title.toLowerCase().includes(lower)
    );
  }, [projectList, search]);

  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const parts = text.split(new RegExp(`(${keyword})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300  rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Offcanvas */}
          <motion.div
            className="relative bg-white h-full shadow-xl flex flex-col"
            style={{ width: layoutMode === "card" ? "640px" : "420px" }}
            initial={{ x: "-100%" }}
            animate={{ 
              x: 0,
              width: layoutMode === "card" ? 600 : 420, // thay đổi width
             }}
            exit={{ x: "-100%" }}
            transition={{
              x: { type: "spring", stiffness: 120, damping: 18 },
              width: { duration: 0.4, ease: "easeInOut" }, // animation width mượt
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">Projects</h2>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() =>{
                    setLayoutMode(layoutMode === "list" ? "card" : "list");
                    localStorage.setItem('project-list-layout-mode', layoutMode === "list" ? "card" : "list")
                  }}
                  title="Toggle layout"
                >
                  {layoutMode === "list" ? (
                    <LayoutGrid size={20} />
                  ) : (
                    <List size={20} />
                  )}
                </button>
                <motion.button
                  onClick={onClose}
                  whileHover={{ rotate: 180 }} // xoay 180 độ khi hover
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                  title="Close"
                >
                  <X size={22} />
                </motion.button>
              </div>
            </div>

            {/* Search bar */}
            <div className="px-6 py-3 border-b flex items-center gap-2 bg-gray-50">
              <Search size={18} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search project..."
                className="flex-1 border-none outline-none bg-transparent text-sm"
              />
            </div>

            {/* Project list/card */}
            <div
              className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${
                layoutMode === "card"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 auto-rows-[180px]"
                  : "flex flex-col gap-3"
              }`}
            >
              {filteredProjects.length === 0 && (
                <p className="text-gray-500 text-center mt-6">
                  No projects found.
                </p>
              )}

              {filteredProjects.map((p) => (
                <motion.div
                  key={p.project_id}
                  layout
                  className={`border rounded-xl p-4 shadow-sm transition-colors flex flex-col justify-between 
                    ${
                      currentProject?.project_id === p.project_id
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }
                    ${layoutMode === "list" ? "h-auto" : "h-full"}
                  `}
                >
                  <div className="flex-1">
                    {editingId === p.project_id ? (
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="w-full border px-2 py-1 rounded"
                        autoFocus
                      />
                    ) : (
                      <div className="space-y-1">
                        <span
                          className="font-medium text-gray-800 block truncate"
                          title={p.project_title}
                        >
                          {highlightText(p.project_title, search)}
                        </span>
                        {/* CreatedAt & UpdatedAt */}
                        <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span>Created: {formatDate(p.createdAt)}</span>
                          <span>Updated: {formatDate(p.updatedAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex ${
                      layoutMode === "list"
                        ? "justify-end mt-2"
                        : "justify-between mt-3"
                    } gap-2`}
                  >
                    {editingId === p.project_id ? (
                      <Button
                        onClick={() => handleUpdate(p.project_id)}
                        className="bg-green-500 text-white p-2 cursor-pointer hover:bg-green-600 hover:text-white"
                        variant={"outline"}
                        title="Save"
                      >
                        <Save size={16} />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setEditingId(p.project_id);
                          setEditingTitle(p.project_title);
                        }}
                        className="cursor-pointer"
                        variant={"outline"}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </Button>
                    )}

                    <Button
                      onClick={() => handleDelete(p.project_id)}
                      className="cursor-pointer"
                      variant={"outline"}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </Button>
                    <Button
                      onClick={() => handleOpen(p.project_id)}
                      className="cursor-pointer"
                      variant={"outline"}
                      title="Open"
                    >
                      <FolderOpen size={16} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex gap-2 bg-gray-50">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="New project title..."
                className="flex-1 border px-3 py-2 rounded text-sm"
              />
              <Button
                onClick={handleAdd}
                className=" text-white flex items-center justify-center cursor-pointer "
                title="Add"
              >
                <Plus size={16} />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
