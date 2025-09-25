package com.ecobazaarx.repository;

import com.ecobazaarx.entity.Cart;
import com.ecobazaarx.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    // Find cart by user
    Optional<Cart> findByUser(User user);
    
    // Check if cart exists for user
    boolean existsByUser(User user);
    
    // Find cart with items by user
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems ci LEFT JOIN FETCH ci.product " +
           "WHERE c.user = :user")
    Optional<Cart> findByUserWithItems(@Param("user") User user);
    
    // Delete cart by user
    void deleteByUser(User user);
}


