package com.ecobazaarx.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


public class CartDto {
    private Long id;
    private Long userId;
    private List<CartItemDto> cartItems;
    private BigDecimal totalAmount;
    private Integer totalItems;
    private LocalDateTime updatedDate;
    
    // Constructors
    public CartDto() {}
    
    public CartDto(Long id, Long userId, List<CartItemDto> cartItems, 
    		BigDecimal totalAmount, Integer totalItems, LocalDateTime updatedDate) {
        this.id = id;
        this.userId = userId;
        this.cartItems = cartItems;
        this.totalAmount = totalAmount;
        this.totalItems = totalItems;
        this.updatedDate = updatedDate;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public List<CartItemDto> getCartItems() { return cartItems; }
    public void setCartItems(List<CartItemDto> cartItems) { this.cartItems = cartItems; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal bigDecimal) { this.totalAmount = bigDecimal; }
    
    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
    
    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }
}