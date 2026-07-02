package com.example.seori_back.user.repository;

import com.example.seori_back.user.domain.entity.User;
import com.example.seori_back.user.domain.entity.UserRoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    List<User> findByRoleIn(List<UserRoleEnum> roles);
    boolean existsById(String userId);
}
