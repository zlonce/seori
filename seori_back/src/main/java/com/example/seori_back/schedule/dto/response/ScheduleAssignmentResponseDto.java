package com.example.seori_back.schedule.dto.response;

import com.example.seori_back.schedule.domain.entity.ScheduleAssignment;

import java.time.LocalDate;

public record ScheduleAssignmentResponseDto(
        String userId,
        String userName,
        LocalDate workDate
) {
    public static ScheduleAssignmentResponseDto from(ScheduleAssignment assignment) {
        return new ScheduleAssignmentResponseDto(
                assignment.getUser().getUserId(),
                assignment.getUser().getName(),
                assignment.getWorkDate()
        );
    }
}
