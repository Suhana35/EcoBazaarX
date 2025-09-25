package com.ecobazaarx.mapper;

import com.ecobazaarx.dto.ProductDto;
import com.ecobazaarx.entity.Product;
import com.ecobazaarx.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDto toDto(Product product) {
        if (product == null) {
            return null;
        }

        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setType(product.getType());
        dto.setPrice(product.getPrice());
        dto.setEcoScore(product.getEcoScore());
        dto.setFootprint(product.getFootprint());
        dto.setMaterialCO2(product.getMaterialCO2());
        dto.setShippingCO2(product.getShippingCO2());
        dto.setImage(product.getImage());
        dto.setDate(product.getCreatedDate());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setDescription(product.getDescription());

        // new fields
        dto.setStatus(product.getStatus());
        dto.setRating(product.getRating());
        dto.setSales(product.getSales());

        // map seller info (avoid full User entity to prevent circular refs)
        if (product.getSeller() != null) {
            dto.setSellerId(product.getSeller().getId());
            dto.setSellerName(product.getSeller().getName());
        }

        return dto;
    }

    public Product toEntity(ProductDto dto, User seller) {
        if (dto == null) {
            return null;
        }

        Product product = new Product();
        product.setId(dto.getId());
        product.setName(dto.getName());
        product.setType(dto.getType());
        product.setPrice(dto.getPrice());
        product.setEcoScore(dto.getEcoScore());
        product.setFootprint(dto.getFootprint());
        product.setMaterialCO2(dto.getMaterialCO2());
        product.setShippingCO2(dto.getShippingCO2());
        product.setImage(dto.getImage());
        product.setStockQuantity(dto.getStockQuantity());
        product.setDescription(dto.getDescription());

        // new fields
        product.setStatus(dto.getStatus());
        product.setRating(dto.getRating());
        product.setSales(dto.getSales());

        // set seller (passed explicitly from service)
        product.setSeller(seller);

        return product;
    }
}
