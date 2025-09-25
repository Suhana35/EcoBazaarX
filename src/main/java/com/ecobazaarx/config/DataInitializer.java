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
        // Ensure seller1 exists
        User seller1 = userRepository.findByEmail("seller1@gmail.com")
                .orElseGet(() -> {
                    User user = new User("seller1", "seller1@gmail.com",
                            "$2a$10$0i3qqoKX6NoxLCswyTo6l.9DAt1elNIWgpLwosbTzsU5Qq31fvsqa",
                            Role.SELLER);
                    return userRepository.save(user);
                });

        // Ensure seller2 exists
        User seller2 = userRepository.findByEmail("seller2@gmail.com")
                .orElseGet(() -> {
                    User user = new User("seller2", "seller2@gmail.com",
                            "``", // Use proper bcrypt hash
                            Role.SELLER);
                    return userRepository.save(user);
                });
        
        User u1 = userRepository.findByEmail("cust1@gmail.com")
                .orElseGet(() -> {
                    User user = new User("cust1", "cust1@gmail.com",
                            "$2a$10$ES5zAaIG5tyJj40pmS8cnun3okIOPKnHKT8OaYoVvPE.U0HhL2yLO", // Use proper bcrypt hash
                            Role.CONSUMER);
                    return userRepository.save(user);
                });
        User u2 = userRepository.findByEmail("admin1@gmail.com")
                .orElseGet(() -> {
                    User user = new User("admin1", "admin1@gmail.com",
                            "$2a$10$1Vlx/GHIQWZvGod5TGbn3OkomO1K8cmZaNYmv8kk78FDZ6.QuJMZG", // Use proper bcrypt hash
                            Role.ADMIN);
                    return userRepository.save(user);
                });

        List<Product> products = Arrays.asList(
            // Seller1 products (6)
            new Product(null, "Men Grey Hoodie", "Hoodie", BigDecimal.valueOf(49.9),
                    BigDecimal.valueOf(4.5), BigDecimal.valueOf(3.8), BigDecimal.valueOf(2.3),
                    BigDecimal.valueOf(1.5),
                    "https://images.unsplash.com/photo-1632073143817-8cd5b2165e20?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1lbiUyMGdyZXklMjBob29kaWV8ZW58MHx8MHx8fDA%3D",
                    null, null, 50, "Comfortable eco-friendly hoodie made from organic cotton",
                    seller1, "active", BigDecimal.valueOf(4.0), 10),

            new Product(null, "Women Striped T-Shirt", "T-Shirt", BigDecimal.valueOf(34.9),
                    BigDecimal.valueOf(4.7), BigDecimal.valueOf(2.5), BigDecimal.valueOf(1.5),
                    BigDecimal.valueOf(1.0),
                    "https://media.istockphoto.com/id/827511198/photo/blue-and-white-stripped-sailor-style-t-shirt-isolated.webp?a=1&b=1&s=612x612&w=0&k=20&c=pnxcM51FJUD8UOScIRsCitamz8xNqhAQVZMi1lYMuOo=",
                    null, null, 75, "Stylish striped t-shirt made from sustainable materials",
                    seller1, "active", BigDecimal.valueOf(4.5), 25),

            new Product(null, "Classic Leather Jacket", "Jacket", BigDecimal.valueOf(149.9),
                    BigDecimal.valueOf(3.2), BigDecimal.valueOf(12.0), BigDecimal.valueOf(9.0),
                    BigDecimal.valueOf(3.0),
                    "https://media.istockphoto.com/id/175253379/photo/black-leather-jacket.jpg?s=2048x2048&w=is&k=20&c=1Tcx4nLXFiuHeiSlC_j82rqZKpFXAw6T3hLFC-iSSKg=",
                    null, null, 25, "Premium leather jacket with classic design",
                    seller1, "active", BigDecimal.valueOf(3.8), 5),

            new Product(null, "Men Casual Sneakers", "Shoes", BigDecimal.valueOf(69.9),
                    BigDecimal.valueOf(4.2), BigDecimal.valueOf(4.0), BigDecimal.valueOf(2.0),
                    BigDecimal.valueOf(1.0),
                    "https://media.istockphoto.com/id/2158040847/photo/plain-sneaker-mens-footwear-on-a-grey-tiled-floor.jpg?s=2048x2048&w=is&k=20&c=t_yLO87UG_LiMrQBdNzdeFkByDr9CbwmasKKSQjNGIg=",
                    null, null, 40, "Comfortable eco-friendly casual sneakers",
                    seller1, "active", BigDecimal.valueOf(4.1), 15),

            new Product(null, "Women Summer Dress", "Dress", BigDecimal.valueOf(59.9),
                    BigDecimal.valueOf(4.8), BigDecimal.valueOf(2.2), BigDecimal.valueOf(1.5),
                    BigDecimal.valueOf(0.8),
                    "https://images.unsplash.com/photo-1520975911621-95d89c742b68?w=500&h=600",
                    null, null, 60, "Lightweight summer dress made from sustainable fabrics",
                    seller1, "active", BigDecimal.valueOf(4.6), 20),

            new Product(null, "Eco Denim Jeans", "Jeans", BigDecimal.valueOf(79.9),
                    BigDecimal.valueOf(4.3), BigDecimal.valueOf(5.0), BigDecimal.valueOf(3.0),
                    BigDecimal.valueOf(2.0),
                    "https://media.istockphoto.com/id/612479974/photo/crumpled-dress-isolated.jpg?s=2048x2048&w=is&k=20&c=HPMzDEFEJH27d0XVtqElAssG8TfN-SmOYrSm48vJpuU=",
                    null, null, 45, "Durable eco-friendly denim jeans",
                    seller1, "active", BigDecimal.valueOf(4.2), 12),

            // Seller2 products (5)
            new Product(null, "Wireless Bluetooth Earbuds", "Electronics", BigDecimal.valueOf(39.9),
                    BigDecimal.valueOf(4.4), BigDecimal.valueOf(1.2), BigDecimal.valueOf(0.5),
                    BigDecimal.valueOf(0.2),
                    "https://images.unsplash.com/photo-1754821130715-318b3615bde8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8V2lyZWxlc3MlMjBCbHVldG9vdGglMjBFYXJidWRzfGVufDB8fDB8fHww",
                    null, null, 100, "Compact and eco-friendly wireless earbuds",
                    seller2, "active", BigDecimal.valueOf(4.3), 50),

            new Product(null, "Smart LED Desk Lamp", "Electronics", BigDecimal.valueOf(29.9),
                    BigDecimal.valueOf(4.6), BigDecimal.valueOf(2.0), BigDecimal.valueOf(1.0),
                    BigDecimal.valueOf(0.5),
                    "https://images.unsplash.com/photo-1708513427809-728a7913fc9f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U21hcnQlMjBMRUQlMjBEZXNrJTIwTGFtcHxlbnwwfHwwfHx8MA%3D%3D",
                    null, null, 80, "Energy-efficient smart LED desk lamp",
                    seller2, "active", BigDecimal.valueOf(4.5), 30),

            new Product(null, "Organic Green Tea", "Beverage", BigDecimal.valueOf(19.9),
                    BigDecimal.valueOf(4.9), BigDecimal.valueOf(0.5), BigDecimal.valueOf(0.3),
                    BigDecimal.valueOf(0.1),
                    "https://images.unsplash.com/photo-1641997827830-12fa1d1a238d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8T3JnYW5pYyUyMEdyZWVuJTIwVGVhfGVufDB8fDB8fHww",
                    null, null, 120, "Refreshing organic green tea",
                    seller2, "active", BigDecimal.valueOf(4.8), 100),

            new Product(null, "Recycled Notebook", "Stationery", BigDecimal.valueOf(9.9),
                    BigDecimal.valueOf(4.7), BigDecimal.valueOf(0.3), BigDecimal.valueOf(0.2),
                    BigDecimal.valueOf(0.1),
                    "https://images.unsplash.com/photo-1647559709298-c0e3dcb47092?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZWN5Y2xlZCUyME5vdGVib29rfGVufDB8fDB8fHww",
                    null, null, 200, "Notebook made from recycled paper",
                    seller2, "active", BigDecimal.valueOf(4.5), 150),

            new Product(null, "Stainless Steel Water Bottle", "Accessories", BigDecimal.valueOf(24.9),
                    BigDecimal.valueOf(4.8), BigDecimal.valueOf(1.0), BigDecimal.valueOf(0.5),
                    BigDecimal.valueOf(0.2),
                    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U3RhaW5sZXNzJTIwU3RlZWwlMjBXYXRlciUyMEJvdHRsZXxlbnwwfHwwfHx8MA%3D%3D",
                    null, null, 90, "Reusable stainless steel water bottle",
                    seller2, "active", BigDecimal.valueOf(4.7), 60)
        );

        productRepository.saveAll(products);
        System.out.println("✅ Default products initialized successfully for seller1 and seller2!");
    }
}
