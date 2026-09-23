package com.example.seori_back.schedule.service;

import com.example.seori_back.global.exception.CustomException;
import com.example.seori_back.global.exception.ErrorCode;
import com.example.seori_back.schedule.domain.entity.ScheduleVote;
import com.example.seori_back.schedule.domain.entity.ScheduleWeek;
import com.example.seori_back.schedule.domain.entity.WeekStatusEnum;
import com.example.seori_back.schedule.dto.request.AssignmentItem;
import com.example.seori_back.schedule.dto.request.AssignmentsRequestDto;
import com.example.seori_back.schedule.dto.request.CreateScheduleWeekRequestDto;
import com.example.seori_back.schedule.dto.request.SaveVotesRequestDto;
import com.example.seori_back.schedule.dto.request.UpdateAssignmentsRequestDto;
import com.example.seori_back.schedule.dto.request.UpdateBusinessDaysRequestDto;
import com.example.seori_back.schedule.dto.response.ScheduleAssignmentResponseDto;
import com.example.seori_back.schedule.dto.response.ScheduleVoteResponseDto;
import com.example.seori_back.schedule.dto.response.ScheduleWeekDetailResponseDto;
import com.example.seori_back.schedule.dto.response.ScheduleWeekResponseDto;
import com.example.seori_back.schedule.repository.ScheduleVoteRepository;
import com.example.seori_back.schedule.repository.ScheduleWeekRepository;
import com.example.seori_back.user.domain.entity.User;
import com.example.seori_back.user.repository.UserRepository;
import com.example.seori_back.workShift.domain.entity.WorkShift;
import com.example.seori_back.workShift.repository.WorkShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleWeekRepository scheduleWeekRepository;
    private final ScheduleVoteRepository scheduleVoteRepository;
    private final WorkShiftRepository workShiftRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ScheduleWeekResponseDto> getWeeks() {
        return scheduleWeekRepository.findAllByOrderByWeekStartDateAsc().stream()
                .map(ScheduleWeekResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ScheduleWeekDetailResponseDto getWeekDetail(Long weekId) {
        ScheduleWeek week = findWeek(weekId);
        List<ScheduleVote> votes = scheduleVoteRepository.findByWeekId(weekId);
        List<WorkShift> assignments = workShiftRepository.findByWeekId(weekId);
        return ScheduleWeekDetailResponseDto.from(week, votes, assignments);
    }

    @Transactional
    public ScheduleWeekResponseDto createWeek(CreateScheduleWeekRequestDto request) {
        ScheduleWeek week = ScheduleWeek.create(request.weekStartDate(), request.votingDeadline(), request.businessDays());
        scheduleWeekRepository.save(week);
        return ScheduleWeekResponseDto.from(week);
    }

    @Transactional
    public ScheduleWeekResponseDto updateBusinessDays(Long weekId, UpdateBusinessDaysRequestDto request) {
        ScheduleWeek week = findWeek(weekId);
        if (week.getStatus() == WeekStatusEnum.CONFIRMED) {
            throw new CustomException(ErrorCode.SCHEDULE_ALREADY_CONFIRMED);
        }
        week.updateBusinessDays(request.businessDays());
        return ScheduleWeekResponseDto.from(week);
    }

    @Transactional
    public ScheduleWeekResponseDto closeVoting(Long weekId) {
        ScheduleWeek week = findWeek(weekId);
        if (week.getStatus() != WeekStatusEnum.VOTING) {
            throw new CustomException(ErrorCode.SCHEDULE_INVALID_STATUS);
        }
        week.close();
        return ScheduleWeekResponseDto.from(week);
    }

    @Transactional
    public ScheduleWeekResponseDto confirm(Long weekId, AssignmentsRequestDto request) {
        ScheduleWeek week = findWeek(weekId);
        if (week.getStatus() != WeekStatusEnum.CLOSED) {
            throw new CustomException(ErrorCode.SCHEDULE_INVALID_STATUS);
        }

        createMissingShifts(week, request.assignments());

        week.confirm();
        return ScheduleWeekResponseDto.from(week);
    }

    @Transactional
    public ScheduleWeekResponseDto updateAssignments(Long weekId, UpdateAssignmentsRequestDto request) {
        ScheduleWeek week = findWeek(weekId);
        if (week.getStatus() != WeekStatusEnum.CONFIRMED) {
            throw new CustomException(ErrorCode.SCHEDULE_INVALID_STATUS);
        }

        request.remove().forEach(item ->
                workShiftRepository.findByUserIdAndWorkDate(item.userId(), item.workDate())
                        .filter(w -> w.getStartTime() == null)
                        .ifPresent(workShiftRepository::delete));

        createMissingShifts(week, request.add());

        return ScheduleWeekResponseDto.from(week);
    }

    private void createMissingShifts(ScheduleWeek week, List<AssignmentItem> items) {
        List<AssignmentItem> distinctItems = items.stream().distinct().toList();
        distinctItems.forEach(item -> validateBusinessDate(week, item.workDate()));

        List<WorkShift> toCreate = distinctItems.stream()
                .filter(item -> workShiftRepository.findByUserIdAndWorkDate(item.userId(), item.workDate()).isEmpty())
                .map(item -> {
                    User user = userRepository.findById(item.userId())
                            .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
                    return WorkShift.createScheduled(user, week, item.workDate());
                })
                .toList();
        workShiftRepository.saveAll(toCreate);
    }

    private void validateBusinessDate(ScheduleWeek week, LocalDate date) {
        long offset = ChronoUnit.DAYS.between(week.getWeekStartDate(), date);
        boolean[] businessDays = week.getBusinessDaysAsArray();
        if (offset < 0 || offset > 6 || !businessDays[(int) offset]) {
            throw new CustomException(ErrorCode.INVALID_ASSIGNMENT_DATE);
        }
    }

    @Transactional(readOnly = true)
    public List<ScheduleVoteResponseDto> getVotes(Long weekId) {
        findWeek(weekId);
        return scheduleVoteRepository.findByWeekId(weekId).stream()
                .map(ScheduleVoteResponseDto::from)
                .toList();
    }

    @Transactional
    public void saveVotes(Long weekId, String userId, SaveVotesRequestDto request) {
        ScheduleWeek week = findWeek(weekId);
        if (week.getStatus() != WeekStatusEnum.VOTING) {
            throw new CustomException(ErrorCode.SCHEDULE_INVALID_STATUS);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        scheduleVoteRepository.deleteByWeekIdAndUserId(weekId, userId);

        List<ScheduleVote> votes = request.availableDates().stream()
                .map(date -> ScheduleVote.create(week, user, date))
                .toList();
        scheduleVoteRepository.saveAll(votes);
    }

    @Transactional(readOnly = true)
    public List<ScheduleAssignmentResponseDto> getAssignments(Long weekId) {
        findWeek(weekId);
        return workShiftRepository.findByWeekId(weekId).stream()
                .map(ScheduleAssignmentResponseDto::from)
                .toList();
    }

    private ScheduleWeek findWeek(Long weekId) {
        return scheduleWeekRepository.findById(weekId)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_WEEK_NOT_FOUND));
    }
}
