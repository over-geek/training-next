package com.icps.training_attendance.config.websocket;

import com.icps.training_attendance.authserver.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements HandshakeInterceptor {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                 WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String query = request.getURI().getQuery();
        log.debug("Processing WebSocket handshake with query: {}", query);
        if (query != null && query.contains("token=")) {
            String token = extractToken(query);
            try {
                String username = jwtService.extractUsername(token);
                if (username != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    if (jwtService.isTokenValid(token, userDetails)) {
                        attributes.put("username", username);
                        return true;
                    }
                }
            } catch (Exception e) {
                log.error("Invalid token in WebSocket connection", e);
            }
        }
        log.warn("Unauthorized WebSocket connection attempt");
        return false;
    }

    private String extractToken(String query) {
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            if (pair.startsWith("token=")) {
                return pair.substring(6);
            }
        }
        return null;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                             WebSocketHandler wsHandler, Exception exception) {
        // No action needed after handshake
    }
} 