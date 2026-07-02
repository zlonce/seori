import { useEffect, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

interface Props {
  content: string;
}

export default function NoticeViewer({ content }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    instanceRef.current = Editor.factory({
      el: containerRef.current,
      viewer: true,
      initialValue: content,
    });

    return () => {
      instanceRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    instanceRef.current?.setMarkdown(content);
  }, [content]);

  return <div ref={containerRef} />;
}
