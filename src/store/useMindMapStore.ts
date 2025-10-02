import { create } from "zustand";
import { Edge, Node} from "@xyflow/react";

interface MindMapState {
  node: {
    nodes: Node[];
    setNodes: (nodes: Node[]) => void;
    addNode: () => void;
    
    addSiblingNode: (selectedNode: Node) => Node | null;
    addChildNode: (selectedNode: Node) => Node;
    addParentNode: (selectedNode: Node) => Node | null;
    
    deleteNode: (nodeId: string) => void;

    currentActiveNodeId: string | null;
    getcurrentActiveNodeId: () => string | null;
    setcurrentActiveNodeId: (nodeId: string | null) => void;

    currentFocusNodeId: string | null;
    setcurrentFocusNodeId: (nodeId: string | null) => void;

    updateNodeData: (data: Record<string, unknown>) => void;

    moveLeft: () => void,
    moveRight: () => void,
    moveUp: () => void,
    moveDown: () => void
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

    const isSame = JSON.stringify(past[past.length - 1]) === JSON.stringify({nodes, edges})
    console.log({isSame})
    if(isSame) return
    
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
        if(selectedNode.data?.collapsed) {
          get().toggleCollapse(selectedNode.id)
        }
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
          type: "myEdge",
        };

        saveHistory();

        get().node.setNodes([...get().node.nodes, newNode]);
        get().edge.setEdges([...get().edge.edges, newEdge]);
        get().node.setcurrentActiveNodeId(newNodeId);
        get().node.setcurrentFocusNodeId(newNodeId);
        get().layout.updateLayout();

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

        const nodes = [...get().node.nodes];
        const selectedIndex = nodes.findIndex((n) => n.id === selectedNode.id);

        if (selectedIndex !== -1) {
          nodes.splice(selectedIndex + 1, 0, newNode); // chèn ngay sau selectedNode
        } else {
          nodes.push(newNode); // fallback
        }
        get().node.setNodes(nodes);

        // tìm parent
        const parentEdge = get().edge.edges.find(
          (e) => e.target === selectedNode.id
        );
        if (parentEdge) {
          const newEdge: Edge = {
            id: `edge-${parentEdge.source}-${newNodeId}`,
            source: parentEdge.source,
            target: newNodeId,
            type: "myEdge",
          };
          get().edge.setEdges([...get().edge.edges, newEdge]);
        }

        get().node.setcurrentActiveNodeId(newNodeId);
        get().node.setcurrentFocusNodeId(newNodeId);
        get().layout.updateLayout();

