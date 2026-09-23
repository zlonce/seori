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

import java.time.LocalDateTime;
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

        // 아직 시간 미입력(예정) 상태인 것만 제거. 이미 실제 시간이 입력된 row는 보존한다.
        request.remove().forEach(item ->
                workShiftRepository.findByUserIdAndWorkDate(item.userId(), item.workDate())
                        .filter(w -> w.getStartTime() == null)
                        .ifPresent(workShiftRepository::delete));

        createMissingShifts(week, request.add());

        return ScheduleWeekResponseDto.from(week);
    }

    // 해당 (유저, 날짜)에 WorkShift가 아직 없는 경우에만 예정 row를 새로 만든다.
    private void createMissingShifts(ScheduleWeek week, List<AssignmentItem> items) {
        List<WorkShift> toCreate = items.stream()
                .distinct()
                .filter(item -> workShiftRepository.findByUserIdAndWorkDate(item.userId(), item.workDate()).isEmpty())
                .map(item -> {
                    User user = userRepository.findById(item.userId())
                            .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
                    return WorkShift.createScheduled(user, week, item.workDate());
                })
                .toList();
        workShiftRepository.saveAll(toCreate);
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
