package com.ecobazaarx.dto;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CartItemDto {
    private Long id;
    private ProductDto product;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    private BigDecimal subtotal;
    private LocalDateTime addedDate;
    
    // Constructors
    public CartItemDto() {}
    
    public CartItemDto(Long id, ProductDto product, Integer quantity, BigDecimal subtotal, LocalDateTime addedDate) {
        this.id = id;
        this.product = product;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.addedDate = addedDate;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public ProductDto getProduct() { return product; }
    public void setProduct(ProductDto product) { this.product = product; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal bigDecimal) { this.subtotal = bigDecimal; }
    
    public LocalDateTime getAddedDate() { return addedDate; }
    public void setAddedDate(LocalDateTime addedDate) { this.addedDate = addedDate; }
}