import { useEffect, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

interface Props {
  initialValue?: string;
  editorRef: React.MutableRefObject<Editor | null>;
}

export default function NoticeEditor({ initialValue = "", editorRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = new Editor({
      el: containerRef.current,
      height: "400px",
      initialEditType: "wysiwyg",
      hideModeSwitch: true,
      initialValue,
      toolbarItems: [
        ["heading", "bold", "italic", "strike"],
        ["ul", "ol"],
        ["link", "hr"],
      ],
    });

    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  return <div ref={containerRef} />;
}