        return newNode;
      },
      addParentNode: (selectedNode) => {
        if (selectedNode.id === "root") return null;

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
          type: "myEdge",
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
        const oldParentEdge = edge.edges.find(
          (e) => e.target === selectedNode.id
        );
        let updatedEdges = [...edge.edges, newEdge];

        if (oldParentEdge) {
          updatedEdges = updatedEdges.filter((e) => e !== oldParentEdge);
          updatedEdges.push({
            id: `edge-${oldParentEdge.source}-${newNodeId}`,
            source: oldParentEdge.source,
            target: newNodeId,
            type: "myEdge",
          });
        }

        // --- 3. Cập nhật store
        node.setNodes([...updatedNodes, newNode]);
        edge.setEdges(updatedEdges);

        // --- 4. Focus vào node mới
        node.setcurrentActiveNodeId(newNodeId);
        node.setcurrentFocusNodeId(newNodeId);
        get().layout.updateLayout();

        return newNode;
      },

      deleteNode: (nodeId) => {
        if (!nodeId) return;
        if (nodeId === "root") {
          console.warn("⚠️ Không thể xóa node gốc (root)!");
          return;
        }
        // Lưu lịch sử trước
        saveHistory();

        const { node, edge } = get();
        const setCurrentActiveNodeId = node.setcurrentActiveNodeId;

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

        // BFS tìm tất cả con cháu
        while (queue.length > 0) {
          const parent = queue.shift();

          // Node
          const nodeItem = node.nodes.find((n) => n.id === parent);
          if (nodeItem) {
            if (!nodeItem.data) nodeItem.data = {};
            nodeItem.data.isDeleting = true;
          }

          // Edge + child nodes
          const childEdges = edge.edges.filter((e) => e.source === parent);
          childEdges.forEach((e) => {
            if (!e.data) e.data = {};
            e.data.isDeleting = true;

            const childId = e.target;
            if (!nodesToDelete.has(childId)) {
              nodesToDelete.add(childId);
              queue.push(childId);
            }
          });
        }

        node.setNodes(
          node.nodes.map((n) => {
            if (!nodesToDelete.has(n.id)) return n;
            return { ...n, data: { ...n.data, isDeleting: true } };
          })
        );
        edge.setEdges(
          edge.edges.map((e) => {
            if (!nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)) {
              return e;
            }
            return { ...e, data: { ...e.data, isDeleting: true } };
          })
        );

        // Sau animation xong (~200ms), remove thật
        setTimeout(() => {
          node.setNodes(node.nodes.filter((n) => !nodesToDelete.has(n.id)));
          edge.setEdges(
            edge.edges.filter(
              (e) =>
                !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)
            )
          );

          // focus node kế tiếp nếu có
          if (nextFocusId) {
            setCurrentActiveNodeId(nextFocusId);
          }
          get().layout.updateLayout();
        }, 200);
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

      moveLeft: () => {
        const { node, edge } = get();
        const { currentActiveNodeId, setcurrentActiveNodeId } = node;
        if (!currentActiveNodeId) return;

        // tìm edge cha → con
        const parentEdge = edge.edges.find(
          (e) => e.target === currentActiveNodeId
        );
        if (parentEdge) {
          setcurrentActiveNodeId(parentEdge.source);
        }
      },
      moveRight: () => {
        const { node, edge } = get();
        const { currentActiveNodeId, setcurrentActiveNodeId } = node;
        if (!currentActiveNodeId) return;

        // tìm danh sách con
        const childEdges = edge.edges.filter(
          (e) => e.source === currentActiveNodeId
        );
        if (childEdges.length > 0) {
          setcurrentActiveNodeId(childEdges[0].target); // con đầu tiên
        }
      },
      moveUp: () => {
        const { node, edge } = get();
        const { currentActiveNodeId, setcurrentActiveNodeId } = node;
        if (!currentActiveNodeId) return;

        const parentEdge = edge.edges.find(
          (e) => e.target === currentActiveNodeId
        );
        if (!parentEdge) return; // root không có cha
        const parentId = parentEdge.source;

        // danh sách anh em
        const siblings = edge.edges
          .filter((e) => e.source === parentId)
          .map((e) => e.target);

        siblings.sort(
          (a, b) =>
            node.nodes.findIndex((n) => n.id === a) -
            node.nodes.findIndex((n) => n.id === b)
        );

        const index = siblings.indexOf(currentActiveNodeId);

        // có anh em phía trên
        if (index > 0) {
          setcurrentActiveNodeId(siblings[index - 1]);
          return;
        }

        // nếu không có → tìm anh em họ (uncle) của cha
        const grandParentEdge = edge.edges.find((e) => e.target === parentId);
        if (!grandParentEdge) return;

        const grandParentId = grandParentEdge.source;
        const uncles = edge.edges
          .filter((e) => e.source === grandParentId)
          .map((e) => e.target);

        uncles.sort(
          (a, b) =>
            node.nodes.findIndex((n) => n.id === a) -
            node.nodes.findIndex((n) => n.id === b)
        );

        const parentIndex = uncles.indexOf(parentId);
        if (parentIndex > 0) {
          const uncleAbove = uncles[parentIndex - 1];
          // nếu uncle có con → chọn con cuối
          const cousins = edge.edges
            .filter((e) => e.source === uncleAbove)
            .map((e) => e.target);
          if (cousins.length > 0) {
            setcurrentActiveNodeId(cousins[cousins.length - 1]);
          } else {
            setcurrentActiveNodeId(uncleAbove);
          }
        }
      },
      moveDown: () => {
        const { node, edge } = get();
        const { currentActiveNodeId, setcurrentActiveNodeId } = node;
        if (!currentActiveNodeId) return;

        const parentEdge = edge.edges.find(
          (e) => e.target === currentActiveNodeId
        );
        if (!parentEdge) return;
        const parentId = parentEdge.source;

        // danh sách anh em
        const siblings = edge.edges
          .filter((e) => e.source === parentId)
          .map((e) => e.target);

        siblings.sort(
          (a, b) =>
            node.nodes.findIndex((n) => n.id === a) -
            node.nodes.findIndex((n) => n.id === b)
        );

        const index = siblings.indexOf(currentActiveNodeId);

        // có anh em phía dưới
        if (index < siblings.length - 1) {
          setcurrentActiveNodeId(siblings[index + 1]);
          return;
        }

        // nếu không có → tìm anh em họ phía dưới
        const grandParentEdge = edge.edges.find((e) => e.target === parentId);
        if (!grandParentEdge) return;

        const grandParentId = grandParentEdge.source;
        const uncles = edge.edges
          .filter((e) => e.source === grandParentId)
          .map((e) => e.target);
        uncles.sort(
          (a, b) =>
            node.nodes.findIndex((n) => n.id === a) -
            node.nodes.findIndex((n) => n.id === b)
        );

        const parentIndex = uncles.indexOf(parentId);
        if (parentIndex < uncles.length - 1) {
          const uncleBelow = uncles[parentIndex + 1];
          const cousins = edge.edges
            .filter((e) => e.source === uncleBelow)
            .map((e) => e.target);
          if (cousins.length > 0) {
            setcurrentActiveNodeId(cousins[0]); // con đầu tiên
          } else {
            setcurrentActiveNodeId(uncleBelow);
          }
        }
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
        const { node, edge } = get();
        const rootId = "root";
        if (!node.nodes.find((n) => n.id === rootId)) return;

        // Khoảng cách có thể chỉnh tuỳ UI
        const LEFT = 50; // lề trái cho root
        const H_GAP = 80; // khoảng cách ngang cha ↔ con
        const V_GAP = 20; // khoảng cách dọc giữa các subtree siblings
        const DEFAULT_W = 150; // fallback width nếu chưa đo
        const DEFAULT_H = 50; // fallback height nếu chưa đo

        // Map nhanh id → node
        const byId = new Map(node.nodes.map((n) => [n.id, n]));

        // Helper lấy size thực tế
        const sizeOf = (id: string) => {
          const n = byId.get(id);
          const w = Math.max(1, n?.measured?.width ?? DEFAULT_W);
          const h = Math.max(1, n?.measured?.height ?? DEFAULT_H);
          return { w, h };
        };

        // Xây childrenMap, bỏ qua con nếu parent đang collapsed
        const childrenMap: Record<string, string[]> = {};
        edge.edges.forEach((e) => {
          const parent = byId.get(e.source);
          if (parent?.data?.collapsed) return;
          (childrenMap[e.source] ??= []).push(e.target);
        });

        // 👉 Sort children theo thứ tự trong node.nodes
        Object.keys(childrenMap).forEach((pid) => {
          childrenMap[pid].sort((a, b) => {
            return (
              node.nodes.findIndex((n) => n.id === a) -
              node.nodes.findIndex((n) => n.id === b)
            );
          });
        });

        // Tính blockHeight (chiều cao subtree) bằng đệ quy + memo
        const blockHeight = new Map<string, number>();
        const calcBlock = (id: string): number => {
          if (blockHeight.has(id)) return blockHeight.get(id)!;
          const { h } = sizeOf(id);
          const kids = childrenMap[id] ?? [];
          if (kids.length === 0) {
            blockHeight.set(id, h);
            return h;
          }
          let sum = 0;
          kids.forEach((cid, i) => {
            sum += calcBlock(cid);
            if (i < kids.length - 1) sum += V_GAP;
          });
          const total = Math.max(h, sum);
          blockHeight.set(id, total);
          return total;
        };

        const totalH = calcBlock(rootId);
        const screenH = window.innerHeight;
        const rootTop = Math.max((screenH - totalH) / 2, 20); // căn giữa dọc

        // Đặt toạ độ
        const pos = new Map<string, { x: number; y: number }>();
        const place = (id: string, left: number, top: number) => {
          const { w, h } = sizeOf(id);
          const myBlockH = blockHeight.get(id)!;

          const x = left;
          const y = top + (myBlockH - h) / 2;

          pos.set(id, { x, y });

          const kids = childrenMap[id] ?? [];
          if (kids.length === 0) return;

          let nextTop = top;
          const childLeft = x + w + H_GAP;

          kids.forEach((cid) => {
            const chBlockH = blockHeight.get(cid)!;
            place(cid, childLeft, nextTop);
            nextTop += chBlockH + V_GAP;
          });
        };

        place(rootId, LEFT, rootTop);

        // Apply vị trí
        const updatedNodes = node.nodes.map((n) => {
          const p = pos.get(n.id);
          return p ? { ...n, position: { x: p.x, y: p.y } } : n;
        });

        set((state) => ({
          node: { ...state.node, nodes: updatedNodes },
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

        // cập nhật node gốc toggle (KHÔNG ẩn node này)
        nodesMap.set(id, {
          ...node,
          data: {
            ...node.data,
            collapsed: newCollapsed,
            // isHidding: newCollapsed,
          },
        });

        // Hàm helper ẩn có animation
        const hideWithAnimation = (edge: Edge, child: Node) => {
          edgesMap.set(edge.id, {
            ...edge,
            data: { ...edge.data, isHidding: true },
          });
          nodesMap.set(child.id, {
            ...child,
            data: { ...child.data, isHidding: true },
          });

          setTimeout(() => {
            edgesMap.set(edge.id, {
              ...edge,
              hidden: true,
              data: { ...edge.data, isHidding: false },
            });
            nodesMap.set(child.id, {
              ...child,
              hidden: true,
              data: { ...child.data, isHidding: false },
            });
          }, 200);
        };

        // Hàm đệ quy để ẩn/hiện con cháu
        const toggleChildren = (parentId: string, hiddenByParent: boolean) => {
          for (const e of state.edge.edges) {
            if (e.source !== parentId) continue;

            const child = nodesMap.get(e.target);
            if (!child) continue;

            if (!e.data) e.data = {};
            if (!child.data) child.data = {};

            // Trường hợp cha collapsed hoặc bị ẩn theo cha
            if (hiddenByParent) {
              // chỉ animate nếu chưa hidden
              if (!child.hidden) {
                hideWithAnimation(e, child);
              } else {
                // đã hidden thì giữ nguyên, không animate lại
                edgesMap.set(e.id, { ...e, hidden: true });
                nodesMap.set(child.id, { ...child, hidden: true });
              }
              toggleChildren(child.id, true);
            } else {
              // Cha expand → hiện edge & child
              edgesMap.set(e.id, {
                ...e,
                hidden: false,
                data: { ...e.data, isHidding: false },
              });
              nodesMap.set(child.id, {
                ...child,
                hidden: false,
                data: { ...child.data, isHidding: false },
              });

              // Nếu child cũng collapsed → vẫn phải ẩn con cháu của nó
              if (child.data?.collapsed) {
                toggleChildren(child.id, true);
              } else {
                toggleChildren(child.id, false);
              }
            }
          }
        };

        // Bắt đầu từ node gốc
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

      get().layout.updateLayout();

      // force render
      get().node.setcurrentActiveNodeId(new Date().getTime().toString());
      get().node.setcurrentActiveNodeId(id);

      // clear focus to text editor
      get().node.setcurrentFocusNodeId(""); 
      // setTimeout(() => {
        
      // }, 50);
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
        const selectedNode = get().node.nodes.find((n) => n.selected);
        if (selectedNode) {
          get().node.setcurrentActiveNodeId(selectedNode.id);
        }
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
        const selectedNode = get().node.nodes.find((n) => n.selected);
        if (selectedNode) {
          get().node.setcurrentActiveNodeId(selectedNode.id);
        }
      },
    },
  };

});

export default useMindMapStore;
