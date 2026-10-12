import { useState } from "react";
import { confirmScheduleAPI, reopenVotingAPI } from "../../api/schedule";
import type { ScheduleWeek, ScheduleWeekDetail } from "../../api/schedule";
import ConfirmModal from "../common/ConfirmModal";
import { DAY_KO, formatShort } from "./scheduleUtils";
import VoteTable from "./VoteTable";
import styles from "./SchedulePage.module.css";

interface Props {
  currentDetail: ScheduleWeekDetail;
  businessDates: Array<{ date: string; dayIdx: number }>;
  myId: string;
  isManagerOrAbove: boolean;
  onRefreshDetail: () => Promise<void>;
  onUpdateWeekInfo: (updated: ScheduleWeek) => void;
  onError: (msg: string) => void;
}

export default function ClosedView({
  currentDetail,
  businessDates,
  myId,
  isManagerOrAbove,
  onRefreshDetail,
  onUpdateWeekInfo,
  onError,
}: Props) {
  const [draftAssign, setDraftAssign] = useState<Set<string>>(new Set());
  const [confirmingReopen, setConfirmingReopen] = useState(false);
  const [confirmingSchedule, setConfirmingSchedule] = useState(false);

  const votesFor = (date: string) =>
    currentDetail.votes.filter((v) => v.availableDate === date);

  const toggleDraft = (userId: string, date: string) => {
    const key = `${userId}:${date}`;
    setDraftAssign((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleConfirm = async () => {
    setConfirmingSchedule(false);
    const assignments = Array.from(draftAssign).map((key) => {
      const [userId, workDate] = key.split(":");
      return { userId, workDate };
    });
    try {
      await confirmScheduleAPI(currentDetail.id, assignments);
      await onRefreshDetail();
    } catch {
      onError("일정 확정에 실패했습니다.");
    }
  };

  const handleReopen = async () => {
    setConfirmingReopen(false);
    try {
      const updated = await reopenVotingAPI(currentDetail.id);
      onUpdateWeekInfo(updated);
    } catch {
      onError("투표 재개에 실패했습니다.");
    }
  };

  return (
    <>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>투표 현황</h3>
        <VoteTable businessDates={businessDates} votesFor={votesFor} myId={myId} />
      </div>

      {!isManagerOrAbove ? (
        <p className={styles.waitMsg}>일정 확정을 기다리는 중입니다.</p>
      ) : (
        <>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>일정 배정</h3>
            <p className={styles.assignHint}>투표한 직원을 눌러 배정하세요.</p>
            <div className={styles.dateRows}>
              {businessDates.map(({ date, dayIdx }) => {
                const dayVotes = votesFor(date);
                return (
                  <div key={date} className={styles.dateRow}>
                    <div className={styles.dateLabel}>
                      <span className={styles.dayNameBold}>{DAY_KO[dayIdx]}</span>
                      <span className={styles.daySmDate}>{formatShort(date)}</span>
                    </div>
                    <div className={styles.tagRow}>
                      {dayVotes.length === 0 ? (
                        <span className={styles.noOne}>투표 없음</span>
                      ) : (
                        dayVotes.map((v) => {
                          const on = draftAssign.has(`${v.userId}:${date}`);
                          return (
                            <button
                              key={v.userId}
                              className={`${styles.assignTag} ${on ? styles.assignTagOn : ""}`}
                              onClick={() => toggleDraft(v.userId, date)}
                            >
                              {v.userName}
                              {on && <span className={styles.check}> ✓</span>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button className={styles.confirmBtn} onClick={() => setConfirmingSchedule(true)}>
            일정 확정
          </button>
          <button className={styles.reopenBtn} onClick={() => setConfirmingReopen(true)}>
            투표 다시 열기
          </button>
          {confirmingSchedule && (
            <ConfirmModal
              message="일정을 확정하시겠어요?"
              confirmLabel="확정"
              onConfirm={handleConfirm}
              onCancel={() => setConfirmingSchedule(false)}
            />
          )}
          {confirmingReopen && (
            <ConfirmModal
              message="투표를 다시 여시겠어요?"
              confirmLabel="다시 열기"
              onConfirm={handleReopen}
              onCancel={() => setConfirmingReopen(false)}
            />
          )}
        </>
      )}
    </>
  );
}
