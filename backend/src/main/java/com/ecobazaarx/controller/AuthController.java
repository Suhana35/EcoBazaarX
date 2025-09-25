package com.ecobazaarx.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.ecobazaarx.dto.UserDto;
import com.ecobazaarx.entity.Status;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.payload.request.LoginRequest;
import com.ecobazaarx.payload.request.SignupRequest;
import com.ecobazaarx.payload.response.JwtResponse;
import com.ecobazaarx.payload.response.MessageResponse;
import com.ecobazaarx.repository.UserRepository;
import com.ecobazaarx.security.jwt.JwtUtils;
import com.ecobazaarx.service.UserDetailsServiceImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
	@Autowired
	AuthenticationManager authenticationManager;

	@Autowired
	UserRepository userRepository;

	@Autowired
	PasswordEncoder encoder;

	@Autowired
	JwtUtils jwtUtils;

	@Autowired
	UserDetailsServiceImpl userService;

	@PostMapping("/signin")
	public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		User user = (User) authentication.getPrincipal();
		
		if (user.getStatus() == Status.INACTIVE) {
	        return ResponseEntity.badRequest()
	                .body(new MessageResponse("Your account is inactive. Please contact support."));
	    }
		
		String jwt = jwtUtils.generateJwtToken(user.getUsername(), user.getId(), user.getRole().name());


		return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getRole()));
	}

	@PostMapping("/signup")
	public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
		if (userRepository.existsByEmail(signUpRequest.getEmail())) {
			return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
		}

		// Create new user's account
		User user = new User(signUpRequest.getName(), signUpRequest.getEmail(),
				encoder.encode(signUpRequest.getPassword()), signUpRequest.getRole());

		user.setAgreeToTerms(signUpRequest.getAgreeToTerms());
		user.setSubscribeNewsletter(signUpRequest.getSubscribeNewsletter());

		userRepository.save(user);

		return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
	}



	@GetMapping("/me")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> getCurrentUser(Authentication authentication) {
		User user = (User) authentication.getPrincipal();

		// Reuse the same JwtResponse structure as /signin
		return ResponseEntity.ok(new JwtResponse("", // no new token here
				user.getId(), user.getName(), user.getEmail(), user.getRole()));
	}

	@GetMapping("/admin/users")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<UserDto>> getAllUsers() {
		List<UserDto> users = userService.getAllUsers();

		if (users.isEmpty()) {
			return ResponseEntity.noContent().build(); 
		}

		return ResponseEntity.ok(users); 
	}

	@PatchMapping("/admin/{id}/status")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestParam String status
//			,HttpServletRequest request
			) 
	{
//		String token = jwtUtils.parseJwt(request);

		Status s;
		try {
//			Long i= jwtUtils.getUserIdFromJwtToken(token);
			s = Status.valueOf(status.toUpperCase());
		} catch (Exception e) {
			return ResponseEntity.badRequest()
					.body(Map.of("success", false, "message", "Invalid user status: " + status, "data", null));
		}

		UserDto updatedUser = userService.deleteUser(id, s);

		return ResponseEntity.ok(Map.of("success", true, "message", "User status changed", "data", updatedUser));
	}
	
	@PatchMapping("/admin/{id}/role")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam String role) {
	    try {
	        UserDto updatedUser = userService.updateUserRole(id, role.toUpperCase());
	        return ResponseEntity.ok(Map.of("success", true, "message", "User role changed", "data", updatedUser));
	    } catch (IllegalArgumentException e) {
	        return ResponseEntity.badRequest()
	                .body(Map.of("success", false, "message", "Invalid role: " + role, "data", null));
	    } catch (RuntimeException e) {
	        return ResponseEntity.badRequest()
	                .body(Map.of("success", false, "message", e.getMessage(), "data", null));
	    }
	}


}
