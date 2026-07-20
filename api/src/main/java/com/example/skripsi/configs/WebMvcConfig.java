package com.example.skripsi.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Case-insensitive binding for every enum-typed @RequestParam / @PathVariable.
 *
 * BUG FIX: Spring's default String->Enum converter is case-sensitive, so a
 * query like ?status=pending failed to convert to CompanyRequestStatus.PENDING
 * and surfaced as an HTTP 500. The admin verification UI's status dropdown
 * sends lowercase values ("pending"/"approved"/"rejected"), which made the
 * whole status filter crash. Normalising to upper case here fixes it for the
 * status filter and any future enum param without touching each controller.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverterFactory(new CaseInsensitiveEnumConverterFactory());
    }

    static final class CaseInsensitiveEnumConverterFactory
            implements ConverterFactory<String, Enum<?>> {

        @Override
        public <T extends Enum<?>> Converter<String, T> getConverter(Class<T> targetType) {
            return source -> {
                String trimmed = source.trim();
                if (trimmed.isEmpty()) {
                    return null;
                }
                @SuppressWarnings({"unchecked", "rawtypes"})
                T value = (T) Enum.valueOf((Class) targetType, trimmed.toUpperCase());
                return value;
            };
        }
    }
}
