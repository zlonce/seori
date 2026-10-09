package com.example.seori_back.schedule.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AssignmentsRequestDto(
        @NotNull
        List<AssignmentItem> assignments
) {}
