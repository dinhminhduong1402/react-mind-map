import {create} from 'zustand'


interface EditingState {
  nodeId: string | null,
  isEditing: boolean,
  setIsEditing: (nodeId: string, value: boolean) => void,

  isFocus: boolean,
  setIsFocus: (nodeId: string, value: boolean) => void
}

const useEditingStore = create<EditingState>(
  (set) => ({

    nodeId: null,
    isEditing: false,
    isFocus: false,
    setIsFocus: (nodeId, value) => {
      set(() => ({nodeId, isFocus: value}))
    },
    setIsEditing: (nodeId, value) => {
      set(() => ({nodeId: nodeId, isEditing: !!value}))
    }
    
  })
)

export default useEditingStore

