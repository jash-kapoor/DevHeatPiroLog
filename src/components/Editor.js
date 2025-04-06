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

  useEffect(() => {
    const editor = Codemirror.fromTextArea(
      document.getElementById('realtimeEditor'),
      {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      }
    );

    editor.on('change', (instance, changes) => {
      const code = instance.getValue();
      onCodeChange(code);
      
      // Only emit if the change came from user input
      if (!ignoreChangesRef.current && changes.origin !== 'setValue') {
        socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code,
        });
      }
    });

    editorRef.current = editor;

    return () => {
      editor.toTextArea();
    };
  }, [roomId]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleCodeChange = ({ code }) => {
      if (code !== null && editorRef.current) {
        ignoreChangesRef.current = true;
        editorRef.current.setValue(code);
        ignoreChangesRef.current = false;
      }
    };

    socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

    return () => {
      socketRef.current?.off(ACTIONS.CODE_CHANGE, handleCodeChange);
    };
  }, [socketRef.current, roomId]);

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;