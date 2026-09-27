import { useState } from "react";
import type { WorkShiftResponse } from "../../api/workShift";
import { deleteWorkShiftAPI } from "../../api/workShift";
import WorkRecordModal from "./WorkRecordModal";
import styles from "./WorkTimeList.module.css";

interface Props {
  records: WorkShiftResponse[];
  onRefresh: () => void;
}

export default function WorkTimeList({ records, onRefresh }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [editRecord, setEditRecord] = useState<WorkShiftResponse | null>(null);

  const completed = records
    .filter((r) => r.startTime !== null)
    .sort((a, b) => a.workDate.localeCompare(b.workDate));

  return (
    <div className={styles.section}>
      <button className={styles.toggle} onClick={() => setExpanded((v) => !v)}>
        <span>근무 목록</span>
        <span className={styles.toggleArrow}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        completed.length === 0 ? (
          <p className={styles.empty}>완료된 근무 기록이 없습니다.</p>
        ) : (
          <div className={styles.list}>
            {completed.map((r) => (
              <button
                key={r.id}
                className={styles.row}
                onClick={() => setEditRecord(r)}
              >
                <span className={styles.date}>{r.workDate}</span>
                <span className={styles.time}>
                  {r.startTime} ~ {r.endTime}
                </span>
              </button>
            ))}
          </div>
        )
      )}

      {editRecord && (
        <WorkRecordModal
          date={editRecord.workDate}
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onSaved={() => {
            setEditRecord(null);
            onRefresh();
          }}
          onDelete={async () => {
            await deleteWorkShiftAPI(editRecord.id);
            setEditRecord(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
