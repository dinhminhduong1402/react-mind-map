import { Node } from "@xyflow/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  // FolderKanban,
  Loader,
  CheckCircle,
  // Settings,
  ChevronRight,
  Beer,
  Redo2,
  Undo2,
  // Eye,
  Save,
  Trash2,
  Network,
  Workflow,
  GitFork,
  HatGlasses,
  Share2,
  ChevronDown,
  // House   ,
  Menu  ,
  Edit3,
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { FcGoogle } from "react-icons/fc";
import { AccessService } from "@/services/accessService";

export default function TopBar() {
  const [title, setTitle] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  const [openDonateModal, setOpenDonateModal] = useState(false);
  const { currentProject, isSaving } = useProjectStore();
  const {
    node: {
      addChildNode,
      addSiblingNode,
      addParentNode,
      deleteNode,
      currentActiveNodeId,
    },
    history: { redo, undo },
    toggleCollapse,
  } = useMindMapStore();
  const {logout} = useUserStore()
  const { currentUser } = useUserStore();

  const [editingTitle, setEditingTitle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedNodeRef = useRef(
    useMindMapStore.getState().node.nodes.find((n) => n.id === currentActiveNodeId)
  );
  useEffect(() => {
    selectedNodeRef.current = useMindMapStore.getState().node.nodes.find((n) => n.id === currentActiveNodeId);
  }, [currentActiveNodeId]);

  useEffect(() => {
    if (editingTitle && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingTitle]);

  const handleTitleSave = () => {
    setEditingTitle(false);
    if (currentProject && title.trim() && title !== currentProject.project_title) {

      useProjectStore.getState().udpateProjectData({
        project_id: currentProject.project_id,
        project_title: title.trim(),
      })
    }
  };
  
  type Command =
    | "addChildNode"
    | "addSiblingNode"
    | "addParentNode"
    | "deleteNode"
    | "toggleCollapse"
    | "redo"
    | "undo";

  type HandlerMap = Record<Command, () => void>;
  const createHandlers = (selectedNode: Node | undefined): HandlerMap => {
    const lastestNode = useMindMapStore
        .getState()
        .node.nodes.find((n) => n.id === selectedNode?.id);
    return {
      addChildNode: () => lastestNode && addChildNode(lastestNode),
      addSiblingNode: () => lastestNode && addSiblingNode(lastestNode),
      addParentNode: () => lastestNode && addParentNode(lastestNode),
      deleteNode: () => lastestNode && deleteNode(lastestNode.id),
      toggleCollapse: () => lastestNode && toggleCollapse(lastestNode.id),
      redo: () => redo(),
      undo: () => undo(),
    };
  };
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
  }, [currentProject?.project_title]);

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
      // {
      //   handler: "toggleCollapse",
      //   icon: <Eye></Eye>,
      //   title: "Toggle subtree",
      //   shorcut: "Crt + /",
      // },
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
        <div className=" w-[450px] overflow-hidden bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)]  rounded-md ">
          <div
            className="flex gap-5 w-[100%]
          px-3 py-1 pointer-events-auto justify-between"
          >
            <div className="flex items-center gap-4 cursor-pointer">
              <Button
                className="cursor-pointer bg-gray-200 border-2 border-black-800"
                variant={"ghost"}
                onClick={() => setOpenModal(true)}
              >
                <Menu
                  // className="bg-yellow-500"
                  size={34}
                />
              </Button>

              {/* ✅ Editable Project Title */}
              {editingTitle ? (
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                  className="text-md font-semibold border-b border-gray-400 focus:outline-none px-1 w-[calc(450px-5rem)]"
                />
              ) : title.length > 15 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h1
                        className="text-md font-semibold text-gray-800 text-nowrap flex items-center gap-1 hover:text-purple-600"
                        onClick={() => setEditingTitle(true)}
                      >
                        {truncate(title, 15)}
                        <Edit3
                          size={14}
                          className="opacity-60 hover:opacity-100"
                        />
                      </h1>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-sm">
                      {title}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <h1
                  className="text-md font-semibold text-gray-800 text-nowrap flex items-center gap-1 hover:text-purple-600"
                  onClick={() => setEditingTitle(true)}
                >
                  {title}
                  <Edit3 size={14} className="opacity-60 hover:opacity-100" />
                </h1>
              )}
            </div>

            <div className="flex items-center gap-1 justify-between">
              {/* save info */}
              <div
                // style={{ ...btnStyle, background: "green" }}
                // variant='outline'
                className="bg-transparent text-gray-500 border-none text-sm text-nowrap flex align-center gap-3"
              >
                Lastest:
                {isSaving ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <div className="flex gap-1 items-center">
                    <CheckCircle size={16} />
                  </div>
                )}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              {/* save button */}
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
          {/* <Button
            variant="ghost"
            className="cursor-pointer bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)]"
          >
            <Settings></Settings>
            Settings
          </Button> */}
          {/* Share */}
          <Button
            variant="ghost"
            className="cursor-pointer bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)]"
          >
            <Share2></Share2>
            Share
          </Button>
          {/*User  */}
          <DropdownMenu
            open={openUserDropdown}
            onOpenChange={setOpenUserDropdown}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="cursor-pointer rounded-md bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)]"
                // size="icon"
              >
                {currentUser ? (
                  <img
                    src={currentUser?.user_avatar}
                    alt="avatar"
                    width={25}
                    height={25}
                    className="rounded-full"
                  />
                ) : (
                  <HatGlasses />
                )}
                {openUserDropdown ? (
                  <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" align="end">
              {!currentUser && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    AccessService.getGoogleOAuthLoginUrl().then((url) => {
                      window.open(url, "_self");
                    });
                  }}
                >
                  <FcGoogle /> Login with Google
                </DropdownMenuItem>
              )}
              {currentUser && (
                <>
                  <DropdownMenuLabel className="font-medium text-gray-700">
                    {currentUser.user_name}
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => logout()}
                  >
                    Logout
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
