package com.example.seori_back.user.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, length = 15, unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRoleEnum role;

    @Column(nullable = false)
    private int hourlyWage;

    @Column(nullable = false)
    private int overtimeWage;

    public static User create(String userId, String encodedPassword, String phone, UserRoleEnum role, int hourlyWage, int overtimeWage) {
        User user = new User();
        user.userId = userId;
        user.password = encodedPassword;
        user.phone = phone;
        user.role = role;
        user.hourlyWage = hourlyWage;
        user.overtimeWage = overtimeWage;
        return user;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
