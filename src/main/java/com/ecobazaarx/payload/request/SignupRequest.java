package com.ecobazaarx.payload.request;

import com.ecobazaarx.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String name;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    private Role role = Role.CONSUMER;
    private Boolean agreeToTerms = false;
    private Boolean subscribeNewsletter = true;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Boolean getAgreeToTerms() { return agreeToTerms; }
    public void setAgreeToTerms(Boolean agreeToTerms) { this.agreeToTerms = agreeToTerms; }

    public Boolean getSubscribeNewsletter() { return subscribeNewsletter; }
    public void setSubscribeNewsletter(Boolean subscribeNewsletter) { this.subscribeNewsletter = subscribeNewsletter; }
}