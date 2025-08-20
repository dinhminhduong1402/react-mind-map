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
          rankdir: "LR", // Left -> Right
          nodesep: 100,
          ranksep: 100,
        });
        g.setDefaultEdgeLabel(() => ({}));

        const { node, edge } = get();

        // Khai báo node cho dagre
        node.nodes.forEach((n: Node) => {
          g.setNode(n.id, { width: 100, height: 50 });
        });

        // Khai báo edge
        edge.edges.forEach((e: Edge) => g.setEdge(e.source, e.target));

        dagre.layout(g);

        // 📌 Tìm root node trong layout của dagre
        const rootId = "root";
        const dagreRootPos = g.node(rootId);

        // 📌 Tính vị trí target cho root (x=50, y=center viewport - 80px topbar)
        const screenHeight = window.innerHeight;
        const targetRootPos = {
          x: 50,
          y: (screenHeight - 80) / 2,
        };

        // 📌 Tính delta để dịch toàn bộ graph theo root
        const dx = targetRootPos.x - dagreRootPos.x;
        const dy = targetRootPos.y - dagreRootPos.y;

        const updatedNodes = node.nodes.map((n: Node) => {
          const pos = g.node(n.id);
          if (!pos) return n; // tránh lỗi nếu dagre chưa tính node

          return {
            ...n,
            position: {
              x: pos.x + dx,
              y: pos.y + dy,
            },
          };
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
        const toggleChildren = (parentId: string, hiddenByParent: boolean) => {
          for (const e of state.edge.edges) {
            if (e.source === parentId) {
              const child = nodesMap.get(e.target);
              if (!child) continue;

              // Nếu cha đang collapse => ẩn luôn con
              if (hiddenByParent) {
                edgesMap.set(e.id, { ...e, hidden: true });
                nodesMap.set(child.id, { ...child, hidden: true });

                // Ẩn luôn con cháu
                toggleChildren(child.id, true);
              } else {
                // Cha expand → chỉ hiện nếu child KHÔNG collapse
                edgesMap.set(e.id, { ...e, hidden: false });
                nodesMap.set(child.id, { ...child, hidden: false });

                if (!child.data?.collapsed) {
                  toggleChildren(child.id, false);
                } else {
                  // Child vẫn collapsed thì ẩn con cháu của nó
                  toggleChildren(child.id, true);
                }
              }
            }
          }
        };

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
