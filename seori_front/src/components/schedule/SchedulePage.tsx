import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  getWeeksAPI,
  getWeekDetailAPI,
  createWeekAPI,
  updateBusinessDaysAPI,
  closeVotingAPI,
  confirmScheduleAPI,
  saveVotesAPI,
  type ScheduleWeek,
  type ScheduleWeekDetail,
  type ScheduleVote,
} from "../../api/schedule";
import { getStaffListAPI, type StaffSummary } from "../../api/user";
import styles from "./SchedulePage.module.css";

// ── Constants ───────────────────────────────────────────────────────────
const DAY_KO = ["월", "화", "수", "목", "금", "토", "일"];
const DEFAULT_BUSINESS_DAYS: boolean[] = [true, false, true, true, true, true, true];
const PREFETCH_COUNT = 3;

// ── Utilities ───────────────────────────────────────────────────────────
function toLocalStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function getWeekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + i);
    return toLocalStr(d);
  });
}

function getBusinessDates(week: ScheduleWeek): Array<{ date: string; dayIdx: number }> {
  return getWeekDates(week.weekStartDate)
    .map((date, i) => ({ date, dayIdx: i }))
    .filter((_, i) => week.businessDays[i]);
}

function formatShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDeadline(dl: string): string {
  const d = new Date(dl);
  const dow = DAY_KO[d.getDay() === 0 ? 6 : d.getDay() - 1];
  return `${d.getMonth() + 1}/${d.getDate()}(${dow}) ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function defaultDeadlineStr(weekStart: string): string {
  if (!weekStart) return "";
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + 3);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T21:00`;
}

function formatWeekRange(weekStart: string): string {
  const s = new Date(weekStart + "T00:00:00");
  const e = new Date(weekStart + "T00:00:00");
  e.setDate(s.getDate() + 6);
  const sm = s.getMonth() + 1;
  const em = e.getMonth() + 1;
  const endStr = em !== sm ? `${em}/${e.getDate()}` : String(e.getDate());
  return `${s.getFullYear()}년 ${sm}월 · ${sm}/${s.getDate()}~${endStr}`;
}

const BADGE_CLASS: Record<string, string> = {
  VOTING: styles.badgeVoting,
  CLOSED: styles.badgeClosed,
  CONFIRMED: styles.badgeConfirmed,
};

const STATUS_LABEL: Record<string, string> = {
  VOTING: "투표중",
  CLOSED: "마감",
  CONFIRMED: "확정",
};

