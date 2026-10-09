package com.example.seori_back.global.util;

import com.example.seori_back.global.exception.CustomException;
import com.example.seori_back.global.exception.ErrorCode;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalTime;

@Component
public class WageCalculator {

    private static final LocalTime OVERTIME_START = LocalTime.of(22, 0);

    public WageResult calculate(LocalTime startTime, LocalTime endTime, int hourlyWage, int overtimeWage, boolean isSpecialDay) {
        if (startTime == null || endTime == null) {
            throw new CustomException(ErrorCode.INVALID_WORK_TIME_NULL);
        }

        int totalMinutes = (int) Duration.between(startTime, endTime).toMinutes();
        if (totalMinutes <= 0) throw new CustomException(ErrorCode.INVALID_WORK_TIME);

        if (isSpecialDay) {
            int wage = Math.round((float) totalMinutes / 60 * overtimeWage);
            return new WageResult(0, totalMinutes, 0, wage);
        }

        if (!endTime.isAfter(OVERTIME_START)) {
            // 전부 정규시간
            int wage = Math.round((float) totalMinutes / 60 * hourlyWage);
            return new WageResult(totalMinutes, 0, wage, 0);
        }

        if (!startTime.isBefore(OVERTIME_START)) {
            // 전부 초과시간
            int wage = Math.round((float) totalMinutes / 60 * overtimeWage);
            return new WageResult(0, totalMinutes, 0, wage);
        }

        // 정규 + 초과 혼합
        int regularMinutes = (int) Duration.between(startTime, OVERTIME_START).toMinutes();
        int overtimeMinutes = (int) Duration.between(OVERTIME_START, endTime).toMinutes();
        int regularWage = Math.round((float) regularMinutes / 60 * hourlyWage);
        int overtimeWageAmount = Math.round((float) overtimeMinutes / 60 * overtimeWage);
        return new WageResult(regularMinutes, overtimeMinutes, regularWage, overtimeWageAmount);
    }

    public record WageResult(int regularMinutes, int overtimeMinutes, int regularWage, int overtimeWage) {
        public int totalWage() {
            return regularWage + overtimeWage;
        }
    }
}
