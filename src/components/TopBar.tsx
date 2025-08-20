import { useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectModal from "./ProjectModal"; // import modal
import {Node, Edge} from '@xyflow/react'
import useMindMapStore from "@/store/useMindMapStore";
import {saveMindmapToProject} from '@/store/syncLogic'

interface Project {
  project_id: string | null;
  project_title: string | null;
}

interface TopBarProps {
  currentProject: Project | null;
  selectedNode: Node | null
}


const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  margin: "10px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default function TopBar({ currentProject, selectedNode }: TopBarProps) {
  const [title, setTitle] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [showSubheader, setShowSubheader] = useState(true);

  const {nodes, setNodes} = useMindMapStore((state) => state.node);
  const {edges, setEdges} = useMindMapStore((state) => state.edge);

  const handleAddChildNode = () => {
    if (!selectedNode) return;

    const newNodeId = `node-${Date.now()}`;
    const childPosition = {
      x: (selectedNode.position?.x || 0) + 200, // lệch sang phải
      y: selectedNode.position?.y || 0,
    };

    const newNode: Node = {
      id: newNodeId,
      type: "textUpdaterNode",
      position: childPosition,
      data: { label: "New child" },
    };

    const newEdge: Edge = {
      id: `edge-${selectedNode.id}-${newNodeId}`,
      source: selectedNode.id,
      target: newNodeId,
    };

    setNodes([...nodes, newNode]);
    setEdges([...edges, newEdge]);
  };
  
  useEffect(() => {
    if (currentProject?.project_title) {
      setTitle(currentProject.project_title);
    } else {
      setTitle("No Project Selected");
    }
  }, [currentProject]);

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-40
          bg-white 
          px-6 py-1 
          flex items-center justify-between
          ${showSubheader ? "" : "shadow-md"}
        `}
      >
        {/* Project Info */}
        <div className="flex items-center gap-2">
          <FolderKanban className="text-blue-600" size={22} />
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        </div>

        {/* Right side (menu, button mở modal) */}
        <div className="flex items-center gap-4">
          {/* ...existing buttons... */}
          <Button
            variant="outline"
            onClick={() => setShowSubheader((v) => !v)}
            style={{ ...btnStyle, background: "#f5f5f5", color: "#333" }}
          >
            {showSubheader ? "Ẩn phím tắt" : "Hiện phím tắt"}
          </Button>
          
          <Button
            onClick={handleAddChildNode}
            disabled={!selectedNode}
            style={{ ...btnStyle, background: "#007bff" }}
          >
            + Add Child
          </Button>

          <Button
            onClick={() => saveMindmapToProject()}
            style={{ ...btnStyle, background: "green" }}
          >
            Save Project
          </Button>

          <Button variant="outline" onClick={() => setOpenModal(true)}>
            Quản lý Projects
          </Button>
          
        </div>
      </header>

      {/* Subheader hiển thị phím tắt */}
      {showSubheader && (
        <div
          className="
            fixed top-[68px] left-0 right-0 z-30
            bg-gray-50 border-t border-b border-gray-200 shadow-md 
            px-6 py-2 flex items-center gap-6 text-sm text-gray-600 
          "
        >
          <span><kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> → Thêm node cùng cấp</span>
          <span><kbd className="px-2 py-1 bg-gray-200 rounded">Tab</kbd> → Thêm node con</span>
          <span><kbd className="px-2 py-1 bg-gray-200 rounded">Delete/Backspace</kbd> → Xóa node</span>
          <span><kbd className="px-2 py-1 bg-gray-200 rounded">Crt+Z</kbd> → undo</span>
          <span><kbd className="px-2 py-1 bg-gray-200 rounded">Crt+Shift+Z</kbd> → redo</span>
          <span><kbd className="px-2 py-1 bg-gray-200 rounded">Crt+Shift+F</kbd> → Auto Format Layout</span>
        </div>
      )}

      {/* Modal */}
      <ProjectModal isOpen={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
}
