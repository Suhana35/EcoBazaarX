package com.ecobazaarx.dto;

import java.util.List;

/**
 * Pre-aggregated carbon analytics payload.
 *
 * All totals, averages and ranked lists are computed in the database (see
 * AnalyticsService.getCarbonAnalytics) so the frontend only needs to render
 * the numbers — no JavaScript math, no loading 1 000+ records over the wire.
 */
public class CarbonAnalyticsDto {

    // ── Overview ──────────────────────────────────────────────────────────────
    private double totalEmissions;          // materialCO2 + shippingCO2 across all active products
    private double totalMaterialCO2;
    private double totalShippingCO2;
    private double avgEmissionsPerProduct;
    private double avgEcoScore;
    private long   totalProducts;
    private long   totalOrders;
    private long   highEmissionCount;       // products where (materialCO2 + shippingCO2) > 10

    // ── Breakdown lists ───────────────────────────────────────────────────────
    private List<EmissionByType>   emissionsByType;
    private List<MonthlyEmission>  emissionsByMonth;
    private List<ProductSummary>   topOffenders;    // 5 highest-emission products
    private List<ProductSummary>   ecoFriendly;     // 5 best eco-score products

    // ── New: per-user and per-seller carbon ───────────────────────────────────
    private double totalOrderCO2;          // sum of all order totalCO2Footprint
    private double avgCO2PerOrder;         // average CO2 per non-cancelled order
    private List<UserCarbonSummary>   userCarbonList;    // CO2 per user (from orders)
    private List<SellerCarbonSummary> sellerCarbonList;  // CO2 per seller (from products)

    // ── Inner DTOs ────────────────────────────────────────────────────────────

    public static class EmissionByType {
        private String name;
        private double emissions;
        private double materialCO2;
        private double shippingCO2;
        private long   count;
        private double avgEcoScore;

        public EmissionByType() {}
        public EmissionByType(String name, double materialCO2, double shippingCO2,
                              long count, double avgEcoScore) {
            this.name        = name;
            this.materialCO2 = materialCO2;
            this.shippingCO2 = shippingCO2;
            this.emissions   = materialCO2 + shippingCO2;
            this.count       = count;
            this.avgEcoScore = avgEcoScore;
        }

        public String getName()        { return name; }
        public double getEmissions()   { return emissions; }
        public double getMaterialCO2() { return materialCO2; }
        public double getShippingCO2() { return shippingCO2; }
        public long   getCount()       { return count; }
        public double getAvgEcoScore() { return avgEcoScore; }
        public void setName(String n)           { this.name = n; }
        public void setEmissions(double e)      { this.emissions = e; }
        public void setMaterialCO2(double m)    { this.materialCO2 = m; }
        public void setShippingCO2(double s)    { this.shippingCO2 = s; }
        public void setCount(long c)            { this.count = c; }
        public void setAvgEcoScore(double a)    { this.avgEcoScore = a; }
    }

    public static class MonthlyEmission {
        private String month;       // "YYYY-MM"
        private double emissions;   // sum of order totalCO2Footprint
        private long   orderCount;

        public MonthlyEmission() {}
        public MonthlyEmission(String month, double emissions, long orderCount) {
            this.month      = month;
            this.emissions  = emissions;
            this.orderCount = orderCount;
        }

        public String getMonth()       { return month; }
        public double getEmissions()   { return emissions; }
        public long   getOrderCount()  { return orderCount; }
        public void setMonth(String m)      { this.month = m; }
        public void setEmissions(double e)  { this.emissions = e; }
        public void setOrderCount(long c)   { this.orderCount = c; }
    }

    public static class ProductSummary {
        private Long   id;
        private String name;
        private String type;
        private double materialCO2;
        private double shippingCO2;
        private double ecoScore;

        public ProductSummary() {}
        public ProductSummary(Long id, String name, String type,
                              double materialCO2, double shippingCO2, double ecoScore) {
            this.id          = id;
            this.name        = name;
            this.type        = type;
            this.materialCO2 = materialCO2;
            this.shippingCO2 = shippingCO2;
            this.ecoScore    = ecoScore;
        }

        public Long   getId()          { return id; }
        public String getName()        { return name; }
        public String getType()        { return type; }
        public double getMaterialCO2() { return materialCO2; }
        public double getShippingCO2() { return shippingCO2; }
        public double getEcoScore()    { return ecoScore; }
        public void setId(Long i)           { this.id = i; }
        public void setName(String n)       { this.name = n; }
        public void setType(String t)       { this.type = t; }
        public void setMaterialCO2(double m){ this.materialCO2 = m; }
        public void setShippingCO2(double s){ this.shippingCO2 = s; }
        public void setEcoScore(double e)   { this.ecoScore = e; }
    }

    public static class UserCarbonSummary {
        private Long   userId;
        private String userName;
        private double totalCO2;
        private long   orderCount;
        private double avgEcoScore;

        public UserCarbonSummary() {}
        public UserCarbonSummary(Long userId, String userName, double totalCO2, long orderCount, double avgEcoScore) {
            this.userId     = userId;
            this.userName   = userName;
            this.totalCO2   = totalCO2;
            this.orderCount = orderCount;
            this.avgEcoScore = avgEcoScore;
        }

