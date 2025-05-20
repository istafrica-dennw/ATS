package com.ats.util;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class ModelMapperUtil {
    private final ModelMapper modelMapper;

    public ModelMapperUtil() {
        this.modelMapper = new ModelMapper();
    }

    public <S, T> T map(S source, Class<T> targetClass) {
        return modelMapper.map(source, targetClass);
    }

    public <S, T> List<T> mapAll(List<S> source, Class<T> targetClass) {
        return source.stream()
                .map(element -> map(element, targetClass))
                .collect(Collectors.toList());
    }

    @Bean
    public ModelMapper modelMapper() {
        return modelMapper;
    }
}
