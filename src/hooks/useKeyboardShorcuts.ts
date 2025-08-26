import { useEffect } from "react";
import useMindMapStore from "../store/useMindMapStore";
import { saveProject } from "@/helpers/indexDb";
import useProjectStore from "@/store/useProjectStore";

export default function useKeyboardShortcuts() {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { nodes, currentActiveNodeId, deleteNode, addChildNode, addSiblingNode, setcurrentFocusNodeId, addParentNode, moveLeft, moveRight, moveUp, moveDown} = useMindMapStore.getState().node;
      const { edges} = useMindMapStore.getState().edge;
      const {toggleCollapse} = useMindMapStore.getState()

      // no need selected node
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault(); 
        console.log("update layout")
        const { updateLayout } = useMindMapStore.getState().layout;
        updateLayout()
      }

      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault(); 
        console.log('Crt Z')
        const { undo } = useMindMapStore.getState().history;
        undo()
      }

      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault(); 
        const { redo } = useMindMapStore.getState().history;
        redo()
      }

      if(e.ctrlKey && e.key === 's') {
        const {updateProject, currentProjectId, projects} = useProjectStore.getState()
        if(currentProjectId) {
          updateProject(currentProjectId, nodes, edges)
          const currentProject = projects.find(p => p.project_id === currentProjectId)
          saveProject(currentProject)
        }
        e.preventDefault()
        return 0
      }
      
      // need selectedNode
      const selectedNode = nodes.find(n => n.id === currentActiveNodeId);
      // console.log({ selectedNodeId: selectedNode?.id });
      if (!selectedNode) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        deleteNode(selectedNode.id);
        e.preventDefault()
        e.stopPropagation()
      }

      if (e.key === "Tab" && !e.shiftKey) {
        addChildNode(selectedNode);
        e.preventDefault()
        e.stopPropagation()
        return 0
      }

      if(e.shiftKey && e.key === 'Tab') {
        addParentNode(selectedNode)
        e.preventDefault()
        e.stopPropagation()
        return 0
      }

      if (e.key === "Enter") {
        addSiblingNode(selectedNode);
        e.preventDefault()
        e.stopPropagation()
        return 0
      }

      if (e.key === 'F2') {
        setcurrentFocusNodeId('')
        setTimeout(() => setcurrentFocusNodeId(selectedNode.id), 0) // Force update - Tránh trường hợp currentFocusNodeId trước đó trùng với selected node id hiện tại (=>>>>>> Thật nghệ thuật)
        e.preventDefault()
        e.stopPropagation()
        return 0
      }

      if(e.key === 'ArrowLeft' && !e.ctrlKey) {
        console.log('move left')
        moveLeft()
        return 0
      }
      if(e.key === 'ArrowRight' && !e.ctrlKey) {
        console.log('move right')
        moveRight()
        return 0
      }
      if(e.key === 'ArrowUp' && !e.ctrlKey) {
        console.log('move up')
        moveUp()
        return 0
      }
      if(e.key === 'ArrowDown' && !e.ctrlKey) {
        console.log('move down')
        moveDown()
        return 0
      }

      if(e.ctrlKey && e.code === 'Slash') {
        toggleCollapse(selectedNode.id)
        e.preventDefault()
        e.stopPropagation()
        return 0
      }
      
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
