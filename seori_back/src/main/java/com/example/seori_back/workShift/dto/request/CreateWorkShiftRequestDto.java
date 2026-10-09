package com.example.seori_back.workShift.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreateWorkShiftRequestDto(
        @NotNull LocalDate workDate,
        @NotNull @JsonFormat(pattern = "HH:mm") LocalTime startTime,
        @NotNull @JsonFormat(pattern = "HH:mm") LocalTime endTime
) {}
