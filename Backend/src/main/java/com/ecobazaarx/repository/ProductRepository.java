package com.ecobazaarx.repository;

import com.ecobazaarx.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStatusOrderByCreatedDateDesc(String status);

    List<Product> findByTypeAndStatusOrderByNameAsc(String type, String status);

    @Query("SELECT p FROM Product p WHERE p.status = 'active' AND (" +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.type) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Product> searchProducts(@Param("searchTerm") String searchTerm);

    Page<Product> findByStatusOrderByCreatedDateDesc(String status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND " +
           "p.price BETWEEN :minPrice AND :maxPrice ORDER BY p.price ASC")
    List<Product> findByPriceRange(@Param("minPrice") Double minPrice,
                                   @Param("maxPrice") Double maxPrice,
                                   @Param("status") String status);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND " +
           "p.ecoScore BETWEEN :minScore AND :maxScore ORDER BY p.ecoScore DESC")
    List<Product> findByEcoScoreRange(@Param("minScore") Double minScore,
                                      @Param("maxScore") Double maxScore,
                                      @Param("status") String status);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.ecoScore >= :minEcoScore " +
           "ORDER BY p.ecoScore DESC")
    List<Product> findTopEcoFriendlyProducts(@Param("minEcoScore") Double minEcoScore,
                                             @Param("status") String status,
                                             Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.stockQuantity <= :threshold " +
           "ORDER BY p.stockQuantity ASC")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold,
                                       @Param("status") String status);

    long countByStatusIgnoreCase(String status);

    // ── FIXED: use COUNT instead of loading rows into memory ─────────────────
    /**
     * Previously AnalyticsService called findLowStockProducts(10).size() which
     * fetched every low-stock row. This single COUNT query is far cheaper.
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity <= :threshold AND p.status = 'active'")
    long countLowStockActiveProducts(@Param("threshold") int threshold);

    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= :threshold")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);

    boolean existsByIdAndStatus(Long id, String status);

    List<Product> findBySellerId(Long sellerId);

    List<Product> findBySellerIdAndStatus(Long sellerId, String status);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    Page<Product> findBySellerIdAndStatus(Long sellerId, String status, Pageable pageable);

    @Query("SELECT DISTINCT p.type FROM Product p WHERE p.status = 'active' ORDER BY p.type")
    List<String> findDistinctActiveTypes();

    // ── Carbon Analytics Queries ──────────────────────────────────────────────

    /**
     * Aggregates material CO2, shipping CO2, product count, and average eco-score
     * per product type in a single query — replaces the old approach of fetching
     * all products and doing the math in JavaScript on the frontend.
     *
     * Columns returned: [type, sumMaterialCO2, sumShippingCO2, count, avgEcoScore]
     */
    @Query("SELECT p.type, " +
           "       COALESCE(SUM(p.materialCO2), 0), " +
           "       COALESCE(SUM(p.shippingCO2), 0), " +
           "       COUNT(p), " +
           "       COALESCE(AVG(p.ecoScore), 0) " +
           "FROM Product p " +
           "WHERE p.status = 'active' " +
           "GROUP BY p.type " +
           "ORDER BY (SUM(p.materialCO2) + SUM(p.shippingCO2)) DESC")
    List<Object[]> getCarbonByType();

    /**
     * Platform-wide CO2 totals and eco-score average in one round-trip.
     * Columns: [sumMaterialCO2, sumShippingCO2, avgEcoScore, count]
     *
     * Return type MUST be List<Object[]> — Spring Data JPA always returns a
     * List even for aggregate-only queries with no GROUP BY. Declaring the
     * return type as Object[] makes Spring try to coerce the List itself into
     * the array slots, so overview[0] ends up being an Object[] (the first row)
     * instead of the first numeric column → NumberFormatException at runtime.
     */
    @Query("SELECT COALESCE(SUM(p.materialCO2), 0), " +
           "       COALESCE(SUM(p.shippingCO2), 0), " +
           "       COALESCE(AVG(p.ecoScore), 0), " +
           "       COUNT(p) " +
           "FROM Product p WHERE p.status = 'active'")
    List<Object[]> getOverallCarbonStats();

    /**
     * Count of active products whose combined CO2 exceeds the given threshold.
     */
    @Query("SELECT COUNT(p) FROM Product p " +
           "WHERE p.status = 'active' " +
           "AND (COALESCE(p.materialCO2, 0) + COALESCE(p.shippingCO2, 0)) > :threshold")
    long countHighEmissionProducts(@Param("threshold") double threshold);

    /**
     * Top N products ordered by total CO2 descending (highest emitters first).
     */
    @Query("SELECT p FROM Product p " +
           "WHERE p.status = 'active' " +
           "AND (p.materialCO2 IS NOT NULL OR p.shippingCO2 IS NOT NULL) " +
           "ORDER BY (COALESCE(p.materialCO2, 0) + COALESCE(p.shippingCO2, 0)) DESC")
    List<Product> findTopEmitters(Pageable pageable);

    /**
     * Top N products ordered by eco-score descending (greenest first).
     */
    @Query("SELECT p FROM Product p " +
           "WHERE p.status = 'active' AND p.ecoScore IS NOT NULL " +
           "ORDER BY p.ecoScore DESC")
    List<Product> findTopEcoFriendly(Pageable pageable);

    // ── Recommendation Queries ────────────────────────────────────────────────

    @Query("SELECT p FROM Product p WHERE p.status = 'active' " +
           "AND p.id <> :excludeId " +
           "AND p.type = :type " +
           "AND (:minFootprint IS NULL OR p.footprint >= :minFootprint) " +
           "AND (:maxFootprint IS NULL OR p.footprint <= :maxFootprint) " +
           "ORDER BY p.ecoScore DESC, p.footprint ASC")
    List<Product> findRecommendedProducts(
            @Param("excludeId") Long excludeId,
            @Param("type") String type,
            @Param("minFootprint") BigDecimal minFootprint,
            @Param("maxFootprint") BigDecimal maxFootprint,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'active' " +
           "AND p.id <> :excludeId " +
           "AND p.type = :type " +
           "ORDER BY p.ecoScore DESC, p.sales DESC")
    List<Product> findRecommendedProductsByTypeOnly(
            @Param("excludeId") Long excludeId,
            @Param("type") String type,
            Pageable pageable);

    // ── Per-seller carbon analytics ───────────────────────────────────────────

    /**
     * Returns one row per seller with aggregated carbon data across their active products.
     * Columns: [sellerId LONG, sellerName STRING, sumMaterialCO2 DOUBLE,
     *           sumShippingCO2 DOUBLE, productCount LONG, avgEcoScore DOUBLE]
     */
    @Query("SELECT p.seller.id, p.seller.name, " +
           "COALESCE(SUM(p.materialCO2), 0), " +
           "COALESCE(SUM(p.shippingCO2), 0), " +
           "COUNT(p), " +
           "COALESCE(AVG(p.ecoScore), 0) " +
           "FROM Product p " +
           "WHERE p.status = 'active' " +
           "GROUP BY p.seller.id, p.seller.name " +
           "ORDER BY (SUM(p.materialCO2) + SUM(p.shippingCO2)) DESC")
    List<Object[]> getCarbonBySeller();
}