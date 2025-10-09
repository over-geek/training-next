package com.icps.training_attendance.config.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.icps.training_attendance.dto.employee.EmployeeDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@Slf4j
public class AttendanceWebSocketHandler extends TextWebSocketHandler {
  private static final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
  private static final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public void afterConnectionEstablished(WebSocketSession session) {
    sessions.add(session);
    log.info("New WebSocket connection established for session id: {}", session.getId());
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
    sessions.remove(session);
    log.info("WebSocket connection closed for session id: {}", session.getId());
  }

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) {
    try {
      String payload = message.getPayload();
      Map<String, Object> messageMap = objectMapper.readValue(payload, Map.class);
      String type = (String) messageMap.get("type");
      
      // Only log non-PING messages
      if (!"PING".equals(type)) {
        log.info("Received WebSocket message: {}", payload);
      }
      
      // Handle PING messages with PONG response
      if ("PING".equals(type)) {
        Map<String, String> pongMessage = new HashMap<>();
        pongMessage.put("type", "PONG");
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(pongMessage)));
      }
    } catch (Exception e) {
      log.error("Error processing message", e);
    }
  }

  public void broadcastAttendance(EmployeeDTO employee) {
    Map<String, Object> message = new HashMap<>();
    message.put("type", "ATTENDANCE");
    message.put("data", employee);

    broadcast(message);
  }

  private void broadcast(Map<String, Object> message) {
    String jsonMessage;
    try {
      jsonMessage = objectMapper.writeValueAsString(message);
    } catch (JsonProcessingException e) {
      log.error("Error serializing message", e);
      return;
    }

    sessions.removeIf(session -> !session.isOpen());  // Clean up closed sessions

    String finalJsonMessage = jsonMessage;
    sessions.forEach(session -> {
      try {
        if (session.isOpen()) {
          session.sendMessage(new TextMessage(finalJsonMessage));
        }
      } catch (IOException e) {
        log.error("Error sending message to session {}: {}", session.getId(), e.getMessage());
      }
    });
  }

  public void broadcastError(String errorMessage) {
    Map<String, Object> message = new HashMap<>();
    message.put("type", "ERROR");
    message.put("message", errorMessage);

    broadcast(message);
  }

  public void closeAllSessions() {
    sessions.forEach(session -> {
      try {
        if (session.isOpen()) {
          session.close(CloseStatus.NORMAL);
        }
      } catch (IOException e) {
        log.error("Error closing session {}: {}", session.getId(), e.getMessage());
      }
    });
    sessions.clear();
  }
}
