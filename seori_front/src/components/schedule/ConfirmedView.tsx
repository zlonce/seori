import { useState } from "react";
import { confirmScheduleAPI } from "../../api/schedule";
import type { ScheduleWeekDetail } from "../../api/schedule";
import type { StaffSummary } from "../../api/user";
import { DAY_KO, formatShort } from "./scheduleUtils";
import VoteTable from "./VoteTable";
import styles from "./SchedulePage.module.css";

interface Props {
  currentDetail: ScheduleWeekDetail;
  businessDates: Array<{ date: string; dayIdx: number }>;
  myId: string;
  isManagerOrAbove: boolean;
  staffList: StaffSummary[];
  onRefreshDetail: () => Promise<void>;
  onError: (msg: string) => void;
}

export default function ConfirmedView({
  currentDetail,
  businessDates,
  myId,
  isManagerOrAbove,
  staffList,
  onRefreshDetail,
  onError,
}: Props) {
  const [editingConfirmed, setEditingConfirmed] = useState(false);
  const [draftAssign, setDraftAssign] = useState<Set<string>>(new Set());
  const [showVoteHistory, setShowVoteHistory] = useState(false);

  const votesFor = (date: string) =>
    currentDetail.votes.filter((v) => v.availableDate === date);

  const assignedFor = (date: string) =>
    currentDetail.assignments.filter((a) => a.workDate === date);

  const toggleDraft = (userId: string, date: string) => {
    const key = `${userId}:${date}`;
    setDraftAssign((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openEditConfirmed = () => {
    setDraftAssign(
      new Set(currentDetail.assignments.map((a) => `${a.userId}:${a.workDate}`)),
    );
    setEditingConfirmed(true);
  };

  const handleSaveConfirmedEdit = async () => {
    const assignments = Array.from(draftAssign).map((key) => {
      const [userId, workDate] = key.split(":");
      return { userId, workDate };
    });
    try {
      await confirmScheduleAPI(currentDetail.id, assignments);
      await onRefreshDetail();
      setEditingConfirmed(false);
    } catch {
      onError("일정 수정에 실패했습니다.");
    }
  };

  return (
    <>
      <div className={styles.section}>
        <div className={styles.confirmedHeader}>
          <h3 className={styles.sectionTitle}>확정 일정</h3>
          {isManagerOrAbove && !editingConfirmed && (
            <button className={styles.editConfirmedBtn} onClick={openEditConfirmed}>
              수정
            </button>
          )}
        </div>

        {!editingConfirmed ? (
          <div className={styles.dateRows}>
            {businessDates.map(({ date, dayIdx }) => {
              const assigned = assignedFor(date);
              return (
                <div key={date} className={styles.dateRow}>
                  <div className={styles.dateLabel}>
                    <span className={styles.dayNameBold}>{DAY_KO[dayIdx]}</span>
                    <span className={styles.daySmDate}>{formatShort(date)}</span>
                  </div>
                  <div className={styles.tagRow}>
                    {assigned.length === 0 ? (
                      <span className={styles.restDay}>없음</span>
                    ) : (
                      assigned.map((a) => (
                        <span key={a.userId} className={styles.confirmedName}>
                          {a.userName}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <p className={styles.assignHint}>
              배정할 직원을 눌러 수정하세요. (투표하지 않은 직원도 배정 가능)
            </p>
            <div className={styles.dateRows}>
              {businessDates.map(({ date, dayIdx }) => (
                <div key={date} className={styles.dateRow}>
                  <div className={styles.dateLabel}>
                    <span className={styles.dayNameBold}>{DAY_KO[dayIdx]}</span>
                    <span className={styles.daySmDate}>{formatShort(date)}</span>
                  </div>
                  <div className={styles.tagRow}>
                    {[...staffList]
                      .sort((a, b) => {
                        const aVoted = votesFor(date).some((v) => v.userId === a.userId);
                        const bVoted = votesFor(date).some((v) => v.userId === b.userId);
                        return aVoted === bVoted ? 0 : aVoted ? -1 : 1;
                      })
                      .map((s) => {
                        const on = draftAssign.has(`${s.userId}:${date}`);
                        const voted = votesFor(date).some((v) => v.userId === s.userId);
                        return (
                          <button
                            key={s.userId}
                            className={`${styles.assignTag} ${on ? styles.assignTagOn : voted ? styles.assignTagVoted : ""}`}
                            onClick={() => toggleDraft(s.userId, date)}
                          >
                            {s.name}
                            {on && <span className={styles.check}> ✓</span>}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={() => setEditingConfirmed(false)}>
                취소
              </button>
              <button className={styles.submitBtn} onClick={handleSaveConfirmedEdit}>
                저장
              </button>
            </div>
          </>
        )}
      </div>

      <div className={styles.section}>
        <button
          className={styles.voteHistoryToggle}
          onClick={() => setShowVoteHistory((v) => !v)}
        >
          <span>투표 기록</span>
          <span className={styles.toggleArrow}>{showVoteHistory ? "▲" : "▼"}</span>
        </button>
        {showVoteHistory && (
          <div className={styles.voteHistoryBody}>
            <VoteTable businessDates={businessDates} votesFor={votesFor} myId={myId} />
          </div>
        )}
      </div>
    </>
  );
}
