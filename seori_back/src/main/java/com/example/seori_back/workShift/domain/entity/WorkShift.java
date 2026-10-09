package com.example.seori_back.workShift.domain.entity;

import com.example.seori_back.schedule.domain.entity.ScheduleWeek;
import com.example.seori_back.user.domain.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(
    name = "work_shifts",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "work_date"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "week_id")
    private ScheduleWeek week;

    @Column(nullable = false)
    private LocalDate workDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private boolean specialDay;

    private int regularMinutes;

    private int overtimeMinutes;

    private int regularWage;

    private int overtimeWage;

    public static WorkShift create(User user, LocalDate workDate, LocalTime startTime, LocalTime endTime,
                                    boolean specialDay, int regularMinutes, int overtimeMinutes,
                                    int regularWage, int overtimeWage) {
        WorkShift shift = new WorkShift();
        shift.user = user;
        shift.workDate = workDate;
        shift.startTime = startTime;
        shift.endTime = endTime;
        shift.specialDay = specialDay;
        shift.regularMinutes = regularMinutes;
        shift.overtimeMinutes = overtimeMinutes;
        shift.regularWage = regularWage;
        shift.overtimeWage = overtimeWage;
        return shift;
    }

    public static WorkShift createScheduled(User user, ScheduleWeek week, LocalDate workDate) {
        WorkShift shift = new WorkShift();
        shift.user = user;
        shift.week = week;
        shift.workDate = workDate;
        return shift;
    }

    public void update(LocalTime startTime, LocalTime endTime,
                       boolean specialDay, int regularMinutes, int overtimeMinutes,
                       int regularWage, int overtimeWage) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.specialDay = specialDay;
        this.regularMinutes = regularMinutes;
        this.overtimeMinutes = overtimeMinutes;
        this.regularWage = regularWage;
        this.overtimeWage = overtimeWage;
    }
}
