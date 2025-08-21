import { create } from "zustand";
import dagre from "dagre";
import { Edge, Node } from "@xyflow/react";

interface MindMapState {
  node: {
    nodes: Node[];
    setNodes: (nodes: Node[]) => void;
    addNode: () => void;

    
    addSiblingNode: (selectedNode: Node) => Node | null;
    addChildNode: (selectedNode: Node) => Node;
    
    
    deleteNode: (nodeId: string) => void;

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
  toggleCompleted: (id: string) => void;
  history: {
    past: { nodes: Node[]; edges: Edge[] }[];
    future: { nodes: Node[]; edges: Edge[] }[];
    undo: () => void;
    redo: () => void;
  };
}

const useMindMapStore = create<MindMapState>()((set, get) => {
  const saveHistory = () => {
    const { nodes } = get().node;
    const { edges } = get().edge;
    const { past } = get().history;
    set({
      history: {
        past: [...past, { nodes, edges }],
        future: [],
        undo: get().history.undo,
        redo: get().history.redo,
      },
    });
    // console.log({history: get().history})
  };
  
  return {
    node: {
      currentActiveNodeId: null, // Set the first node as active by default
      nodes: [],
      addNode: () => {},

      addChildNode: (selectedNode) => {
        const newNodeId = `node-${crypto.randomUUID().toString()}`;
        // console.log({width: selectedNode.measured?.width})
        const childPosition = {
          x:
            (selectedNode.position?.x || 0) +
            (selectedNode.measured?.width || 0) +
            50,
          y: selectedNode.position?.y || 0,
        };

        const newNode: Node = {
          id: newNodeId,
          type: "textUpdaterNode",
          position: childPosition,
          data: { content: "New child" },
          selected: false,
        };

        const newEdge: Edge = {
          id: `edge-${selectedNode.id}-${newNodeId}`,
          source: selectedNode.id,
          target: newNodeId,
        };

        saveHistory();

        get().node.setNodes([...get().node.nodes, newNode]);
        get().edge.setEdges([...get().edge.edges, newEdge]);
        get().node.setcurrentActiveNodeId(newNodeId);

        return newNode
      },
      addSiblingNode: (selectedNode) => {
        if(selectedNode.id == 'root') return null
        
        // console.log({selectedNodeId: selectedNode.id})
        const newNodeId = `node-${crypto.randomUUID().toString()}`;
        const siblingPosition = {
          x: selectedNode.position?.x || 0,
          y: (selectedNode.position?.y || 0) + 100,
        };

        const newNode: Node = {
          id: newNodeId,
          type: "textUpdaterNode",
          position: siblingPosition,
          data: { content: "New sibling" },
          selected: true,
        };

        saveHistory();

        get().node.setNodes([...get().node.nodes, newNode]);
        get().node.setcurrentActiveNodeId(newNodeId);

        // tìm parent
        const parentEdge = get().edge.edges.find(
          (e) => e.target === selectedNode.id
        );
        if (parentEdge) {
          const newEdge: Edge = {
            id: `edge-${parentEdge.source}-${newNodeId}`,
            source: parentEdge.source,
            target: newNodeId,
          };
          get().edge.setEdges([...get().edge.edges, newEdge]);
        }

        get().node.setcurrentActiveNodeId(newNodeId);

        return newNode
      },

      deleteNode: (nodeId) => {
        if (!nodeId) return;
        if (nodeId === "root") {
          console.warn("⚠️ Không thể xóa node gốc (root)!");
          return;
        }

        const nodesToDelete = new Set([nodeId]);
        const queue = [nodeId];

        while (queue.length > 0) {
          const parentId = queue.shift();
          // Tìm các cạnh có source là parentId
          const childEdges = get().edge.edges.filter(
            (e) => e.source === parentId
          );

          // Thêm các node con vào danh sách xóa và hàng đợi
          childEdges.forEach((edge) => {
            if (!nodesToDelete.has(edge.target)) {
              nodesToDelete.add(edge.target);
              queue.push(edge.target);
            }
          });
        }

        saveHistory();

        get().node.setNodes(
          get().node.nodes.filter((n) => !nodesToDelete.has(n.id))
        );

        get().edge.setEdges(
          get().edge.edges.filter(
            (e) => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)
          )
        );
      },
      setNodes: (nodes) => {
        set((state) => ({ node: { ...state.node, nodes } }));
        const selected = get().node.nodes.find((n) => n.selected);
        // console.log({selected})
        if(selected) {
          get().node.setcurrentActiveNodeId(selected.id);
        }
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
        saveHistory();
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
          rankdir: "LR",
          nodesep: 50, // khoảng cách ngang tối thiểu
          ranksep: 100, // khoảng cách dọc tối thiểu
        });
        g.setDefaultEdgeLabel(() => ({}));

        const { node, edge } = get();

        // Khai báo node cho dagre với kích thước thực tế
        node.nodes.forEach((n: Node) => {
          const nodeWidth = n.measured?.width || 150;
          const nodeHeight = n.measured?.height || 50;

          g.setNode(n.id, { width: nodeWidth, height: nodeHeight });
        });

        // Khai báo edge
        edge.edges.forEach((e: Edge) => g.setEdge(e.source, e.target));

        dagre.layout(g);

        const rootId = "root";
        const dagreRootPos = g.node(rootId);

        const screenHeight = window.innerHeight;
        const targetRootPos = {
          x: 50,
          y: (screenHeight - 80) / 2,
        };

        const dx = targetRootPos.x - dagreRootPos.x;
        const dy = targetRootPos.y - dagreRootPos.y;

        const updatedNodes = node.nodes.map((n: Node) => {
          const pos = g.node(n.id);
          if (!pos) return n;

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
    toggleCompleted: (nodeId) => {
      
      set((state) => ({
        node: {
          ...state.node,

          nodes: state.node.nodes.map((node) => {
            // Tìm node cần cập nhật bằng ID
            if (node.id === nodeId) {
              // Trả về một object node mới với thuộc tính 'data' được cập nhật
              return {
                ...node,
                data: {
                  ...node.data,
                  completed: !node.data.completed, // Lật ngược giá trị của 'completed'
                },
              };
            }
            return node;
          }),
        },
      }));

    },

    history: {
      past: [],
      future: [],
      undo: () => {
        const { past, future } = get().history;
        if (past.length === 0) return;

        const present = {
          nodes: get().node.nodes,
          edges: get().edge.edges,
        };
        const previousState = past[past.length - 1];
        const newPast = past.slice(0, -1);

        set({
          node: { ...get().node, nodes: previousState.nodes },
          edge: { ...get().edge, edges: previousState.edges },
          history: {
            past: newPast,
            future: [present, ...future],
            undo: get().history.undo,
            redo: get().history.redo,
          },
        });
      },
      redo: () => {
        const { past, future } = get().history;
        if (future.length === 0) return;

        const present = {
          nodes: get().node.nodes,
          edges: get().edge.edges,
        };
        const nextState = future[0];
        const newFuture = future.slice(1);

        set({
          node: { ...get().node, nodes: nextState.nodes },
          edge: { ...get().edge, edges: nextState.edges },
          history: {
            past: [...past, present],
            future: newFuture,
            undo: get().history.undo,
            redo: get().history.redo,
          },
        });
      },
    },
  };


});

export default useMindMapStore;
