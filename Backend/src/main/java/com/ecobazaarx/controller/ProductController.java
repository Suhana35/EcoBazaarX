package com.ecobazaarx.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ecobazaarx.dto.ProductDto;
import com.ecobazaarx.security.jwt.JwtUtils;
import com.ecobazaarx.service.ProductService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    private final ProductService productService;
    private final JwtUtils jwtUtils;

    @Autowired
    public ProductController(ProductService productService, JwtUtils jwtUtils) {
        this.productService = productService;
        this.jwtUtils = jwtUtils;
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = jwtUtils.parseJwt(request);
        if (token == null) throw new RuntimeException("No JWT token found");
        Long userId = jwtUtils.getUserIdFromJwtToken(token);
        if (userId == null) throw new RuntimeException("User ID not found in token");
        log.debug("Authenticated product request by userId={}", userId);
        return userId;
    }

    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<ProductDto>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(productService.getAllProducts(page, size));
    }

    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProductDto>> getProductsBySellerId(
            @PathVariable Long sellerId, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(productService.getProductsBySellerId(userId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ProductDto> createProduct(
            @Valid @RequestBody ProductDto productDto, HttpServletRequest request) {
        Long sellerId = getUserIdFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(productDto, sellerId));
    }

    @PutMapping("/seller/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductDto> updateProductBySeller(
            @PathVariable Long id,
            @Valid @RequestBody ProductDto productDto,
            HttpServletRequest request) {
        Long sellerId = getUserIdFromRequest(request);
        return ResponseEntity.ok(productService.updateProductBySeller(id, productDto, sellerId));
    }

    @DeleteMapping("/seller/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteProductBySeller(
            @PathVariable Long id, HttpServletRequest request) {
        Long sellerId = getUserIdFromRequest(request);
        productService.deleteProductBySeller(id, sellerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDto>> searchProducts(@RequestParam String q) {
        return ResponseEntity.ok(productService.searchProducts(q));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ProductDto>> getProductsByType(@PathVariable String type) {
        return ResponseEntity.ok(productService.getProductsByType(type));
    }

    @GetMapping("/price-range")
    public ResponseEntity<List<ProductDto>> getProductsByPriceRange(
            @RequestParam Double minPrice, @RequestParam Double maxPrice) {
        return ResponseEntity.ok(productService.getProductsByPriceRange(minPrice, maxPrice));
    }

    @GetMapping("/eco-range")
    public ResponseEntity<List<ProductDto>> getProductsByEcoScoreRange(
            @RequestParam Double minScore, @RequestParam Double maxScore) {
        return ResponseEntity.ok(productService.getProductsByEcoScoreRange(minScore, maxScore));
    }

    @GetMapping("/top-eco")
    public ResponseEntity<List<ProductDto>> getTopEcoFriendlyProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(productService.getTopEcoFriendlyProducts(limit));
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getAllProductTypes() {
        return ResponseEntity.ok(productService.getAllProductTypes());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id, @Valid @RequestBody ProductDto productDto) {
        return ResponseEntity.ok(productService.updateProduct(id, productDto));
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ProductDto> updateProductStock(
            @PathVariable Long id, @RequestParam Integer stock) {
        return ResponseEntity.ok(productService.updateProductStock(id, stock));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ProductDto> updateProductStatus(
            @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(productService.updateProductStatus(id, status));
    }

    @PatchMapping("/{id}/rating")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ProductDto> updateProductRating(
            @PathVariable Long id, @RequestParam BigDecimal rating) {
        return ResponseEntity.ok(productService.updateProductRating(id, rating));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<List<ProductDto>> getLowStockProducts(
            @RequestParam(defaultValue = "10") Integer threshold) {
        return ResponseEntity.ok(productService.getLowStockProducts(threshold));
    }

    /**
     * GET /api/products/{id}/recommendations?limit=4
     *
     * Returns smart product recommendations for a given product based on:
     *  - Same product category (type)
     *  - Similar carbon footprint range (±60%)
     *  - Ordered by eco-score DESC (greener products first)
     *
     * No authentication required — consumers see this on the product details page.
     */
    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<ProductDto>> getRecommendations(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(productService.getRecommendations(id, limit));
    }
}