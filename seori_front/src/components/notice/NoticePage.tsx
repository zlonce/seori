import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Editor from "@toast-ui/editor";
import { useAuth } from "../../hooks/useAuth";
import NoticeEditor from "./NoticeEditor";
import NoticeViewer from "./NoticeViewer";
import styles from "./NoticePage.module.css";

interface Notice {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

// TODO: API 연결 시 제거
const DUMMY_NOTICES: Notice[] = [
  {
    id: 1,
    title: "신입 직원 안내사항",
    content:
      "## 환영합니다!\n\n새로운 직원 여러분을 환영합니다.\n\n### 기본 규칙\n\n- 출근 시 유니폼 착용 필수\n- 지각 시 미리 연락\n- 근무 기록은 당일 등록",
    authorName: "사장님",
    createdAt: "2024-06-01",
  },
  {
    id: 2,
    title: "6월 공지사항",
    content: "## 6월 주요 공지\n\n6월 한 달간 매장 운영 관련 안내드립니다.\n\n- 토요일 영업시간 변경: 오전 11시 오픈\n- 공휴일 추가 수당 지급 예정",
    authorName: "매니저",
    createdAt: "2024-06-10",
  },
];

type View = "list" | "detail" | "create" | "edit";

export default function NoticePage() {
  const { user } = useAuth();
  const canWrite =
    user?.role === "ROLE_OWNER" || user?.role === "ROLE_MANAGER";

  const [notices, setNotices] = useState<Notice[]>(DUMMY_NOTICES);
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Notice | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const editorRef = useRef<Editor | null>(null);

  const openDetail = (notice: Notice) => {
    setSelected(notice);
    setView("detail");
  };

  const openCreate = () => {
    setTitleInput("");
    setView("create");
  };

  const openEdit = (notice: Notice) => {
    setTitleInput(notice.title);
    setSelected(notice);
    setView("edit");
  };

  const handleSave = () => {
    const content = editorRef.current?.getMarkdown() ?? "";
    if (!titleInput.trim() || !content.trim()) return;

    if (view === "create") {
      const newNotice: Notice = {
        id: Date.now(),
        title: titleInput.trim(),
        content,
        authorName: user?.userId ?? "",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setNotices((prev) => [newNotice, ...prev]);
      setView("list");
    } else if (view === "edit" && selected) {
      setNotices((prev) =>
        prev.map((n) =>
          n.id === selected.id
            ? { ...n, title: titleInput.trim(), content }
            : n
        )
      );
      setSelected((prev) =>
        prev ? { ...prev, title: titleInput.trim(), content } : null
      );
      setView("detail");
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setNotices((prev) => prev.filter((n) => n.id !== id));
    setView("list");
  };

  if (view === "list") {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>공지</h2>
          {canWrite && (
            <button className={styles.writeBtn} onClick={openCreate}>
              + 작성
            </button>
          )}
        </div>
        {notices.length === 0 && (
          <p className={styles.empty}>등록된 공지가 없습니다.</p>
        )}
        <ul className={styles.list}>
          {notices.map((n) => (
            <li key={n.id} className={styles.card} onClick={() => openDetail(n)}>
              <span className={styles.cardTitle}>{n.title}</span>
              <div className={styles.cardMeta}>
                <span>{n.authorName}</span>
                <span>{n.createdAt}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (view === "detail" && selected) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => setView("list")}>
            <ChevronLeft size={18} />
            공지
          </button>
          {canWrite && (
            <div className={styles.actionBtns}>
              <button className={styles.editBtn} onClick={() => openEdit(selected)}>
                수정
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(selected.id)}>
                삭제
              </button>
            </div>
          )}
        </div>
        <h2 className={styles.detailTitle}>{selected.title}</h2>
        <div className={styles.detailMeta}>
          <span>{selected.authorName}</span>
          <span>{selected.createdAt}</span>
        </div>
        <div className={styles.viewerWrap}>
          <NoticeViewer content={selected.content} />
        </div>
      </div>
    );
  }

  if (view === "create" || view === "edit") {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            className={styles.backBtn}
            onClick={() => setView(view === "edit" ? "detail" : "list")}
          >
            <ChevronLeft size={18} />
            {view === "edit" ? "돌아가기" : "공지"}
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            저장
          </button>
        </div>
        <input
          className={styles.titleInput}
          placeholder="제목을 입력하세요"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
        />
        <div className={styles.editorWrap}>
          <NoticeEditor
            key={view === "edit" ? selected?.id : "new"}
            initialValue={view === "edit" ? selected?.content : ""}
            editorRef={editorRef}
          />
        </div>
      </div>
    );
  }

  return null;
}
