import { useState, useRef, useEffect } from "react";
import styles from "./MemoPage.module.css";
import ConfirmModal from "../common/ConfirmModal";
import {
  getMemosAPI,
  createMemoAPI,
  toggleMemoAPI,
  deleteMemoAPI,
  type MemoItem,
} from "../../api/memo";

export default function MemoPage() {
  const [items, setItems] = useState<MemoItem[]>([]);
  const [input, setInput] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  useEffect(() => {
    getMemosAPI()
      .then(setItems)
      .catch(() => showError("목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!input.trim()) return;
    try {
      const newItem = await createMemoAPI(input.trim());
      setItems((prev) => [newItem, ...prev]);
      setInput("");
      inputRef.current?.focus();
    } catch {
      showError("추가에 실패했습니다.");
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const updated = await toggleMemoAPI(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      showError("상태 변경에 실패했습니다.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId === null) return;
    try {
      await deleteMemoAPI(deleteTargetId);
      setItems((prev) => prev.filter((item) => item.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch {
      showError("삭제에 실패했습니다.");
      setDeleteTargetId(null);
    }
  };

  const sorted = [
    ...items.filter((item) => !item.done),
    ...items.filter((item) => item.done),
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>메모</h2>
        <p className={styles.empty}>불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>메모</h2>
      {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}

      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="추가할 내용을 입력하세요"
          maxLength={50}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button className={styles.addBtn} onClick={handleAdd}>
          추가
        </button>
      </div>

      <ul className={styles.list}>
        {sorted.map((item) => (
          <li key={item.id} className={styles.item}>
            <button
              className={`${styles.checkbox} ${item.done ? styles.checkboxDone : ""}`}
              onClick={() => handleToggle(item.id)}
            >
              {item.done && <span className={styles.checkmark}>✓</span>}
            </button>
            <span className={`${styles.itemText} ${item.done ? styles.itemTextDone : ""}`}>
              {item.text}
            </span>
            <button
              className={styles.deleteBtn}
              onClick={() => setDeleteTargetId(item.id)}
            >
              삭제
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <p className={styles.empty}>할 일이 없습니다.</p>
        )}
      </ul>
      {deleteTargetId !== null && (
        <ConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
