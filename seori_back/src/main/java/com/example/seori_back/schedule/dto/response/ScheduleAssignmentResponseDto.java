package com.example.seori_back.schedule.dto.response;

import com.example.seori_back.workShift.domain.entity.WorkShift;

import java.time.LocalDate;

public record ScheduleAssignmentResponseDto(
        String userId,
        String userName,
        LocalDate workDate
) {
    public static ScheduleAssignmentResponseDto from(WorkShift shift) {
        return new ScheduleAssignmentResponseDto(
                shift.getUser().getUserId(),
                shift.getUser().getName(),
                shift.getWorkDate()
        );
    }
}
