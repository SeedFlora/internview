package com.example.skripsi.models.review;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateReviewRequest {
    @NotBlank
    @Size(max = 10)
    private String internshipType;

    @NotBlank
    @Size(max = 10)
    private String workScheme;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer duration;

    @NotNull
    @Min(2000)
    // BUG FIX: no upper bound meant year=2147483647 passed @Min then blew up
    // LocalDate.of(year+1, ...) with a DateTimeException -> HTTP 500. Cap it.
    @Max(2100)
    private Integer year;

    @NotBlank
    @Size(max = 75)
    private String jobTitle;

    @JsonProperty("SubCategoryIds")
    @Size(max = 4, message = "Maximum 4 subcategories allowed")
    private List<Long> subCategoryIds;

    @Valid
    @NotNull
    private RatingsRequest ratings;

    @Size(max = 10)
    private List<Long> recruitmentSteps;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer interviewDifficulty;

    @NotBlank
    @Size(max = 500)
    private String testimony;

    @NotBlank
    @Size(max = 500)
    private String pros;

    @NotBlank
    @Size(max = 500)
    private String cons;

    @Size(max = 10)
    private String admissionTrack;

    @Size(max = 10)
    private String recruitmentDurationCode;

    @Size(max = 500)
    private String exampleQuestions;

    @Size(max = 500)
    private String selectionProcess;

    @Size(max = 500)
    private String tipsTricks;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RatingsRequest {
        @NotNull
        @Min(1)
        @Max(5)
        private Integer workCulture;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer learningOpp;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer mentorship;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer benefit;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer workLifeBalance;
    }
}
