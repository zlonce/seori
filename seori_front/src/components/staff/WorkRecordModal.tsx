import { useState } from "react";
import type { WorkRecordResponse } from "../../api/workRecord";
import { createWorkRecordAPI, updateWorkRecordAPI } from "../../api/workRecord";
import styles from "./WorkRecordModal.module.css";

interface Props {
  date: string;
  record?: WorkRecordResponse;
  onClose: () => void;
  onSaved: () => void;
  onDelete?: () => Promise<void>;
}

const DEFAULT_START = "18:30";
const DEFAULT_END = "22:00";

export default function WorkRecordModal({ date, record, onClose, onSaved, onDelete }: Props) {
  const [startTime, setStartTime] = useState(record?.startTime ?? DEFAULT_START);
  const [endTime, setEndTime] = useState(record?.endTime ?? DEFAULT_END);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm("이 근무 기록을 삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      await onDelete();
      onClose();
    } catch {
      setError("삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      if (record) {
        await updateWorkRecordAPI(record.id, { startTime, endTime });
      } else {
        await createWorkRecordAPI({ workDate: date, startTime, endTime });
      }
      onSaved();
      onClose();
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{date} 근무 기록</h3>
          {record && onDelete && (
            <button className={styles.deleteBtn} onClick={handleDelete} disabled={loading} title="삭제">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.timeRow}>
          <div className={styles.field}>
            <label className={styles.label}>출근</label>
            <input className={styles.input} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <span className={styles.dash}>~</span>
          <div className={styles.field}>
            <label className={styles.label}>퇴근</label>
            <input className={styles.input} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.buttons}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>취소</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
