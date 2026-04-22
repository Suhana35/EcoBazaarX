package com.ecobazaarx.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.ecobazaarx.dto.AddToCartRequest;
import com.ecobazaarx.dto.CartDto;
import com.ecobazaarx.dto.UpdateCartItemRequest;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.security.jwt.JwtUtils;
import com.ecobazaarx.service.CartService;

@RestController
@RequestMapping("/api/cart")
// FIX: Removed @CrossOrigin(origins = "*") — handled globally in WebSecurityConfig
@PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
public class CartController {

    private static final Logger log = LoggerFactory.getLogger(CartController.class);

    private final CartService cartService;
    private final JwtUtils jwtUtils;

    @Autowired
    public CartController(CartService cartService, JwtUtils jwtUtils) {
        this.cartService = cartService;
        this.jwtUtils = jwtUtils;
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = jwtUtils.parseJwt(request);
        return jwtUtils.getUserIdFromJwtToken(token);
    }

    @GetMapping
    public ResponseEntity<CartDto> getUserCart(HttpServletRequest request) {
        return ResponseEntity.ok(cartService.getUserCart(getUserIdFromRequest(request)));
    }

    @PostMapping("/add")
    public ResponseEntity<CartDto> addToCart(
            @Valid @RequestBody AddToCartRequest addToCartRequest,
            HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        // FIX: Removed System.out.println("User Id : " + userId)
        log.debug("addToCart request for userId={}", userId);
        return ResponseEntity.ok(cartService.addToCart(userId, addToCartRequest));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartDto> updateCartItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest updateRequest,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(cartService.updateCartItem(user.getId(), cartItemId, updateRequest));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartDto> removeFromCart(
            @PathVariable Long cartItemId, HttpServletRequest request) {
        return ResponseEntity.ok(cartService.removeFromCart(getUserIdFromRequest(request), cartItemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(HttpServletRequest request) {
        cartService.clearCart(getUserIdFromRequest(request));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCartItemCount(HttpServletRequest request) {
        return ResponseEntity.ok(cartService.getCartItemCount(getUserIdFromRequest(request)));
    }
}