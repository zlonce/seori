package com.example.seori_back.schedule.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateBusinessDaysRequestDto(
        @NotNull
        @Size(min = 7, max = 7)
        boolean[] businessDays
) {}
