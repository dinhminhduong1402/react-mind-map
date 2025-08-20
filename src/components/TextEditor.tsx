import { useRef, useState, useEffect, MouseEvent } from 'react';
import useMindMapStore from '../store/useMindMapStore';

type TextEditorProps = {
  id: string,
  text?: string
}

export default function TextEditor({id, text}: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const {updateNodeData} = useMindMapStore((state) => state.node)

  const handleMouseUp = () => {
    if (!isEditing) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowToolbar(false);
      return;
    }
    setShowToolbar(true);
  };

  const exec = (command: string) => {
    document.execCommand(command);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      editorRef.current?.focus();
    }, 0);
  };

  const handleBlur = () => {
    updateNodeData({id, "content": editorRef.current?.innerText})
    setIsEditing(false);
    setShowToolbar(false);
  };

  const handleInput = () => {
    
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!editorRef.current?.contains(e.target as Node)) {
        setShowToolbar(false);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', padding: '0px' }}>
      {showToolbar && isEditing && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            transform: 'translateY(-100%)',
            background: '#fff',
            border: '1px solid #ccc',
            padding: '6px 10px',
            borderRadius: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            zIndex: 10,
            display: 'flex',
          }}
        >
          <button onClick={() => exec('bold')}><b>B</b></button>
          <button onClick={() => exec('italic')}><i>I</i></button>
          <button onClick={() => exec('underline')}><u>U</u></button>
        </div>
      )}

      <div
        ref={editorRef}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
        onInput={handleInput}
        contentEditable={isEditing}
        suppressContentEditableWarning
        className={isEditing ? "nodrag" : ""}
        style={{
          border: '1px solid #ccc',
          padding: '12px',
          minHeight: '25px',
          borderRadius: '4px',
          cursor: isEditing ? 'text' : 'pointer',
          background: isEditing ? '#fff' : '#f9f9f9'
        }}
      >
        {text}
      </div>
    </div>
  );
}