        public Long   getUserId()      { return userId; }
        public String getUserName()    { return userName; }
        public double getTotalCO2()    { return totalCO2; }
        public long   getOrderCount()  { return orderCount; }
        public double getAvgEcoScore() { return avgEcoScore; }
        public void setUserId(Long v)       { this.userId = v; }
        public void setUserName(String v)   { this.userName = v; }
        public void setTotalCO2(double v)   { this.totalCO2 = v; }
        public void setOrderCount(long v)   { this.orderCount = v; }
        public void setAvgEcoScore(double v){ this.avgEcoScore = v; }
    }

    public static class SellerCarbonSummary {
        private Long   sellerId;
        private String sellerName;
        private double materialCO2;
        private double shippingCO2;
        private double totalCO2;
        private long   productCount;
        private double avgEcoScore;

        public SellerCarbonSummary() {}
        public SellerCarbonSummary(Long sellerId, String sellerName, double materialCO2,
                                   double shippingCO2, long productCount, double avgEcoScore) {
            this.sellerId     = sellerId;
            this.sellerName   = sellerName;
            this.materialCO2  = materialCO2;
            this.shippingCO2  = shippingCO2;
            this.totalCO2     = materialCO2 + shippingCO2;
            this.productCount = productCount;
            this.avgEcoScore  = avgEcoScore;
        }

        public Long   getSellerId()    { return sellerId; }
        public String getSellerName()  { return sellerName; }
        public double getMaterialCO2() { return materialCO2; }
        public double getShippingCO2() { return shippingCO2; }
        public double getTotalCO2()    { return totalCO2; }
        public long   getProductCount(){ return productCount; }
        public double getAvgEcoScore() { return avgEcoScore; }
        public void setSellerId(Long v)      { this.sellerId = v; }
        public void setSellerName(String v)  { this.sellerName = v; }
        public void setMaterialCO2(double v) { this.materialCO2 = v; }
        public void setShippingCO2(double v) { this.shippingCO2 = v; }
        public void setTotalCO2(double v)    { this.totalCO2 = v; }
        public void setProductCount(long v)  { this.productCount = v; }
        public void setAvgEcoScore(double v) { this.avgEcoScore = v; }
    }

    // ── Root getters / setters ────────────────────────────────────────────────

    public double getTotalEmissions()            { return totalEmissions; }
    public void   setTotalEmissions(double v)    { this.totalEmissions = v; }

    public double getTotalMaterialCO2()          { return totalMaterialCO2; }
    public void   setTotalMaterialCO2(double v)  { this.totalMaterialCO2 = v; }

    public double getTotalShippingCO2()          { return totalShippingCO2; }
    public void   setTotalShippingCO2(double v)  { this.totalShippingCO2 = v; }

    public double getAvgEmissionsPerProduct()           { return avgEmissionsPerProduct; }
    public void   setAvgEmissionsPerProduct(double v)   { this.avgEmissionsPerProduct = v; }

    public double getAvgEcoScore()               { return avgEcoScore; }
    public void   setAvgEcoScore(double v)       { this.avgEcoScore = v; }

    public long   getTotalProducts()             { return totalProducts; }
    public void   setTotalProducts(long v)       { this.totalProducts = v; }

    public long   getTotalOrders()               { return totalOrders; }
    public void   setTotalOrders(long v)         { this.totalOrders = v; }

    public long   getHighEmissionCount()         { return highEmissionCount; }
    public void   setHighEmissionCount(long v)   { this.highEmissionCount = v; }

    public List<EmissionByType>  getEmissionsByType()             { return emissionsByType; }
    public void                  setEmissionsByType(List<EmissionByType> v)  { this.emissionsByType = v; }

    public List<MonthlyEmission> getEmissionsByMonth()            { return emissionsByMonth; }
    public void                  setEmissionsByMonth(List<MonthlyEmission> v){ this.emissionsByMonth = v; }

    public List<ProductSummary>  getTopOffenders()                { return topOffenders; }
    public void                  setTopOffenders(List<ProductSummary> v)     { this.topOffenders = v; }

    public List<ProductSummary>  getEcoFriendly()                 { return ecoFriendly; }
    public void                  setEcoFriendly(List<ProductSummary> v)      { this.ecoFriendly = v; }

    public double getTotalOrderCO2()               { return totalOrderCO2; }
    public void   setTotalOrderCO2(double v)       { this.totalOrderCO2 = v; }

    public double getAvgCO2PerOrder()              { return avgCO2PerOrder; }
    public void   setAvgCO2PerOrder(double v)      { this.avgCO2PerOrder = v; }

    public List<UserCarbonSummary>   getUserCarbonList()                    { return userCarbonList; }
    public void                      setUserCarbonList(List<UserCarbonSummary> v) { this.userCarbonList = v; }

    public List<SellerCarbonSummary> getSellerCarbonList()                       { return sellerCarbonList; }
    public void                      setSellerCarbonList(List<SellerCarbonSummary> v) { this.sellerCarbonList = v; }
}