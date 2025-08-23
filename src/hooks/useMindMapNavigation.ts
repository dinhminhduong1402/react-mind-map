import { useReactFlow, Node } from "@xyflow/react";

export function useMindMapNavigation(){
  const {setCenter} = useReactFlow()

  const centerNode = (node: Node) => {
    if (node) {
      const x = node.position.x + (node.width ?? 0) / 2;
      const y = node.position.y + (node.height ?? 0) / 2;
      setCenter(x, y, { zoom: 1.2, duration: 500 }); // zoom nhẹ cho dễ nhìn
    }
  }


  return {
    centerNode
  }
  
}