package com.ecobazaarx.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.ecobazaarx.entity.Product;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.entity.Role;
import com.ecobazaarx.repository.ProductRepository;
import com.ecobazaarx.repository.UserRepository;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Autowired
    public DataInitializer(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            initializeDefaultProducts();
        }
    }

    private void initializeDefaultProducts() {

        User seller1 = userRepository.findByEmail("seller1@gmail.com")
                .orElseGet(() -> {
                    User user = new User("seller1", "seller1@gmail.com",
                            "$2a$10$0i3qqoKX6NoxLCswyTo6l.9DAt1elNIWgpLwosbTzsU5Qq31fvsqa",
                            Role.SELLER);
                    return userRepository.save(user);
                });

        User seller2 = userRepository.findByEmail("seller2@gmail.com")
                .orElseGet(() -> {
                    User user = new User("seller2", "seller2@gmail.com",
                            "$2a$10$zJ.5H1isaGeHmMNA5pxueufaZSbIRkL/6oPeUEn.CggwtjcH/KxoG",
                            Role.SELLER);
                    return userRepository.save(user);
                });

        User u1 = userRepository.findByEmail("cust1@gmail.com")
                .orElseGet(() -> {
                    User user = new User("cust1", "cust1@gmail.com",
                            "$2a$10$ES5zAaIG5tyJj40pmS8cnun3okIOPKnHKT8OaYoVvPE.U0HhL2yLO",
                            Role.CONSUMER);
                    return userRepository.save(user);
                });

        User u2 = userRepository.findByEmail("admin1@gmail.com")
                .orElseGet(() -> {
                    User user = new User("admin1", "admin1@gmail.com",
                            "$2a$10$1Vlx/GHIQWZvGod5TGbn3OkomO1K8cmZaNYmv8kk78FDZ6.QuJMZG",
                            Role.ADMIN);
                    return userRepository.save(user);
                });

        List<Product> products = Arrays.asList(

            // ───────────────────────────────────────────────────────────────
            // SELLER 1 — Fashion & Apparel (15 products)
            // ───────────────────────────────────────────────────────────────

            new Product(null, "Men Grey Hoodie", "Hoodie",
                    BigDecimal.valueOf(999), BigDecimal.valueOf(4.5),
                    BigDecimal.valueOf(3.8), BigDecimal.valueOf(2.3), BigDecimal.valueOf(1.5),
                    "https://images.unsplash.com/photo-1632073143817-8cd5b2165e20?w=600&auto=format&fit=crop&q=60",
                    null, null, 50, "Comfortable eco-friendly hoodie made from organic cotton",
                    seller1, "active", BigDecimal.valueOf(4.0), 10),

            new Product(null, "Women Striped T-Shirt", "T-Shirt",
                    BigDecimal.valueOf(699), BigDecimal.valueOf(4.7),
                    BigDecimal.valueOf(2.5), BigDecimal.valueOf(1.5), BigDecimal.valueOf(1.0),
                    "https://media.istockphoto.com/id/827511198/photo/blue-and-white-stripped-sailor-style-t-shirt-isolated.webp?a=1&b=1&s=612x612&w=0&k=20&c=pnxcM51FJUD8UOScIRsCitamz8xNqhAQVZMi1lYMuOo=",
                    null, null, 75, "Stylish striped t-shirt made from sustainable materials",
                    seller1, "active", BigDecimal.valueOf(4.5), 25),

            new Product(null, "Classic Leather Jacket", "Jacket",
                    BigDecimal.valueOf(3499), BigDecimal.valueOf(3.2),
                    BigDecimal.valueOf(12.0), BigDecimal.valueOf(9.0), BigDecimal.valueOf(3.0),
                    "https://media.istockphoto.com/id/175253379/photo/black-leather-jacket.jpg?s=2048x2048&w=is&k=20&c=1Tcx4nLXFiuHeiSlC_j82rqZKpFXAw6T3hLFC-iSSKg=",
                    null, null, 25, "Premium leather jacket with classic design",
                    seller1, "active", BigDecimal.valueOf(3.8), 5),

            new Product(null, "Men Casual Sneakers", "Shoes",
                    BigDecimal.valueOf(1499), BigDecimal.valueOf(4.2),
                    BigDecimal.valueOf(4.0), BigDecimal.valueOf(2.0), BigDecimal.valueOf(1.0),
                    "https://media.istockphoto.com/id/2158040847/photo/plain-sneaker-mens-footwear-on-a-grey-tiled-floor.jpg?s=2048x2048&w=is&k=20&c=t_yLO87UG_LiMrQBdNzdeFkByDr9CbwmasKKSQjNGIg=",
                    null, null, 40, "Comfortable eco-friendly casual sneakers",
                    seller1, "active", BigDecimal.valueOf(4.1), 15),

            new Product(null, "Women Summer Dress", "Dress",
                    BigDecimal.valueOf(1199), BigDecimal.valueOf(4.8),
                    BigDecimal.valueOf(2.2), BigDecimal.valueOf(1.5), BigDecimal.valueOf(0.8),
                    "https://images.unsplash.com/photo-1520975911621-95d89c742b68?w=600&auto=format&fit=crop&q=60",
                    null, null, 60, "Lightweight summer dress made from sustainable fabrics",
                    seller1, "active", BigDecimal.valueOf(4.6), 20),

            new Product(null, "Eco Denim Jeans", "Jeans",
                    BigDecimal.valueOf(1799), BigDecimal.valueOf(4.3),
                    BigDecimal.valueOf(5.0), BigDecimal.valueOf(3.0), BigDecimal.valueOf(2.0),
                    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=60",
                    null, null, 45, "Durable eco-friendly denim jeans",
                    seller1, "active", BigDecimal.valueOf(4.2), 12),

            new Product(null, "Organic Cotton Polo Shirt", "T-Shirt",
                    BigDecimal.valueOf(849), BigDecimal.valueOf(4.6),
                    BigDecimal.valueOf(2.0), BigDecimal.valueOf(1.2), BigDecimal.valueOf(0.8),
                    "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&auto=format&fit=crop&q=60",
                    null, null, 80, "Classic polo shirt crafted from 100% organic cotton",
                    seller1, "active", BigDecimal.valueOf(4.4), 18),

            new Product(null, "Recycled Polyester Windbreaker", "Jacket",
                    BigDecimal.valueOf(2199), BigDecimal.valueOf(4.4),
                    BigDecimal.valueOf(6.5), BigDecimal.valueOf(4.0), BigDecimal.valueOf(2.5),
                    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=60",
                    null, null, 35, "Lightweight windbreaker made from recycled plastic bottles",
                    seller1, "active", BigDecimal.valueOf(4.3), 8),

            new Product(null, "Hemp Cargo Pants", "Pants",
                    BigDecimal.valueOf(1399), BigDecimal.valueOf(4.7),
                    BigDecimal.valueOf(3.5), BigDecimal.valueOf(2.0), BigDecimal.valueOf(1.5),
                    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=60",
                    null, null, 55, "Versatile cargo pants made from sustainable hemp fibers",
                    seller1, "active", BigDecimal.valueOf(4.5), 14),

            new Product(null, "Bamboo Fiber Socks (5-Pack)", "Accessories",
                    BigDecimal.valueOf(399), BigDecimal.valueOf(4.9),
                    BigDecimal.valueOf(0.8), BigDecimal.valueOf(0.5), BigDecimal.valueOf(0.3),
                    "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&auto=format&fit=crop&q=60",
                    null, null, 150, "Ultra-soft socks made from antibacterial bamboo fiber",
                    seller1, "active", BigDecimal.valueOf(4.8), 80),

            new Product(null, "Women Linen Blazer", "Jacket",
                    BigDecimal.valueOf(2799), BigDecimal.valueOf(4.5),
                    BigDecimal.valueOf(7.0), BigDecimal.valueOf(4.5), BigDecimal.valueOf(2.5),
                    "https://images.unsplash.com/photo-1594938298603-c8148c4b2f07?w=600&auto=format&fit=crop&q=60",
                    null, null, 30, "Elegant linen blazer for a sustainable professional look",
                    seller1, "active", BigDecimal.valueOf(4.4), 7),

            new Product(null, "Men Slim Fit Chinos", "Pants",
                    BigDecimal.valueOf(1299), BigDecimal.valueOf(4.3),
                    BigDecimal.valueOf(3.2), BigDecimal.valueOf(2.0), BigDecimal.valueOf(1.2),
                    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=60",
                    null, null, 65, "Slim-fit chinos made from organic stretch cotton",
                    seller1, "active", BigDecimal.valueOf(4.2), 22),

            new Product(null, "Tie-Dye Organic Sweatshirt", "Hoodie",
                    BigDecimal.valueOf(899), BigDecimal.valueOf(4.6),
                    BigDecimal.valueOf(3.0), BigDecimal.valueOf(1.8), BigDecimal.valueOf(1.2),
                    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=60",
                    null, null, 40, "Trendy tie-dye sweatshirt coloured with plant-based dyes",
                    seller1, "active", BigDecimal.valueOf(4.6), 16),

            new Product(null, "Vegan Leather Belt", "Accessories",
                    BigDecimal.valueOf(599), BigDecimal.valueOf(4.4),
                    BigDecimal.valueOf(1.5), BigDecimal.valueOf(0.8), BigDecimal.valueOf(0.4),
                    "https://images.unsplash.com/photo-1624222247347-e6e2e46b9cc5?w=600&auto=format&fit=crop&q=60",
                    null, null, 70, "Stylish belt crafted from plant-based vegan leather",
                    seller1, "active", BigDecimal.valueOf(4.3), 35),

            new Product(null, "Organic Wool Beanie", "Accessories",
                    BigDecimal.valueOf(449), BigDecimal.valueOf(4.7),
                    BigDecimal.valueOf(1.2), BigDecimal.valueOf(0.7), BigDecimal.valueOf(0.3),
                    "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=60",
                    null, null, 90, "Warm and cosy beanie knitted from ethical wool",
                    seller1, "active", BigDecimal.valueOf(4.7), 45),

            // ───────────────────────────────────────────────────────────────
            // SELLER 2 — Home, Tech & Wellness (15 products)
            // ───────────────────────────────────────────────────────────────

            new Product(null, "Wireless Bluetooth Earbuds", "Electronics",
                    BigDecimal.valueOf(1299), BigDecimal.valueOf(4.4),
                    BigDecimal.valueOf(1.2), BigDecimal.valueOf(0.5), BigDecimal.valueOf(0.2),
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=60",
                    null, null, 100, "Compact and eco-friendly wireless earbuds",
                    seller2, "active", BigDecimal.valueOf(4.3), 50),

            new Product(null, "Smart LED Desk Lamp", "Electronics",
                    BigDecimal.valueOf(899), BigDecimal.valueOf(4.6),
                    BigDecimal.valueOf(2.0), BigDecimal.valueOf(1.0), BigDecimal.valueOf(0.5),
                    "https://images.unsplash.com/photo-1534104621568-a2daf3c8de85?w=600&auto=format&fit=crop&q=60",
                    null, null, 80, "Energy-efficient smart LED desk lamp",
                    seller2, "active", BigDecimal.valueOf(4.5), 30),

            new Product(null, "Organic Green Tea", "Beverage",
                    BigDecimal.valueOf(349), BigDecimal.valueOf(4.9),
                    BigDecimal.valueOf(0.5), BigDecimal.valueOf(0.3), BigDecimal.valueOf(0.1),
                    "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=60",
                    null, null, 120, "Refreshing certified-organic green tea",
                    seller2, "active", BigDecimal.valueOf(4.8), 100),

            new Product(null, "Recycled Notebook", "Stationery",
                    BigDecimal.valueOf(199), BigDecimal.valueOf(4.7),
                    BigDecimal.valueOf(0.3), BigDecimal.valueOf(0.2), BigDecimal.valueOf(0.1),
                    "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop&q=60",
                    null, null, 200, "Notebook made from 100% recycled paper",
                    seller2, "active", BigDecimal.valueOf(4.5), 150),

            new Product(null, "Stainless Steel Water Bottle", "Accessories",
                    BigDecimal.valueOf(599), BigDecimal.valueOf(4.8),
                    BigDecimal.valueOf(1.0), BigDecimal.valueOf(0.5), BigDecimal.valueOf(0.2),
                    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=60",
                    null, null, 90, "Reusable insulated stainless steel water bottle",
                    seller2, "active", BigDecimal.valueOf(4.7), 60),

            new Product(null, "Bamboo Toothbrush Set (4-Pack)", "Personal Care",
                    BigDecimal.valueOf(299), BigDecimal.valueOf(5.0),
                    BigDecimal.valueOf(0.4), BigDecimal.valueOf(0.2), BigDecimal.valueOf(0.1),
                    "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=60",
                    null, null, 250, "100% biodegradable bamboo toothbrushes with charcoal bristles",
                    seller2, "active", BigDecimal.valueOf(4.9), 200),

            new Product(null, "Solar Power Bank 20000mAh", "Electronics",
                    BigDecimal.valueOf(1999), BigDecimal.valueOf(4.5),
                    BigDecimal.valueOf(3.5), BigDecimal.valueOf(2.0), BigDecimal.valueOf(0.8),
                    "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=60",
                    null, null, 60, "High-capacity solar-powered portable charger",
                    seller2, "active", BigDecimal.valueOf(4.4), 40),

            new Product(null, "Organic Beeswax Candle", "Home Decor",
                    BigDecimal.valueOf(449), BigDecimal.valueOf(4.8),
                    BigDecimal.valueOf(0.6), BigDecimal.valueOf(0.4), BigDecimal.valueOf(0.2),
                    "https://images.unsplash.com/photo-1603905317064-8b47bee43c43?w=600&auto=format&fit=crop&q=60",
                    null, null, 130, "Hand-poured beeswax candle with natural fragrance",
                    seller2, "active", BigDecimal.valueOf(4.8), 90),

            new Product(null, "Reusable Beeswax Food Wraps", "Kitchen",
                    BigDecimal.valueOf(349), BigDecimal.valueOf(4.9),
                    BigDecimal.valueOf(0.4), BigDecimal.valueOf(0.2), BigDecimal.valueOf(0.1),
                    "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=60",
                    null, null, 180, "Plastic-free beeswax food wraps — pack of 3",
                    seller2, "active", BigDecimal.valueOf(4.9), 120),

            new Product(null, "Cork Yoga Mat", "Fitness",
                    BigDecimal.valueOf(1299), BigDecimal.valueOf(4.7),
                    BigDecimal.valueOf(4.0), BigDecimal.valueOf(2.5), BigDecimal.valueOf(1.0),
                    "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&auto=format&fit=crop&q=60",
                    null, null, 45, "Non-slip yoga mat made from sustainable cork and natural rubber",
                    seller2, "active", BigDecimal.valueOf(4.6), 25),

            new Product(null, "Compostable Phone Case", "Electronics",
                    BigDecimal.valueOf(499), BigDecimal.valueOf(4.6),
                    BigDecimal.valueOf(0.7), BigDecimal.valueOf(0.4), BigDecimal.valueOf(0.2),
                    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=60",
                    null, null, 110, "100% compostable phone case made from plant-based materials",
                    seller2, "active", BigDecimal.valueOf(4.5), 70),

            new Product(null, "Activated Charcoal Soap Bar", "Personal Care",
                    BigDecimal.valueOf(249), BigDecimal.valueOf(4.8),
                    BigDecimal.valueOf(0.3), BigDecimal.valueOf(0.2), BigDecimal.valueOf(0.1),
                    "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=600&auto=format&fit=crop&q=60",
                    null, null, 200, "Deep-cleansing soap bar with natural activated charcoal",
                    seller2, "active", BigDecimal.valueOf(4.7), 160),

            new Product(null, "Seed Paper Greeting Cards (5-Pack)", "Stationery",
                    BigDecimal.valueOf(299), BigDecimal.valueOf(5.0),
                    BigDecimal.valueOf(0.2), BigDecimal.valueOf(0.1), BigDecimal.valueOf(0.05),
                    "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&auto=format&fit=crop&q=60",
                    null, null, 300, "Plantable greeting cards embedded with wildflower seeds",
                    seller2, "active", BigDecimal.valueOf(5.0), 250),

            new Product(null, "Bamboo Cutting Board", "Kitchen",
                    BigDecimal.valueOf(699), BigDecimal.valueOf(4.8),
                    BigDecimal.valueOf(1.5), BigDecimal.valueOf(0.8), BigDecimal.valueOf(0.4),
                    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=60",
                    null, null, 75, "Durable and naturally antimicrobial bamboo cutting board",
                    seller2, "active", BigDecimal.valueOf(4.8), 55),

            new Product(null, "Natural Loofah Sponge Set", "Personal Care",
                    BigDecimal.valueOf(199), BigDecimal.valueOf(4.9),
                    BigDecimal.valueOf(0.2), BigDecimal.valueOf(0.1), BigDecimal.valueOf(0.05),
                    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=60",
                    null, null, 220, "100% natural loofah sponges — plastic-free bathroom essential",
                    seller2, "active", BigDecimal.valueOf(4.9), 180)
        );

        productRepository.saveAll(products);
        System.out.println("✅ " + products.size() + " default products initialized successfully!");
    }
}