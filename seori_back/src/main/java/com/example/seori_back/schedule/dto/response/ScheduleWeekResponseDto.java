package com.example.seori_back.schedule.dto.response;

import com.example.seori_back.schedule.domain.entity.ScheduleWeek;
import com.example.seori_back.schedule.domain.entity.WeekStatusEnum;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ScheduleWeekResponseDto(
        Long id,
        LocalDate weekStartDate,
        LocalDateTime votingDeadline,
        WeekStatusEnum status,
        boolean[] businessDays
) {
    public static ScheduleWeekResponseDto from(ScheduleWeek week) {
        return new ScheduleWeekResponseDto(
                week.getId(),
                week.getWeekStartDate(),
                week.getVotingDeadline(),
                week.getStatus(),
                week.getBusinessDaysAsArray()
        );
    }
}