// ── Component ───────────────────────────────────────────────────────────
export default function SchedulePage() {
  const { user } = useAuth();
  const isManagerOrAbove = user?.role === "ROLE_OWNER" || user?.role === "ROLE_MANAGER";
  const myId = user?.userId ?? "";

  // 캐시: weekId → 상세 데이터
  const cacheRef = useRef<Map<number, ScheduleWeekDetail>>(new Map());
  const activeWeekIdRef = useRef<number | null>(null);

  // 데이터
  const [weeks, setWeeks] = useState<ScheduleWeek[]>([]);
  const [currentDetail, setCurrentDetail] = useState<ScheduleWeekDetail | null>(null);
  const [staffList, setStaffList] = useState<StaffSummary[]>([]);

  // UI
  const [weekIdx, setWeekIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [draftAssign, setDraftAssign] = useState<Set<string>>(new Set());
  const [editingConfirmed, setEditingConfirmed] = useState(false);
  const [localVoteSet, setLocalVoteSet] = useState<Set<string>>(new Set());
  const [voteDirty, setVoteDirty] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWeekDays, setNewWeekDays] = useState<boolean[]>([...DEFAULT_BUSINESS_DAYS]);
  const [newWeekDeadline, setNewWeekDeadline] = useState<string>("");
  const [editingDays, setEditingDays] = useState(false);
  const [draftDays, setDraftDays] = useState<boolean[]>([]);
  const [showVoteHistory, setShowVoteHistory] = useState(false);

  const week = weeks[weekIdx];
  const businessDates = currentDetail ? getBusinessDates(currentDetail) : [];

  const nextWeekStart = (() => {
    if (weeks.length === 0) {
      const today = new Date();
      const day = today.getDay(); // 0=일, 1=월, ..., 6=토
      const daysToMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + daysToMonday);
      return toLocalStr(monday);
    }
    const last = weeks[weeks.length - 1];
    const d = new Date(last.weekStartDate + "T00:00:00");
    d.setDate(d.getDate() + 7);
    return toLocalStr(d);
  })();

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  // ── 상세 데이터 로드 (캐시 우선) ─────────────────────────────────────
  const loadWeekDetail = async (weekId: number) => {
    activeWeekIdRef.current = weekId;
    const cached = cacheRef.current.get(weekId);
    if (cached) {
      setCurrentDetail(cached);
      return;
    }
    setDetailLoading(true);
    try {
      const detail = await getWeekDetailAPI(weekId);
      cacheRef.current.set(weekId, detail);
      if (activeWeekIdRef.current === weekId) {
        setCurrentDetail(detail);
      }
    } catch {
      showError("주차 정보를 불러오지 못했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  // 변경 후 캐시 갱신 (votes/assignments 포함 재fetch)
  const refreshDetail = async (weekId: number) => {
    const detail = await getWeekDetailAPI(weekId);
    cacheRef.current.set(weekId, detail);
    setCurrentDetail(detail);
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === weekId
          ? { ...w, status: detail.status, businessDays: detail.businessDays }
          : w
      )
    );
  };

  // week의 기본 정보만 캐시에 반영 (votes/assignments는 유지)
  const updateCachedWeekInfo = (updated: ScheduleWeek) => {
    setWeeks((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    const existing = cacheRef.current.get(updated.id);
    if (existing) {
      const merged: ScheduleWeekDetail = { ...existing, ...updated };
      cacheRef.current.set(updated.id, merged);
      if (currentDetail?.id === updated.id) setCurrentDetail(merged);
    }
  };

  // ── 초기 로드 ─────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [fetchedWeeks, fetchedStaff] = await Promise.all([
          getWeeksAPI(),
          isManagerOrAbove ? getStaffListAPI() : Promise.resolve([]),
        ]);
        setWeeks(fetchedWeeks);
        setStaffList(fetchedStaff);

        if (fetchedWeeks.length === 0) return;

        // 최근 N주 자동 prefetch
        const recentWeeks = fetchedWeeks.slice(-PREFETCH_COUNT);
        const details = await Promise.all(recentWeeks.map((w) => getWeekDetailAPI(w.id)));
        details.forEach((d) => cacheRef.current.set(d.id, d));

        // 초기 표시 주차: 현재 주 또는 최신 주
        const today = toLocalStr(new Date());
        const currentWeekIdx = fetchedWeeks.findIndex((w) => {
          const end = new Date(w.weekStartDate + "T00:00:00");
          end.setDate(end.getDate() + 6);
          return w.weekStartDate <= today && today <= toLocalStr(end);
        });
        setWeekIdx(currentWeekIdx !== -1 ? currentWeekIdx : fetchedWeeks.length - 1);
      } catch {
        showError("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 주차 변경 시 UI 초기화 + 상세 로드 ─────────────────────────────
  useEffect(() => {
    if (!week) return;
    setEditingDays(false);
    setShowCreateForm(false);
    setEditingConfirmed(false);
    setShowVoteHistory(false);
    setDraftAssign(new Set());
    loadWeekDetail(week.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week?.id]);

  // ── VOTING 진입 시 localVoteSet 초기화 ──────────────────────────────
  useEffect(() => {
    if (!currentDetail || currentDetail.status !== "VOTING") {
      setLocalVoteSet(new Set());
      setVoteDirty(false);
      return;
    }
    setLocalVoteSet(
      new Set(
        currentDetail.votes
          .filter((v) => v.userId === myId)
          .map((v) => v.availableDate)
      )
    );
    setVoteDirty(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDetail]);

  // ── Handlers ────────────────────────────────────────────────────────
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
    if (!currentDetail) return;
    try {
      await saveVotesAPI(currentDetail.id, Array.from(localVoteSet));
      await refreshDetail(currentDetail.id);
      setVoteDirty(false);
    } catch {
      showError("투표 저장에 실패했습니다.");
    }
  };

  const toggleDraft = (userId: string, date: string) => {
    const key = `${userId}:${date}`;
    setDraftAssign((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCloseVoting = async () => {
    if (!currentDetail) return;
    try {
      const updated = await closeVotingAPI(currentDetail.id);
      updateCachedWeekInfo(updated);
    } catch {
      showError("투표 마감에 실패했습니다.");
    }
  };

  const handleConfirm = async () => {
    if (!currentDetail) return;
    const assignments = Array.from(draftAssign).map((key) => {
      const [userId, workDate] = key.split(":");
      return { userId, workDate };
    });
    try {
      await confirmScheduleAPI(currentDetail.id, assignments);
      await refreshDetail(currentDetail.id);
    } catch {
      showError("일정 확정에 실패했습니다.");
    }
  };

  const handleSubmitCreate = async () => {
    try {
      const newIdx = weeks.length;
      const created = await createWeekAPI(nextWeekStart, newWeekDays, newWeekDeadline);
      const detail = await getWeekDetailAPI(created.id);
      cacheRef.current.set(created.id, detail);
      setWeeks((prev) => [...prev, created]);
      setWeekIdx(newIdx);
      setShowCreateForm(false);
      setNewWeekDays([...DEFAULT_BUSINESS_DAYS]);
      setNewWeekDeadline("");
    } catch {
      showError("주차 생성에 실패했습니다.");
    }
  };

  const openEditConfirmed = () => {
    if (!currentDetail) return;
    setDraftAssign(
      new Set(currentDetail.assignments.map((a) => `${a.userId}:${a.workDate}`))
    );
    setEditingConfirmed(true);
  };

  const handleSaveConfirmedEdit = async () => {
    if (!currentDetail) return;
    const assignments = Array.from(draftAssign).map((key) => {
      const [userId, workDate] = key.split(":");
      return { userId, workDate };
    });
    try {
      await confirmScheduleAPI(currentDetail.id, assignments);
      await refreshDetail(currentDetail.id);
      setEditingConfirmed(false);
    } catch {
      showError("일정 수정에 실패했습니다.");
    }
  };

  const openEditDays = () => {
    if (!currentDetail) return;
    setDraftDays([...currentDetail.businessDays]);
    setEditingDays(true);
  };

  const handleSaveDays = async () => {
    if (!currentDetail) return;
    try {
      const updated = await updateBusinessDaysAPI(currentDetail.id, draftDays);
      updateCachedWeekInfo(updated);
      setEditingDays(false);
    } catch {
      showError("영업일 수정에 실패했습니다.");
    }
  };

  const votesFor = (date: string) =>
    currentDetail?.votes.filter((v) => v.availableDate === date) ?? [];

  const assignedFor = (date: string) =>
    currentDetail?.assignments.filter((a) => a.workDate === date) ?? [];

  // ── Render ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>일정</h2>
        <p className={styles.waitMsg}>불러오는 중...</p>
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>일정</h2>
          {isManagerOrAbove && (
            <button className={styles.createBtn} onClick={() => { setShowCreateForm(true); setNewWeekDeadline(defaultDeadlineStr(nextWeekStart)); }}>
              + 주 생성
            </button>
          )}
        </div>
        {showCreateForm && nextWeekStart && (
          <CreateWeekForm
            nextWeekStart={nextWeekStart}
            newWeekDays={newWeekDays}
            setNewWeekDays={setNewWeekDays}
            votingDeadline={newWeekDeadline}
            setVotingDeadline={setNewWeekDeadline}
            onSubmit={handleSubmitCreate}
            onCancel={() => { setShowCreateForm(false); setNewWeekDays([...DEFAULT_BUSINESS_DAYS]); setNewWeekDeadline(""); }}
          />
        )}
        {errorMsg && <p className={styles.waitMsg}>{errorMsg}</p>}
        <p className={styles.waitMsg}>등록된 주차가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h2 className={styles.title}>일정</h2>
        {isManagerOrAbove && !showCreateForm && (
          <button className={styles.createBtn} onClick={() => { setShowCreateForm(true); setNewWeekDeadline(defaultDeadlineStr(nextWeekStart)); }}>
            + 주 생성
          </button>
        )}
      </div>

      {errorMsg && <p className={styles.waitMsg}>{errorMsg}</p>}

      {/* 주 생성 폼 */}
      {showCreateForm && (
        <CreateWeekForm
          nextWeekStart={nextWeekStart}
          newWeekDays={newWeekDays}
          setNewWeekDays={setNewWeekDays}
          votingDeadline={newWeekDeadline}
          setVotingDeadline={setNewWeekDeadline}
          onSubmit={handleSubmitCreate}
          onCancel={() => { setShowCreateForm(false); setNewWeekDays([...DEFAULT_BUSINESS_DAYS]); setNewWeekDeadline(""); }}
        />
      )}

      {/* 주차 네비게이션 */}
      <div className={styles.weekNav}>
        <button
          className={styles.navBtn}
          onClick={() => setWeekIdx((i) => i - 1)}
          disabled={weekIdx === 0}
        >
          <ChevronLeft size={20} />
        </button>
        <div className={styles.weekCenter}>
          <span className={styles.weekRange}>
            {week ? formatWeekRange(week.weekStartDate) : ""}
          </span>
          <div className={styles.weekMeta}>
            {week && (
              <>
                <span className={styles.deadline}>마감 {formatDeadline(week.votingDeadline)}</span>
                <span className={`${styles.badge} ${BADGE_CLASS[currentDetail?.status ?? week.status]}`}>
                  {STATUS_LABEL[currentDetail?.status ?? week.status]}
                </span>
                {isManagerOrAbove && (currentDetail?.status ?? week.status) !== "CONFIRMED" && (
                  <button
                    className={styles.editDaysBtn}
                    onClick={editingDays ? () => setEditingDays(false) : openEditDays}
                  >
                    {editingDays ? "닫기" : "영업일 수정"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <button
          className={styles.navBtn}
          onClick={() => setWeekIdx((i) => i + 1)}
          disabled={weekIdx === weeks.length - 1}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 영업일 수정 패널 */}
      {editingDays && (
        <div className={styles.editDaysPanel}>
          <p className={styles.editDaysPanelTitle}>영업일 수정</p>
          <div className={styles.dayToggleGrid}>
            {DAY_KO.map((day, i) => (
              <button
                key={i}
                className={`${styles.dayToggleBtn} ${draftDays[i] ? styles.dayToggleBtnOn : styles.dayToggleBtnOff}`}
                onClick={() => setDraftDays((prev) => prev.map((v, j) => (j === i ? !v : v)))}
              >
                {day}
              </button>
            ))}
          </div>
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => setEditingDays(false)}>취소</button>
            <button className={styles.submitBtn} onClick={handleSaveDays}>저장</button>
          </div>
        </div>
      )}

      {/* 상세 로딩 */}
      {detailLoading && <p className={styles.waitMsg}>불러오는 중...</p>}

      {/* ── VOTING ── */}
      {!detailLoading && currentDetail?.status === "VOTING" && (
        <>
          {user?.role !== "ROLE_OWNER" && (
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
      )}

      {/* ── CLOSED ── */}
      {!detailLoading && currentDetail?.status === "CLOSED" && (
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
              <button className={styles.confirmBtn} onClick={handleConfirm}>
                일정 확정
              </button>
            </>
          )}
        </>
      )}

      {/* ── CONFIRMED ── */}
      {!detailLoading && currentDetail?.status === "CONFIRMED" && (
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
      )}
    </div>
  );
}

// ── CreateWeekForm sub-component ────────────────────────────────────────
interface CreateWeekFormProps {
  nextWeekStart: string;
  newWeekDays: boolean[];
  setNewWeekDays: React.Dispatch<React.SetStateAction<boolean[]>>;
  votingDeadline: string;
  setVotingDeadline: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  onCancel: () => void;
}

function CreateWeekForm({ nextWeekStart, newWeekDays, setNewWeekDays, votingDeadline, setVotingDeadline, onSubmit, onCancel }: CreateWeekFormProps) {
  return (
    <div className={styles.createForm}>
      <div className={styles.createFormHeader}>
        <span className={styles.createFormLabel}>새 투표 주간</span>
        <span className={styles.createFormWeek}>{formatWeekRange(nextWeekStart)}</span>
      </div>
      <p className={styles.createFormHint}>영업일 선택 (화요일 기본 휴무)</p>
      <div className={styles.dayToggleGrid}>
        {DAY_KO.map((day, i) => (
          <button
            key={i}
            className={`${styles.dayToggleBtn} ${newWeekDays[i] ? styles.dayToggleBtnOn : styles.dayToggleBtnOff}`}
            onClick={() => setNewWeekDays((prev) => prev.map((v, j) => (j === i ? !v : v)))}
          >
            {day}
          </button>
        ))}
      </div>
      <p className={styles.createFormHint} style={{ marginTop: 14 }}>투표 마감일</p>
      <input
        type="datetime-local"
        className={styles.deadlineInput}
        value={votingDeadline}
        onChange={(e) => setVotingDeadline(e.target.value)}
      />
      <div className={styles.formActions}>
        <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button className={styles.submitBtn} onClick={onSubmit}>생성</button>
      </div>
    </div>
  );
}

// ── VoteTable sub-component ─────────────────────────────────────────────
interface VoteTableProps {
  businessDates: Array<{ date: string; dayIdx: number }>;
  votesFor: (date: string) => ScheduleVote[];
  myId: string;
}

function VoteTable({ businessDates, votesFor, myId }: VoteTableProps) {
  return (
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
                <span className={styles.noOne}>없음</span>
              ) : (
                dayVotes.map((v) => (
                  <span
                    key={v.userId}
                    className={`${styles.voterTag} ${v.userId === myId ? styles.voterTagMe : ""}`}
                  >
                    {v.userName}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
