package com.example.seori_back.schedule.domain.entity;

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

@Entity
@Table(
    name = "schedule_assignments",
    uniqueConstraints = @UniqueConstraint(columnNames = {"week_id", "user_id", "work_date"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ScheduleAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "week_id", nullable = false)
    private ScheduleWeek week;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate workDate;

    public static ScheduleAssignment create(ScheduleWeek week, User user, LocalDate workDate) {
        ScheduleAssignment assignment = new ScheduleAssignment();
        assignment.week = week;
        assignment.user = user;
        assignment.workDate = workDate;
        return assignment;
    }
}
