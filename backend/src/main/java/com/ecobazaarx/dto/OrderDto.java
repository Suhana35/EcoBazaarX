package com.ecobazaarx.dto;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {
    private Long id;
    private Long userId;
    private List<OrderItemDto> orderItems;
    private BigDecimal totalAmount;
    private String status;
    private String trackingNumber;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime orderDate;
    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;
    private BigDecimal totalEcoScore;
    private BigDecimal totalCO2Footprint;

    
    // Constructors
    public OrderDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public List<OrderItemDto> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItemDto> orderItems) { this.orderItems = orderItems; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal bigDecimal) { this.totalAmount = bigDecimal; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    
    public LocalDateTime getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(LocalDateTime estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }
    
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    
    public LocalDateTime getShippedDate() { return shippedDate; }
    public void setShippedDate(LocalDateTime shippedDate) { this.shippedDate = shippedDate; }
    
    public LocalDateTime getDeliveredDate() { return deliveredDate; }
    public void setDeliveredDate(LocalDateTime deliveredDate) { this.deliveredDate = deliveredDate; }
    
    public BigDecimal getTotalEcoScore() { return totalEcoScore; }
    public void setTotalEcoScore(BigDecimal totalEcoScore) { this.totalEcoScore = totalEcoScore; }
    
    public BigDecimal getTotalCO2Footprint() { return totalCO2Footprint; }
    public void setTotalCO2Footprint(BigDecimal totalCO2Footprint) { this.totalCO2Footprint = totalCO2Footprint; }

}
