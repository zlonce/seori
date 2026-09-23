import { useState } from "react";
import type { WorkShiftResponse } from "../../api/workShift";
import { deleteWorkShiftAPI } from "../../api/workShift";

import WorkRecordModal from "./WorkRecordModal";
import styles from "./WorkCalendar.module.css";

interface Props {
  year: number;
  month: number;
  records: WorkShiftResponse[];
  specialDates: Set<string>;
  onRefresh: () => void;
  restrictToScheduled?: boolean;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const COMPLETED_COLOR = "#2196F3";
const SCHEDULED_COLOR = "#4CAF50";

export default function WorkCalendar({
  year,
  month,
  records,
  specialDates,
  onRefresh,
  restrictToScheduled = false,
}: Props) {
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editRecord, setEditRecord] = useState<WorkShiftResponse | undefined>(
    undefined,
  );
  const [toast, setToast] = useState("");

  const recordMap = new Map<string, WorkShiftResponse>();
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

    if (dateStr > todayStr) {
      setToast(
        record
          ? "예정된 근무일입니다. 근무 후 실제 시간을 입력해주세요."
          : "미래 날짜에는 근무 기록을 추가할 수 없습니다.",
      );
      setTimeout(() => setToast(""), 2500);
      return;
    }

    if (!record && restrictToScheduled) {
      setToast("예정된 근무일에만 시간을 입력할 수 있습니다.");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    setEditRecord(record ?? undefined);
    setModalDate(dateStr);
  };

  const handleDelete = async (
    e: React.MouseEvent,
    record: WorkShiftResponse,
  ) => {
    e.stopPropagation();
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await deleteWorkShiftAPI(record.id);
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
                    ? (record.startTime ? COMPLETED_COLOR : SCHEDULED_COLOR) + "CC"
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
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: COMPLETED_COLOR }} />
          <span>근무완료</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: SCHEDULED_COLOR }} />
          <span>예정</span>
        </div>
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
          onDelete={editRecord ? async () => { await deleteWorkShiftAPI(editRecord.id); onRefresh(); } : undefined}
        />
      )}
    </div>
  );
}
