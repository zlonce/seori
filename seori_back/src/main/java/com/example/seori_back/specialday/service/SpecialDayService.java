package com.example.seori_back.specialday.service;

import com.example.seori_back.global.exception.CustomException;
import com.example.seori_back.global.exception.ErrorCode;
import com.example.seori_back.specialday.domain.entity.SpecialDay;
import com.example.seori_back.specialday.dto.request.CreateSpecialDayRequestDto;
import com.example.seori_back.specialday.dto.response.SpecialDayResponseDto;
import com.example.seori_back.specialday.repository.SpecialDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpecialDayService {

    private final SpecialDayRepository specialDayRepository;

    @Transactional(readOnly = true)
    public List<SpecialDayResponseDto> getByYearMonth(int year, int month) {
        return specialDayRepository.findByYearMonth(year, month).stream()
                .map(SpecialDayResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SpecialDayResponseDto> getActive(int year) {
        return specialDayRepository.findActiveSpecialDays(year).stream()
                .map(SpecialDayResponseDto::from)
                .toList();
    }

    @Transactional
    public SpecialDayResponseDto create(CreateSpecialDayRequestDto request) {
        if (specialDayRepository.existsByDate(request.date())) {
            throw new CustomException(ErrorCode.DUPLICATE_SPECIAL_DAY);
        }
        try {
            SpecialDay specialDay = SpecialDay.create(request.date(), request.name(), request.recurring());
            specialDayRepository.save(specialDay);
            return SpecialDayResponseDto.from(specialDay);
        } catch (DataIntegrityViolationException e) {
            throw new CustomException(ErrorCode.DUPLICATE_SPECIAL_DAY);
        }
    }

    @Transactional
    public void delete(Long id) {
        SpecialDay specialDay = specialDayRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.SPECIAL_DAY_NOT_FOUND));
        specialDayRepository.delete(specialDay);
    }

    @Transactional(readOnly = true)
    public boolean isSpecialDate(LocalDate date) {
        if (specialDayRepository.existsByDate(date)) return true;
        String monthDay = date.getMonthValue() + "-" + date.getDayOfMonth();
        return specialDayRepository.findAllByRecurringTrue().stream()
                .anyMatch(s -> (s.getDate().getMonthValue() + "-" + s.getDate().getDayOfMonth()).equals(monthDay));
    }
}
