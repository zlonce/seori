package com.example.seori_back.specialday.dto.response;

import com.example.seori_back.specialday.domain.entity.SpecialDay;

import java.time.LocalDate;

public record SpecialDayResponseDto(
        Long id,
        LocalDate date,
        String name,
        boolean recurring
) {
    public static SpecialDayResponseDto from(SpecialDay specialDay) {
        return new SpecialDayResponseDto(
                specialDay.getId(),
                specialDay.getDate(),
                specialDay.getName(),
                specialDay.isRecurring()
        );
    }
}
