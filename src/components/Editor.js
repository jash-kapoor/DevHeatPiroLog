import React, { useEffect, useRef, useCallback } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const ignoreChangesRef = useRef(false);
  const latestCodeRef = useRef('');

  // Memoized change handler
  const handleEditorChange = useCallback((instance, changes) => {
    const code = instance.getValue();
    latestCodeRef.current = code;
    onCodeChange(code);
    
    if (!ignoreChangesRef.current && changes.origin !== 'setValue') {
      socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code,
      });
    }
  }, [onCodeChange, roomId, socketRef]);

  // Initialize editor
  useEffect(() => {
    const editor = Codemirror.fromTextArea(
      document.getElementById('realtimeEditor'),
      {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        extraKeys: {
          'Tab': 'indentMore',
          'Shift-Tab': 'indentLess'
        }
      }
    );

    editor.on('change', handleEditorChange);
    editorRef.current = editor;

    return () => {
      editor.off('change', handleEditorChange);
      editor.toTextArea();
    };
  }, [handleEditorChange]);

  // Handle incoming changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleIncomingChange = ({ code }) => {
      if (!editorRef.current || code === null || code === latestCodeRef.current) {
        return;
      }

      const cursor = editorRef.current.getCursor();
      const scrollInfo = editorRef.current.getScrollInfo();

      ignoreChangesRef.current = true;
      editorRef.current.setValue(code);
      latestCodeRef.current = code;
      ignoreChangesRef.current = false;

      editorRef.current.setCursor(cursor);
      editorRef.current.scrollTo(scrollInfo.left, scrollInfo.top);
    };

    socket.on(ACTIONS.CODE_CHANGE, handleIncomingChange);

    return () => {
      socket.off(ACTIONS.CODE_CHANGE, handleIncomingChange);
    };
  }, [socketRef, roomId]); // Proper dependency array

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;