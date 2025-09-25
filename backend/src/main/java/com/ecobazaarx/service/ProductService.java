package com.ecobazaarx.service;

import com.ecobazaarx.dto.OrderDto;
import com.ecobazaarx.dto.ProductDto;
import com.ecobazaarx.entity.Order;
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
    private final UserRepository userRepository; // for seller handling

    @Autowired
    public ProductService(ProductRepository productRepository,
                          ProductMapper productMapper,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.userRepository = userRepository;
    }
    
    // Get all active products
    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        List<Product> products = productRepository.findByStatusOrderByCreatedDateDesc("active");
        return products.stream()
                      .map(productMapper::toDto)
                      .collect(Collectors.toList());
    }
    
    // Get products with pagination
    @Transactional(readOnly = true)
    public Page<ProductDto> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findByStatusOrderByCreatedDateDesc("active", pageable);
        return productPage.map(productMapper::toDto);
    }
    
    // Get product by ID
    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        if (!"active".equalsIgnoreCase(product.getStatus())) {
            throw new ResourceNotFoundException("Product is no longer available");
        }
        
        return productMapper.toDto(product);
    }
    
    // Search products
    @Transactional(readOnly = true)
    public List<ProductDto> searchProducts(String searchTerm) {
        List<Product> products = productRepository.searchProducts(searchTerm);
        return products.stream()
                      .filter(p -> "active".equalsIgnoreCase(p.getStatus()))
                      .map(productMapper::toDto)
                      .collect(Collectors.toList());
    }
    
    // Get products by type
    @Transactional(readOnly = true)
    public List<ProductDto> getProductsByType(String type) {
        List<Product> products = productRepository.findByTypeAndStatusOrderByNameAsc(type, "active");
        return products.stream()
                      .map(productMapper::toDto)
                      .collect(Collectors.toList());
    }
    
 // Get products by price range
    @Transactional(readOnly = true)
    public List<ProductDto> getProductsByPriceRange(Double minPrice, Double maxPrice) {
        List<Product> products = productRepository.findByPriceRange(minPrice, maxPrice, "active");
        return products.stream()
                      .map(productMapper::toDto)
                      .collect(Collectors.toList());
    }
    
 // Get products by eco score range
    @Transactional(readOnly = true)
    public List<ProductDto> getProductsByEcoScoreRange(Double minScore, Double maxScore) {
        List<Product> products = productRepository.findByEcoScoreRange(minScore, maxScore, "active");
        return products.stream()
                      .map(productMapper::toDto)
                      .collect(Collectors.toList());
    }

    // Get top eco-friendly products
    @Transactional(readOnly = true)
    public List<ProductDto> getTopEcoFriendlyProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> products = productRepository.findTopEcoFriendlyProducts(4.0, "active", pageable);
        return products.stream()
                      .map(productMapper::toDto)
                      .collect(Collectors.toList());
    }
    
 // Create new product
    public ProductDto createProduct(ProductDto productDto, Long sellerId) {
        // find seller
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));

        // use correct mapper method (pass seller explicitly)
        Product product = productMapper.toEntity(productDto, seller);

        product.setStatus("active");
        Product savedProduct = productRepository.save(product);
        return productMapper.toDto(savedProduct);
    }

    
    // Update product
    public ProductDto updateProduct(Long id, ProductDto productDto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        // Update fields
        existingProduct.setName(productDto.getName());
        existingProduct.setType(productDto.getType());
        existingProduct.setPrice(productDto.getPrice());
        existingProduct.setEcoScore(productDto.getEcoScore());
        existingProduct.setFootprint(productDto.getFootprint());
        existingProduct.setMaterialCO2(productDto.getMaterialCO2());
        existingProduct.setShippingCO2(productDto.getShippingCO2());
        existingProduct.setImage(productDto.getImage());
        existingProduct.setStockQuantity(productDto.getStockQuantity());
        existingProduct.setDescription(productDto.getDescription());

        if (productDto.getStatus() != null) {
            existingProduct.setStatus(productDto.getStatus());
        }
        
        Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toDto(updatedProduct);
    }
    
    // Update product stock
    public ProductDto updateProductStock(Long id, Integer newStock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        product.setStockQuantity(newStock);
        Product updatedProduct = productRepository.save(product);
        return productMapper.toDto(updatedProduct);
    }
    
    // Reduce product stock (when order is placed)
    public void reduceProductStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        if (product.getStockQuantity() < quantity) {
            throw new IllegalStateException("Insufficient stock for product: " + product.getName());
        }
        
        product.setStockQuantity(product.getStockQuantity() - quantity);
        product.setSales(product.getSales() + quantity); // increment sales
        productRepository.save(product);
    }
    
    // Delete product (soft delete)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
