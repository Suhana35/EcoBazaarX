package com.ecobazaarx.service;



import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecobazaarx.dto.UserDto;
import com.ecobazaarx.entity.Status;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.mapper.UserMapper;
import com.ecobazaarx.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + username));

        return user;
    }
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                    .map(UserMapper::toDto) // convert each entity → DTO
                    .toList();
    }
	public UserDto deleteUser(Long id,Status status) 
	{
	
		 User user = userRepository.findById(id)
		            .orElseThrow(() -> new RuntimeException("User not found with id " + id));

		    // Update status
		    user.setStatus(status);

		    // Save updated user
		    user = userRepository.save(user);

		    // Return updated user as DTO
		    return UserMapper.toDto(user);
		
	}
	
	public UserDto updateUserRole(Long id, String roleName) {
	    User user = userRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

	    try {
	        user.setRole(Enum.valueOf(com.ecobazaarx.entity.Role.class, roleName));
	    } catch (IllegalArgumentException e) {
	        throw new IllegalArgumentException("Invalid role: " + roleName);
	    }

	    User savedUser = userRepository.save(user);
	    return new UserDto(
	            savedUser.getId(),
	            savedUser.getName(),
	            savedUser.getEmail(),
	            savedUser.getRole().name(), // Ensure enum converted to String
	            savedUser.getAgreeToTerms(),
	            savedUser.getSubscribeNewsletter(),
	            savedUser.getCreatedAt(),
	            savedUser.getUpdatedAt(),
	            savedUser.getStatus().name() // If Status is an enum, convert to String
	    );
	    }

	
}