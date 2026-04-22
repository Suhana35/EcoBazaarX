package com.ecobazaarx.service;

import com.ecobazaarx.dto.ProductDto;
import com.ecobazaarx.entity.Product;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.repository.ProductRepository;
import com.ecobazaarx.repository.UserRepository;
import com.ecobazaarx.exception.ResourceNotFoundException;
import com.ecobazaarx.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final UserRepository userRepository;

    @Autowired
    public ProductService(ProductRepository productRepository,
                          ProductMapper productMapper,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        return productRepository.findByStatusOrderByCreatedDateDesc("active")
                .stream().map(productMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getAllProducts(int page, int size) {
        return productRepository.findByStatusOrderByCreatedDateDesc("active", PageRequest.of(page, size))
                .map(productMapper::toDto);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        if (!"active".equalsIgnoreCase(product.getStatus())) {
            throw new ResourceNotFoundException("Product is no longer available");
        }
        return productMapper.toDto(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> searchProducts(String searchTerm) {
        return productRepository.searchProducts(searchTerm)
                .stream().map(productMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getProductsByType(String type) {
        return productRepository.findByTypeAndStatusOrderByNameAsc(type, "active")
                .stream().map(productMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getProductsByPriceRange(Double minPrice, Double maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice, "active")
                .stream().map(productMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getProductsByEcoScoreRange(Double minScore, Double maxScore) {
        return productRepository.findByEcoScoreRange(minScore, maxScore, "active")
                .stream().map(productMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getTopEcoFriendlyProducts(int limit) {
        return productRepository.findTopEcoFriendlyProducts(4.0, "active", PageRequest.of(0, limit))
                .stream().map(productMapper::toDto).collect(Collectors.toList());
    }

    public ProductDto createProduct(ProductDto productDto, Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));
        Product product = productMapper.toEntity(productDto, seller);
        product.setStatus("active");
        return productMapper.toDto(productRepository.save(product));
    }

    public ProductDto updateProduct(Long id, ProductDto productDto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        applyProductUpdates(existing, productDto);
        return productMapper.toDto(productRepository.save(existing));
    }

    public ProductDto updateProductStock(Long id, Integer newStock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setStockQuantity(newStock);
        return productMapper.toDto(productRepository.save(product));
    }

    public void reduceProductStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        if (product.getStockQuantity() < quantity) {
            throw new IllegalStateException("Insufficient stock for product: " + product.getName());
        }
        product.setStockQuantity(product.getStockQuantity() - quantity);
        product.setSales(product.getSales() + quantity);
        productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setStatus("inactive");
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public boolean isProductAvailable(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        return "active".equalsIgnoreCase(product.getStatus()) && product.getStockQuantity() >= quantity;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getLowStockProducts(Integer threshold) {
        return productRepository.findLowStockProducts(threshold, "active")
                .stream().map(productMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllProductTypes() {
        return productRepository.findDistinctActiveTypes();
    }

    public ProductDto updateProductStatus(Long id, String status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
        product.setStatus(status);
        return productMapper.toDto(productRepository.save(product));
    }

    public ProductDto updateProductRating(Long id, BigDecimal rating) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
        if (rating.compareTo(BigDecimal.ZERO) < 0 || rating.compareTo(BigDecimal.valueOf(5)) > 0) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
        product.setRating(rating);
        return productMapper.toDto(productRepository.save(product));
    }

    /**
     * Returns up to {@code limit} recommended products for the given product.
     *
     * Recommendation strategy (in priority order):
     *  1. Same category (type) + similar carbon footprint (±60%), ordered by eco-score DESC.
     *  2. If fewer than limit results, top up with same-type products ordered by eco-score DESC.
     */
    @Transactional(readOnly = true)
    public List<ProductDto> getRecommendations(Long productId, int limit) {
        Product source = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        BigDecimal footprint = source.getFootprint();
        List<Product> recommended;

        if (footprint != null && footprint.compareTo(BigDecimal.ZERO) > 0) {
            // Allow ±60% carbon footprint range for flexible matching
            BigDecimal range = footprint.multiply(BigDecimal.valueOf(0.60));
            BigDecimal minFootprint = footprint.subtract(range);
            BigDecimal maxFootprint = footprint.add(range);
            if (minFootprint.compareTo(BigDecimal.ZERO) < 0) {
                minFootprint = BigDecimal.ZERO;
            }

            recommended = productRepository.findRecommendedProducts(
                    source.getId(),
                    source.getType(),
                    minFootprint,
                    maxFootprint,
                    PageRequest.of(0, limit));

            // If we don't have enough, top-up with type-only fallback results
            if (recommended.size() < limit) {
                List<Long> existingIds = recommended.stream()
                        .map(Product::getId)
                        .collect(Collectors.toList());
                existingIds.add(source.getId());

                List<Product> fallback = productRepository.findRecommendedProductsByTypeOnly(
                        source.getId(),
                        source.getType(),
                        PageRequest.of(0, limit + recommended.size()));

                fallback.stream()
                        .filter(p -> !existingIds.contains(p.getId()))
                        .limit((long) limit - recommended.size())
                        .forEach(recommended::add);
            }
        } else {
            // No footprint data — fall back to type-only
            recommended = productRepository.findRecommendedProductsByTypeOnly(
                    source.getId(),
                    source.getType(),
                    PageRequest.of(0, limit));
        }

        return recommended.stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getProductsBySellerId(Long sellerId) {
        return productRepository.findBySellerId(sellerId)
                .stream().map(productMapper::toDto).collect(Collectors.toList());
    }

    public ProductDto updateProductBySeller(Long productId, ProductDto productDto, Long sellerId) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        if (!existing.getSeller().getId().equals(sellerId)) {
            throw new IllegalStateException("You are not authorized to update this product");
        }
        applyProductUpdates(existing, productDto);
        return productMapper.toDto(productRepository.save(existing));
    }

    public void deleteProductBySeller(Long productId, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalStateException("You are not authorized to delete this product");
        }
        product.setStatus("inactive");
        productRepository.save(product);
    }

    private void applyProductUpdates(Product existing, ProductDto dto) {
        existing.setName(dto.getName());
        existing.setType(dto.getType());
        existing.setPrice(dto.getPrice());
        existing.setEcoScore(dto.getEcoScore());
        existing.setFootprint(dto.getFootprint());
        existing.setMaterialCO2(dto.getMaterialCO2());
        existing.setShippingCO2(dto.getShippingCO2());
        existing.setImage(dto.getImage());
        existing.setStockQuantity(dto.getStockQuantity());
        existing.setDescription(dto.getDescription());
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }
    }
}