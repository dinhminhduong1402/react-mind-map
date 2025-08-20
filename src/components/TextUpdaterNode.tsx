import { Handle, Position, NodeProps } from "@xyflow/react";
import { MouseEvent, useCallback } from "react";
import TextEditor from "./TextEditor";
import useMindMapStore from "../store/useMindMapStore";

export function TextUpdaterNode({ id, data, selected }: NodeProps) {
  const content: string = data?.content ? String(data.content) : "";
  const isRoot = id === "root";

  const toggleCollapse = useMindMapStore((s) => s.toggleCollapse);

  const handleToggle = useCallback((event: MouseEvent) => {
    console.log("Toggle Button was Clicked")
    event.preventDefault()
    event.stopPropagation()
    toggleCollapse(id);
  }, [id, toggleCollapse]);

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        className={`
          rounded-lg p-3 transition-colors relative
          ${isRoot ? "bg-yellow-100 border-2 border-yellow-500 shadow-lg" : ""}
          ${selected && !isRoot ? "bg-blue-100 border-2 border-blue-500 shadow-md" : ""}
          ${!selected && !isRoot ? "bg-white border border-gray-300" : ""}
        `}
      >
        {/* Nút collapse / expand */}
        <button
          onClick={(event) => handleToggle(event)}
          className="absolute +top-1/2 translate-1/2 -right-2 bg-gray-200 hover:bg-gray-300 text-xs px-2 py-1 rounded shadow z-10"
        >
          {data?.collapsed ? "+" : "-"}
        </button>

        {/* Nội dung editor */}
        <TextEditor text={content} id={id} />
      </div>

      <Handle type="source" position={Position.Right} id="a"/>
    </>
  );
}
