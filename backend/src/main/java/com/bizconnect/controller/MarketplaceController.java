package com.bizconnect.controller;

import com.bizconnect.dto.BusinessIdeaDto;
import com.bizconnect.dto.CategoryDto;
import com.bizconnect.dto.ProductServiceDto;
import com.bizconnect.dto.VendorDto;
import com.bizconnect.service.MarketplaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class MarketplaceController {

    @Autowired
    private MarketplaceService marketplaceService;

    @GetMapping("/ideas")
    public ResponseEntity<List<BusinessIdeaDto>> getPublishedIdeas() {
        return ResponseEntity.ok(marketplaceService.getPublishedIdeas());
    }

    @GetMapping("/ideas/{id}")
    public ResponseEntity<BusinessIdeaDto> getPublishedIdea(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.getPublishedIdeaById(id));
    }

    @GetMapping("/vendors")
    public ResponseEntity<List<VendorDto>> getVerifiedVendors() {
        return ResponseEntity.ok(marketplaceService.getVerifiedVendors());
    }

    @GetMapping("/vendors/{id}")
    public ResponseEntity<VendorDto> getVerifiedVendor(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.getVerifiedVendorById(id));
    }

    @GetMapping("/services")
    public ResponseEntity<List<ProductServiceDto>> getApprovedServices() {
        return ResponseEntity.ok(marketplaceService.getApprovedServices());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getActiveCategories() {
        return ResponseEntity.ok(marketplaceService.getActiveCategories());
    }
}
