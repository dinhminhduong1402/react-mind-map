import { Handle, Position, NodeProps } from "@xyflow/react";
import { MouseEvent, useCallback, ReactNode } from "react";
import TextEditor from "./TextEditor";
import useMindMapStore from "../store/useMindMapStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Circle , CircleCheckBig , Minus , Plus  } from "lucide-react";

const icons: Record<string, ReactNode > = {
  pending: <Circle className="text-gray-400" size={25} />,
  completed: <CircleCheckBig className="text-green-500"  size={25} />,
  minus: <Minus className="text-gray-500 bg-gray-100"  size={20} />,
  plus: <Plus className="text-gray-500 bg-gray-100"  size={20} />,
};

export function TextUpdaterNode({ id, data, selected }: NodeProps) {
  const content: string = data?.content ? String(data.content) : "";
  const isRoot = id === "root";
  
  const {edges} = useMindMapStore(state => state.edge)
  const toggleCollapse = useMindMapStore((s) => s.toggleCollapse);
  const toggleCompleted = useMindMapStore((s) => s.toggleCompleted);

  const isLeafNode = edges.findIndex(edge => edge.source === id) == -1

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

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        className={`
          rounded-lg p-3 transition-colors relative
          ${isRoot && selected ? "bg-yellow-200 border-2 border-orange-500 shadow-lg" : ""}
          ${isRoot && !selected ? "bg-yellow-100 border-2 border-yellow-500 shadow-lg" : ""}
          ${!isRoot && selected && !data?.completed ? "bg-blue-100 border-2 border-blue-500 shadow-md" : ""}
          ${!isRoot && !selected && !data?.completed ? "bg-white border border-gray-300" : ""}

          ${data?.completed && !selected 
            ? "bg-green-200 border-2 border-green-600" 
            : ""}
          ${data?.completed && selected 
            ? "bg-blue-100 border-2 border-blue-500 shadow-md " 
            : ""}
        `}
      >
        {/* Nút collapse / expand */}
        {!isRoot && !isLeafNode && (
           <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggle}
                  className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-xs px-0.5 py-0.5 rounded z-10 cursor-pointer"
                >
                  {data?.collapsed ? icons.plus : icons.minus}
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
        <TextEditor text={content} id={id} />
      </div>

      <Handle type="source" position={Position.Right}  id="a"/>
    </>
  );
}