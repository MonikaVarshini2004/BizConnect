package com.bizconnect.controller;

import com.bizconnect.dto.BusinessIdeaDto;
import com.bizconnect.service.MarketplaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ideas")
public class IdeasController {

    @Autowired
    private MarketplaceService marketplaceService;

    @GetMapping
    public ResponseEntity<List<BusinessIdeaDto>> getPublishedIdeas() {
        return ResponseEntity.ok(marketplaceService.getPublishedIdeas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessIdeaDto> getPublishedIdeaById(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.getPublishedIdeaById(id));
    }
}
