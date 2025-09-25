package com.ecobazaarx.mapper;


import org.springframework.stereotype.Component;

import com.ecobazaarx.dto.OrderDto;
import com.ecobazaarx.dto.OrderItemDto;
import com.ecobazaarx.entity.Order;
import com.ecobazaarx.entity.OrderItem;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {
    
    public OrderDto  toDto(Order order) {
        if (order == null) {
            return null;
        }
        
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name().toLowerCase());
        dto.setTrackingNumber(order.getTrackingNumber());
        dto.setEstimatedDelivery(order.getEstimatedDelivery());
        dto.setOrderDate(order.getOrderDate());
        dto.setShippedDate(order.getShippedDate());
        dto.setDeliveredDate(order.getDeliveredDate());
        dto.setTotalEcoScore(order.getTotalEcoScore());
        dto.setTotalCO2Footprint(order.getTotalCO2Footprint());
//        dto.setShippingAddress(order.getShippingAddress());
//        dto.setBillingAddress(order.getBillingAddress());
//        dto.setNotes(order.getNotes());
        
        if (order.getOrderItems() != null) {
            List<OrderItemDto> orderItemDtos = order.getOrderItems().stream()
                    .map(this::toOrderItemDto)
                    .collect(Collectors.toList());
            dto.setOrderItems(orderItemDtos);
        }
        
        return dto;
    }
    
    public OrderItemDto toOrderItemDto(OrderItem orderItem) {
        if (orderItem == null) {
            return null;
        }
        
        OrderItemDto dto = new OrderItemDto();
        dto.setId(orderItem.getId());
        dto.setProductId(orderItem.getProduct().getId());
        dto.setProductName(orderItem.getProductName());
        dto.setProductType(orderItem.getProductType());
        dto.setProductImage(orderItem.getProductImage());
        dto.setQuantity(orderItem.getQuantity());
        dto.setPrice(orderItem.getPrice());
        dto.setEcoScore(orderItem.getEcoScore());
        dto.setMaterialCO2(orderItem.getMaterialCO2());
        dto.setShippingCO2(orderItem.getShippingCO2());
        dto.setSubtotal(orderItem.getSubtotal());
        dto.setStatus(orderItem.getStatus().name().toLowerCase());
        
        return dto;
    }
}