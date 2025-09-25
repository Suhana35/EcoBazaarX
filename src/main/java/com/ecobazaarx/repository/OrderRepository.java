package com.ecobazaarx.repository;

import com.ecobazaarx.entity.Order;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.entity.OrderStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find orders by user
    List<Order> findByUserOrderByOrderDateDesc(User user);
    
    // Find orders by user with pagination
    Page<Order> findByUserOrderByOrderDateDesc(User user, Pageable pageable);
    
    // Find order by tracking number
    Optional<Order> findByTrackingNumber(String trackingNumber);
    
    // Find orders by status
    List<Order> findByStatusOrderByOrderDateDesc(OrderStatus status);
    
    // Find orders by user and status
    List<Order> findByUserAndStatusOrderByOrderDateDesc(User user, OrderStatus status);
    
    // Find orders within date range
    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate " +
           "ORDER BY o.orderDate DESC")
    List<Order> findOrdersByDateRange(@Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);
    
    // Find user's recent orders
    @Query("SELECT o FROM Order o WHERE o.user = :user AND o.orderDate >= :sinceDate " +
           "ORDER BY o.orderDate DESC")
    List<Order> findRecentOrdersByUser(@Param("user") User user, 
                                      @Param("sinceDate") LocalDateTime sinceDate);
    
    // Calculate total sales for user
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user = :user " +
           "AND o.status NOT IN ('CANCELLED', 'RETURNED')")
    Double calculateTotalSalesByUser(@Param("user") User user);
    
    // Calculate total eco score impact for user
    @Query("SELECT SUM(o.totalEcoScore) FROM Order o WHERE o.user = :user " +
           "AND o.status NOT IN ('CANCELLED', 'RETURNED')")
    Double calculateTotalEcoScoreByUser(@Param("user") User user);
    
    // Get order statistics
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countOrdersByStatus(@Param("status") OrderStatus status);
    
 // Find all orders that contain products from a given seller
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.orderItems oi " +
           "JOIN oi.product p " +
           "WHERE p.seller.id = :sellerId " +
           "ORDER BY o.orderDate DESC")
    List<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId);

    // Paginated version
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.orderItems oi " +
           "JOIN oi.product p " +
           "WHERE p.seller.id = :sellerId " +
           "ORDER BY o.orderDate DESC")
    Page<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);

}
