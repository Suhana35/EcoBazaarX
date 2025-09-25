package com.ecobazaarx.service;

import com.ecobazaarx.dto.AddToCartRequest;
import com.ecobazaarx.dto.CartDto;
import com.ecobazaarx.dto.UpdateCartItemRequest;
import com.ecobazaarx.entity.Cart;
import com.ecobazaarx.entity.CartItem;
import com.ecobazaarx.entity.Product;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.exception.ResourceNotFoundException;
import com.ecobazaarx.repository.CartItemRepository;
import com.ecobazaarx.repository.CartRepository;
import com.ecobazaarx.repository.ProductRepository;
import com.ecobazaarx.repository.UserRepository;
import com.ecobazaarx.mapper.CartMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class CartService {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;
    
    @Autowired
    public CartService(CartRepository cartRepository,
                      CartItemRepository cartItemRepository,
                      ProductRepository productRepository,
                      UserRepository userRepository,
                      CartMapper cartMapper) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartMapper = cartMapper;
    }
    
    // Get user's cart
    @Transactional
    public CartDto getUserCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Optional<Cart> cartOptional = cartRepository.findByUserWithItems(user);
        
        if (cartOptional.isPresent()) {
            Cart cart = cartOptional.get();
            cart.updateTotals(); // Ensure totals are up to date
            cartRepository.save(cart);
            return cartMapper.toDto(cart);
        } else {
            // Create new empty cart
            Cart newCart = new Cart(user);
            Cart savedCart = cartRepository.save(newCart);
            return cartMapper.toDto(savedCart);
        }
    }
    
    // Add item to cart
    
    public CartDto addToCart(Long userId, AddToCartRequest request) {
    	User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));
        
        if (!"active".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalStateException("Product is not available");
        }
        
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new IllegalStateException("Insufficient stock. Available: " + product.getStockQuantity());
        }
        
        // Get or create cart
        Cart cart = cartRepository.findByUser(user).orElse(new Cart(user));
        if (cart.getId() == null) {
            cart = cartRepository.save(cart);
        }
        
        // Check if product already exists in cart
        Optional<CartItem> existingCartItem = cartItemRepository.findByCartAndProduct(cart, product);
        
        if (existingCartItem.isPresent()) {
            // Update quantity
            CartItem cartItem = existingCartItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            
            if (product.getStockQuantity() < newQuantity) {
                throw new IllegalStateException("Insufficient stock. Available: " + product.getStockQuantity());
            }
            
            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
        } else {
            // Add new cart item
            CartItem cartItem = new CartItem(cart, product, request.getQuantity());
            cartItemRepository.save(cartItem);
            cart.addCartItem(cartItem);
        }
        
        cart.updateTotals();
        cartRepository.save(cart);
        
        return cartMapper.toDto(cart);
    }
    
    // Update cart item quantity
    public CartDto updateCartItem(Long userId, Long cartItemId, UpdateCartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));
        
        // Verify cart belongs to user
        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new IllegalStateException("Cart item does not belong to user");
        }
        
        Product product = cartItem.getProduct();
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new IllegalStateException("Insufficient stock. Available: " + product.getStockQuantity());
        }
        
        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);
        
        Cart cart = cartItem.getCart();
        cart.updateTotals();
        cartRepository.save(cart);
        
        return cartMapper.toDto(cart);
    }
    
    // Remove item from cart
    public CartDto removeFromCart(Long userId, Long cartItemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));
        
        // Verify cart belongs to user
        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new IllegalStateException("Cart item does not belong to user");
        }
        
        Cart cart = cartItem.getCart();
        cart.removeCartItem(cartItem);
        cartItemRepository.delete(cartItem);
        
        cart.updateTotals();
        cartRepository.save(cart);
        
        return cartMapper.toDto(cart);
    }
    
    // Clear cart
    public void clearCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Optional<Cart> cartOptional = cartRepository.findByUser(user);
        if (cartOptional.isPresent()) {
            Cart cart = cartOptional.get();
            cart.clearCart();
            cartItemRepository.deleteByCart(cart);
            cartRepository.save(cart);
        }
    }
    
    // Get cart item count
    @Transactional(readOnly = true)
    public Integer getCartItemCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Optional<Cart> cartOptional = cartRepository.findByUser(user);
        return cartOptional.map(Cart::getTotalItems).orElse(0);
    }
    
 // Validate cart before checkout
    @Transactional(readOnly = true)
    public boolean validateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Optional<Cart> cartOptional = cartRepository.findByUserWithItems(user);
        if (cartOptional.isEmpty() || cartOptional.get().getCartItems().isEmpty()) {
            return false;
        }
        
        Cart cart = cartOptional.get();
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            if (!"active".equalsIgnoreCase(product.getStatus()) || product.getStockQuantity() < cartItem.getQuantity()) {
                return false;
            }
        }
        
        return true;
    }

}