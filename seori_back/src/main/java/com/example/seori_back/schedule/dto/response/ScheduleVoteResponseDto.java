package com.example.seori_back.schedule.dto.response;

import com.example.seori_back.schedule.domain.entity.ScheduleVote;

import java.time.LocalDate;

public record ScheduleVoteResponseDto(
        String userId,
        String userName,
        LocalDate availableDate
) {
    public static ScheduleVoteResponseDto from(ScheduleVote vote) {
        return new ScheduleVoteResponseDto(
                vote.getUser().getUserId(),
                vote.getUser().getName(),
                vote.getAvailableDate()
        );
    }
}
