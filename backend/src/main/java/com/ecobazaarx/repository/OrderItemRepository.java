package com.ecobazaarx.repository;

import com.ecobazaarx.entity.OrderItem;
import com.ecobazaarx.entity.Order;
import com.ecobazaarx.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    // Find order items by order
    List<OrderItem> findByOrderOrderByIdAsc(Order order);
    
    // Find order items by product
    List<OrderItem> findByProduct(Product product);
    
    // Get most popular products
    @Query("SELECT oi.product, SUM(oi.quantity) as totalSold FROM OrderItem oi " +
           "GROUP BY oi.product ORDER BY totalSold DESC")
    List<Object[]> findMostPopularProducts();
    
    // Calculate total quantity sold for a product
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.product = :product")
    Long getTotalQuantitySoldForProduct(@Param("product") Product product);
    
    // Get user's purchase history for a specific product
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.user.id = :userId AND oi.product = :product " +
           "ORDER BY oi.order.orderDate DESC")
    List<OrderItem> getUserPurchaseHistoryForProduct(@Param("userId") Long userId, 
                                                    @Param("product") Product product);
}