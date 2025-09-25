package com.ecobazaarx.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "order_items")
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(nullable = false)
    private Integer quantity;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Price at time of order
    
    // Snapshot of product details at time of order
    @Column(name = "product_name")
    private String productName;
    
    @Column(name = "product_type")
    private String productType;
    
    @Column(name = "eco_score", precision = 3, scale = 1)
    private BigDecimal ecoScore;
    
    @Column(name = "material_co2", precision = 8, scale = 2)
    private BigDecimal materialCO2;
    
    @Column(name = "shipping_co2", precision = 8, scale = 2)
    private BigDecimal shippingCO2;
    
    @Column(name = "product_image", columnDefinition = "TEXT")
    private String productImage;
    
    @Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private OrderStatus status = OrderStatus.PROCESSING;
    
    public OrderStatus getStatus() {
		return status;
	}

	public void setStatus(OrderStatus status) {
		this.status = status;
	}

	// Constructors
    public OrderItem() {}
    
    public OrderItem(Order order, Product product, Integer quantity, BigDecimal price) {
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.price = price;
        
        // Snapshot product details
        this.productName = product.getName();
        this.productType = product.getType();
        this.ecoScore = product.getEcoScore();
        this.materialCO2 = product.getMaterialCO2();
        this.shippingCO2 = product.getShippingCO2();
        this.productImage = product.getImage();
    }
    
    // Helper methods
    public BigDecimal getSubtotal() {
        return price.multiply(BigDecimal.valueOf(quantity));
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    
    public String getProductType() { return productType; }
    public void setProductType(String productType) { this.productType = productType; }
    
    public BigDecimal getEcoScore() { return ecoScore; }
    public void setEcoScore(BigDecimal ecoScore) { this.ecoScore = ecoScore; }
    
    public BigDecimal getMaterialCO2() { return materialCO2; }
    public void setMaterialCO2(BigDecimal materialCO2) { this.materialCO2 = materialCO2; }
    
    public BigDecimal getShippingCO2() { return shippingCO2; }
    public void setShippingCO2(BigDecimal shippingCO2) { this.shippingCO2 = shippingCO2; }
    
    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }
}
