package com.ecobazaarx.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecobazaarx.dto.CarbonAnalyticsDto;
import com.ecobazaarx.entity.OrderStatus;
import com.ecobazaarx.entity.Product;
import com.ecobazaarx.mapper.ProductMapper;
import com.ecobazaarx.repository.OrderItemRepository;
import com.ecobazaarx.repository.OrderRepository;
import com.ecobazaarx.repository.ProductRepository;

@Service
public class AnalyticsService {

    private final OrderRepository     orderRepository;
    private final ProductRepository   productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductMapper       productMapper;

    public AnalyticsService(OrderRepository orderRepository,
                            ProductRepository productRepository,
                            OrderItemRepository orderItemRepository,
                            ProductMapper productMapper) {
        this.orderRepository     = orderRepository;
        this.productRepository   = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.productMapper       = productMapper;
    }

    // ── Dashboard stats ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalProducts",   productRepository.count());
        stats.put("activeProducts",  productRepository.countByStatusIgnoreCase("active"));

        stats.put("processingOrders", orderRepository.countOrdersByStatus(OrderStatus.PROCESSING));
        stats.put("shippedOrders",    orderRepository.countOrdersByStatus(OrderStatus.SHIPPED));
        stats.put("deliveredOrders",  orderRepository.countOrdersByStatus(OrderStatus.DELIVERED));

        // FIXED: was findLowStockProducts(10).size() — loaded every row into memory.
        // A COUNT query is all we need here.
        stats.put("lowStockProducts", productRepository.countLowStockActiveProducts(10));

