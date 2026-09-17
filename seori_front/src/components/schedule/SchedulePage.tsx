import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  getWeeksAPI,
  getWeekDetailAPI,
  createWeekAPI,
  updateBusinessDaysAPI,
  type ScheduleWeek,
  type ScheduleWeekDetail,
} from "../../api/schedule";
import { getStaffListAPI, type StaffSummary } from "../../api/user";
import { getMyWorkShiftsAPI, type WorkShiftResponse } from "../../api/workShift";
import { getSpecialDaysAPI } from "../../api/specialDay";
import {
  DAY_KO,
  DEFAULT_BUSINESS_DAYS,
  PREFETCH_COUNT,
  BADGE_CLASS,
  STATUS_LABEL,
  toLocalStr,
  getBusinessDates,
  formatDeadline,
  formatWeekRange,
  defaultDeadlineStr,
} from "./scheduleUtils";
import CreateWeekForm from "./CreateWeekForm";
import VotingView from "./VotingView";
import ClosedView from "./ClosedView";
import ConfirmedView from "./ConfirmedView";
import WorkCalendar from "../staff/WorkCalendar";
import styles from "./SchedulePage.module.css";

type Tab = "weekly" | "calendar";

export default function SchedulePage() {
  const { user } = useAuth();
  const isManagerOrAbove = user?.role === "ROLE_OWNER" || user?.role === "ROLE_MANAGER";
  const showCalendarTab = user?.role === "ROLE_STAFF" || user?.role === "ROLE_MANAGER";
  const myId = user?.userId ?? "";

  const [tab, setTab] = useState<Tab>("weekly");

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1);
  const [calRecords, setCalRecords] = useState<WorkShiftResponse[]>([]);
  const [calSpecialDates, setCalSpecialDates] = useState<Set<string>>(new Set());
  const [calLoading, setCalLoading] = useState(false);

  const fetchCalendarData = async () => {
    setCalLoading(true);
    try {
      const [recs, specials] = await Promise.all([
        getMyWorkShiftsAPI(calYear, calMonth),
        getSpecialDaysAPI(calYear, calMonth),
      ]);
      setCalRecords(recs);
      setCalSpecialDates(new Set(specials.map((s) => s.date)));
    } catch {
      showError("근무 달력을 불러오지 못했습니다.");
    } finally {
      setCalLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "calendar") fetchCalendarData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, calYear, calMonth]);

  const prevCalMonth = () => {
    if (calMonth === 1) { setCalYear((y) => y - 1); setCalMonth(12); }
    else setCalMonth((m) => m - 1);
  };
  const nextCalMonth = () => {
    if (calMonth === 12) { setCalYear((y) => y + 1); setCalMonth(1); }
    else setCalMonth((m) => m + 1);
  };

  const cacheRef = useRef<Map<number, ScheduleWeekDetail>>(new Map());
  const activeWeekIdRef = useRef<number | null>(null);

  const [weeks, setWeeks] = useState<ScheduleWeek[]>([]);
  const [currentDetail, setCurrentDetail] = useState<ScheduleWeekDetail | null>(null);
  const [staffList, setStaffList] = useState<StaffSummary[]>([]);

  const [weekIdx, setWeekIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWeekDays, setNewWeekDays] = useState<boolean[]>([...DEFAULT_BUSINESS_DAYS]);
  const [newWeekDeadline, setNewWeekDeadline] = useState("");
  const [editingDays, setEditingDays] = useState(false);
  const [draftDays, setDraftDays] = useState<boolean[]>([]);

  const week = weeks[weekIdx];
  const businessDates = currentDetail ? getBusinessDates(currentDetail) : [];

  const nextWeekStart = (() => {
    if (weeks.length === 0) {
      const today = new Date();
      const day = today.getDay();
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

  const loadWeekDetail = async (weekId: number) => {
    activeWeekIdRef.current = weekId;
    const cached = cacheRef.current.get(weekId);
    if (cached) { setCurrentDetail(cached); return; }
    setDetailLoading(true);
    try {
      const detail = await getWeekDetailAPI(weekId);
      cacheRef.current.set(weekId, detail);
      if (activeWeekIdRef.current === weekId) setCurrentDetail(detail);
    } catch {
      showError("주차 정보를 불러오지 못했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshDetail = async (weekId: number) => {
    const detail = await getWeekDetailAPI(weekId);
    cacheRef.current.set(weekId, detail);
    setCurrentDetail(detail);
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === weekId ? { ...w, status: detail.status, businessDays: detail.businessDays } : w,
      ),
    );
  };

  const updateCachedWeekInfo = (updated: ScheduleWeek) => {
    setWeeks((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    const existing = cacheRef.current.get(updated.id);
    if (existing) {
      const merged: ScheduleWeekDetail = { ...existing, ...updated };
      cacheRef.current.set(updated.id, merged);
      if (currentDetail?.id === updated.id) setCurrentDetail(merged);
    }
  };

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

        const recentWeeks = fetchedWeeks.slice(-PREFETCH_COUNT);
        const details = await Promise.all(recentWeeks.map((w) => getWeekDetailAPI(w.id)));
        details.forEach((d) => cacheRef.current.set(d.id, d));

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

  useEffect(() => {
    if (!week) return;
    setEditingDays(false);
    setShowCreateForm(false);
    loadWeekDetail(week.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week?.id]);

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

  const tabBar = showCalendarTab && (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${tab === "weekly" ? styles.activeTab : ""}`}
        onClick={() => setTab("weekly")}
      >
        주간
      </button>
      <button
        className={`${styles.tab} ${tab === "calendar" ? styles.activeTab : ""}`}
        onClick={() => setTab("calendar")}
      >
        달력
      </button>
    </div>
  );

  if (tab === "calendar" && showCalendarTab) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>일정</h2>
        </div>
        {tabBar}
        {errorMsg && <p className={styles.waitMsg}>{errorMsg}</p>}
        <div className={styles.monthNav}>
          <button className={styles.navBtn} onClick={prevCalMonth}>
            <ChevronLeft size={20} />
          </button>
          <span className={styles.weekRange}>{calYear}년 {calMonth}월</span>
          <button className={styles.navBtn} onClick={nextCalMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
        {calLoading ? (
          <p className={styles.waitMsg}>불러오는 중...</p>
        ) : (
          <WorkCalendar
            year={calYear}
            month={calMonth}
            records={calRecords}
            specialDates={calSpecialDates}
            onRefresh={fetchCalendarData}
            restrictToScheduled={user?.role === "ROLE_STAFF"}
          />
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>일정</h2>
        {tabBar}
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
            <button
              className={styles.createBtn}
              onClick={() => { setShowCreateForm(true); setNewWeekDeadline(defaultDeadlineStr(nextWeekStart)); }}
            >
              + 주 생성
            </button>
          )}
        </div>
        {tabBar}
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
        {errorMsg && <p className={styles.waitMsg}>{errorMsg}</p>}
        <p className={styles.waitMsg}>등록된 주차가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>일정</h2>
        {isManagerOrAbove && !showCreateForm && (
          <button
            className={styles.createBtn}
            onClick={() => { setShowCreateForm(true); setNewWeekDeadline(defaultDeadlineStr(nextWeekStart)); }}
          >
            + 주 생성
          </button>
        )}
      </div>

      {tabBar}

      {errorMsg && <p className={styles.waitMsg}>{errorMsg}</p>}

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

      <div className={styles.weekNav}>
        <button className={styles.navBtn} onClick={() => setWeekIdx((i) => i - 1)} disabled={weekIdx === 0}>
          <ChevronLeft size={20} />
        </button>
        <div className={styles.weekCenter}>
          <span className={styles.weekRange}>{week ? formatWeekRange(week.weekStartDate) : ""}</span>
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
                    onClick={editingDays
                      ? () => setEditingDays(false)
                      : () => { if (currentDetail) { setDraftDays([...currentDetail.businessDays]); setEditingDays(true); } }
                    }
                  >
                    {editingDays ? "닫기" : "영업일 수정"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <button className={styles.navBtn} onClick={() => setWeekIdx((i) => i + 1)} disabled={weekIdx === weeks.length - 1}>
          <ChevronRight size={20} />
        </button>
      </div>

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

      {detailLoading && <p className={styles.waitMsg}>불러오는 중...</p>}

      {!detailLoading && currentDetail?.status === "VOTING" && (
        <VotingView
          currentDetail={currentDetail}
          businessDates={businessDates}
          myId={myId}
          isManagerOrAbove={isManagerOrAbove}
          onRefreshDetail={() => refreshDetail(currentDetail.id)}
          onUpdateWeekInfo={updateCachedWeekInfo}
          onError={showError}
        />
      )}

      {!detailLoading && currentDetail?.status === "CLOSED" && (
        <ClosedView
          currentDetail={currentDetail}
          businessDates={businessDates}
          myId={myId}
          isManagerOrAbove={isManagerOrAbove}
          onRefreshDetail={() => refreshDetail(currentDetail.id)}
          onError={showError}
        />
      )}

      {!detailLoading && currentDetail?.status === "CONFIRMED" && (
        <ConfirmedView
          currentDetail={currentDetail}
          businessDates={businessDates}
          myId={myId}
          isManagerOrAbove={isManagerOrAbove}
          staffList={staffList}
          onRefreshDetail={() => refreshDetail(currentDetail.id)}
          onError={showError}
        />
      )}
    </div>
  );
}
