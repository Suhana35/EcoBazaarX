package com.ecobazaarx.entity;

// FIX: Use an enum instead of a free-text String for product status.
// Prevents silent bugs from typos like "Activ" or "ACTIVE" bypassing status checks.
public enum ProductStatus {
    ACTIVE,
    INACTIVE,
    ARCHIVED
}