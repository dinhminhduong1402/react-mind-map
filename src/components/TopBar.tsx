import {Node} from '@xyflow/react'
import { useEffect, useMemo, useRef, useState } from "react";
import { FolderKanban, Loader, CheckCircle, Settings , Beer , Redo2, Undo2, Eye , Save, Trash2, Network  ,Workflow  ,GitFork   } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectModal from "./ProjectModal"; // import modal
// import {Node} from '@xyflow/react'
import {saveMindmapToProject} from '@/store/syncLogic'
import useProjectStore from "@/store/useProjectStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import useMindMapStore from "@/store/useMindMapStore";
import {saveProject} from "@/helpers/indexDb"
import DonateModal from './DonateModal';

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
  const [openDonateModal, setOpenDonateModal] = useState(false);
  const {isSaving, currentProjectId, projects} = useProjectStore()
  const {node: {nodes, addChildNode, addSiblingNode, addParentNode, deleteNode, currentActiveNodeId}, history: {redo, undo, }, toggleCollapse, } = useMindMapStore()


  const currentProjectRef = useRef(projects.find(p => p.project_id === currentProjectId))
  useEffect(() => {
    currentProjectRef.current = projects.find(p => p.project_id === currentProjectId)
  }, [currentProjectId])

  const selectedNodeRef = useRef(nodes.find(n => n.id === currentActiveNodeId))
  useEffect(() => {
      selectedNodeRef.current = nodes.find(n => n.id === currentActiveNodeId)
  }, [currentActiveNodeId])
  
  type Command =
  | "addChildNode"
  | "addSiblingNode"
  | "addParentNode"
  | "deleteNode"
  | "toggleCollapse"
  | "redo"
  | "undo"
  | "saveProject"

  type HandlerMap = Record<Command, () => void>
  const createHandlers = (selectedNode: Node | undefined): HandlerMap => ({
    addChildNode: () => selectedNode && addChildNode(selectedNode),
    addSiblingNode: () => selectedNode && addSiblingNode(selectedNode),
    addParentNode: () => selectedNode && addParentNode(selectedNode),
    deleteNode: () => selectedNode && deleteNode(selectedNode.id),
    toggleCollapse: () => selectedNode && toggleCollapse(selectedNode.id),
    redo: () => redo(),
    undo: () => undo(),
    saveProject: () =>
      currentProjectRef.current &&
      saveProject(currentProjectRef.current),
  })

  const callHandler = (command: Command) => {
    const handlers = createHandlers(selectedNodeRef.current)
    handlers[command]?.()
  }

  
  useEffect(() => {
    if (currentProject?.project_title) {
      setTitle(currentProject.project_title);
    } else {
      setTitle("No Project Selected");
    }
  }, [currentProject]);

  
  type Action = 
    {
      handler: Command,
      icon: React.ReactNode,
      title: string,
      shorcut: string
    }
  
  const actions: Action[] = useMemo(
    () => [
      {
        handler: "undo",
        icon: <Undo2></Undo2>,
        title: "Undo",
        shorcut: "Crt + Z",
      },
      {
        handler: "redo",
        icon: <Redo2></Redo2>,
        title: "Redo",
        shorcut: "Crt + Shift + Z",
      },
      {
        handler: "addChildNode",
        icon: <Workflow  ></Workflow>,
        title: "Add child node",
        shorcut: "Tab",
      },
      {
        handler: "addSiblingNode",
        icon: <Network></Network>,
        title: "Add sibling node",
        shorcut: "Enter",
      },
      {
        handler: "addParentNode",
        icon: <GitFork ></GitFork>,
        title: "Add parent node",
        shorcut: "Shift + Tab",
      },
      {
        handler: "toggleCollapse",
        icon: <Eye ></Eye>,
        title: "Toggle subtree",
        shorcut: "Crt + /",
      },
      {
        handler: "saveProject",
        icon: <Save></Save>,
        title: "Save project",
        shorcut: "Crt + S",
      },
      {
        handler: "deleteNode",
        icon: <Trash2></Trash2>,
        title: "Delete node/subtree",
        shorcut: "Delete/Backspace",
      },
    ],
    []
  );

  
  

  return (
    <>
      <header
        className={`
          fixed top-0 lef-0 w-[100%] z-40 mt-1 bg-transparent
          pointer-events-none
          flex items-center justify-between px-3
        `}
      >
        {/* Project Info */}
        <div
          className="flex gap-3 bg-white rounded-md shadow-[0_0_15px_rgba(0,0,0,0.2)]
          px-3 py-1 pointer-events-auto"
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
          {/*Middle toolbar actions*/}
        <div
          className="flex gap-3 bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)] rounded-md
          px-3 py-1 pointer-events-auto"
        >
          {actions.map((action, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="cursor-pointer" variant="ghost" onClick={() => callHandler(action.handler)}>
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
          className="flex gap-3 bg-transparent rounded-md 
          px-3 py-1 pointer-events-auto"
        >
          <Button onClick={() => setOpenDonateModal(true)} variant="ghost" className="cursor-pointer bg-amber-500 shadow-[0_0_15px_rgba(0,0,0,0.2)] text-white">
            <Beer  ></Beer>
            Buy me a beer
          </Button>
          <Button variant="ghost" className="cursor-pointer bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <Settings></Settings>
            Settings
          </Button>
        </div>
      </header>

      {/* Modal */}
      <ProjectModal isOpen={openModal} onClose={() => setOpenModal(false)} />
      <DonateModal isOpen={openDonateModal} onClose={() => setOpenDonateModal(false)} />
      
    </>
  );
}
