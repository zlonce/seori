package com.example.seori_back.specialday.repository;

import com.example.seori_back.specialday.domain.entity.SpecialDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SpecialDayRepository extends JpaRepository<SpecialDay, Long> {

    // 특정 연월의 특정일 + 매년 반복 중 해당 월에 해당하는 것 모두 반환
    @Query("SELECT s FROM SpecialDay s WHERE (YEAR(s.date) = :year AND MONTH(s.date) = :month) OR (s.recurring = true AND MONTH(s.date) = :month)")
    List<SpecialDay> findByYearMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT s FROM SpecialDay s WHERE s.recurring = true OR YEAR(s.date) >= :year")
    List<SpecialDay> findActiveSpecialDays(@Param("year") int year);

    // 매년 반복 항목 전체 조회 (급여 계산 시 사용)
    List<SpecialDay> findAllByRecurringTrue();

    // 정확한 날짜로 중복 확인
    boolean existsByDate(LocalDate date);
}
