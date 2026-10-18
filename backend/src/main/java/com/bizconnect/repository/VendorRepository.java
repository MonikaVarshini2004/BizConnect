package com.bizconnect.repository;

import com.bizconnect.entity.User;
import com.bizconnect.entity.Vendor;
import com.bizconnect.entity.enums.VendorStatus;
import com.bizconnect.entity.enums.VendorVerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {

    Optional<Vendor> findByUser(User user);

    Optional<Vendor> findByUserId(Long userId);

    Optional<Vendor> findByBusinessName(String businessName);

    List<Vendor> findByVerificationStatus(VendorVerificationStatus status);

    List<Vendor> findByVendorStatus(VendorStatus status);

    List<Vendor> findByVerificationStatusAndVendorStatus(VendorVerificationStatus verificationStatus, VendorStatus vendorStatus);

    List<Vendor> findByCategoryIdAndVerificationStatusAndVendorStatus(Long categoryId, VendorVerificationStatus verificationStatus, VendorStatus vendorStatus);

    long countByVerificationStatusAndVendorStatus(VendorVerificationStatus verificationStatus, VendorStatus vendorStatus);
}
