package com.ecobazaarx.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecobazaarx.dto.CreateOrderRequest;
import com.ecobazaarx.dto.OrderDto;
import com.ecobazaarx.dto.UserOrderStats;
import com.ecobazaarx.entity.Cart;
import com.ecobazaarx.entity.CartItem;
import com.ecobazaarx.entity.Order;
import com.ecobazaarx.entity.OrderItem;
import com.ecobazaarx.entity.OrderStatus;
import com.ecobazaarx.entity.Product;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.exception.AccessDeniedException;
import com.ecobazaarx.exception.ResourceNotFoundException;
import com.ecobazaarx.mapper.OrderMapper;
import com.ecobazaarx.repository.CartRepository;
import com.ecobazaarx.repository.OrderItemRepository;
import com.ecobazaarx.repository.OrderRepository;
import com.ecobazaarx.repository.ProductRepository;
import com.ecobazaarx.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final CartService cartService;
    private final OrderMapper orderMapper;
    private final ProductRepository productRepository;
    
    @Autowired
    public OrderService(OrderRepository orderRepository,
                       OrderItemRepository orderItemRepository,
                       CartRepository cartRepository,
                       UserRepository userRepository,
                       ProductService productService,
                       CartService cartService,
                       OrderMapper orderMapper,ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productService = productService;
        this.cartService = cartService;
        this.orderMapper = orderMapper;
        this.productRepository=productRepository;
    }
    
    // Create order from cart
    public OrderDto createOrderFromCart(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Get user's cart
        Optional<Cart> cartOptional = cartRepository.findByUserWithItems(user);
        if (cartOptional.isEmpty() || cartOptional.get().getCartItems().isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }
        
        Cart cart = cartOptional.get();
        
        // Validate cart items and stock
        if (!cartService.validateCart(userId)) {
            throw new IllegalStateException("Cart validation failed. Some items may be out of stock or unavailable.");
        }
        
        // Create order
        Order order = new Order(user, cart.getTotalAmount());
//        order.setShippingAddress(request.getShippingAddress());
//        order.setBillingAddress(request.getBillingAddress());
//        order.setNotes(request.getNotes());
        order.setEstimatedDelivery(LocalDateTime.now().plusDays(5)); // 5 days delivery estimate
        
        Order savedOrder = orderRepository.save(order);
        
        // Create order items from cart items
        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem(savedOrder, cartItem.getProduct(), 
                                               cartItem.getQuantity(), cartItem.getProduct().getPrice());
            orderItemRepository.save(orderItem);
            savedOrder.addOrderItem(orderItem);
            
            // Reduce product stock
            productService.reduceProductStock(cartItem.getProduct().getId(), cartItem.getQuantity());
        }
        
        // Calculate order totals
        savedOrder.calculateTotals();
        savedOrder = orderRepository.save(savedOrder);
        
        // Clear cart
        cartService.clearCart(userId);
        
        return orderMapper.toDto(savedOrder);
    }
    
    public OrderDto createOrderForProduct(Long userId, Long productId, int quantity, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Check product availability
        if (!"active".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalStateException("Product is not available");
        }

        if (product.getStockQuantity() < quantity) {
            throw new IllegalStateException("Insufficient stock. Available: " + product.getStockQuantity());
        }

        // Calculate total using BigDecimal
        BigDecimal price = product.getPrice();
        BigDecimal totalAmount = price.multiply(BigDecimal.valueOf(quantity));

        // Create order
        Order order = new Order(user, totalAmount);
//        order.setShippingAddress(request.getShippingAddress());
//        order.setBillingAddress(request.getBillingAddress());
//        order.setNotes(request.getNotes());
        order.setEstimatedDelivery(LocalDateTime.now().plusDays(5));

        Order savedOrder = orderRepository.save(order);

        // Create order item
        OrderItem orderItem = new OrderItem(savedOrder, product, quantity, price);
        orderItemRepository.save(orderItem);
        savedOrder.addOrderItem(orderItem);

        // Reduce product stock
        productService.reduceProductStock(product.getId(), quantity);

        // Recalculate totals
        savedOrder.calculateTotals();
        savedOrder = orderRepository.save(savedOrder);

        return orderMapper.toDto(savedOrder);
    }

    
    // Get user's orders
    @Transactional(readOnly = true)
    public List<OrderDto> getUserOrders(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
        return orders.stream()
                    .map(orderMapper::toDto)
                    .collect(Collectors.toList());
    }
    
    // Get user's orders with pagination
    @Transactional(readOnly = true)
    public Page<OrderDto> getUserOrders(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findByUserOrderByOrderDateDesc(user, pageable);
        return orderPage.map(orderMapper::toDto);
    }
    
    // Get order by ID
    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        // Verify order belongs to user (unless admin)
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Order does not belong to user");
        }
        
        return orderMapper.toDto(order);
    }
    
    // Get order by tracking number
    @Transactional(readOnly = true)
    public OrderDto getOrderByTrackingNumber(String trackingNumber, Long userId) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with tracking number: " + trackingNumber));
        
        // Verify order belongs to user
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Order does not belong to user");
        }
        
        return orderMapper.toDto(order);
    }
    
    // Update order status (Admin only)
    public OrderDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        OrderStatus currentStatus = order.getStatus();
        order.setStatus(newStatus);
        
        // Update timestamps based on status
        switch (newStatus) {
            case SHIPPED:
                if (currentStatus != OrderStatus.SHIPPED) {
                    order.setShippedDate(LocalDateTime.now());
                    if (order.getEstimatedDelivery() == null) {
                        order.setEstimatedDelivery(LocalDateTime.now().plusDays(3));
                    }
                }
                break;
            case DELIVERED:
                if (currentStatus != OrderStatus.DELIVERED) {
                    order.setDeliveredDate(LocalDateTime.now());
                }
                break;
            case CANCELLED:
                // Restore product stock if order is cancelled
                if (currentStatus != OrderStatus.CANCELLED) {
                    restoreProductStock(order);
                }
                break;
        }
        
        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDto(updatedOrder);
    }
    
    // Cancel order
    public OrderDto cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        // Verify order belongs to user
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Order does not belong to user");
        }
        
        // Check if order can be cancelled
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order cannot be cancelled in current status: " + order.getStatus());
        }
        
        // Update status and restore stock
        order.setStatus(OrderStatus.CANCELLED);
        restoreProductStock(order);
        
        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDto(updatedOrder);
    }
    
    // Get recent orders for user
    @Transactional(readOnly = true)
    public List<OrderDto> getRecentOrders(Long userId, int days) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        LocalDateTime sinceDate = LocalDateTime.now().minusDays(days);
        List<Order> orders = orderRepository.findRecentOrdersByUser(user, sinceDate);
        
        return orders.stream()
                    .map(orderMapper::toDto)
                    .collect(Collectors.toList());
    }
    
    // Get all orders (Admin only)
    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                    .map(orderMapper::toDto)
                    .collect(Collectors.toList());
    }
    
    // Get orders by status (Admin only)
    @Transactional(readOnly = true)
    public List<OrderDto> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatusOrderByOrderDateDesc(status);
        return orders.stream()
                    .map(orderMapper::toDto)
                    .collect(Collectors.toList());
    }
    
    // Get user statistics
    @Transactional(readOnly = true)
    public UserOrderStats getUserOrderStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        List<Order> userOrders = orderRepository.findByUserOrderByOrderDateDesc(user);
        Double totalSpent = orderRepository.calculateTotalSalesByUser(user);
        Double totalEcoScore = orderRepository.calculateTotalEcoScoreByUser(user);
        
        return new UserOrderStats(
            userOrders.size(),
            totalSpent != null ? totalSpent : 0.0,
            totalEcoScore != null ? totalEcoScore : 0.0,
            userOrders.stream().mapToInt(o -> o.getOrderItems().size()).sum()
        );
    }
    
    // Helper method to restore product stock
    private void restoreProductStock(Order order) {
        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = orderItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
            // Note: In a real application, you might want to use ProductService here
        }
    }
    
   
    public List<OrderDto> getOrdersBySellerId(Long sellerId) {
        List<Order> orders = orderRepository.findOrdersBySellerId(sellerId);
        return orders.stream()
                     .map(orderMapper::toDto) // convert entity -> dto
                     .collect(Collectors.toList());
    }


    public OrderDto updateOrderStatusBySeller(Long orderId, Long sellerId, OrderStatus newStatus) throws AccessDeniedException {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        boolean updated = false;

        for (OrderItem item : order.getOrderItems()) {
            if (item.getProduct().getSeller().getId().equals(sellerId)) {
                item.setStatus(newStatus);
                updated = true;
                orderItemRepository.save(item);
            }
        }

        if (!updated) {
            throw new AccessDeniedException("No items in this order belong to you");
        }

        orderRepository.save(order);

        // (Optional) derive order status
        if (order.getOrderItems().stream().allMatch(i -> i.getStatus() == OrderStatus.SHIPPED)) {
            order.setStatus(OrderStatus.SHIPPED);
        }

        return orderMapper.toDto(order);
    }
    
    public OrderDto updateConsumerOrderStatus(Long orderId, Long userId, OrderStatus newStatus) 
            throws AccessDeniedException {
        
        // Get the order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Verify that the user is the consumer of the order
        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to update this order");
        }

        // Check current status - consumer can only change if order is in shipped or processing
        OrderStatus currentStatus = order.getStatus();
        if (!currentStatus.equals(OrderStatus.SHIPPED) && !currentStatus.equals(OrderStatus.PROCESSING)) {
            throw new IllegalStateException(
                "Order status cannot be changed from " + currentStatus + 
                ". Orders can only be marked as delivered or cancelled if they are in processing or shipped status."
            );
        }

        // Check if trying to cancel - can cancel from processing or shipped
        if (newStatus.equals(OrderStatus.CANCELLED)) {
            order.setStatus(OrderStatus.CANCELLED);
//            order.setCancelledDate(LocalDateTime.now());
            // Restore product stock when cancelled
            restoreProductStock(order);
        }
        // Check if trying to mark as delivered - can deliver from shipped only
        else if (newStatus.equals(OrderStatus.DELIVERED)) {
            if (!currentStatus.equals(OrderStatus.SHIPPED)) {
                throw new IllegalStateException("Order can only be marked as delivered if it's already shipped");
            }
            order.setStatus(OrderStatus.DELIVERED);
            order.setDeliveredDate(LocalDateTime.now());
        }
        else {
            throw new IllegalStateException("Invalid status transition. Consumers can only mark orders as delivered or cancelled.");
        }

        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDto(updatedOrder);
    }



}
