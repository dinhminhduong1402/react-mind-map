import { Node } from "@xyflow/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FolderKanban,
  Loader,
  CheckCircle,
  Settings,
  Beer,
  Redo2,
  Undo2,
  Eye,
  Save,
  Trash2,
  Network,
  Workflow,
  GitFork,
  HatGlasses,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectModal from "./ProjectModal"; // import modal
// import {Node} from '@xyflow/react'
import { saveMindmapToProject } from "@/store/syncLogic";
import useProjectStore from "@/store/useProjectStore";
import useUserStore from "@/store/useUserStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useMindMapStore from "@/store/useMindMapStore";
import DonateModal from "./DonateModal";
import { truncate } from "@/core/utils";

export default function TopBar() {
  const [title, setTitle] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [openDonateModal, setOpenDonateModal] = useState(false);
  const { currentProject, isSaving } = useProjectStore();
  const {
    node: {
      nodes,
      addChildNode,
      addSiblingNode,
      addParentNode,
      deleteNode,
      currentActiveNodeId,
    },
    history: { redo, undo },
    toggleCollapse,
  } = useMindMapStore();
  const { currentUser } = useUserStore();

  const selectedNodeRef = useRef(
    nodes.find((n) => n.id === currentActiveNodeId)
  );
  useEffect(() => {
    selectedNodeRef.current = nodes.find((n) => n.id === currentActiveNodeId);
  }, [currentActiveNodeId]);

  type Command =
    | "addChildNode"
    | "addSiblingNode"
    | "addParentNode"
    | "deleteNode"
    | "toggleCollapse"
    | "redo"
    | "undo";

  type HandlerMap = Record<Command, () => void>;
  const createHandlers = (selectedNode: Node | undefined): HandlerMap => ({
    addChildNode: () => selectedNode && addChildNode(selectedNode),
    addSiblingNode: () => selectedNode && addSiblingNode(selectedNode),
    addParentNode: () => selectedNode && addParentNode(selectedNode),
    deleteNode: () => selectedNode && deleteNode(selectedNode.id),
    toggleCollapse: () => selectedNode && toggleCollapse(selectedNode.id),
    redo: () => redo(),
    undo: () => undo(),
  });
  const callHandler = (command: Command) => {
    const handlers = createHandlers(selectedNodeRef.current);
    handlers[command]?.();
  };

  useEffect(() => {
    if (currentProject?.project_title) {
      setTitle(currentProject.project_title);
    } else {
      setTitle("No Project Selected");
    }
  }, [currentProject]);

  type Action = {
    handler: Command;
    icon: React.ReactNode;
    title: string;
    shorcut: string;
  };
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
        icon: <Workflow></Workflow>,
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
        icon: <GitFork></GitFork>,
        title: "Add parent node",
        shorcut: "Shift + Tab",
      },
      {
        handler: "toggleCollapse",
        icon: <Eye></Eye>,
        title: "Toggle subtree",
        shorcut: "Crt + /",
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
        <div className=" w-[400px]" onClick={() => setOpenModal(true)}>
          <div
            className="flex gap-5 bg-white rounded-md shadow-[0_0_15px_rgba(0,0,0,0.2)] w-fit
          px-3 py-1 pointer-events-auto"
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <FolderKanban className="text-yellow-500" size={34} />
              {title.length > 15 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h1 className="text-md font-semibold text-gray-800 text-nowrap">
                        {truncate(title, 15)}
                      </h1>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-sm">
                      {title}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <h1 className="text-md font-semibold text-gray-800 text-nowrap">
                  title
                </h1>
              )}
            </div>

            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"ghost"}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveMindmapToProject();
                      }}
                    >
                      <Save />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent side="bottom" className="text-sm">
                    <p className="p-1">
                      Save project ={" "}
                      <kbd className="px-1 py-0.5 bg-gray-200 rounded text-black">
                        Crt + S
                      </kbd>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div
                // style={{ ...btnStyle, background: "green" }}
                // variant='outline'
                className="bg-transparent text-gray-500 border-none text-sm text-nowrap flex align-center gap-3"
              >
                Lasted:
                {isSaving ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <div className="flex gap-1 items-center">
                    <CheckCircle size={16} /> {new Date().toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
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
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    onClick={() => callHandler(action.handler)}
                  >
                    {action.icon}
                  </Button>
                </TooltipTrigger>

                <TooltipContent side="bottom" className="text-sm">
                  <p className="p-1">
                    {action.title} ={" "}
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
          <Button
            onClick={() => setOpenDonateModal(true)}
            variant="ghost"
            className="cursor-pointer bg-yellow-200 shadow-[0_0_15px_rgba(0,0,0,0.2)]  border-solid border-2 border-orange-400 text-black"
          >
            <Beer></Beer>
            Buy me a beer
          </Button>

          {/* Setting */}
          <Button
            variant="ghost"
            className="cursor-pointer bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)]"
          >
            <Settings></Settings>
            Settings
          </Button>
          {/*User  */}
          <Button
            variant="ghost"
            className="cursor-pointer rounded-full bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)]"
            size="icon"
          >
            {
              currentUser ?
              <img
                src={currentUser?.user_avatar}
                alt="avatar"
                width={25}
                height={25}
                className="rounded-full"
              />
      
            : <HatGlasses/>
            }
            
          </Button>
        </div>
      </header>

      {/* Modal */}
      <ProjectModal isOpen={openModal} onClose={() => setOpenModal(false)} />
      <DonateModal
        isOpen={openDonateModal}
        onClose={() => setOpenDonateModal(false)}
      />
    </>
  );
}
