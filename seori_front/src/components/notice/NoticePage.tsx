import { useRef, useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import Editor from "@toast-ui/editor";
import { useAuth } from "../../hooks/useAuth";
import NoticeEditor from "./NoticeEditor";
import NoticeViewer from "./NoticeViewer";
import ConfirmModal from "../common/ConfirmModal";
import {
  getNoticesAPI,
  getNoticeAPI,
  createNoticeAPI,
  updateNoticeAPI,
  deleteNoticeAPI,
  type NoticeSummary,
  type NoticeDetail,
} from "../../api/notice";
import styles from "./NoticePage.module.css";

type View = "list" | "detail" | "create" | "edit";

export default function NoticePage() {
  const { user } = useAuth();
  const canWrite =
    user?.role === "ROLE_OWNER" || user?.role === "ROLE_MANAGER";

  const [notices, setNotices] = useState<NoticeSummary[]>([]);
  const [selected, setSelected] = useState<NoticeDetail | null>(null);
  const [view, setView] = useState<View>("list");
  const [titleInput, setTitleInput] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  useEffect(() => {
    getNoticesAPI()
      .then(setNotices)
      .catch(() => showError("목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (id: number) => {
    try {
      const detail = await getNoticeAPI(id);
      setSelected(detail);
      setView("detail");
    } catch {
      showError("공지를 불러오지 못했습니다.");
    }
  };

  const openCreate = () => {
    if (!canWrite) return;
    setTitleInput("");
    setView("create");
  };

  const openEdit = () => {
    if (!canWrite || !selected) return;
    setTitleInput(selected.title);
    setView("edit");
  };

  const handleSave = async () => {
    const content = editorRef.current?.getMarkdown() ?? "";
    if (!titleInput.trim() || !content.trim()) return;

    try {
      if (view === "create") {
        const created = await createNoticeAPI(titleInput.trim(), content);
        setNotices((prev) => [
          { id: created.id, title: created.title, updatedAt: created.updatedAt },
          ...prev,
        ]);
        setView("list");
      } else if (view === "edit" && selected) {
        const updated = await updateNoticeAPI(selected.id, titleInput.trim(), content);
        setNotices((prev) =>
          [...prev.map((n) =>
            n.id === updated.id
              ? { id: updated.id, title: updated.title, updatedAt: updated.updatedAt }
              : n
          )].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        );
        setSelected(updated);
        setView("detail");
      }
    } catch {
      showError("저장에 실패했습니다.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId === null) return;
    try {
      await deleteNoticeAPI(deleteTargetId);
      setNotices((prev) => prev.filter((n) => n.id !== deleteTargetId));
      setDeleteTargetId(null);
      setView("list");
    } catch {
      showError("삭제에 실패했습니다.");
      setDeleteTargetId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>공지</h2>
        <p className={styles.empty}>불러오는 중...</p>
      </div>
    );
  }

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
        {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
        {notices.length === 0 && (
          <p className={styles.empty}>등록된 공지가 없습니다.</p>
        )}
        <ul className={styles.list}>
          {notices.map((n) => (
            <li key={n.id} className={styles.card} onClick={() => openDetail(n.id)}>
              <span className={styles.cardTitle}>{n.title}</span>
              <div className={styles.cardMeta}>
                <span>{n.updatedAt}</span>
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
              <button className={styles.editBtn} onClick={openEdit}>
                수정
              </button>
              <button className={styles.deleteBtn} onClick={() => setDeleteTargetId(selected.id)}>
                삭제
              </button>
            </div>
          )}
        </div>
        {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
        <h2 className={styles.detailTitle}>{selected.title}</h2>
        <div className={styles.detailMeta}>
          <span>작성 {selected.createdAt}</span>
          {selected.createdAt !== selected.updatedAt && (
            <span>수정 {selected.updatedAt}</span>
          )}
        </div>
        <div className={styles.viewerWrap}>
          <NoticeViewer content={selected.content} />
        </div>
        {deleteTargetId !== null && (
          <ConfirmModal
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTargetId(null)}
          />
        )}
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
        {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
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
