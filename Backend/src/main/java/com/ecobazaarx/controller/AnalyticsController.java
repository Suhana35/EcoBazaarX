package com.ecobazaarx.controller;

import com.ecobazaarx.dto.CarbonAnalyticsDto;
import com.ecobazaarx.service.AnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for analytics data consumed by the admin dashboards.
 *
 * All endpoints here return pre-aggregated results computed in the database.
 * The client only needs to render the numbers — no client-side math required.
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * GET /api/analytics/dashboard
     *
     * Returns key platform metrics (total products, orders by status, low stock).
     * Previously the admin dashboard assembled this from several separate calls.
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    /**
     * GET /api/analytics/popular-products?limit=10
     *
     * Returns the top-selling products by quantity sold.
     */
    @GetMapping("/popular-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPopularProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getPopularProducts(limit));
    }

    /**
     * GET /api/analytics/carbon
     *
     * Returns ALL carbon analytics data needed by CarbonInsightDashboard in a
     * single response:
     *   - Platform-wide CO2 totals and averages
     *   - Emissions grouped by product type
     *   - Monthly emissions trend (last 6 months)
     *   - Top 5 highest-emission products
     *   - Top 5 most eco-friendly products
     *
     * Previously the frontend called GET /api/products (all products) +
     * GET /api/orders/all?size=1000 (up to 1 000 orders) and ran every
     * calculation inside a useMemo block. This endpoint replaces both calls
     * with a handful of DB-level aggregation queries.
     */
    @GetMapping("/carbon")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CarbonAnalyticsDto> getCarbonAnalytics() {
        return ResponseEntity.ok(analyticsService.getCarbonAnalytics());
    }
}