package com.example.seori_back.schedule.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AssignmentItem(
        @NotNull String userId,
        @NotNull LocalDate workDate
) {}
