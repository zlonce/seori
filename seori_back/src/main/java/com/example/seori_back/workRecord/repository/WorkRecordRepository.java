package com.example.seori_back.workRecord.repository;

import com.example.seori_back.workRecord.domain.entity.WorkRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface WorkRecordRepository extends JpaRepository<WorkRecord, Long> {

    @Query("SELECT w FROM WorkRecord w WHERE w.user.userId = :userId AND YEAR(w.workDate) = :year AND MONTH(w.workDate) = :month")
    List<WorkRecord> findByUserIdAndYearMonth(@Param("userId") String userId, @Param("year") int year, @Param("month") int month);

    List<WorkRecord> findByWorkDateBetween(LocalDate start, LocalDate end);
}
