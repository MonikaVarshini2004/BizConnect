package com.bizconnect.repository;

import com.bizconnect.entity.JobApplication;
import com.bizconnect.entity.JobOpening;
import com.bizconnect.entity.User;
import com.bizconnect.entity.enums.JobApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    long countByJobOpening_Id(Long jobOpeningId);

    List<JobApplication> findByJobOpening(JobOpening jobOpening);

    List<JobApplication> findByJobOpeningId(Long jobOpeningId);

    List<JobApplication> findByUser(User user);

    List<JobApplication> findByUserId(Long userId);

    List<JobApplication> findByStatus(JobApplicationStatus status);

    List<JobApplication> findByJobOpeningVendorIdOrderByAppliedAtDesc(Long vendorId);

    Optional<JobApplication> findByJobOpeningIdAndUserId(Long jobOpeningId, Long userId);
}
