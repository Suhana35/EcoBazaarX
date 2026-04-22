package com.ecobazaarx.dto;

public class UserOrderStats {
    private Integer totalOrders;
    private Double totalSpent;
    private Double totalEcoScore;
    private Integer totalItemsPurchased;
    
    public UserOrderStats() {}
    
    public UserOrderStats(Integer totalOrders, Double totalSpent, Double totalEcoScore, Integer totalItemsPurchased) {
        this.totalOrders = totalOrders;
        this.totalSpent = totalSpent;
        this.totalEcoScore = totalEcoScore;
        this.totalItemsPurchased = totalItemsPurchased;
    }
    
    // Getters and Setters
    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }
    
    public Double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent; }
    
    public Double getTotalEcoScore() { return totalEcoScore; }
    public void setTotalEcoScore(Double totalEcoScore) { this.totalEcoScore = totalEcoScore; }
    
    public Integer getTotalItemsPurchased() { return totalItemsPurchased; }
    public void setTotalItemsPurchased(Integer totalItemsPurchased) { this.totalItemsPurchased = totalItemsPurchased; }
}