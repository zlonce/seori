import { useState, useEffect } from "react";
import { closeVotingAPI, saveVotesAPI } from "../../api/schedule";
import type { ScheduleWeek, ScheduleWeekDetail } from "../../api/schedule";
import { DAY_KO } from "./scheduleUtils";
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

export default function VotingView({
  currentDetail,
  businessDates,
  myId,
  isManagerOrAbove,
  onRefreshDetail,
  onUpdateWeekInfo,
  onError,
}: Props) {
  const [localVoteSet, setLocalVoteSet] = useState<Set<string>>(new Set());
  const [voteDirty, setVoteDirty] = useState(false);

  useEffect(() => {
    setLocalVoteSet(
      new Set(
        currentDetail.votes
          .filter((v) => v.userId === myId)
          .map((v) => v.availableDate),
      ),
    );
    setVoteDirty(false);
  }, [currentDetail, myId]);

  const toggleMyVote = (date: string) => {
    setLocalVoteSet((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
    setVoteDirty(true);
  };

  const handleSaveVotes = async () => {
    try {
      await saveVotesAPI(currentDetail.id, Array.from(localVoteSet));
      await onRefreshDetail();
      setVoteDirty(false);
    } catch {
      onError("투표 저장에 실패했습니다.");
    }
  };

  const handleCloseVoting = async () => {
    try {
      const updated = await closeVotingAPI(currentDetail.id);
      onUpdateWeekInfo(updated);
    } catch {
      onError("투표 마감에 실패했습니다.");
    }
  };

  const votesFor = (date: string) =>
    currentDetail.votes.filter((v) => v.availableDate === date);

  return (
    <>
      {!isManagerOrAbove && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>내 투표</h3>
          <div className={styles.myVoteGrid}>
            {businessDates.map(({ date, dayIdx }) => (
              <button
                key={date}
                className={`${styles.dayBtn} ${localVoteSet.has(date) ? styles.dayBtnOn : ""}`}
                onClick={() => toggleMyVote(date)}
              >
                <span className={styles.dayBtnName}>{DAY_KO[dayIdx]}</span>
                <span className={styles.dayBtnDate}>
                  {new Date(date + "T00:00:00").getDate()}
                </span>
              </button>
            ))}
          </div>
          <button
            className={`${styles.saveVoteBtn} ${voteDirty ? styles.saveVoteBtnActive : ""}`}
            onClick={handleSaveVotes}
            disabled={!voteDirty}
          >
            저장하기
          </button>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>투표 현황</h3>
        <VoteTable businessDates={businessDates} votesFor={votesFor} myId={myId} />
      </div>

      {isManagerOrAbove && (
        <button className={styles.closeBtn} onClick={handleCloseVoting}>
          투표 마감
        </button>
      )}
    </>
  );
}
