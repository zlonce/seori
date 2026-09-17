package com.example.seori_back.workShift.controller;

import com.example.seori_back.workShift.dto.request.CreateWorkShiftRequestDto;
import com.example.seori_back.workShift.dto.request.UpdateWorkShiftRequestDto;
import com.example.seori_back.workShift.dto.response.WorkShiftResponseDto;
import com.example.seori_back.workShift.service.WorkShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/work-shifts")
@RequiredArgsConstructor
public class WorkShiftController {

    private final WorkShiftService workShiftService;

    @GetMapping("/my")
    public ResponseEntity<List<WorkShiftResponseDto>> getMyShifts(
            @AuthenticationPrincipal String userId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(workShiftService.getMyShifts(userId, year, month));
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
    public ResponseEntity<List<WorkShiftResponseDto>> getStaffShifts(
            @PathVariable String staffId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(workShiftService.getStaffShifts(staffId, year, month));
    }

    @PostMapping
    public ResponseEntity<WorkShiftResponseDto> create(
            @AuthenticationPrincipal String userId,
            @RequestBody @Valid CreateWorkShiftRequestDto request) {
        return ResponseEntity.ok(workShiftService.create(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkShiftResponseDto> update(
            @AuthenticationPrincipal String userId,
            @PathVariable Long id,
            @RequestBody @Valid UpdateWorkShiftRequestDto request) {
        return ResponseEntity.ok(workShiftService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal String userId,
            @PathVariable Long id) {
        workShiftService.delete(userId, id);
        return ResponseEntity.ok().build();
    }
}
