package com.ecobazaarx.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ecobazaarx.dto.AddToCartRequest;
import com.ecobazaarx.dto.CartDto;
import com.ecobazaarx.dto.UpdateCartItemRequest;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.security.jwt.JwtUtils;
import com.ecobazaarx.service.CartService;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
public class CartController {
    
    private final CartService cartService;
    private final JwtUtils jwtUtils;
    
    @Autowired
    public CartController(CartService cartService, JwtUtils jwtUtils) {
        this.cartService = cartService;
        this.jwtUtils = jwtUtils;
    }
    
//    private Long getUserIdFromRequest(HttpServletRequest request) {
//        String token = jwtUtils.parseJwt(request);
//        String username = jwtUtils.getUserNameFromJwtToken(token);
//        return jwtUtils.getUserIdFromJwtToken(token); // You'll need to implement this method in JwtUtils
//    }
    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = jwtUtils.parseJwt(request);
        return jwtUtils.getUserIdFromJwtToken(token);
    }

    @GetMapping
    public ResponseEntity<CartDto> getUserCart(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        CartDto cart = cartService.getUserCart(userId);
        return ResponseEntity.ok(cart);
    }
    
//    @PostMapping("/add")
//    public ResponseEntity<CartDto> addToCart(@Valid @RequestBody AddToCartRequest addToCartRequest,
//                                           HttpServletRequest request) {
//        Long userId = getUserIdFromRequest(request);
//        System.out.println("User Id : " + getUserIdFromRequest(request));
//        CartDto cart = cartService.addToCart(userId, addToCartRequest);
//        return ResponseEntity.ok(cart);
//    }
    @PostMapping("/add")
    public ResponseEntity<CartDto> addToCart(@Valid @RequestBody AddToCartRequest addToCartRequest,
                                           HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        System.out.println("User Id : " + getUserIdFromRequest(request));
        CartDto cart = cartService.addToCart(userId, addToCartRequest);
        return ResponseEntity.ok(cart);
    }
    
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartDto> updateCartItem(@PathVariable Long cartItemId,
                                                @Valid @RequestBody UpdateCartItemRequest updateRequest,
                                                HttpServletRequest request,Authentication authentication) {
    	 User user = (User) authentication.getPrincipal();
 	    Long userId = user.getId();
        CartDto cart = cartService.updateCartItem(userId, cartItemId, updateRequest);
        return ResponseEntity.ok(cart);
    }
    
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartDto> removeFromCart(@PathVariable Long cartItemId,
                                                HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        CartDto cart = cartService.removeFromCart(userId, cartItemId);
        return ResponseEntity.ok(cart);
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/count")
    public ResponseEntity<Integer> getCartItemCount(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        Integer count = cartService.getCartItemCount(userId);
        return ResponseEntity.ok(count);
    }
}