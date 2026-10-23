package com.smartev.review;

import com.smartev.security.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Station reviews and AI review summarization")
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtUtils jwtUtils;

    private Long getUserIdFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return 1L;
        }
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtils.extractUserId(token);
            return userId != null ? userId : 1L;
        } catch (Exception e) {
            return 1L;
        }
    }

    @GetMapping("/station/{stationId}")
    @Operation(summary = "Get all reviews for a station")
    public ResponseEntity<List<Review>> getStationReviews(@PathVariable Long stationId) {
        return ResponseEntity.ok(reviewService.getStationReviews(stationId));
    }

    @PostMapping("/station/{stationId}")
    @Operation(summary = "Submit a driver rating and review for a station")
    public ResponseEntity<Review> addReview(
            @PathVariable Long stationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromHeader(authHeader);
        Double rating = ((Number) body.get("rating")).doubleValue();
        String comment = (String) body.get("comment");
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.addReview(stationId, userId, rating, comment));
    }

    @GetMapping("/station/{stationId}/summary")
    @Operation(summary = "Get AI-generated synthesis and sentiment summary of driver reviews")
    public ResponseEntity<Map<String, Object>> getAiSummary(@PathVariable Long stationId) {
        return ResponseEntity.ok(reviewService.getAiReviewSummary(stationId));
    }
}
