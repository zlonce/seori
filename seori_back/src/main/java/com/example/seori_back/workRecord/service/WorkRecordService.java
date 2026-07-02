package com.example.seori_back.workRecord.service;

import com.example.seori_back.global.exception.CustomException;
import com.example.seori_back.global.exception.ErrorCode;
import com.example.seori_back.global.util.WageCalculator;
import com.example.seori_back.specialday.service.SpecialDayService;
import com.example.seori_back.user.domain.entity.User;
import com.example.seori_back.user.repository.UserRepository;
import com.example.seori_back.workRecord.domain.entity.WorkRecord;
import com.example.seori_back.workRecord.dto.request.CreateWorkRecordRequestDto;
import com.example.seori_back.workRecord.dto.request.UpdateWorkRecordRequestDto;
import com.example.seori_back.workRecord.dto.response.WorkRecordResponseDto;
import com.example.seori_back.workRecord.repository.WorkRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkRecordService {

    private final WorkRecordRepository workRecordRepository;
    private final SpecialDayService specialDayService;
    private final UserRepository userRepository;
    private final WageCalculator wageCalculator;

    @Transactional(readOnly = true)
    public List<WorkRecordResponseDto> getMyRecords(String userId, int year, int month) {
        userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return workRecordRepository.findByUserIdAndYearMonth(userId, year, month).stream()
                .map(WorkRecordResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WorkRecordResponseDto> getStaffRecords(String staffId, int year, int month) {
        userRepository.findById(staffId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return workRecordRepository.findByUserIdAndYearMonth(staffId, year, month).stream()
                .map(WorkRecordResponseDto::from)
                .toList();
    }

    @Transactional
    public WorkRecordResponseDto create(String userId, CreateWorkRecordRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        boolean isSpecial = specialDayService.isSpecialDate(request.workDate());
        WageCalculator.WageResult wage = wageCalculator.calculate(request.startTime(), request.endTime(), user.getHourlyWage(), user.getOvertimeWage(), isSpecial);
        WorkRecord record = WorkRecord.create(user, request.workDate(), request.startTime(), request.endTime(),
                isSpecial, wage.regularMinutes(), wage.overtimeMinutes(), wage.regularWage(), wage.overtimeWage());
        workRecordRepository.save(record);
        return WorkRecordResponseDto.from(record);
    }

    @Transactional
    public WorkRecordResponseDto update(String userId, Long recordId, UpdateWorkRecordRequestDto request) {
        WorkRecord record = findOwnRecord(userId, recordId);
        User user = record.getUser();
        boolean isSpecial = specialDayService.isSpecialDate(record.getWorkDate());
        WageCalculator.WageResult wage = wageCalculator.calculate(request.startTime(), request.endTime(), user.getHourlyWage(), user.getOvertimeWage(), isSpecial);
        record.update(request.startTime(), request.endTime(),
                isSpecial, wage.regularMinutes(), wage.overtimeMinutes(), wage.regularWage(), wage.overtimeWage());
        return WorkRecordResponseDto.from(record);
    }

    @Transactional
    public void delete(String userId, Long recordId) {
        WorkRecord record = findOwnRecord(userId, recordId);
        workRecordRepository.delete(record);
    }

    private WorkRecord findOwnRecord(String userId, Long recordId) {
        WorkRecord record = workRecordRepository.findById(recordId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORK_RECORD_NOT_FOUND));
        if (!record.getUser().getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN_WORK_RECORD);
        }
        return record;
    }
}
