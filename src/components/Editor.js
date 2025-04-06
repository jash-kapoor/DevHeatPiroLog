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

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: 'javascript', json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }

        init();
    }, [onCodeChange, roomId, socketRef]);

    useEffect(() => {
        const socket = socketRef.current;
        if (socket) {
            socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null && editorRef.current) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socket?.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef]);

    return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