//        product.setStatus("inactive");
//        productRepository.save(product);
        productRepository.deleteById(id);
    }
    
    // Check product availability
    @Transactional(readOnly = true)
    public boolean isProductAvailable(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        return "active".equalsIgnoreCase(product.getStatus()) && product.getStockQuantity() >= quantity;
    }
    
 // Get low stock products
    @Transactional(readOnly = true)
    public List<ProductDto> getLowStockProducts(Integer threshold) {
        List<Product> products = productRepository.findLowStockProducts(threshold, "active");
        return products.stream()
                      .map(productMapper::toDto)
                      .collect(Collectors.toList());
    }
    
    // Get all product types
    @Transactional(readOnly = true)
    public List<String> getAllProductTypes() {
        return productRepository.findByStatusOrderByCreatedDateDesc("active")
                               .stream()
                               .map(Product::getType)
                               .distinct()
                               .sorted()
                               .collect(Collectors.toList());
    }
    
   
    public ProductDto updateProductStatus(Long id, String status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
        product.setStatus(status);
        Product updatedProduct = productRepository.save(product);
        return productMapper.toDto(updatedProduct);
    }

    public ProductDto updateProductRating(Long id, BigDecimal rating) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));

        if (rating.compareTo(BigDecimal.ZERO) < 0 || rating.compareTo(BigDecimal.valueOf(5)) > 0) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }

        product.setRating(rating);
        Product updatedProduct = productRepository.save(product);
        return productMapper.toDto(updatedProduct);
    }

    public List<ProductDto> getProductsBySellerId(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        return products.stream()
                     .map(productMapper::toDto) // convert entity -> dto
                     .collect(Collectors.toList());
    }

 // ================= SELLER-SPECIFIC UPDATE =================
    public ProductDto updateProductBySeller(Long productId, ProductDto productDto, Long sellerId) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Ensure the logged-in seller owns this product
        if (!existingProduct.getSeller().getId().equals(sellerId)) {
            throw new IllegalStateException("You are not authorized to update this product");
        }

        // Update fields
        existingProduct.setName(productDto.getName());
        existingProduct.setType(productDto.getType());
        existingProduct.setPrice(productDto.getPrice());
        existingProduct.setEcoScore(productDto.getEcoScore());
        existingProduct.setFootprint(productDto.getFootprint());
        existingProduct.setMaterialCO2(productDto.getMaterialCO2());
        existingProduct.setShippingCO2(productDto.getShippingCO2());
        existingProduct.setImage(productDto.getImage());
        existingProduct.setStockQuantity(productDto.getStockQuantity());
        existingProduct.setDescription(productDto.getDescription());

        if (productDto.getStatus() != null) {
            existingProduct.setStatus(productDto.getStatus());
        }

        Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toDto(updatedProduct);
    }

    public void deleteProductBySeller(Long productId, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Ensure seller owns this product
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalStateException("You are not authorized to delete this product");
        }

        // Soft delete (set inactive instead of removing permanently)
//        product.setStatus("inactive");
//        productRepository.save(product);
        productRepository.deleteById(sellerId);
    }

    
}
