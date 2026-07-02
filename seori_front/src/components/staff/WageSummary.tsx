import { useState } from "react";
import type { WorkRecordResponse } from "../../api/workRecord";
import { deleteWorkRecordAPI } from "../../api/workRecord";
import WorkRecordModal from "./WorkRecordModal";
import styles from "./WageSummary.module.css";

interface Props {
  records: WorkRecordResponse[];
  onRefresh: () => void;
}

export default function WageSummary({ records, onRefresh }: Props) {
  const [modalRecord, setModalRecord] = useState<WorkRecordResponse | null>(
    null,
  );
  const totalRegularMinutes = records.reduce((s, r) => s + r.regularMinutes, 0);
  const totalOvertimeMinutes = records.reduce((s, r) => s + r.overtimeMinutes, 0);
  const totalWage = records.reduce((s, r) => s + r.totalWage, 0);

  const fmt = (min: number) => `${Math.floor(min / 60)}H ${min % 60}M`;
  const fmtWage = (w: number) => w.toLocaleString("ko-KR") + "원";

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.label}>정규 근무시간</span>
          <span className={styles.value}>{fmt(totalRegularMinutes)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.label}>초과 근무시간</span>
          <span className={styles.value}>{fmt(totalOvertimeMinutes)}</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
          <span className={`${styles.label} ${styles.labelBold}`}>
            예상 월급
          </span>
          <span className={styles.totalWage}>{fmtWage(totalWage)}</span>
        </div>
      </div>

      <div className={styles.list}>
        {records.length === 0 && (
          <p className={styles.empty}>이번 달 근무 기록이 없습니다.</p>
        )}
        {records.map((r) => (
          <button
            key={r.id}
            className={styles.card}
            type="button"
            onClick={() => setModalRecord(r)}
          >
            <div className={styles.cardLeft}>
              <span className={styles.date}>{r.workDate}</span>
              {r.specialDay && (
                <span className={styles.specialBadge}>추가수당일</span>
              )}
              <span className={styles.time}>
                {r.startTime} ~ {r.endTime}
              </span>
            </div>
            <div className={styles.cardRight}>
              <span className={styles.cardWage}>{fmtWage(r.totalWage)}</span>
              {r.overtimeMinutes > 0 && (
                <span className={styles.overtime}>
                  초과 {fmt(r.overtimeMinutes)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {modalRecord && (
        <WorkRecordModal
          date={modalRecord.workDate}
          record={modalRecord}
          onClose={() => setModalRecord(null)}
          onSaved={() => {
            setModalRecord(null);
            onRefresh();
          }}
          onDelete={async () => {
            await deleteWorkRecordAPI(modalRecord.id);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
