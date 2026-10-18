package com.bizconnect.controller;

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
@RequestMapping("/api")
public class VendorsController {

    @Autowired
    private MarketplaceService marketplaceService;

    @GetMapping("/categories")
    public ResponseEntity<List<VendorDto>> getVerifiedVendors() {
        return ResponseEntity.ok(marketplaceService.getVerifiedVendors());
    }

    @GetMapping("/vendors/{id}")
    public ResponseEntity<VendorDto> getVerifiedVendorById(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.getVerifiedVendorById(id));
    }

    @GetMapping("/vendors/by-idea/{ideaId}")
    public ResponseEntity<List<VendorDto>> getVendorsByIdea(@PathVariable Long ideaId) {
        return ResponseEntity.ok(marketplaceService.getVendorsByIdea(ideaId));
    }
}
