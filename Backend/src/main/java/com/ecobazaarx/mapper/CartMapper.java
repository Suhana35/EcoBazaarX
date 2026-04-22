package com.ecobazaarx.mapper;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.ecobazaarx.dto.CartDto;
import com.ecobazaarx.dto.CartItemDto;
import com.ecobazaarx.entity.Cart;
import com.ecobazaarx.entity.CartItem;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {
    
    private final ProductMapper productMapper;
    
    @Autowired
    public CartMapper(ProductMapper productMapper) {
        this.productMapper = productMapper;
    }
    
    public CartDto toDto(Cart cart) {
        if (cart == null) {
            return null;
        }
        
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        dto.setTotalAmount(cart.getTotalAmount());
        dto.setTotalItems(cart.getTotalItems());
        dto.setUpdatedDate(cart.getUpdatedDate());
        
        if (cart.getCartItems() != null) {
            List<CartItemDto> cartItemDtos = cart.getCartItems().stream()
                    .map(this::toCartItemDto)
                    .collect(Collectors.toList());
            dto.setCartItems(cartItemDtos);
        }
        
        return dto;
    }
    
    public CartItemDto toCartItemDto(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }
        
        CartItemDto dto = new CartItemDto();
        dto.setId(cartItem.getId());
        dto.setProduct(productMapper.toDto(cartItem.getProduct()));
        dto.setQuantity(cartItem.getQuantity());
        dto.setSubtotal(cartItem.getSubtotal());
        dto.setAddedDate(cartItem.getAddedDate());
        
        return dto;
    }
}