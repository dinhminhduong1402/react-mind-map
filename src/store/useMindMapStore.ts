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
    addParentNode: (selectedNode: Node) => Node;
    
    
    deleteNode: (nodeId: string) => void;

    currentActiveNodeId: string | null;
    getcurrentActiveNodeId: () => string | null;
    setcurrentActiveNodeId: (nodeId: string | null) => void;

    currentFocusNodeId: string | null;
    setcurrentFocusNodeId: (nodeId: string | null) => void;

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
      currentFocusNodeId: null,
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
        get().node.setcurrentFocusNodeId(newNodeId);

        return newNode;
      },
      addSiblingNode: (selectedNode) => {
        if (selectedNode.id == "root") return null;

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
        get().node.setcurrentFocusNodeId(newNodeId);

        return newNode;
      },
      addParentNode: (selectedNode) => {
        const offsetX = 200; // khoảng cách dịch sang phải
        const newNodeId = `node-${crypto.randomUUID().toString()}`;

        const { node, edge } = get();

        // Node mới xuất hiện ngay tại chỗ selectedNode
        const newNode: Node = {
          id: newNodeId,
          type: "textUpdaterNode",
          position: { ...selectedNode.position }, // giữ đúng vị trí của selected
          data: { content: "New parent" },
          selected: false,
        };

        // Edge parent mới -> selectedNode
        const newEdge: Edge = {
          id: `edge-${newNodeId}-${selectedNode.id}`,
          source: newNodeId,
          target: selectedNode.id,
        };

        saveHistory();

        // --- 1. Dịch chuyển selectedNode và toàn bộ con cháu sang phải
        const nodesToShift = new Set<string>();
        const queue = [selectedNode.id];
        while (queue.length > 0) {
          const parentId = queue.shift()!;
          nodesToShift.add(parentId);
          const childEdges = edge.edges.filter((e) => e.source === parentId);
          childEdges.forEach((e) => {
            if (!nodesToShift.has(e.target)) {
              queue.push(e.target);
            }
          });
        }

        const updatedNodes = node.nodes.map((n) => {
          if (nodesToShift.has(n.id)) {
            return {
              ...n,
              position: {
                x: (n.position?.x || 0) + offsetX,
                y: n.position?.y || 0,
              },
            };
          }
          return n;
        });

        // --- 2. Xử lý lại edges (nối oldParent -> newParent nếu cần)
        const oldParentEdge = edge.edges.find((e) => e.target === selectedNode.id);
        let updatedEdges = [...edge.edges, newEdge];

        if (oldParentEdge) {
          updatedEdges = updatedEdges.filter((e) => e !== oldParentEdge);
          updatedEdges.push({
            id: `edge-${oldParentEdge.source}-${newNodeId}`,
            source: oldParentEdge.source,
            target: newNodeId,
          });
        }

        // --- 3. Cập nhật store
        node.setNodes([...updatedNodes, newNode]);
        edge.setEdges(updatedEdges);

        // --- 4. Focus vào node mới
        node.setcurrentActiveNodeId(newNodeId);
        node.setcurrentFocusNodeId(newNodeId);

        return newNode;
      },


      deleteNode: (nodeId) => {
        if (!nodeId) return;
        if (nodeId === "root") {
          console.warn("⚠️ Không thể xóa node gốc (root)!");
          return;
        }

        const { node, edge } = get()
        const setCurrentActiveNodeId = node.setcurrentActiveNodeId
        

        // --- Tìm parent của node này
        const parentEdge = edge.edges.find((e) => e.target === nodeId);
        const parentId = parentEdge?.source || null;

        // --- Tìm danh sách anh em (siblings)
        const siblings = parentId
          ? edge.edges
              .filter((e) => e.source === parentId && e.target !== nodeId)
              .map((e) => e.target)
          : [];

        // --- Tìm vị trí node trong danh sách nodes để tính "gần nhất"
        let nextFocusId: string | null = null;
        if (siblings.length > 0) {
          const currentIndex = node.nodes.findIndex((n) => n.id === nodeId);

          // Tìm anh em ngay bên trái
          for (let i = currentIndex - 1; i >= 0; i--) {
            if (siblings.includes(node.nodes[i].id)) {
              nextFocusId = node.nodes[i].id;
              break;
            }
          }

          // Nếu không có anh em bên trái thì lấy anh em bên phải
          if (!nextFocusId) {
            for (let i = currentIndex + 1; i < node.nodes.length; i++) {
              if (siblings.includes(node.nodes[i].id)) {
                nextFocusId = node.nodes[i].id;
                break;
              }
            }
          }
        }

        // Nếu không tìm được sibling thì fallback về parent
        if (!nextFocusId && parentId) {
          nextFocusId = parentId;
        }

        // --- Bắt đầu xóa
        const nodesToDelete = new Set([nodeId]);
        const queue = [nodeId];

        while (queue.length > 0) {
          const parent = queue.shift();
          const childEdges = edge.edges.filter((e) => e.source === parent);
          childEdges.forEach((e) => {
            if (!nodesToDelete.has(e.target)) {
              nodesToDelete.add(e.target);
              queue.push(e.target);
            }
          });
        }

        saveHistory();

        node.setNodes(node.nodes.filter((n) => !nodesToDelete.has(n.id)));

        edge.setEdges(
          edge.edges.filter(
            (e) => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)
          )
        );

        // --- Cuối cùng: focus node kế tiếp
        if (nextFocusId) {
          setCurrentActiveNodeId(nextFocusId);
        }
      },

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
      setcurrentFocusNodeId: (nodeId) => {
        set((state) => ({
          node: {
            ...state.node,
            currentFocusNodeId: nodeId,
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
