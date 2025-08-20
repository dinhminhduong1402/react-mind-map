import { create } from "zustand";
// import {persist} from 'zustand/middleware';
import dagre from "dagre";
import { Edge, Node } from "@xyflow/react";

interface MindMapState {
  node: {
    nodes: Node[];
    setNodes: (nodes: Node[]) => void;
    addNode: () => void;

    currentActiveNodeId: string | null;
    getcurrentActiveNodeId: () => string | null;
    setcurrentActiveNodeId: (nodeId: string | null) => void;

    updateNodeData: (data: Record<string, unknown>) => void;
  };
  edge: {
    edges: Edge[];
    setEdges: (edges: Edge[]) => void;
  };
  layout: {
    updateLayout: () => void;
  };
  toggleCollapse: (id: string) => void;
}

const useMindMapStore = create<MindMapState>()((set, get) => {
  return {
    node: {
      currentActiveNodeId: null, // Set the first node as active by default
      nodes: [],
      addNode: () => {},
      setNodes: (nodes) => {
        set((state) => ({ node: { ...state.node, nodes } }));
      },
      setcurrentActiveNodeId: (nodeId) => {
        set((state) => ({
          node: {
            ...state.node,
            nodes: state.node.nodes.map((n) => ({
              ...n,
              selected: n.id === nodeId,
            })),
            currentActiveNodeId: nodeId,
          },
        }));
      },
      getcurrentActiveNodeId: () => {
        const { currentActiveNodeId } = get().node;
        return currentActiveNodeId;
      },
      updateNodeData: (updateData) => {
        const { id } = updateData;
        set((state) => {
          const updateNodes = state.node.nodes.map((n) => {
            if (n.id == id) {
              return {
                ...n,
                data: {
                  ...n.data,
                  ...updateData,
                },
              };
            }
            return n;
          });
          return {
            node: {
              ...state.node,
              nodes: updateNodes,
            },
          };
        });
      },
    },
    edge: {
      edges: [],
      setEdges: (edges) => {
        set((state) => ({ edge: { ...state.edge, edges } }));
      },
    },
    layout: {
      updateLayout: () => {
        const g = new dagre.graphlib.Graph();
        g.setGraph({ 
          rankdir: "LR" ,  // Left to Right (Horizontal layout)
          nodesep: 150,    // khoảng cách ngang giữa node
          ranksep: 100,    // khoảng cách dọc giữa các level
        });
        g.setDefaultEdgeLabel(() => ({}));

        const { node, edge } = get();
        node.nodes.forEach((node: Node) =>
          g.setNode(node.id, { width: 100, height: 50 })
        );
        edge.edges.forEach((edge: Edge) => g.setEdge(edge.source, edge.target));

        dagre.layout(g);

        const updatedNodes = node.nodes.map((node: Node) => {
          const pos = g.node(node.id);
          return { ...node, position: { x: pos.x, y: pos.y } };
        });

        set((state) => ({
          node: {
            ...state.node,
            nodes: updatedNodes,
          },
        }));
      },

    },

    toggleCollapse: (id: string) => {
      set((state) => {
        const nodesMap = new Map(state.node.nodes.map((n) => [n.id, n]));
        const edgesMap = new Map(state.edge.edges.map((e) => [e.id, e]));

        const node = nodesMap.get(id);
        if (!node) return state;

        const newCollapsed = !node.data?.collapsed;

        // cập nhật node gốc toggle
        nodesMap.set(id, {
          ...node,
          data: { ...node.data, collapsed: newCollapsed },
        });

        // hàm đệ quy để ẩn/hiện con cháu
        const toggleChildren = (parentId: string, hidden: boolean) => {
          for (const e of state.edge.edges) {
            if (e.source === parentId) {
              // Ẩn/hiện edge
              edgesMap.set(e.id, { ...e, hidden });

              // Ẩn/hiện node target
              const child = nodesMap.get(e.target);
              if (child) {
                nodesMap.set(e.target, { ...child, hidden });

                // nếu đang collapse thì ẩn cả con cháu của child
                toggleChildren(e.target, hidden);
              }
            }
          }
        };

        // Nếu collapse thì ẩn con cháu, nếu expand thì hiện lại
        toggleChildren(id, newCollapsed);

        return {
          node: {
            ...state.node,
            nodes: Array.from(nodesMap.values()),
          },
          edge: {
            ...state.edge,
            edges: Array.from(edgesMap.values()),
          },
        };
      });
    },
  };
});

export default useMindMapStore;
