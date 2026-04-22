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
// FIX: Removed @CrossOrigin(origins = "*") — conflicts with WebSecurityConfig CORS policy
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
    public ResponseEntity<OrderDto> createOrder(
            @Valid @RequestBody CreateOrderRequest createOrderRequest,
            HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrderFromCart(userId, createOrderRequest));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getOrdersBySellerId(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(orderService.getOrdersBySellerId(userId));
    }

    @PostMapping("/product/{productId}")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> createOrderForProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") int quantity,
            @Valid @RequestBody CreateOrderRequest createOrderRequest,
            HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrderForProduct(userId, productId, quantity, createOrderRequest));
    }

    @GetMapping
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getUserOrders(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping("/paginated")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDto>> getUserOrdersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(orderService.getUserOrders(userId, page, size));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> getOrderById(
            @PathVariable Long orderId, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(orderService.getOrderById(orderId, userId));
    }

    @GetMapping("/tracking/{trackingNumber}")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> getOrderByTrackingNumber(
            @PathVariable String trackingNumber, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(orderService.getOrderByTrackingNumber(trackingNumber, userId));
    }

    @PatchMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Long orderId, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(orderService.cancelOrder(orderId, userId));
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getRecentOrders(
            @RequestParam(defaultValue = "30") int days, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(orderService.getRecentOrders(userId, days));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<UserOrderStats> getUserOrderStats(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(orderService.getUserOrderStats(userId));
    }

    // FIX: Now returns Page<OrderDto> with pagination params — previously loaded ALL
    // orders into memory at once, which would cause OOM errors as data grows
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDto>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getOrdersByStatus(@PathVariable String status) {
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(orderService.getOrdersByStatus(orderStatus));
    }

    @PatchMapping("/seller/{orderId}/status")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> sellerUpdateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            HttpServletRequest request) throws AccessDeniedException {
        Long sellerId = getUserIdFromRequest(request);
        OrderStatus orderStatus;
        try {
            orderStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid order status: " + status);
        }
        return ResponseEntity.ok(orderService.updateOrderStatusBySeller(orderId, sellerId, orderStatus));
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateConsumerOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            HttpServletRequest request) {
        try {
            Long userId = getUserIdFromRequest(request);
            OrderStatus orderStatus;
            try {
                orderStatus = OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid order status: " + status);
            }
            if (!orderStatus.equals(OrderStatus.DELIVERED) && !orderStatus.equals(OrderStatus.CANCELLED)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Consumers can only change status to 'delivered' or 'cancelled'");
            }
            return ResponseEntity.ok(orderService.updateConsumerOrderStatus(orderId, userId, orderStatus));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}