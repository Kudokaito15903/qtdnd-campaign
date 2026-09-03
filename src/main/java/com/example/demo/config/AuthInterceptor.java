package com.example.demo.config;

import com.example.demo.controller.AuthController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Pre-flight CORS request should pass
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (AuthController.SECRET_TOKEN.equals(token)) {
                return true; // Token is valid
            }
        }

        // Token is missing or invalid
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return false;
    }
}
