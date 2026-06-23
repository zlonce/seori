package com.example.seori_back.workRecord.domain.entity;

import com.example.seori_back.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "work_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate workDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    private boolean specialDay;

    private int regularMinutes;

    private int overtimeMinutes;

    private int regularWage;

    private int overtimeWage;

    public static WorkRecord create(User user, LocalDate workDate, LocalTime startTime, LocalTime endTime,
                                    boolean specialDay, int regularMinutes, int overtimeMinutes,
                                    int regularWage, int overtimeWage) {
        WorkRecord record = new WorkRecord();
        record.user = user;
        record.workDate = workDate;
        record.startTime = startTime;
        record.endTime = endTime;
        record.specialDay = specialDay;
        record.regularMinutes = regularMinutes;
        record.overtimeMinutes = overtimeMinutes;
        record.regularWage = regularWage;
        record.overtimeWage = overtimeWage;
        return record;
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
