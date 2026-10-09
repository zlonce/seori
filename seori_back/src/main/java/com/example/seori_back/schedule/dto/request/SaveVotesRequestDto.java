package com.example.seori_back.schedule.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record SaveVotesRequestDto(
        @NotNull
        List<LocalDate> availableDates
) {}
