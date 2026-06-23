package com.example.seori_back.specialday.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateSpecialDayRequestDto(
        @NotNull LocalDate date,
        @NotBlank String name,
        boolean recurring
) {}
