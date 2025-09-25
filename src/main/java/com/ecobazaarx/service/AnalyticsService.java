package com.ecobazaarx.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecobazaarx.entity.OrderStatus;
import com.ecobazaarx.entity.Product;
import com.ecobazaarx.mapper.ProductMapper;
import com.ecobazaarx.repository.OrderItemRepository;
import com.ecobazaarx.repository.OrderRepository;
import com.ecobazaarx.repository.ProductRepository;

@Service
public class AnalyticsService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductMapper productMapper;
    
    public AnalyticsService(OrderRepository orderRepository, ProductRepository productRepository,
			OrderItemRepository orderItemRepository, ProductMapper productMapper) {
		this.orderRepository = orderRepository;
		this.productRepository = productRepository;
		this.orderItemRepository = orderItemRepository;
		this.productMapper = productMapper;
	}
    
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total products
        stats.put("totalProducts", productRepository.count());
        
        // Total active products (status = active)
        stats.put("activeProducts", productRepository.countByStatusIgnoreCase("active"));
        
        // Orders by status
        stats.put("processingOrders", orderRepository.countOrdersByStatus(OrderStatus.PROCESSING));
        stats.put("shippedOrders", orderRepository.countOrdersByStatus(OrderStatus.SHIPPED));
        stats.put("deliveredOrders", orderRepository.countOrdersByStatus(OrderStatus.DELIVERED));
        
        // Low stock products
        stats.put("lowStockProducts", productRepository.findLowStockProducts(10).size());
        
        return stats;
    }
    
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPopularProducts(int limit) {
        List<Object[]> popularProducts = orderItemRepository.findMostPopularProducts();
        return popularProducts.stream()
                .limit(limit)
                .map(row -> {
                    Map<String, Object> productStats = new HashMap<>();
                    Product product = (Product) row[0];
                    Long totalSold = (Long) row[1];
                    productStats.put("product", productMapper.toDto(product));
                    productStats.put("totalSold", totalSold);
                    return productStats;
                })
                .collect(Collectors.toList());
    }
}
