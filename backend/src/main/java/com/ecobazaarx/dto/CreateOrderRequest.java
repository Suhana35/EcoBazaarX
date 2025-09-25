package com.ecobazaarx.dto;

public class CreateOrderRequest {
    private String shippingAddress;
    private String billingAddress;
    private String notes;
    
    // Constructors
    public CreateOrderRequest() {}
    
    // Getters and Setters
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    
    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}