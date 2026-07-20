package com.example.skripsi.securities;

import com.example.skripsi.exceptions.*;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    private final JwtUtils jwtUtils;

    public JwtFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            try {
                String token = header.substring(7);
                Claims claims = jwtUtils.parseClaims(token);

                Date expiration = claims.getExpiration();

                if (expiration != null && expiration.before(new Date())) {
                    throw new InvalidTokenException("Token expired");
                }

                String email = claims.getSubject();
                Long userId = claims.get("userId", Long.class);
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) claims.get("roles", List.class);

                if (email == null || userId == null || roles == null) {
                    throw new InvalidTokenException("Invalid token claims");
                }

                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList());

                // A valid Bearer token was parsed for THIS request. Set a fresh
                // context unconditionally -- these are pooled, stateless worker
                // threads, so deferring to whatever Authentication happens to be
                // left on the thread would be wrong.
                AuthUser authUser = new AuthUser(userId, email);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(authUser, null, authorities);

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                // BUG FIX (two issues):
                // 1. Previously the filter turned an expired/invalid Bearer into a
                //    401 for EVERY route -- so a returning user with a day-old
                //    token was bounced off PUBLIC pages. Now we just leave the
                //    request anonymous; the authorization layer serves public GETs
                //    and still 401s protected routes via the entry point.
                // 2. filterChain.doFilter used to sit INSIDE this try, so a
                //    downstream controller/response-flush exception got caught here
                //    and mislabeled as a 401 "Invalid token" (masking real errors
                //    and prompting clients to replay non-idempotent POSTs). doFilter
                //    now runs once, outside the try, below.
                log.debug("Ignoring invalid/expired bearer token: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
