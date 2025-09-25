package com.ecobazaarx.controller;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ecobazaarx.dto.OrderDto;
import com.ecobazaarx.dto.ProductDto;
import com.ecobazaarx.security.jwt.JwtUtils;
import com.ecobazaarx.service.ProductService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {
    
    private final ProductService productService;
    private final JwtUtils jwtUtils;
    
    @Autowired
    public ProductController(ProductService productService, JwtUtils jwtUtils) {
        this.productService = productService;
        this.jwtUtils = jwtUtils;
    }
    
    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = jwtUtils.parseJwt(request);
        if (token == null) {
        	System.out.println(token);
            throw new RuntimeException("No JWT token found");
        }
        Long userId = jwtUtils.getUserIdFromJwtToken(token);
        if (userId == null) {
        	
            throw new RuntimeException("User ID not found in token");
        }
        System.out.println(userId);
        return userId;
    }
    
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        List<ProductDto> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/paginated")
    public ResponseEntity<Page<ProductDto>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ProductDto> products = productService.getAllProducts(page, size);
        return ResponseEntity.ok(products);
    }
    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProductDto>> getProductsBySellerId(@PathVariable Long sellerId, HttpServletRequest request) {
    	Long userId = getUserIdFromRequest(request);
        List<ProductDto> products = productService.getProductsBySellerId(userId);
        return ResponseEntity.ok(products);
    }
 
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody ProductDto productDto,HttpServletRequest request) 
    {
    	Long sellerId = getUserIdFromRequest(request);
        ProductDto createdProduct = productService.createProduct(productDto,sellerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }
    

    @PutMapping("/seller/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDto productDto,
            HttpServletRequest request) {
        Long sellerId = getUserIdFromRequest(request);
        ProductDto updatedProduct = productService.updateProductBySeller(id, productDto, sellerId);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/seller/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long sellerId = getUserIdFromRequest(request);
        productService.deleteProductBySeller(id, sellerId);
        return ResponseEntity.noContent().build();
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ProductDto>> searchProducts(@RequestParam String q) {
        List<ProductDto> products = productService.searchProducts(q);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ProductDto>> getProductsByType(@PathVariable String type) {
        List<ProductDto> products = productService.getProductsByType(type);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/price-range")
    public ResponseEntity<List<ProductDto>> getProductsByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        List<ProductDto> products = productService.getProductsByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/eco-range")
    public ResponseEntity<List<ProductDto>> getProductsByEcoScoreRange(
            @RequestParam Double minScore,
            @RequestParam Double maxScore) {
        List<ProductDto> products = productService.getProductsByEcoScoreRange(minScore, maxScore);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/top-eco")
    public ResponseEntity<List<ProductDto>> getTopEcoFriendlyProducts(
            @RequestParam(defaultValue = "10") int limit) {
        List<ProductDto> products = productService.getTopEcoFriendlyProducts(limit);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/types")
    public ResponseEntity<List<String>> getAllProductTypes() {
        List<String> types = productService.getAllProductTypes();
        return ResponseEntity.ok(types);
    }
    
    // ================= ADMIN / SELLER ENDPOINTS =================
    
    
    
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, 
                                                   @Valid @RequestBody ProductDto productDto) {
        ProductDto updatedProduct = productService.updateProduct(id, productDto);
        return ResponseEntity.ok(updatedProduct);
    }
    
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ProductDto> updateProductStock(@PathVariable Long id, 
                                                        @RequestParam Integer stock) {
        ProductDto updatedProduct = productService.updateProductStock(id, stock);
        return ResponseEntity.ok(updatedProduct);
    }
    
    // ✅ New: Update product status (active/inactive/archived)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ProductDto> updateProductStatus(@PathVariable Long id,
                                                         @RequestParam String status) {
        ProductDto updatedProduct = productService.updateProductStatus(id, status);
        return ResponseEntity.ok(updatedProduct);
    }

    // ✅ New: Update product rating (optional, if ratings are calculated via reviews you can skip this)
    @PatchMapping("/{id}/rating")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ProductDto> updateProductRating(@PathVariable Long id,
                                                         @RequestParam BigDecimal rating) {
        ProductDto updatedProduct = productService.updateProductRating(id, rating);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<List<ProductDto>> getLowStockProducts(
            @RequestParam(defaultValue = "10") Integer threshold) {
        List<ProductDto> products = productService.getLowStockProducts(threshold);
        return ResponseEntity.ok(products);
    }
}
