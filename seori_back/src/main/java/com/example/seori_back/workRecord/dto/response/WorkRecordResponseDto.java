package com.example.seori_back.workRecord.dto.response;

import com.example.seori_back.workRecord.domain.entity.WorkRecord;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalTime;

public record WorkRecordResponseDto(
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
    public static WorkRecordResponseDto from(WorkRecord record) {
        return new WorkRecordResponseDto(
                record.getId(),
                record.getWorkDate(),
                record.getStartTime(),
                record.getEndTime(),
                record.isSpecialDay(),
                record.getRegularMinutes(),
                record.getOvertimeMinutes(),
                record.getRegularWage(),
                record.getOvertimeWage(),
                record.getRegularWage() + record.getOvertimeWage()
        );
    }
}
