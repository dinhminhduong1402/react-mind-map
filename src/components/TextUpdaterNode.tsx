import { Handle, Position, NodeProps, Edge } from "@xyflow/react";
import { MouseEvent, useCallback, ReactNode, useRef, useMemo, useLayoutEffect } from "react";
import TextEditor from "./TextEditor";
import useMindMapStore from "../store/useMindMapStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Circle , CircleCheckBig , Minus , Plus  } from "lucide-react";
import useKeyBoardManager from "@/core/useKeyBoardManger";



const icons: Record<string, ReactNode > = {
  pending: <Circle className="text-gray-400" size={20} />,
  completed: <CircleCheckBig className="text-gray-400"  size={20} />,
  minus: <Minus className="bg-transparent"  size={20} />,
  plus: <Plus className="text-gray-500 bg-gray-100"  size={16} />,
};

export function TextUpdaterNode({ id, data, selected }: NodeProps) {
  const content: string = data?.content ? String(data.content) : "";
  const isRoot = id === "root";
  

  const {nodes, setcurrentActiveNodeId} = useMindMapStore(state => state.node)
  const {edges} = useMindMapStore(state => state.edge)
  const toggleCollapse = useMindMapStore((s) => s.toggleCollapse);
  const toggleCompleted = useMindMapStore((s) => s.toggleCompleted);

  const isLeafNode = edges.findIndex(edge => edge.source === id) == -1

  const getDepth = (nodeId: string): number => {
    let depth = 0;
    let currentId = nodeId;
    while (currentId !== "root") {
      const parentEdge = edges.find((e) => e.target === currentId);
      if (!parentEdge) break;
      currentId = parentEdge.source;
      depth++;
    }
    return depth;
  };
  const depth = getDepth(id);
  const isDeepNode = depth >= 2;
  

  const handleToggle = useCallback((event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleCollapse(id);
  }, [id, toggleCollapse]);

  const handleCompleted = useCallback((event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleCompleted(id);
  }, [id, toggleCompleted]);

  const nodeRef = useRef<HTMLDivElement>(null)
  
  const shortCuts = (e: React.KeyboardEvent<HTMLElement>) => {
    const {nodes, currentActiveNodeId, addSiblingNode} = useMindMapStore.getState().node

    const selectedNode = nodes.find(n => n.id === currentActiveNodeId)
    if(!selectedNode) return -1
    
    if (e.key === "Enter") { //Phải nghe nút enter ở phần tử con để chặn đi enter nổi ra ngoài phần conflic với enter của flutter flow
      addSiblingNode(selectedNode);
      return 0
    }

    return -1
  }
  const {onKeyDown} = useKeyBoardManager({handler: shortCuts, deps: [nodeRef.current]})

  const childNodesCount = useMemo(() => {
    function getAllChildCount(parentId: string, edges: Edge[]): number {
      const visited = new Set<string>()
      const stack = [parentId]

      while (stack.length > 0) {
        const current = stack.pop()!

        edges.forEach(edge => {
          if (edge.source === current && !visited.has(edge.target)) {
            visited.add(edge.target)
            stack.push(edge.target)
          }
        })
      }

      return visited.size
    }

    return getAllChildCount(id, edges)
  }, [nodes, edges])

  useLayoutEffect(() => {
    const selectedNode = nodes.find(n => n.selected)
    if(selectedNode) {
      setcurrentActiveNodeId(selectedNode.id)
    }
  }, [])

  return (
    <div ref={nodeRef} tabIndex={-1} onKeyDown={onKeyDown}>
      <Handle type="target" position={Position.Left} />
      <div 
        className={`
          rounded-lg relative
           hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] border-4 hover:scale-110 
          transition-all duration-200

          ${isRoot && selected ? "bg-yellow-200 border-2 border-blue-500 shadow-lg p-3" : ""}
          ${isRoot && !selected ? "bg-yellow-100 border-2 border-yellow-500 shadow-lg p-3" : ""}
          ${!isRoot && selected && !isDeepNode ? "bg-blue-100 border-4 border-blue-500 shadow-md px-2 py-0" : ""}
          ${!isRoot && !selected && !isDeepNode ? "border-2 px-2 py-0 bg-gray-100 border-gray-300" : ""}

          ${isDeepNode && !selected ? "bg-transparent border-transparent  px-2" : ""}
          ${isDeepNode && selected ? "bg-blue-100 border-4 border-blue-500 shadow-md px-2" : ""}

          ${data?.completed ? 'line-through' : ''}
        `}
      >
        {/* Nút collapse / expand */}
        {!isRoot && !isLeafNode && (
           <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggle}
                  className="absolute top-1/2 -right-4 transform border-2 -translate-y-1/2 bg-white rounded z-10 cursor-pointer text-gray-500 h-6 w-6"
                >
                  {data?.collapsed ? childNodesCount : icons.minus}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{data?.collapsed ? "Expand nodes" : "Collapse nodes"}</p>
              </TooltipContent>
            </Tooltip>
        )}

        {/* Nút đánh dấu đã hoàn thành */}
        {!isRoot && (
           <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCompleted}
                  className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-xs  rounded-full z-10 cursor-pointer"
                >
                  {data?.completed ? icons.completed : icons.pending}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{data?.completed ? "Mark as Incomplete" : "Mark as Completed"}</p>
              </TooltipContent>
            </Tooltip>
        )}
        
        {/* Nội dung editor */}
        <TextEditor text={content} id={id} nodeData={data} />
      </div>

      <Handle type="source" position={Position.Right}  id="a"/>
    </div>
  );
}