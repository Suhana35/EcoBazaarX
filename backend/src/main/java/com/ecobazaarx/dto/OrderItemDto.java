package com.ecobazaarx.dto;

import java.math.BigDecimal;



public class OrderItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productType;
    private String productImage;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal ecoScore;
    private BigDecimal materialCO2;
    private BigDecimal shippingCO2;
    private BigDecimal subtotal;
    private String status;
    
    // Constructors
    public OrderItemDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    
    public String getProductType() { return productType; }
    public void setProductType(String productType) { this.productType = productType; }
    
    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal bigDecimal) { this.price = bigDecimal; }
    
    public BigDecimal getEcoScore() { return ecoScore; }
    public void setEcoScore(BigDecimal ecoScore) { this.ecoScore = ecoScore; }
    
    public BigDecimal getMaterialCO2() { return materialCO2; }
    public void setMaterialCO2(BigDecimal materialCO2) { this.materialCO2 = materialCO2; }
    
    public BigDecimal getShippingCO2() { return shippingCO2; }
    public void setShippingCO2(BigDecimal shippingCO2) { this.shippingCO2 = shippingCO2; }
    
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
}
