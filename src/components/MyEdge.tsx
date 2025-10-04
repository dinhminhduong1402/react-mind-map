import { EdgeProps, getBezierPath } from "@xyflow/react";
import { motion } from "framer-motion";
import { memo } from "react";

function MyEdge(props: EdgeProps & { isDeleting?: boolean, isHidding?: boolean , isDragging?: boolean}) {
  const [edgePath] = getBezierPath(props) || [""]
  const isDeleting = props.data?.isDeleting
  const isHidding = props.data?.isHidding
  const isDragging = props.data?.isDragging
  // console.log({isDeleting, isDragging})
  
  return (
    <motion.path
      d={edgePath} // luôn update d theo node
      stroke="gray"
      strokeWidth={1}
      className="opacity-50"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={
        !isDragging ? {
          d: edgePath, //animate path theo node
          pathLength: isDeleting || isHidding ? 0 : 1,
          opacity: isDeleting || isHidding ? 0 : 0.5,
        } : {d: edgePath, pathLength: 1, opacity: 1}
      }
     
      transition={
        !isDragging ?
        {
          d: { duration: 0.3, ease: "easeInOut" }, // animate d
          // pathLength: { duration: 0.3, ease: "easeInOut" },
          // opacity: { duration: 0.3, ease: "easeInOut" },
        } : {d: {duration: 0}}
      }
    />
  );
}

export default memo(MyEdge);
