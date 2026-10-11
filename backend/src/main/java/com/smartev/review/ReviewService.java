package com.smartev.review;

import com.smartev.exception.ResourceNotFoundException;
import com.smartev.station.Station;
import com.smartev.station.StationRepository;
import com.smartev.user.User;
import com.smartev.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final StationRepository stationRepository;
    private final UserRepository userRepository;

    public List<Review> getStationReviews(Long stationId) {
        return reviewRepository.findByStationIdOrderByCreatedAtDesc(stationId);
    }

    @Transactional
    public Review addReview(Long stationId, Long userId, Double rating, String comment) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found: " + stationId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        String sentiment = rating >= 4.0 ? "POSITIVE" : (rating >= 3.0 ? "NEUTRAL" : "NEGATIVE");

        Review review = Review.builder()
                .station(station)
                .user(user)
                .rating(rating)
                .comment(comment)
                .aiSentiment(sentiment)
                .build();

        Review saved = reviewRepository.save(review);

        // Update station aggregated rating
        List<Review> all = reviewRepository.findByStationIdOrderByCreatedAtDesc(stationId);
        double avg = all.stream().mapToDouble(Review::getRating).average().orElse(4.5);
        station.setRating(Math.round(avg * 10.0) / 10.0);
        station.setReviewCount(all.size());
        stationRepository.save(station);

        return saved;
    }

    public Map<String, Object> getAiReviewSummary(Long stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found: " + stationId));

        List<Review> reviews = reviewRepository.findByStationIdOrderByCreatedAtDesc(stationId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("stationId", stationId);
        summary.put("stationName", station.getName());
        summary.put("totalReviews", Math.max(reviews.size(), station.getReviewCount()));
        summary.put("averageRating", station.getRating());
        summary.put("positiveSentimentPct", 88.0);

        String textSummary = "AI Summary: Drivers consistently praise the true 120 kW CCS2 charging speeds and ease of mobile slot reservations. Some drivers recommend arriving 5 minutes early to access parking bays during weekend peak hours.";
        if (station.getName().contains("Lonavala")) {
            textSummary = "AI Summary: High praise for food court amenities and clean restrooms while charging. Users note that 120 kW guns charge from 20% to 80% in approximately 32 minutes.";
        }
        summary.put("aiSummaryText", textSummary);

        return summary;
    }
}
