package com.example.seori_back.schedule.repository;

import com.example.seori_back.schedule.domain.entity.ScheduleVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ScheduleVoteRepository extends JpaRepository<ScheduleVote, Long> {
    List<ScheduleVote> findByWeekId(Long weekId);

    @Modifying
    @Query("DELETE FROM ScheduleVote v WHERE v.week.id = :weekId AND v.user.userId = :userId")
    void deleteByWeekIdAndUserId(Long weekId, String userId);
}
