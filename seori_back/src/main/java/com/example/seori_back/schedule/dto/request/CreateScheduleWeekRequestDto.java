package com.example.seori_back.schedule.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CreateScheduleWeekRequestDto(
        @NotNull
        LocalDate weekStartDate,

        @NotNull
        @Size(min = 7, max = 7)
        boolean[] businessDays,

        @NotNull
        LocalDateTime votingDeadline
) {}
