package com.example.seori_back.schedule.repository;

import com.example.seori_back.schedule.domain.entity.ScheduleWeek;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleWeekRepository extends JpaRepository<ScheduleWeek, Long> {
    List<ScheduleWeek> findAllByOrderByWeekStartDateAsc();
}
