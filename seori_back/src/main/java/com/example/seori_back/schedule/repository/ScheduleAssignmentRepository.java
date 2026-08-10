package com.example.seori_back.schedule.repository;

import com.example.seori_back.schedule.domain.entity.ScheduleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleAssignmentRepository extends JpaRepository<ScheduleAssignment, Long> {
    List<ScheduleAssignment> findByWeekId(Long weekId);
    void deleteByWeekId(Long weekId);
}
