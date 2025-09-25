package com.ecobazaarx.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDto {
    private Long id;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Product type is required")
    private String type;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @DecimalMin(value = "0.0", message = "Eco score must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Eco score must be between 0 and 5")
    private BigDecimal ecoScore;

    private BigDecimal footprint;
    private BigDecimal materialCO2;
    private BigDecimal shippingCO2;
    private String image;
    private LocalDateTime date;   // maps from createdDate
    private Integer stockQuantity;
    private String description;

    // --- New fields to match Product entity ---
    private Long sellerId;
    private String sellerName;
    private String status;
    private BigDecimal rating;
    private Integer sales;

    // Constructors
    public ProductDto() {}

    public ProductDto(Long id, String name, String type, BigDecimal price, BigDecimal ecoScore,
                      BigDecimal footprint, BigDecimal materialCO2, BigDecimal shippingCO2,
                      String image, LocalDateTime date, Integer stockQuantity,
                      String description, Long sellerId, String sellerName,
                      String status, BigDecimal rating, Integer sales) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.price = price;
        this.ecoScore = ecoScore;
        this.footprint = footprint;
        this.materialCO2 = materialCO2;
        this.shippingCO2 = shippingCO2;
        this.image = image;
        this.date = date;
        this.stockQuantity = stockQuantity;
        this.description = description;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.status = status;
        this.rating = rating;
        this.sales = sales;
    }

    // Getters and Setters
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

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getSales() { return sales; }
    public void setSales(Integer sales) { this.sales = sales; }
}
