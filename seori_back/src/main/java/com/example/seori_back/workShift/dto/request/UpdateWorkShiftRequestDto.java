package com.example.seori_back.workShift.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record UpdateWorkShiftRequestDto(
        @NotNull @JsonFormat(pattern = "HH:mm") LocalTime startTime,
        @NotNull @JsonFormat(pattern = "HH:mm") LocalTime endTime
) {}
