package com.example.seori_back.user.service;

import com.example.seori_back.global.exception.CustomException;
import com.example.seori_back.global.exception.ErrorCode;
import com.example.seori_back.global.jwt.JwtUtil;
import com.example.seori_back.user.domain.entity.User;
import com.example.seori_back.user.domain.entity.UserRoleEnum;
import com.example.seori_back.user.dto.request.ChangePasswordRequestDto;
import com.example.seori_back.user.dto.request.CreateUserRequestDto;
import com.example.seori_back.user.dto.request.LoginRequestDto;
import com.example.seori_back.user.dto.request.UpdateStaffRequestDto;
import com.example.seori_back.user.dto.response.LoginResponseDto;
import com.example.seori_back.user.dto.response.StaffSummaryResponseDto;
import com.example.seori_back.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public void createUser(CreateUserRequestDto request) {
        String phone = request.phone().replaceAll("[^0-9]", "");
        if(phone.length() < 11){
            throw new CustomException(ErrorCode.INVALID_PHONE_NUMBER);
        }
        String userId = phone.substring(phone.length() - 4);

        if (userRepository.existsById(userId)) {
            throw new CustomException(ErrorCode.DUPLICATE_USER_ID);
        }

        String encoded = passwordEncoder.encode(userId);
        User user = User.create(userId, encoded, request.phone(), request.name(), request.role(), request.hourlyWage(), request.overtimeWage());
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        String accessToken = jwtUtil.generateAccessToken(user.getPhone(), user.getUserId(), user.getRole().getAuthority());
        String refreshToken = jwtUtil.generateRefreshToken(user.getPhone(), user.getUserId(), user.getRole().getAuthority());

        return new LoginResponseDto(accessToken, refreshToken);
    }

    @Transactional(readOnly = true)
    public String refreshAccessToken(String refreshToken) {
        Claims claims = parseRefreshToken(refreshToken);

        String userId = claims.get("userId", String.class);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return jwtUtil.generateAccessToken(user.getPhone(), user.getUserId(), user.getRole().getAuthority());
    }

    private Claims parseRefreshToken(String refreshToken) {
        try {
            Claims claims = jwtUtil.parseToken(refreshToken);
            if (!"refresh".equals(claims.get("type"))) {
                throw new CustomException(ErrorCode.INVALID_TOKEN_TYPE);
            }
            return claims;
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
    }

    @Transactional(readOnly = true)
    public List<StaffSummaryResponseDto> getStaffList() {
        return userRepository.findByRoleIn(List.of(UserRoleEnum.STAFF, UserRoleEnum.MANAGER)).stream()
                .map(StaffSummaryResponseDto::from)
                .toList();
    }

    @Transactional
    public void updateStaff(String userId, UpdateStaffRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.updateProfile(request.name(), request.role(), request.hourlyWage(), request.overtimeWage());
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_CURRENT_PASSWORD);
        }

        user.changePassword(passwordEncoder.encode(request.newPassword()));
    }
}
