package com.ecobazaarx.mapper;

import com.ecobazaarx.dto.UserDto;
import com.ecobazaarx.entity.Status;
import com.ecobazaarx.entity.User;

public class UserMapper {

    // Convert Entity → DTO
    public static UserDto toDto(User user) {
        if (user == null) return null;

        return new UserDto(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user.getAgreeToTerms(),
            user.getSubscribeNewsletter(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.getStatus().name()
            
        );
    }

    // Convert DTO → Entity
    public static User toEntity(UserDto dto) {
        if (dto == null) return null;

        User user = new User();
        user.setId(dto.getId());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        // password intentionally excluded (should be set separately)
        // role will be converted back from String
        user.setRole(dto.getRole() != null ? Enum.valueOf(com.ecobazaarx.entity.Role.class, dto.getRole()) : null);
        user.setAgreeToTerms(dto.getAgreeToTerms());
        user.setSubscribeNewsletter(dto.getSubscribeNewsletter());
        user.setCreatedAt(dto.getCreatedAt());
        user.setUpdatedAt(dto.getUpdatedAt());
        if (dto.getStatus() != null) {
            user.setStatus(Enum.valueOf(Status.class, dto.getStatus())); // ✅ String → Enum
        }
        return user;
    }
}
