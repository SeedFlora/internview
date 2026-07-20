package com.example.skripsi.models.auth;

import com.example.skripsi.validation.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResetPasswordRequest {
    @NotBlank
    private String token;

    @NotBlank
    @ValidPassword
    private String newPassword;
}
