import { useState } from "react";
import type { WorkRecordResponse } from "../../api/workRecord";
import { deleteWorkRecordAPI } from "../../api/workRecord";

import WorkRecordModal from "./WorkRecordModal";
import styles from "./WorkCalendar.module.css";

interface Props {
  year: number;
  month: number;
  records: WorkRecordResponse[];
  specialDates: Set<string>;
  onRefresh: () => void;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const STATUS_COLOR = {
  COMPLETED: "#2196F3",
  INCOMPLETE: "#FF9800",
  SCHEDULED: "#4CAF50",
} as const;

export default function WorkCalendar({
  year,
  month,
  records,
  specialDates,
  onRefresh,
}: Props) {
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editRecord, setEditRecord] = useState<WorkRecordResponse | undefined>(
    undefined,
  );
  const [toast, setToast] = useState("");

  const recordMap = new Map<string, WorkRecordResponse>();
  records.forEach((r) => recordMap.set(r.workDate, r));

  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const toDateStr = (day: number) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const handleCellClick = (day: number) => {
    const dateStr = toDateStr(day);
    const record = recordMap.get(dateStr);

    if (record) {
      setEditRecord(record);
      setModalDate(dateStr);
      return;
    }

    if (dateStr > todayStr) {
      setToast("미래 날짜에는 근무 기록을 추가할 수 없습니다.");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    setEditRecord(undefined);
    setModalDate(dateStr);
  };

  const handleDelete = async (
    e: React.MouseEvent,
    record: WorkRecordResponse,
  ) => {
    e.stopPropagation();
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await deleteWorkRecordAPI(record.id);
      onRefresh();
    } catch {
      setToast("삭제에 실패했습니다.");
      setTimeout(() => setToast(""), 2500);
    }
  };

  return (
    <div>
      {toast && (
        <div className={styles.errorToast}>{toast}</div>
      )}

      <div className={styles.dayHeader}>
        {DAY_LABELS.map((d, i) => (
          <div
            key={d}
            className={styles.dayLabel}
            style={{
              color: i === 0 ? "#e53935" : i === 6 ? "#1976D2" : "#666",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className={styles.emptyCell} />;
          const dateStr = toDateStr(day);
          const record = recordMap.get(dateStr);
          const isSpecial = specialDates.has(dateStr);
          const isToday = todayStr === dateStr;
          const isPast = dateStr < todayStr;
          const isFuture = dateStr > todayStr;
          const isSun = idx % 7 === 0;
          const isSat = idx % 7 === 6;

          return (
            <button
              key={idx}
              className={styles.cell}
              style={{
                background: isToday ? "#fff8f8" : "#fff",
                opacity: isFuture ? 0.5 : 1,
              }}
              onClick={() => handleCellClick(day)}
              onContextMenu={
                record
                  ? (e) => {
                      e.preventDefault();
                      handleDelete(e, record);
                    }
                  : undefined
              }
            >
              <span
                className={styles.dayNum}
                style={{
                  color: isSpecial
                    ? "#e53935"
                    : record
                      ? "#fff"
                      : isSun
                        ? "#e53935"
                        : isSat
                          ? "#1976D2"
                          : "#1a1a1a",
                  fontWeight: isSpecial || record ? 700 : 400,
                  background: record
                    ? STATUS_COLOR[record.status] + "CC"
                    : "transparent",
                }}
              >
                {day}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.legend}>
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <div key={status} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: color }} />
            <span>
              {status === "COMPLETED"
                ? "근무완료"
                : status === "INCOMPLETE"
                  ? "시간미입력"
                  : "예정"}
            </span>
          </div>
        ))}
        <div className={styles.legendItem}>
          <span className={styles.legendSpecial}>날짜</span>
          <span>&nbsp;= 추가수당일</span>
        </div>
      </div>

      {modalDate && (
        <WorkRecordModal
          date={modalDate}
          record={editRecord}
          onClose={() => setModalDate(null)}
          onSaved={onRefresh}
          onDelete={editRecord ? async () => { await deleteWorkRecordAPI(editRecord.id); onRefresh(); } : undefined}
        />
      )}
    </div>
  );
}
