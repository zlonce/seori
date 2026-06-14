package com.example.seori_back.user.controller;

import com.example.seori_back.user.dto.request.ChangePasswordRequestDto;
import com.example.seori_back.user.dto.request.CreateUserRequestDto;
import com.example.seori_back.user.dto.request.LoginRequestDto;
import com.example.seori_back.user.dto.response.LoginResponseDto;
import com.example.seori_back.user.service.UserService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody @Valid LoginRequestDto request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> createUser(@RequestBody @Valid CreateUserRequestDto request) {
        userService.createUser(request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/password")
    public ResponseEntity<Void> changePassword(
            @RequestAttribute("userId") Long userId,
            @RequestBody @Valid ChangePasswordRequestDto request) {
        userService.changePassword(userId, request);
        return ResponseEntity.ok().build();
    }
}
