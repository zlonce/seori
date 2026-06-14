package com.example.seori_back.user.service;

import com.example.seori_back.global.jwt.JwtUtil;
import com.example.seori_back.user.domain.entity.User;
import com.example.seori_back.user.dto.request.ChangePasswordRequestDto;
import com.example.seori_back.user.dto.request.CreateUserRequestDto;
import com.example.seori_back.user.dto.request.LoginRequestDto;
import com.example.seori_back.user.dto.response.LoginResponseDto;
import com.example.seori_back.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public void createUser(CreateUserRequestDto request) {
        String phone = request.getPhone().replaceAll("[^0-9]", "");
        Long userId = Long.parseLong(phone.substring(phone.length() - 4));

        if (userRepository.existsById(userId)) {
            throw new IllegalArgumentException("이미 등록된 전화번호 뒷자리입니다: " + userId);
        }

        String initialPassword = String.valueOf(userId);
        String encoded = passwordEncoder.encode(initialPassword);

        User user = User.create(userId, encoded, request.getPhone(), request.getRole(), request.getHourlyWage(), request.getOvertimeWage());
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getPhone(), user.getUserId(), user.getRole().getAuthority());
        String refreshToken = jwtUtil.generateRefreshToken(user.getPhone(), user.getUserId(), user.getRole().getAuthority());

        return new LoginResponseDto(accessToken, refreshToken);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        user.changePassword(passwordEncoder.encode(request.getNewPassword()));
    }
}
