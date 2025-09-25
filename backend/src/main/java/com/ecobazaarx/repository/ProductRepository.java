package com.ecobazaarx.repository;

import com.ecobazaarx.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ✅ Find products by status
    List<Product> findByStatusOrderByCreatedDateDesc(String status);

    // ✅ Find products by type and status
    List<Product> findByTypeAndStatusOrderByNameAsc(String type, String status);

    // ✅ Search products by name, type, or description (only active ones)
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.type) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Product> searchProducts(@Param("searchTerm") String searchTerm);

    // ✅ Find products with pagination
    Page<Product> findByStatusOrderByCreatedDateDesc(String status, Pageable pageable);

    // ✅ Find products by price range and status
    @Query("SELECT p FROM Product p WHERE p.status = :status AND " +
           "p.price BETWEEN :minPrice AND :maxPrice ORDER BY p.price ASC")
    List<Product> findByPriceRange(@Param("minPrice") Double minPrice,
                                   @Param("maxPrice") Double maxPrice,
                                   @Param("status") String status);

    // ✅ Find products by eco score range and status
    @Query("SELECT p FROM Product p WHERE p.status = :status AND " +
           "p.ecoScore BETWEEN :minScore AND :maxScore ORDER BY p.ecoScore DESC")
    List<Product> findByEcoScoreRange(@Param("minScore") Double minScore,
                                      @Param("maxScore") Double maxScore,
                                      @Param("status") String status);

    // ✅ Find top eco-friendly products (status filter + pagination)
    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.ecoScore >= :minEcoScore " +
           "ORDER BY p.ecoScore DESC")
    List<Product> findTopEcoFriendlyProducts(@Param("minEcoScore") Double minEcoScore,
                                             @Param("status") String status,
                                             Pageable pageable);

    // ✅ Find low stock products (status filter)
    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.stockQuantity <= :threshold " +
           "ORDER BY p.stockQuantity ASC")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold,
                                       @Param("status") String status);
    long countByStatusIgnoreCase(String status);

    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= :threshold")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);

    // ✅ Check if product exists and is active
    boolean existsByIdAndStatus(Long id, String status);
    
 // ✅ Find all products by sellerId
    List<Product> findBySellerId(Long sellerId);

    // ✅ Find all products by sellerId and status
    List<Product> findBySellerIdAndStatus(Long sellerId, String status);

    // ✅ Find products by sellerId with pagination
    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    // ✅ Find products by sellerId and status with pagination
    Page<Product> findBySellerIdAndStatus(Long sellerId, String status, Pageable pageable);

}
