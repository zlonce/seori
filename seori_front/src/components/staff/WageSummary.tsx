import { useState } from "react";
import type { WorkShiftResponse } from "../../api/workShift";
import { deleteWorkShiftAPI } from "../../api/workShift";
import WorkRecordModal from "./WorkRecordModal";
import styles from "./WageSummary.module.css";

interface Props {
  records: WorkShiftResponse[];
  onRefresh: () => void;
}

export default function WageSummary({ records, onRefresh }: Props) {
  const [modalRecord, setModalRecord] = useState<WorkShiftResponse | null>(
    null,
  );
  const workedRecords = records.filter((r) => r.startTime !== null);
  const totalRegularMinutes = workedRecords.reduce((s, r) => s + r.regularMinutes, 0);
  const totalOvertimeMinutes = workedRecords.reduce((s, r) => s + r.overtimeMinutes, 0);
  const totalWage = workedRecords.reduce((s, r) => s + r.totalWage, 0);

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
        {workedRecords.length === 0 && (
          <p className={styles.empty}>이번 달 근무 기록이 없습니다.</p>
        )}
        {workedRecords.map((r) => (
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
            await deleteWorkShiftAPI(modalRecord.id);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
