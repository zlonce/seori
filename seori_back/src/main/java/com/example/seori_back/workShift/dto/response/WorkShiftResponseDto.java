package com.example.seori_back.workShift.dto.response;

import com.example.seori_back.workShift.domain.entity.WorkShift;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalTime;

public record WorkShiftResponseDto(
        Long id,
        LocalDate workDate,
        @JsonFormat(pattern = "HH:mm") LocalTime startTime,
        @JsonFormat(pattern = "HH:mm") LocalTime endTime,
        boolean specialDay,
        int regularMinutes,
        int overtimeMinutes,
        int regularWage,
        int overtimeWage,
        int totalWage
) {
    public static WorkShiftResponseDto from(WorkShift shift) {
        return new WorkShiftResponseDto(
                shift.getId(),
                shift.getWorkDate(),
                shift.getStartTime(),
                shift.getEndTime(),
                shift.isSpecialDay(),
                shift.getRegularMinutes(),
                shift.getOvertimeMinutes(),
                shift.getRegularWage(),
                shift.getOvertimeWage(),
                shift.getRegularWage() + shift.getOvertimeWage()
        );
    }
}
