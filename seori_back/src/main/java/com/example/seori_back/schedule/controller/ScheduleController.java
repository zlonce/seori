package com.example.seori_back.schedule.controller;

import com.example.seori_back.schedule.dto.request.ConfirmScheduleRequestDto;
import com.example.seori_back.schedule.dto.request.CreateScheduleWeekRequestDto;
import com.example.seori_back.schedule.dto.request.SaveVotesRequestDto;
import com.example.seori_back.schedule.dto.request.UpdateBusinessDaysRequestDto;
import com.example.seori_back.schedule.dto.response.ScheduleAssignmentResponseDto;
import com.example.seori_back.schedule.dto.response.ScheduleVoteResponseDto;
import com.example.seori_back.schedule.dto.response.ScheduleWeekDetailResponseDto;
import com.example.seori_back.schedule.dto.response.ScheduleWeekResponseDto;
import com.example.seori_back.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<ScheduleWeekResponseDto>> getWeeks() {
        return ResponseEntity.ok(scheduleService.getWeeks());
    }

    @GetMapping("/{weekId}")
    public ResponseEntity<ScheduleWeekDetailResponseDto> getWeekDetail(@PathVariable Long weekId) {
        return ResponseEntity.ok(scheduleService.getWeekDetail(weekId));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
    public ResponseEntity<ScheduleWeekResponseDto> createWeek(
            @RequestBody @Valid CreateScheduleWeekRequestDto request) {
        return ResponseEntity.ok(scheduleService.createWeek(request));
    }

    @PatchMapping("/{weekId}/business-days")
    @PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
    public ResponseEntity<ScheduleWeekResponseDto> updateBusinessDays(
            @PathVariable Long weekId,
            @RequestBody @Valid UpdateBusinessDaysRequestDto request) {
        return ResponseEntity.ok(scheduleService.updateBusinessDays(weekId, request));
    }

    @PatchMapping("/{weekId}/close")
    @PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
    public ResponseEntity<ScheduleWeekResponseDto> closeVoting(@PathVariable Long weekId) {
        return ResponseEntity.ok(scheduleService.closeVoting(weekId));
    }

    @PutMapping("/{weekId}/confirm")
    @PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
    public ResponseEntity<ScheduleWeekResponseDto> confirm(
            @PathVariable Long weekId,
            @RequestBody @Valid ConfirmScheduleRequestDto request) {
        return ResponseEntity.ok(scheduleService.confirm(weekId, request));
    }

    @GetMapping("/{weekId}/votes")
    public ResponseEntity<List<ScheduleVoteResponseDto>> getVotes(@PathVariable Long weekId) {
        return ResponseEntity.ok(scheduleService.getVotes(weekId));
    }

    @PutMapping("/{weekId}/votes")
    @PreAuthorize("hasRole('STAFF') or hasRole('MANAGER')")
    public ResponseEntity<Void> saveVotes(
            @PathVariable Long weekId,
            @RequestBody @Valid SaveVotesRequestDto request,
            @AuthenticationPrincipal String userId) {
        scheduleService.saveVotes(weekId, userId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{weekId}/assignments")
    public ResponseEntity<List<ScheduleAssignmentResponseDto>> getAssignments(@PathVariable Long weekId) {
        return ResponseEntity.ok(scheduleService.getAssignments(weekId));
    }
}
