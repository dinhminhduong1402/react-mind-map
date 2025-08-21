import { useRef, useState, useEffect, MouseEvent } from 'react';
import { FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight, FiList } from 'react-icons/fi';
import useMindMapStore from '../store/useMindMapStore';
import useEditingStore from '@/store/useEditingStore';

type TextEditorProps = {
  id: string;
  text?: string;
};

export default function TailwindTextEditor({ id, text }: TextEditorProps) {
  const editorRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const {isEditing, setIsEditing} = useEditingStore();
  const { updateNodeData } = useMindMapStore((state) => state.node);

  // Khởi tạo nội dung ban đầu cho editor
  useEffect(() => {
    if (editorRef.current && text !== undefined) {
      editorRef.current.innerHTML = text;
    }
  }, [text]);


  const handleDoubleClick = (e: MouseEvent) => {
    e.stopPropagation();
    
    if (!isEditing) {
      setIsEditing(id, true);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (toolbarRef.current && toolbarRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    updateNodeData({ id, content: editorRef.current?.innerHTML || '' });
    setIsEditing(id, false);
    setShowToolbar(false);
  };

  const handleMouseUp = () => {
    if (!isEditing) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if(isEditing) {
      e.stopPropagation();
      console.log('stop here')
    }
    setTimeout(() => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            setShowToolbar(true);
        } else {
            setShowToolbar(false);
        }
    }, 50);
  }

  const execCommand = (e: MouseEvent, command: string) => {
    e.stopPropagation();
    document.execCommand(command);
    editorRef.current?.focus();
  };
  
  const formatBlock = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    document.execCommand('formatBlock', false, e.target.value);
    editorRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        editorRef.current && 
        !editorRef.current.contains(e.target as Node) &&
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        handleBlur(e as unknown as React.FocusEvent<HTMLDivElement>);
      }
    };
    document.addEventListener('mousedown', handleClickOutside as unknown as EventListener);
    return () => document.removeEventListener('mousedown', handleClickOutside as unknown as EventListener);
  }, []);

  return (
    <div
      className="relative p-0 w-full"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {showToolbar && isEditing && (
        <div
          ref={toolbarRef}
          style={{ transform: 'translateY(-100%)' }}
          className="absolute top-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 flex items-center gap-1 whitespace-nowrap"
        >
          <button onClick={(e) => execCommand(e, 'bold')} className="p-1 rounded hover:bg-gray-100"><FiBold /></button>
          <button onClick={(e) => execCommand(e, 'italic')} className="p-1 rounded hover:bg-gray-100"><FiItalic /></button>
          <button onClick={(e) => execCommand(e, 'underline')} className="p-1 rounded hover:bg-gray-100"><FiUnderline /></button>
          <button onClick={(e) => execCommand(e, 'insertUnorderedList')} className="p-1 rounded hover:bg-gray-100"><FiList /></button>
          <button onClick={(e) => execCommand(e, 'justifyLeft')} className="p-1 rounded hover:bg-gray-100"><FiAlignLeft /></button>
          <button onClick={(e) => execCommand(e, 'justifyCenter')} className="p-1 rounded hover:bg-gray-100"><FiAlignCenter /></button>
          <button onClick={(e) => execCommand(e, 'justifyRight')} className="p-1 rounded hover:bg-gray-100"><FiAlignRight /></button>
          <select onChange={formatBlock} className="border-0 bg-gray-100 rounded p-1 text-sm cursor-pointer focus:outline-none">
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>
      )}

      <div
        ref={editorRef}
        onMouseUp={handleMouseUp}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        contentEditable={isEditing}
        suppressContentEditableWarning
        className={`
          ${isEditing ? 'nodrag border-blue-500 bg-white cursor-text' : 'border-gray-200 bg-gray-50 cursor-pointer'}
          p-3 min-h-[40px] rounded-lg text-base leading-snug outline-none transition-all
          hover:border-blue-500
        `}
      />
    </div>
  );
}