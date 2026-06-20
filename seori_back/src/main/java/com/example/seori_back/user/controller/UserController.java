package com.example.seori_back.user.controller;

import com.example.seori_back.user.dto.request.ChangePasswordRequestDto;
import com.example.seori_back.user.dto.request.CreateUserRequestDto;
import com.example.seori_back.user.dto.request.LoginRequestDto;
import com.example.seori_back.user.dto.response.LoginResponseDto;
import com.example.seori_back.user.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody @Valid LoginRequestDto request,
            HttpServletResponse response) {

        LoginResponseDto tokens = userService.login(request);

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokens.getRefreshToken())
                .httpOnly(true)
                .secure(false) // 운영 환경에서는 true (HTTPS)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(Map.of("accessToken", tokens.getAccessToken()));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<Map<String, String>> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String newAccessToken = userService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(Duration.ofSeconds(0))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> createUser(@RequestBody @Valid CreateUserRequestDto request) {
        userService.createUser(request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/password")
    public ResponseEntity<Void> changePassword(
            @RequestAttribute String userId,
            @RequestBody @Valid ChangePasswordRequestDto request) {
        userService.changePassword(userId, request);
        return ResponseEntity.ok().build();
    }
}
