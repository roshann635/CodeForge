import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';

export const CodeEditor = ({ code, language, onChange }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    let langExtension = javascript();
    if (language === 'python') langExtension = python();
    if (language === 'cpp') langExtension = cpp();
    if (language === 'java') langExtension = java();

    const startState = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        langExtension,
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": { height: "100%", fontSize: "14px" },
          ".cm-scroller": { overflow: "auto" }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]); // Only recreate editor if language changes to bind new extensions easily

  // Effect to update doc if code prop changes externally (e.g. template reload)
  useEffect(() => {
    if (viewRef.current && code !== viewRef.current.state.doc.toString()) {
       viewRef.current.dispatch({
         changes: { from: 0, to: viewRef.current.state.doc.length, insert: code }
       });
    }
  }, [code]);

  return <div className="code-editor" ref={editorRef} style={{ height: '100%', width: '100%' }}></div>;
};
