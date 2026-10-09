package com.example.seori_back.schedule.dto.response;

import com.example.seori_back.schedule.domain.entity.ScheduleVote;
import com.example.seori_back.schedule.domain.entity.ScheduleWeek;
import com.example.seori_back.schedule.domain.entity.WeekStatusEnum;
import com.example.seori_back.workShift.domain.entity.WorkShift;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ScheduleWeekDetailResponseDto(
        Long id,
        LocalDate weekStartDate,
        LocalDateTime votingDeadline,
        WeekStatusEnum status,
        boolean[] businessDays,
        List<ScheduleVoteResponseDto> votes,
        List<ScheduleAssignmentResponseDto> assignments
) {
    public static ScheduleWeekDetailResponseDto from(
            ScheduleWeek week,
            List<ScheduleVote> votes,
            List<WorkShift> assignments
    ) {
        return new ScheduleWeekDetailResponseDto(
                week.getId(),
                week.getWeekStartDate(),
                week.getVotingDeadline(),
                week.getStatus(),
                week.getBusinessDaysAsArray(),
                votes.stream().map(ScheduleVoteResponseDto::from).toList(),
                assignments.stream().map(ScheduleAssignmentResponseDto::from).toList()
        );
    }
}
