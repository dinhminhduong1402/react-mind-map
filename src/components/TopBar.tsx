import { useEffect, useMemo, useState } from "react";
import { FolderKanban, Loader, CheckCircle, Settings , CircleDollarSign, Redo2, Undo2, ListCollapse, Save, Trash2, ArrowRightToLine ,ArrowLeftToLine ,ArrowDownToLine  } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectModal from "./ProjectModal"; // import modal
// import {Node} from '@xyflow/react'
import {saveMindmapToProject} from '@/store/syncLogic'
import useProjectStore from "@/store/useProjectStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Project {
  project_id: string | null;
  project_title: string | null;
}

interface TopBarProps {
  currentProject: Project | null;
}

export default function TopBar({ currentProject }: TopBarProps) {
  const [title, setTitle] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const {isSaving} = useProjectStore()
  // const [showSubheader, setShowSubheader] = useState(true);

  useEffect(() => {
    if (currentProject?.project_title) {
      setTitle(currentProject.project_title);
    } else {
      setTitle("No Project Selected");
    }
  }, [currentProject]);

  const actions = useMemo(() => (
    [
      {icon: <Undo2></Undo2>, title: "Undo", shorcut: 'Crt + Z'},
      {icon: <Redo2></Redo2>, title: "Redo", shorcut: 'Crt + Shift + Z'},
      {icon: <ArrowRightToLine></ArrowRightToLine>, title: "Add child node", shorcut: 'Tab'},
      {icon: <ArrowLeftToLine></ArrowLeftToLine>, title: "Add sibling node", shorcut: 'Enter'},
      {icon: <ArrowDownToLine  ></ArrowDownToLine>, title: "Add parent node", shorcut: 'Shift + Tab'},
      {icon: <ListCollapse  ></ListCollapse>, title: "Toggle subtree", shorcut: 'Crt + /'},
      {icon: <Save  ></Save>, title: "Save project", shorcut: 'Crt + S'},
      {icon: <Trash2  ></Trash2>, title: "Delete node/subtree", shorcut: 'Delete/Backspace'},
      
    ]
  ), [])

  return (
    <>
      <header
        className={`
          fixed top-0 lef-0 w-[100%] z-40 mt-1 bg-transparent
          
          flex items-center justify-between px-3
        `}
      >
        {/* Project Info */}
        <div
          className="flex gap-3 bg-white rounded-md shadow-[0_0_15px_rgba(0,0,0,0.2)]
          px-3 py-1"
          onClick={() => setOpenModal(true)}
        >
          <div className="flex items-center gap-2 cursor-pointer">
            <FolderKanban className="text-yellow-500" size={28} />
            <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => saveMindmapToProject()}
              // style={{ ...btnStyle, background: "green" }}
              // variant='outline'
              className="bg-transparent text-gray-800"
              disabled
            >
              {isSaving ? <Loader className="animate-spin" /> : <CheckCircle />}
              Auto Save
            </Button>
          </div>
        </div>

        <div
          className="flex gap-3 bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)] rounded-md
          px-3 py-1"
        >
          {actions.map((action, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="cursor-pointer" variant="ghost">
                    {action.icon}
                  </Button>
                </TooltipTrigger>

                <TooltipContent side="bottom" className="text-sm">
                  <p className="p-1">
                    {action.title} = {" "}
                    <kbd className="px-1 py-0.5 bg-gray-200 rounded text-black">
                      {action.shorcut}
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Right side (menu, button mở modal) */}
        <div
          className="flex gap-3 bg-white rounded-md shadow-[0_0_15px_rgba(0,0,0,0.2)]
          px-3 py-1"
        >
          <Button variant="ghost" className="cursor-pointer">
            <CircleDollarSign></CircleDollarSign>
          </Button>
          <Button variant="ghost" className="cursor-pointer">
            <Settings></Settings>
          </Button>
        </div>
      </header>

      {/* Subheader hiển thị phím tắt */}
      {/* {showSubheader && (
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
      )} */}

      {/* Modal */}
      <ProjectModal isOpen={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
}
