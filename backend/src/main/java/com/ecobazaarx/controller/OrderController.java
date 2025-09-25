package com.ecobazaarx.controller;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ecobazaarx.dto.CreateOrderRequest;
import com.ecobazaarx.dto.OrderDto;
import com.ecobazaarx.dto.UserOrderStats;
import com.ecobazaarx.entity.OrderStatus;
import com.ecobazaarx.exception.AccessDeniedException;
import com.ecobazaarx.security.jwt.JwtUtils;
import com.ecobazaarx.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {
    
    private final OrderService orderService;
    private final JwtUtils jwtUtils;
    
    @Autowired
    public OrderController(OrderService orderService, JwtUtils jwtUtils) {
        this.orderService = orderService;
        this.jwtUtils = jwtUtils;
    }
    
    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = jwtUtils.parseJwt(request);
        return jwtUtils.getUserIdFromJwtToken(token);
    }
    

    
    @PostMapping
    @PreAuthorize("hasRole('CONSUMER')")
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody CreateOrderRequest createOrderRequest,
                                              HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        OrderDto order = orderService.createOrderFromCart(userId, createOrderRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getOrdersBySellerId( HttpServletRequest request) {
    	Long userId = getUserIdFromRequest(request);
        List<OrderDto> orders = orderService.getOrdersBySellerId(userId);
        return ResponseEntity.ok(orders);
    }
    

    
    @PostMapping("/product/{productId}")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> createOrderForProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") int quantity,
            @Valid @RequestBody CreateOrderRequest createOrderRequest,
            HttpServletRequest request) {
        
        Long userId = getUserIdFromRequest(request);
        OrderDto order = orderService.createOrderForProduct(userId, productId, quantity, createOrderRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    
    @GetMapping
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getUserOrders(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        List<OrderDto> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/paginated")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDto>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        Page<OrderDto> orders = orderService.getUserOrders(userId, page, size);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long orderId,
                                               HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        OrderDto order = orderService.getOrderById(orderId, userId);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/tracking/{trackingNumber}")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> getOrderByTrackingNumber(@PathVariable String trackingNumber,
                                                           HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        OrderDto order = orderService.getOrderByTrackingNumber(trackingNumber, userId);
        return ResponseEntity.ok(order);
    }
    
    @PatchMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> cancelOrder(@PathVariable Long orderId,
                                              HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        OrderDto order = orderService.cancelOrder(orderId, userId);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/recent")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getRecentOrders(
            @RequestParam(defaultValue = "30") int days,
            HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        List<OrderDto> orders = orderService.getRecentOrders(userId, days);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<UserOrderStats> getUserOrderStats(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        UserOrderStats stats = orderService.getUserOrderStats(userId);
        return ResponseEntity.ok(stats);
    }
    
    // Admin endpoints
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        List<OrderDto> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getOrdersByStatus(@PathVariable String status) {
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        List<OrderDto> orders = orderService.getOrdersByStatus(orderStatus);
        return ResponseEntity.ok(orders);
    }
    
    @PatchMapping("/seller/{orderId}/status")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> sellerUpdateOrderStatus(@PathVariable Long orderId,
                                                     @RequestParam String status,
                                                     HttpServletRequest request) throws AccessDeniedException {
        Long sellerId = getUserIdFromRequest(request);

        // Validate status safely
        OrderStatus orderStatus;
        try {
            orderStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid order status: " + status);
        }

        // Ensure seller owns the order before updating
        OrderDto order = orderService.updateOrderStatusBySeller(orderId, sellerId, orderStatus);

        return ResponseEntity.ok(order);
    }
    

}
