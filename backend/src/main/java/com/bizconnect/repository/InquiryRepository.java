package com.bizconnect.repository;

import com.bizconnect.entity.BusinessIdea;
import com.bizconnect.entity.Inquiry;
import com.bizconnect.entity.User;
import com.bizconnect.entity.Vendor;
import com.bizconnect.entity.enums.InquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findByUserOrderByCreatedAtDesc(User user);

    List<Inquiry> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Inquiry> findByVendorOrderByCreatedAtDesc(Vendor vendor);

    List<Inquiry> findByVendorIdOrderByCreatedAtDesc(Long vendorId);

    List<Inquiry> findByBusinessIdea(BusinessIdea businessIdea);

    List<Inquiry> findByStatus(InquiryStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT i FROM Inquiry i LEFT JOIN FETCH i.user LEFT JOIN FETCH i.vendor v LEFT JOIN FETCH v.user LEFT JOIN FETCH i.businessIdea WHERE i.id = :id")
    java.util.Optional<Inquiry> findByIdWithDetails(@org.springframework.data.repository.query.Param("id") Long id);
}
