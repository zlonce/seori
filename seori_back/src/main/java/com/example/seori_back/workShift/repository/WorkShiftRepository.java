package com.example.seori_back.workShift.repository;

import com.example.seori_back.workShift.domain.entity.WorkShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkShiftRepository extends JpaRepository<WorkShift, Long> {

    @Query("SELECT w FROM WorkShift w WHERE w.user.userId = :userId AND YEAR(w.workDate) = :year AND MONTH(w.workDate) = :month")
    List<WorkShift> findByUserIdAndYearMonth(@Param("userId") String userId, @Param("year") int year, @Param("month") int month);

    @Query("SELECT w FROM WorkShift w WHERE w.user.userId = :userId AND w.workDate = :workDate")
    Optional<WorkShift> findByUserIdAndWorkDate(@Param("userId") String userId, @Param("workDate") LocalDate workDate);

    List<WorkShift> findByWorkDateBetween(LocalDate start, LocalDate end);

    List<WorkShift> findByWeekId(Long weekId);
}
