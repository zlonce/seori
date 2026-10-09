package com.example.seori_back.schedule.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_weeks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ScheduleWeek {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate weekStartDate;

    @Column(nullable = false)
    private LocalDateTime votingDeadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeekStatusEnum status;

    // 월~일 영업 여부, 예: "1010111"
    @Column(nullable = false, length = 7)
    private String businessDays;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static ScheduleWeek create(LocalDate weekStartDate, LocalDateTime votingDeadline, boolean[] businessDays) {
        ScheduleWeek week = new ScheduleWeek();
        week.weekStartDate = weekStartDate;
        week.votingDeadline = votingDeadline;
        week.status = WeekStatusEnum.VOTING;
        week.businessDays = toBusinessDaysString(businessDays);
        week.createdAt = LocalDateTime.now();
        return week;
    }

    public void updateBusinessDays(boolean[] businessDays) {
        this.businessDays = toBusinessDaysString(businessDays);
    }

    public void close() {
        this.status = WeekStatusEnum.CLOSED;
    }

    public void confirm() {
        this.status = WeekStatusEnum.CONFIRMED;
    }

    public boolean[] getBusinessDaysAsArray() {
        boolean[] result = new boolean[7];
        for (int i = 0; i < 7; i++) {
            result[i] = businessDays.charAt(i) == '1';
        }
        return result;
    }

    private static String toBusinessDaysString(boolean[] days) {
        StringBuilder sb = new StringBuilder();
        for (boolean d : days) {
            sb.append(d ? '1' : '0');
        }
        return sb.toString();
    }
}
