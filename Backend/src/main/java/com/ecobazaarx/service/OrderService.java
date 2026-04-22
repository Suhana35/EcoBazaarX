package com.ecobazaarx.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    private final OrderRepository     orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository      cartRepository;
    private final UserRepository      userRepository;
    private final ProductService      productService;
    private final CartService         cartService;
    private final OrderMapper         orderMapper;
    private final ProductRepository   productRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartRepository cartRepository,
                        UserRepository userRepository,
                        ProductService productService,
                        CartService cartService,
                        OrderMapper orderMapper,
                        ProductRepository productRepository) {
        this.orderRepository     = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository      = cartRepository;
        this.userRepository      = userRepository;
        this.productService      = productService;
        this.cartService         = cartService;
        this.orderMapper         = orderMapper;
        this.productRepository   = productRepository;
    }

    public OrderDto createOrderFromCart(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Optional<Cart> cartOptional = cartRepository.findByUserWithItems(user);
        if (cartOptional.isEmpty() || cartOptional.get().getCartItems().isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        Cart cart = cartOptional.get();
        if (!cartService.validateCart(userId)) {
            throw new IllegalStateException("Cart validation failed. Some items may be out of stock or unavailable.");
        }

        Order order = new Order(user, cart.getTotalAmount());
        order.setEstimatedDelivery(LocalDateTime.now().plusDays(5));
        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem(savedOrder, cartItem.getProduct(),
                    cartItem.getQuantity(), cartItem.getProduct().getPrice());
            orderItemRepository.save(orderItem);
            savedOrder.addOrderItem(orderItem);
            productService.reduceProductStock(cartItem.getProduct().getId(), cartItem.getQuantity());
        }

        savedOrder.calculateTotals();
        savedOrder = orderRepository.save(savedOrder);
        cartService.clearCart(userId);
        return orderMapper.toDto(savedOrder);
    }

    public OrderDto createOrderForProduct(Long userId, Long productId, int quantity, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!"active".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalStateException("Product is not available");
        }
        if (product.getStockQuantity() < quantity) {
            throw new IllegalStateException("Insufficient stock. Available: " + product.getStockQuantity());
        }

        BigDecimal price       = product.getPrice();
        BigDecimal totalAmount = price.multiply(BigDecimal.valueOf(quantity));

        Order order = new Order(user, totalAmount);
        order.setEstimatedDelivery(LocalDateTime.now().plusDays(5));
        Order savedOrder = orderRepository.save(order);

        OrderItem orderItem = new OrderItem(savedOrder, product, quantity, price);
        orderItemRepository.save(orderItem);
        savedOrder.addOrderItem(orderItem);
        productService.reduceProductStock(product.getId(), quantity);

        savedOrder.calculateTotals();
        savedOrder = orderRepository.save(savedOrder);
        return orderMapper.toDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getUserOrders(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return orderRepository.findByUserOrderByOrderDateDesc(user)
                .stream().map(orderMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getUserOrders(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return orderRepository.findByUserOrderByOrderDateDesc(user, PageRequest.of(page, size))
                .map(orderMapper::toDto);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Order does not belong to user");
        }
        return orderMapper.toDto(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByTrackingNumber(String trackingNumber, Long userId) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with tracking number: " + trackingNumber));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Order does not belong to user");
        }
        return orderMapper.toDto(order);
    }

    public OrderDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus currentStatus = order.getStatus();
        order.setStatus(newStatus);

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
                if (currentStatus != OrderStatus.CANCELLED) {
                    restoreProductStock(order);
                }
                break;
        }

        return orderMapper.toDto(orderRepository.save(order));
    }

    public OrderDto cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Order does not belong to user");
        }
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order cannot be cancelled in current status: " + order.getStatus());
        }
        order.setStatus(OrderStatus.CANCELLED);
        restoreProductStock(order);
        return orderMapper.toDto(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getRecentOrders(Long userId, int days) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return orderRepository.findRecentOrdersByUser(user, LocalDateTime.now().minusDays(days))
                .stream().map(orderMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrders(int page, int size) {
        return orderRepository.findAll(PageRequest.of(page, size)).map(orderMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatusOrderByOrderDateDesc(status)
                .stream().map(orderMapper::toDto).collect(Collectors.toList());
    }

    /**
     * FIXED: was calling findByUserOrderByOrderDateDesc(user).size() which
     * loaded every order row into memory just to count them.
     *
     * Now uses three targeted COUNT/SUM queries — no rows are transferred
     * that aren't needed.
     */
    @Transactional(readOnly = true)
    public UserOrderStats getUserOrderStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Single COUNT query instead of loading all orders
        long   orderCount  = orderRepository.countOrdersByUser(user);
        Double totalSpent  = orderRepository.calculateTotalSalesByUser(user);
        Double totalEcoScore = orderRepository.calculateTotalEcoScoreByUser(user);
        Long   totalItems  = orderRepository.countTotalItemsByUser(user);

        return new UserOrderStats(
                (int) orderCount,
                totalSpent     != null ? totalSpent     : 0.0,
                totalEcoScore  != null ? totalEcoScore  : 0.0,
                totalItems     != null ? totalItems.intValue() : 0
        );
    }

    private void restoreProductStock(Order order) {
        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = orderItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
            productRepository.save(product);
        }
    }

    public List<OrderDto> getOrdersBySellerId(Long sellerId) {
        return orderRepository.findOrdersBySellerId(sellerId)
                .stream().map(orderMapper::toDto).collect(Collectors.toList());
    }

    public OrderDto updateOrderStatusBySeller(Long orderId, Long sellerId, OrderStatus newStatus)
            throws AccessDeniedException {
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

        if (order.getOrderItems().stream().allMatch(i -> i.getStatus() == OrderStatus.SHIPPED)) {
            order.setStatus(OrderStatus.SHIPPED);
        }

        return orderMapper.toDto(order);
    }

    public OrderDto updateConsumerOrderStatus(Long orderId, Long userId, OrderStatus newStatus)
            throws AccessDeniedException {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to update this order");
        }

        OrderStatus currentStatus = order.getStatus();
        if (!currentStatus.equals(OrderStatus.SHIPPED) && !currentStatus.equals(OrderStatus.PROCESSING)) {
            throw new IllegalStateException(
                    "Order status cannot be changed from " + currentStatus +
                    ". Orders can only be marked as delivered or cancelled if they are in processing or shipped status.");
        }

        if (newStatus.equals(OrderStatus.CANCELLED)) {
            order.setStatus(OrderStatus.CANCELLED);
            restoreProductStock(order);
        } else if (newStatus.equals(OrderStatus.DELIVERED)) {
            if (!currentStatus.equals(OrderStatus.SHIPPED)) {
                throw new IllegalStateException("Order can only be marked as delivered if it's already shipped");
            }
            order.setStatus(OrderStatus.DELIVERED);
            order.setDeliveredDate(LocalDateTime.now());
        } else {
            throw new IllegalStateException("Consumers can only mark orders as delivered or cancelled.");
        }

        return orderMapper.toDto(orderRepository.save(order));
    }
}