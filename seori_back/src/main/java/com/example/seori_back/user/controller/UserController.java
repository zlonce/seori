package com.example.seori_back.user.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.seori_back.user.dto.request.ChangePasswordRequestDto;
import com.example.seori_back.user.dto.request.CreateUserRequestDto;
import com.example.seori_back.user.dto.request.UpdateStaffRequestDto;
import com.example.seori_back.user.dto.response.StaffSummaryResponseDto;
import com.example.seori_back.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@PostMapping()
	@PreAuthorize("hasRole('OWNER')")
	public ResponseEntity<Void> createUser(@RequestBody @Valid CreateUserRequestDto request) {
		userService.createUser(request);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/staff")
	@PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
	public ResponseEntity<List<StaffSummaryResponseDto>> getStaffList() {
		return ResponseEntity.ok(userService.getStaffList());
	}

	@PatchMapping("/{userId}/profile")
	@PreAuthorize("hasRole('OWNER') or hasRole('MANAGER')")
	public ResponseEntity<Void> updateStaff(
		@PathVariable String userId,
		@RequestBody @Valid UpdateStaffRequestDto request) {
		userService.updateStaff(userId, request);
		return ResponseEntity.ok().build();
	}

	@PatchMapping("/password")
	public ResponseEntity<Void> changePassword(
		@RequestAttribute String userId,
		@RequestBody @Valid ChangePasswordRequestDto request) {
		userService.changePassword(userId, request);
		return ResponseEntity.ok().build();
	}
}
