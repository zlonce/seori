import { useState, useRef } from "react";
import styles from "./MemoPage.module.css";

interface MemoItem {
  id: number;
  text: string;
  done: boolean;
}

// TODO: API 연결 시 제거
const DUMMY_ITEMS: MemoItem[] = [
  { id: 1, text: "설탕", done: false },
  { id: 2, text: "쌈장", done: false },
  { id: 3, text: "마늘", done: true },
];

export default function MemoPage() {
  const [items, setItems] = useState<MemoItem[]>(DUMMY_ITEMS);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!input.trim()) return;
    setItems((prev) => [
      { id: Date.now(), text: input.trim(), done: false },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const handleToggle = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const sorted = [
    ...items.filter((item) => !item.done),
    ...items.filter((item) => item.done),
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>메모</h2>

      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="추가할 내용을 입력하세요"
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
              onClick={() => handleDelete(item.id)}
            >
              삭제
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <p className={styles.empty}>할 일이 없습니다.</p>
        )}
      </ul>
    </div>
  );
}
