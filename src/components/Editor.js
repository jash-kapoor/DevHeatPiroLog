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
  const ignoreChangesRef = useRef(false);
  const latestCodeRef = useRef(''); // Stores the latest code value

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

    // Handle editor changes
    const handleChange = (instance, changes) => {
      const code = instance.getValue();
      latestCodeRef.current = code;
      onCodeChange(code);
      
      // Only emit if change came from user input
      if (!ignoreChangesRef.current && changes.origin !== 'setValue') {
        socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code,
        });
      }
    };

    editor.on('change', handleChange);
    editorRef.current = editor;

    // Cleanup
    return () => {
      editor.off('change', handleChange);
      editor.toTextArea();
    };
  }, [onCodeChange, roomId]);

  // Handle incoming code changes
  useEffect(() => {
    if (!socketRef.current) return;

    const handleIncomingChange = ({ code }) => {
      if (!editorRef.current || code === null || code === latestCodeRef.current) {
        return;
      }

      // Save cursor position
      const cursor = editorRef.current.getCursor();
      const scrollInfo = editorRef.current.getScrollInfo();

      // Update editor content
      ignoreChangesRef.current = true;
      editorRef.current.setValue(code);
      latestCodeRef.current = code;
      ignoreChangesRef.current = false;

      // Restore cursor position
      editorRef.current.setCursor(cursor);
      editorRef.current.scrollTo(scrollInfo.left, scrollInfo.top);
    };

    socketRef.current.on(ACTIONS.CODE_CHANGE, handleIncomingChange);

    // Cleanup
    return () => {
      socketRef.current?.off(ACTIONS.CODE_CHANGE, handleIncomingChange);
    };
  }, [socketRef.current, roomId]);

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;