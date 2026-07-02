package com.example.seori_back.specialday.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateSpecialDayRequestDto(
        @NotNull LocalDate date,
        @NotBlank @Size(max = 30) String name,
        boolean recurring
) {}
