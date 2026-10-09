package com.example.seori_back.schedule.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateAssignmentsRequestDto(
        @NotNull
        List<AssignmentItem> add,
        @NotNull
        List<AssignmentItem> remove
) {}
