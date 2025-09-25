package com.ecobazaarx.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Product type is required")
    @Column(nullable = false)
    private String type;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @DecimalMin(value = "0.0", message = "Eco score must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Eco score must be between 0 and 5")
    @Column(name = "eco_score", precision = 3, scale = 1)
    private BigDecimal ecoScore;

    @DecimalMin(value = "0.0", message = "Footprint cannot be negative")
    @Column(precision = 8, scale = 2)
    private BigDecimal footprint;

    @DecimalMin(value = "0.0", message = "Material CO2 cannot be negative")
    @Column(name = "material_co2", precision = 8, scale = 2)
    private BigDecimal materialCO2;

    @DecimalMin(value = "0.0", message = "Shipping CO2 cannot be negative")
    @Column(name = "shipping_co2", precision = 8, scale = 2)
    private BigDecimal shippingCO2;

    @Column(columnDefinition = "TEXT")
    private String image;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

//    @Column(name = "is_active")
//    private Boolean isActive = true;

    // --- New fields to match frontend ---
    @ManyToOne(fetch = FetchType.LAZY) // seller is a User
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(name = "status")
    private String status = "active"; // default active

    @Column(name = "rating", precision = 2, scale = 1)
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "sales",nullable = false)
    private Integer sales = 0;
    
    
    // Constructors
    public Product() {
    }

    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
        if (sales == null) {
            sales = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }

    // Getters and setters (include new fields)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getEcoScore() { return ecoScore; }
    public void setEcoScore(BigDecimal ecoScore) { this.ecoScore = ecoScore; }

    public BigDecimal getFootprint() { return footprint; }
    public void setFootprint(BigDecimal footprint) { this.footprint = footprint; }

    public BigDecimal getMaterialCO2() { return materialCO2; }
    public void setMaterialCO2(BigDecimal materialCO2) { this.materialCO2 = materialCO2; }

    public BigDecimal getShippingCO2() { return shippingCO2; }
    public void setShippingCO2(BigDecimal shippingCO2) { this.shippingCO2 = shippingCO2; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    

    public Product(Long id, @NotBlank(message = "Product name is required") String name,
			@NotBlank(message = "Product type is required") String type,
			@NotNull(message = "Price is required") @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0") BigDecimal price,
			@DecimalMin(value = "0.0", message = "Eco score must be between 0 and 5") @DecimalMax(value = "5.0", message = "Eco score must be between 0 and 5") BigDecimal ecoScore,
			@DecimalMin(value = "0.0", message = "Footprint cannot be negative") BigDecimal footprint,
			@DecimalMin(value = "0.0", message = "Material CO2 cannot be negative") BigDecimal materialCO2,
			@DecimalMin(value = "0.0", message = "Shipping CO2 cannot be negative") BigDecimal shippingCO2,
			String image, LocalDateTime createdDate, LocalDateTime updatedDate,
			@Min(value = 0, message = "Stock quantity cannot be negative") Integer stockQuantity, String description,
			User seller, String status, BigDecimal rating, Integer sales) {
		super();
		this.id = id;
		this.name = name;
		this.type = type;
		this.price = price;
		this.ecoScore = ecoScore;
		this.footprint = footprint;
		this.materialCO2 = materialCO2;
		this.shippingCO2 = shippingCO2;
		this.image = image;
		this.createdDate = createdDate;
		this.updatedDate = updatedDate;
		this.stockQuantity = stockQuantity;
		this.description = description;
		this.seller = seller;
		this.status = status;
		this.rating = rating;
		this.sales = sales;
	}


	public User getSeller() {
		return seller;
	}


	public void setSeller(User seller) {
		this.seller = seller;
	}


	public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getSales() { return sales; }
    public void setSales(Integer sales) { this.sales = sales; }
}
