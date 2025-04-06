import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const lastCode = useRef('');

  // Initialize CodeMirror editor
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

    // Handle local changes
    editor.on('change', (instance, changes) => {
      const code = instance.getValue();
      lastCode.current = code;
      onCodeChange(code);
      
      // Only emit if change is from user input
      if (!isRemoteChange.current && changes.origin !== 'setValue') {
        socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code,
        });
      }
      isRemoteChange.current = false;
    });

    editorRef.current = editor;

    return () => {
      editor.toTextArea();
    };
  }, [onCodeChange, roomId]);

  // Handle incoming changes from other clients
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleCodeChange = ({ code }) => {
      if (!editorRef.current || !code || code === lastCode.current) return;
      
      // Save cursor and scroll position
      const cursor = editorRef.current.getCursor();
      const scrollInfo = editorRef.current.getScrollInfo();
      
      // Update editor content
      isRemoteChange.current = true;
      editorRef.current.setValue(code);
      lastCode.current = code;
      
      // Restore cursor and scroll position
      editorRef.current.setCursor(cursor);
      editorRef.current.scrollTo(scrollInfo.left, scrollInfo.top);
    };

    socket.on(ACTIONS.CODE_CHANGE, handleCodeChange);

    return () => {
      socket.off(ACTIONS.CODE_CHANGE, handleCodeChange);
    };
  }, [socketRef.current, roomId]);

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;