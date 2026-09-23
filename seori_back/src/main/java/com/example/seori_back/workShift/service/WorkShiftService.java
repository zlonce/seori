package com.example.seori_back.workShift.service;

import com.example.seori_back.global.exception.CustomException;
import com.example.seori_back.global.exception.ErrorCode;
import com.example.seori_back.global.util.WageCalculator;
import com.example.seori_back.specialday.service.SpecialDayService;
import com.example.seori_back.user.domain.entity.User;
import com.example.seori_back.user.repository.UserRepository;
import com.example.seori_back.workShift.domain.entity.WorkShift;
import com.example.seori_back.workShift.dto.request.CreateWorkShiftRequestDto;
import com.example.seori_back.workShift.dto.request.UpdateWorkShiftRequestDto;
import com.example.seori_back.workShift.dto.response.WorkShiftResponseDto;
import com.example.seori_back.workShift.repository.WorkShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkShiftService {

    private final WorkShiftRepository workShiftRepository;
    private final SpecialDayService specialDayService;
    private final UserRepository userRepository;
    private final WageCalculator wageCalculator;

    @Transactional(readOnly = true)
    public List<WorkShiftResponseDto> getMyShifts(String userId, int year, int month) {
        userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return workShiftRepository.findByUserIdAndYearMonth(userId, year, month).stream()
                .map(WorkShiftResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WorkShiftResponseDto> getStaffShifts(String staffId, int year, int month) {
        userRepository.findById(staffId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return workShiftRepository.findByUserIdAndYearMonth(staffId, year, month).stream()
                .map(WorkShiftResponseDto::from)
                .toList();
    }

    @Transactional
    public WorkShiftResponseDto create(String userId, CreateWorkShiftRequestDto request) {
        validateNotFutureDate(request.workDate());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        boolean isSpecial = specialDayService.isSpecialDate(request.workDate());
        WageCalculator.WageResult wage = wageCalculator.calculate(request.startTime(), request.endTime(), user.getHourlyWage(), user.getOvertimeWage(), isSpecial);
        WorkShift shift = WorkShift.create(user, request.workDate(), request.startTime(), request.endTime(),
                isSpecial, wage.regularMinutes(), wage.overtimeMinutes(), wage.regularWage(), wage.overtimeWage());
        workShiftRepository.save(shift);
        return WorkShiftResponseDto.from(shift);
    }

    @Transactional
    public WorkShiftResponseDto update(String userId, Long shiftId, UpdateWorkShiftRequestDto request) {
        WorkShift shift = findOwnShift(userId, shiftId);
        validateNotFutureDate(shift.getWorkDate());
        User user = shift.getUser();
        boolean isSpecial = specialDayService.isSpecialDate(shift.getWorkDate());
        WageCalculator.WageResult wage = wageCalculator.calculate(request.startTime(), request.endTime(), user.getHourlyWage(), user.getOvertimeWage(), isSpecial);
        shift.update(request.startTime(), request.endTime(),
                isSpecial, wage.regularMinutes(), wage.overtimeMinutes(), wage.regularWage(), wage.overtimeWage());
        return WorkShiftResponseDto.from(shift);
    }

    @Transactional
    public void delete(String userId, Long shiftId) {
        WorkShift shift = findOwnShift(userId, shiftId);
        workShiftRepository.delete(shift);
    }

    private void validateNotFutureDate(LocalDate workDate) {
        if (workDate.isAfter(LocalDate.now())) {
            throw new CustomException(ErrorCode.FUTURE_WORK_DATE_NOT_ALLOWED);
        }
    }

    private WorkShift findOwnShift(String userId, Long shiftId) {
        WorkShift shift = workShiftRepository.findById(shiftId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORK_SHIFT_NOT_FOUND));
        if (!shift.getUser().getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN_WORK_SHIFT);
        }
        return shift;
    }
}
