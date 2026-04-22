package com.ecobazaarx.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
// FIX: Removed @CrossOrigin(origins = "*") — handled globally in WebSecurityConfig
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now(),
            "service", "EcoMarket API",
            "version", "1.0.0"
        ));
    }
}