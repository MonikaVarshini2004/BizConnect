package com.bizconnect.repository;

import com.bizconnect.entity.ProductService;
import com.bizconnect.entity.Vendor;
import com.bizconnect.entity.enums.ProductServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductServiceRepository extends JpaRepository<ProductService, Long> {

    List<ProductService> findByVendor(Vendor vendor);

    List<ProductService> findByVendorId(Long vendorId);

    List<ProductService> findByStatus(ProductServiceStatus status);

    List<ProductService> findByCategoryIdAndStatus(Long categoryId, ProductServiceStatus status);

    List<ProductService> findByNameContainingIgnoreCaseAndStatus(String keyword, ProductServiceStatus status);
}
