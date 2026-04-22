package com.ecobazaarx.repository;

import com.ecobazaarx.entity.Order;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.entity.OrderStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByOrderDateDesc(User user);

    Page<Order> findByUserOrderByOrderDateDesc(User user, Pageable pageable);

    Optional<Order> findByTrackingNumber(String trackingNumber);

    List<Order> findByStatusOrderByOrderDateDesc(OrderStatus status);

    List<Order> findByUserAndStatusOrderByOrderDateDesc(User user, OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate " +
           "ORDER BY o.orderDate DESC")
    List<Order> findOrdersByDateRange(@Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o FROM Order o WHERE o.user = :user AND o.orderDate >= :sinceDate " +
           "ORDER BY o.orderDate DESC")
    List<Order> findRecentOrdersByUser(@Param("user") User user,
                                      @Param("sinceDate") LocalDateTime sinceDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user = :user " +
           "AND o.status NOT IN ('CANCELLED', 'RETURNED')")
    Double calculateTotalSalesByUser(@Param("user") User user);

    @Query("SELECT SUM(o.totalEcoScore) FROM Order o WHERE o.user = :user " +
           "AND o.status NOT IN ('CANCELLED', 'RETURNED')")
    Double calculateTotalEcoScoreByUser(@Param("user") User user);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countOrdersByStatus(@Param("status") OrderStatus status);

    // ── FIXED: was findByUserOrderByOrderDateDesc(user).size() ───────────────
    /**
     * Previously OrderService.getUserOrderStats() loaded every user order into
     * memory just to call .size(). This COUNT query does the same in one query.
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user = :user")
    long countOrdersByUser(@Param("user") User user);

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.order.user = :user " +
           "AND oi.order.status NOT IN " +
           "(com.ecobazaarx.entity.OrderStatus.CANCELLED, com.ecobazaarx.entity.OrderStatus.RETURNED)")
    Long countTotalItemsByUser(@Param("user") User user);

    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.orderItems oi " +
           "JOIN oi.product p " +
           "WHERE p.seller.id = :sellerId " +
           "ORDER BY o.orderDate DESC")
    List<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.orderItems oi " +
           "JOIN oi.product p " +
           "WHERE p.seller.id = :sellerId " +
           "ORDER BY o.orderDate DESC")
    Page<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);

    // ── Carbon Analytics Queries ──────────────────────────────────────────────

    /**
     * Monthly emissions trend for the last 6 months.
     *
     * LIMIT is hardcoded in SQL (not a named param, not Pageable) because:
     *  - Spring Data JPA named params don't bind inside LIMIT clauses.
     *  - Using Pageable with a native query causes Spring/Hibernate to wrap the
     *    SQL in a derived-table subquery, which breaks DATE_FORMAT + ORDER BY
     *    in MySQL and produces a 400 Bad Request at runtime.
     *
     * GROUP BY repeats the full expression (not the alias) to avoid SQL_SYNTAX errors.
     *
     * Columns returned: [month VARCHAR "YYYY-MM", emissions DOUBLE, order_count BIGINT]
     *
     * NOTE: DATE_FORMAT is MySQL-specific; for PostgreSQL use TO_CHAR(o.order_date,'YYYY-MM').
     */
    @Query(value =
           "SELECT DATE_FORMAT(o.order_date, '%Y-%m') AS month, " +
           "       COALESCE(SUM(o.total_co2_footprint), 0) AS emissions, " +
           "       COUNT(o.id) AS order_count " +
           "FROM orders o " +
           "WHERE o.status NOT IN ('CANCELLED', 'RETURNED') " +
           "GROUP BY DATE_FORMAT(o.order_date, '%Y-%m') " +
           "ORDER BY DATE_FORMAT(o.order_date, '%Y-%m') DESC " +
           "LIMIT 6",
           nativeQuery = true)
    List<Object[]> getMonthlyEmissions();

    /** Total CO2 footprint across all non-cancelled orders. */
    @Query("SELECT COALESCE(SUM(o.totalCO2Footprint), 0) FROM Order o " +
           "WHERE o.status NOT IN " +
           "(com.ecobazaarx.entity.OrderStatus.CANCELLED, com.ecobazaarx.entity.OrderStatus.RETURNED)")
    Double getTotalOrderCO2();

    /** Total number of non-cancelled orders (used in analytics overview). */
    @Query("SELECT COUNT(o) FROM Order o " +
           "WHERE o.status NOT IN " +
           "(com.ecobazaarx.entity.OrderStatus.CANCELLED, com.ecobazaarx.entity.OrderStatus.RETURNED)")
    long countActiveOrders();

    // ── Per-user carbon analytics ─────────────────────────────────────────────

    /**
     * Returns one row per user with their total CO2 footprint from orders.
     * Columns: [userId LONG, userName STRING, totalCO2 DOUBLE, orderCount LONG, avgEcoScore DOUBLE]
     */
    @Query("SELECT o.user.id, o.user.name, " +
           "COALESCE(SUM(o.totalCO2Footprint), 0), " +
           "COUNT(o), " +
           "COALESCE(AVG(o.totalEcoScore), 0) " +
           "FROM Order o " +
           "WHERE o.status NOT IN " +
           "(com.ecobazaarx.entity.OrderStatus.CANCELLED, com.ecobazaarx.entity.OrderStatus.RETURNED) " +
           "GROUP BY o.user.id, o.user.name " +
           "ORDER BY SUM(o.totalCO2Footprint) DESC")
    List<Object[]> getCarbonByUser();

    /**
     * Total CO2 footprint from orders (sum of all non-cancelled order CO2).
     * Already exists as getTotalOrderCO2() above — this alias is for clarity.
     */
    @Query("SELECT COALESCE(SUM(o.totalCO2Footprint), 0), " +
           "COUNT(o), " +
           "COALESCE(AVG(o.totalCO2Footprint), 0) " +
           "FROM Order o " +
           "WHERE o.status NOT IN " +
           "(com.ecobazaarx.entity.OrderStatus.CANCELLED, com.ecobazaarx.entity.OrderStatus.RETURNED)")
    List<Object[]> getOrderCarbonOverview();
}