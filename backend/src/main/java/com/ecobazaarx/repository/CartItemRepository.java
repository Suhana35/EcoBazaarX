package com.ecobazaarx.repository;

import com.ecobazaarx.entity.CartItem;
import com.ecobazaarx.entity.Cart;
import com.ecobazaarx.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // Find cart item by cart and product
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    
    // Find all cart items by cart
    List<CartItem> findByCartOrderByAddedDateDesc(Cart cart);
    
    // Check if cart item exists
    boolean existsByCartAndProduct(Cart cart, Product product);
    
    // Delete cart items by cart
    void deleteByCart(Cart cart);
    
    // Count items in cart
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart = :cart")
    Long countItemsInCart(@Param("cart") Cart cart);
    
    // Calculate total amount in cart
    @Query("SELECT SUM(ci.quantity * ci.product.price) FROM CartItem ci WHERE ci.cart = :cart")
    Double calculateCartTotal(@Param("cart") Cart cart);
}