        return stats;
    }

    // ── Popular products ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPopularProducts(int limit) {
        List<Object[]> rows = orderItemRepository.findMostPopularProducts();
        return rows.stream()
                .limit(limit)
                .map(row -> {
                    Map<String, Object> productStats = new HashMap<>();
                    productStats.put("product",   productMapper.toDto((Product) row[0]));
                    productStats.put("totalSold", row[1]);
                    return productStats;
                })
                .collect(Collectors.toList());
    }

    // ── Carbon analytics ──────────────────────────────────────────────────────

    /**
     * Builds the full carbon analytics payload using a small number of
     * aggregation queries instead of loading every product and order into
     * memory and computing the numbers in Java / JavaScript.
     *
     * Before this change the frontend:
     *  1. fetched ALL products  (GET /api/products)
     *  2. fetched up to 1 000 orders (GET /api/orders/all?size=1000)
     *  3. ran every calculation (sums, averages, ranking) inside useMemo()
     *
     * Now a single call to GET /api/analytics/carbon returns the finished result.
     */
    @Transactional(readOnly = true)
    public CarbonAnalyticsDto getCarbonAnalytics() {
        CarbonAnalyticsDto dto = new CarbonAnalyticsDto();

        // ── 1. Platform-wide totals (one query) ───────────────────────────────
        // getOverallCarbonStats() returns List<Object[]> — one row, multiple cols.
        // We must call .get(0) to obtain the actual Object[] row before indexing.
        List<Object[]> overviewRows = productRepository.getOverallCarbonStats();
        Object[] overview = (overviewRows != null && !overviewRows.isEmpty())
                ? overviewRows.get(0)
                : new Object[]{0, 0, 0, 0L};
        double totalMaterial = toDouble(overview[0]);
        double totalShipping = toDouble(overview[1]);
        double avgEcoScore   = toDouble(overview[2]);
        long   totalProducts = toLong(overview[3]);

        double totalEmissions = totalMaterial + totalShipping;

        dto.setTotalMaterialCO2(totalMaterial);
        dto.setTotalShippingCO2(totalShipping);
        dto.setTotalEmissions(totalEmissions);
        dto.setAvgEmissionsPerProduct(totalProducts > 0 ? totalEmissions / totalProducts : 0);
        dto.setAvgEcoScore(avgEcoScore);
        dto.setTotalProducts(totalProducts);

        // ── 2. High-emission count (one query) ────────────────────────────────
        dto.setHighEmissionCount(productRepository.countHighEmissionProducts(10.0));

        // ── 3. Emissions by product type (one query) ──────────────────────────
        List<Object[]> typeRows = productRepository.getCarbonByType();
        List<CarbonAnalyticsDto.EmissionByType> byType = new ArrayList<>();
        for (Object[] row : typeRows) {
            byType.add(new CarbonAnalyticsDto.EmissionByType(
                    (String) row[0],
                    toDouble(row[1]),
                    toDouble(row[2]),
                    toLong(row[3]),
                    toDouble(row[4])
            ));
        }
        dto.setEmissionsByType(byType);

        // ── 4. Top offenders and eco-friendly (two queries, limited to 5 rows) ─
        List<Product> topEmitters = productRepository.findTopEmitters(PageRequest.of(0, 5));
        dto.setTopOffenders(topEmitters.stream()
                .map(p -> new CarbonAnalyticsDto.ProductSummary(
                        p.getId(), p.getName(), p.getType(),
                        toDouble(p.getMaterialCO2()), toDouble(p.getShippingCO2()),
                        toDouble(p.getEcoScore())))
                .collect(Collectors.toList()));

        List<Product> ecoFriendly = productRepository.findTopEcoFriendly(PageRequest.of(0, 5));
        dto.setEcoFriendly(ecoFriendly.stream()
                .map(p -> new CarbonAnalyticsDto.ProductSummary(
                        p.getId(), p.getName(), p.getType(),
                        toDouble(p.getMaterialCO2()), toDouble(p.getShippingCO2()),
                        toDouble(p.getEcoScore())))
                .collect(Collectors.toList()));

        // ── 5. Order totals (two queries) ─────────────────────────────────────
        dto.setTotalOrders(orderRepository.countActiveOrders());

        // ── 6. Monthly emissions trend (last 6 months, LIMIT hardcoded in SQL) ──
        List<Object[]> monthlyRows = orderRepository.getMonthlyEmissions();
        List<CarbonAnalyticsDto.MonthlyEmission> monthly = new ArrayList<>();
        for (Object[] row : monthlyRows) {
            monthly.add(0, new CarbonAnalyticsDto.MonthlyEmission(   // reverse to chronological order
                    (String) row[0],
                    toDouble(row[1]),
                    toLong(row[2])
            ));
        }
        dto.setEmissionsByMonth(monthly);

        // ── 7. Order-level CO2 overview ───────────────────────────────────────
        List<Object[]> orderOverviewRows = orderRepository.getOrderCarbonOverview();
        if (orderOverviewRows != null && !orderOverviewRows.isEmpty()) {
            Object[] ov = orderOverviewRows.get(0);
            dto.setTotalOrderCO2(toDouble(ov[0]));
            dto.setAvgCO2PerOrder(toDouble(ov[2]));
        }

        // ── 8. Per-user carbon footprint ──────────────────────────────────────
        List<Object[]> userRows = orderRepository.getCarbonByUser();
        List<CarbonAnalyticsDto.UserCarbonSummary> userList = new ArrayList<>();
        for (Object[] row : userRows) {
            userList.add(new CarbonAnalyticsDto.UserCarbonSummary(
                    toLong(row[0]),
                    (String) row[1],
                    toDouble(row[2]),
                    toLong(row[3]),
                    toDouble(row[4])
            ));
        }
        dto.setUserCarbonList(userList);

        // ── 9. Per-seller carbon footprint (from products) ────────────────────
        List<Object[]> sellerRows = productRepository.getCarbonBySeller();
        List<CarbonAnalyticsDto.SellerCarbonSummary> sellerList = new ArrayList<>();
        for (Object[] row : sellerRows) {
            sellerList.add(new CarbonAnalyticsDto.SellerCarbonSummary(
                    toLong(row[0]),
                    (String) row[1],
                    toDouble(row[2]),
                    toDouble(row[3]),
                    toLong(row[4]),
                    toDouble(row[5])
            ));
        }
        dto.setSellerCarbonList(sellerList);

        return dto;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private double toDouble(Object v) {
        if (v == null) return 0.0;
        if (v instanceof Number) return ((Number) v).doubleValue();
        return Double.parseDouble(v.toString());
    }

    private long toLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Number) return ((Number) v).longValue();
        return Long.parseLong(v.toString());
    }
}