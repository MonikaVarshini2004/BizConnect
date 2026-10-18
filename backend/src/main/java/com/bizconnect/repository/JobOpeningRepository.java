package com.bizconnect.repository;

import com.bizconnect.entity.JobOpening;
import com.bizconnect.entity.Vendor;
import com.bizconnect.entity.enums.JobOpeningStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobOpeningRepository extends JpaRepository<JobOpening, Long> {

    List<JobOpening> findByVendor(Vendor vendor);

    List<JobOpening> findByVendorId(Long vendorId);

    List<JobOpening> findByStatus(JobOpeningStatus status);

    List<JobOpening> findByTitleContainingIgnoreCaseAndStatus(String title, JobOpeningStatus status);
}
