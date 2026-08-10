package com.example.seori_back.schedule.service;

import com.example.seori_back.global.exception.CustomException;
import com.example.seori_back.global.exception.ErrorCode;
import com.example.seori_back.schedule.domain.entity.ScheduleAssignment;
import com.example.seori_back.schedule.domain.entity.ScheduleVote;
import com.example.seori_back.schedule.domain.entity.ScheduleWeek;
import com.example.seori_back.schedule.domain.entity.WeekStatusEnum;
import com.example.seori_back.schedule.dto.request.ConfirmScheduleRequestDto;
import com.example.seori_back.schedule.dto.request.CreateScheduleWeekRequestDto;
import com.example.seori_back.schedule.dto.request.SaveVotesRequestDto;
import com.example.seori_back.schedule.dto.request.UpdateBusinessDaysRequestDto;
import com.example.seori_back.schedule.dto.response.ScheduleAssignmentResponseDto;
import com.example.seori_back.schedule.dto.response.ScheduleVoteResponseDto;
import com.example.seori_back.schedule.dto.response.ScheduleWeekDetailResponseDto;
import com.example.seori_back.schedule.dto.response.ScheduleWeekResponseDto;
import com.example.seori_back.schedule.repository.ScheduleAssignmentRepository;
import com.example.seori_back.schedule.repository.ScheduleVoteRepository;
import com.example.seori_back.schedule.repository.ScheduleWeekRepository;
import com.example.seori_back.user.domain.entity.User;
import com.example.seori_back.user.repository.UserRepository;
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
    private final ScheduleAssignmentRepository scheduleAssignmentRepository;
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
        List<ScheduleAssignment> assignments = scheduleAssignmentRepository.findByWeekId(weekId);
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
    public ScheduleWeekResponseDto confirm(Long weekId, ConfirmScheduleRequestDto request) {
        ScheduleWeek week = findWeek(weekId);
        if (week.getStatus() == WeekStatusEnum.VOTING) {
            throw new CustomException(ErrorCode.SCHEDULE_INVALID_STATUS);
        }

        scheduleAssignmentRepository.deleteByWeekId(weekId);

        List<ScheduleAssignment> assignments = request.assignments().stream()
                .map(item -> {
                    User user = userRepository.findById(item.userId())
                            .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
                    return ScheduleAssignment.create(week, user, item.workDate());
                })
                .toList();
        scheduleAssignmentRepository.saveAll(assignments);

        week.confirm();
        return ScheduleWeekResponseDto.from(week);
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
        return scheduleAssignmentRepository.findByWeekId(weekId).stream()
                .map(ScheduleAssignmentResponseDto::from)
                .toList();
    }

    private ScheduleWeek findWeek(Long weekId) {
        return scheduleWeekRepository.findById(weekId)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_WEEK_NOT_FOUND));
    }
}
