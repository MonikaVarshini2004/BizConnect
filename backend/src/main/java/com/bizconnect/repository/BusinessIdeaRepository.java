package com.bizconnect.repository;

import com.bizconnect.entity.BusinessIdea;
import com.bizconnect.entity.Category;
import com.bizconnect.entity.User;
import com.bizconnect.entity.enums.BusinessIdeaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessIdeaRepository extends JpaRepository<BusinessIdea, Long> {

    List<BusinessIdea> findByStatus(BusinessIdeaStatus status);

    List<BusinessIdea> findByCategoryAndStatus(Category category, BusinessIdeaStatus status);

    List<BusinessIdea> findByCategoryIdAndStatus(Long categoryId, BusinessIdeaStatus status);

    List<BusinessIdea> findByCreatedBy(User user);

    List<BusinessIdea> findByNameContainingIgnoreCaseAndStatus(String keyword, BusinessIdeaStatus status);

    long countByStatus(BusinessIdeaStatus status);
}
