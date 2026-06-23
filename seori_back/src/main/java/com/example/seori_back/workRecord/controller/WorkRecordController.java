package com.example.seori_back.workRecord.controller;

import com.example.seori_back.workRecord.dto.request.CreateWorkRecordRequestDto;
import com.example.seori_back.workRecord.dto.request.UpdateWorkRecordRequestDto;
import com.example.seori_back.workRecord.dto.response.WorkRecordResponseDto;
import com.example.seori_back.workRecord.service.WorkRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-records")
@RequiredArgsConstructor
public class WorkRecordController {

    private final WorkRecordService workRecordService;

    @GetMapping("/my")
    public ResponseEntity<List<WorkRecordResponseDto>> getMyRecords(
            @RequestAttribute String userId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(workRecordService.getMyRecords(userId, year, month));
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
    public ResponseEntity<List<WorkRecordResponseDto>> getStaffRecords(
            @PathVariable String staffId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(workRecordService.getStaffRecords(staffId, year, month));
    }

    @PostMapping
    public ResponseEntity<WorkRecordResponseDto> create(
            @RequestAttribute String userId,
            @RequestBody @Valid CreateWorkRecordRequestDto request) {
        return ResponseEntity.ok(workRecordService.create(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkRecordResponseDto> update(
            @RequestAttribute String userId,
            @PathVariable Long id,
            @RequestBody @Valid UpdateWorkRecordRequestDto request) {
        return ResponseEntity.ok(workRecordService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestAttribute String userId,
            @PathVariable Long id) {
        workRecordService.delete(userId, id);
        return ResponseEntity.ok().build();
    }
}
