package com.ecobazaarx.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "orders")
public class Order {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<OrderItem> orderItems = new ArrayList<>();

	@NotNull(message = "Total amount is required")
	@DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be greater than 0")
	@Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
	private BigDecimal totalAmount;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private OrderStatus status = OrderStatus.PROCESSING;

	@Column(name = "tracking_number", unique = true)
	private String trackingNumber;

	@Column(name = "estimated_delivery")
	private LocalDateTime estimatedDelivery;

	@Column(name = "order_date", nullable = false)
	private LocalDateTime orderDate;

	@Column(name = "shipped_date")
	private LocalDateTime shippedDate;

	@Column(name = "delivered_date")
	private LocalDateTime deliveredDate;

	@Column(name = "total_eco_score", precision = 3, scale = 1)
	private BigDecimal totalEcoScore;

	@Column(name = "total_co2_footprint", precision = 8, scale = 2)
	private BigDecimal totalCO2Footprint;

//	@Column(name = "shipping_address", columnDefinition = "TEXT")
//	private String shippingAddress;
//
//	@Column(name = "billing_address", columnDefinition = "TEXT")
//	private String billingAddress;
//
//	@Column(columnDefinition = "TEXT")
//	private String notes;

	// Constructors
	public Order() {
		this.orderDate = LocalDateTime.now();
	}

	public Order(User user, BigDecimal totalAmount) {
		this.user = user;
		this.totalAmount = totalAmount;
		this.orderDate = LocalDateTime.now();
		this.status = OrderStatus.PROCESSING;
	}

	// Lifecycle callbacks
	@PrePersist
	protected void onCreate() {
		if (orderDate == null) {
			orderDate = LocalDateTime.now();
		}
		if (trackingNumber == null) {
			trackingNumber = generateTrackingNumber();
		}
	}

	private String generateTrackingNumber() {
		return "TRK" + System.currentTimeMillis() + String.format("%03d", (int) (Math.random() * 1000));
	}

	// Helper methods
	public void addOrderItem(OrderItem orderItem) {
		orderItems.add(orderItem);
		orderItem.setOrder(this);
	}

	public void removeOrderItem(OrderItem orderItem) {
		orderItems.remove(orderItem);
		orderItem.setOrder(null);
	}

	public void calculateTotals() {
		this.totalAmount = orderItems.stream()
				.map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
				.reduce(BigDecimal.ZERO, BigDecimal::add);

		this.totalEcoScore = orderItems.stream()
				.map(item -> item.getEcoScore() != null
						? item.getEcoScore().multiply(BigDecimal.valueOf(item.getQuantity()))
						: BigDecimal.ZERO)
				.reduce(BigDecimal.ZERO, BigDecimal::add)
				.divide(BigDecimal.valueOf(orderItems.isEmpty() ? 1 : orderItems.size()), 1, RoundingMode.HALF_UP);

		this.totalCO2Footprint = orderItems.stream().map(item -> {
			BigDecimal material = item.getMaterialCO2() != null ? item.getMaterialCO2() : BigDecimal.ZERO;
			BigDecimal shipping = item.getShippingCO2() != null ? item.getShippingCO2() : BigDecimal.ZERO;
			return (material.add(shipping)).multiply(BigDecimal.valueOf(item.getQuantity()));
		}).reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	// Getters and Setters
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public List<OrderItem> getOrderItems() {
		return orderItems;
	}

	public void setOrderItems(List<OrderItem> orderItems) {
		this.orderItems = orderItems;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public OrderStatus getStatus() {
		return status;
	}

	public void setStatus(OrderStatus status) {
		this.status = status;
	}

	public String getTrackingNumber() {
		return trackingNumber;
	}

	public void setTrackingNumber(String trackingNumber) {
		this.trackingNumber = trackingNumber;
	}

	public LocalDateTime getEstimatedDelivery() {
		return estimatedDelivery;
	}

	public void setEstimatedDelivery(LocalDateTime estimatedDelivery) {
		this.estimatedDelivery = estimatedDelivery;
	}

	public LocalDateTime getOrderDate() {
		return orderDate;
	}

	public void setOrderDate(LocalDateTime orderDate) {
		this.orderDate = orderDate;
	}

	public LocalDateTime getShippedDate() {
		return shippedDate;
	}

	public void setShippedDate(LocalDateTime shippedDate) {
		this.shippedDate = shippedDate;
	}

	public LocalDateTime getDeliveredDate() {
		return deliveredDate;
	}

	public void setDeliveredDate(LocalDateTime deliveredDate) {
		this.deliveredDate = deliveredDate;
	}

	public BigDecimal getTotalEcoScore() {
		return totalEcoScore;
	}

	public void setTotalEcoScore(BigDecimal totalEcoScore) {
		this.totalEcoScore = totalEcoScore;
	}

	public BigDecimal getTotalCO2Footprint() {
		return totalCO2Footprint;
	}

	public void setTotalCO2Footprint(BigDecimal totalCO2Footprint) {
		this.totalCO2Footprint = totalCO2Footprint;
	}

//	public String getShippingAddress() {
//		return shippingAddress;
//	}
//
//	public void setShippingAddress(String shippingAddress) {
//		this.shippingAddress = shippingAddress;
//	}
//
//	public String getBillingAddress() {
//		return billingAddress;
//	}
//
//	public void setBillingAddress(String billingAddress) {
//		this.billingAddress = billingAddress;
//	}
//
//	public String getNotes() {
//		return notes;
//	}
//
//	public void setNotes(String notes) {
//		this.notes = notes;
//	}
}