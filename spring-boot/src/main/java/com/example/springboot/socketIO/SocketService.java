package com.example.springboot.socketIO;

import com.corundumstudio.socketio.SocketIOClient;
import com.example.springboot.models.SocketMessage;
import com.example.springboot.models.StartGameMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SocketService {

    public void sendMessage(String room, String eventName, SocketIOClient senderClient, SocketMessage message) {
        for (SocketIOClient client : senderClient.getNamespace().getRoomOperations(room).getClients()) {
            if (!client.getSessionId().equals(senderClient.getSessionId())) {
                client.sendEvent(eventName, message);
            }
        }
    }

    public void sendMessage(String room, String eventName, SocketIOClient senderClient, StartGameMessage message) {
        for (SocketIOClient client : senderClient.getNamespace().getRoomOperations(room).getClients()) {
            if (!client.getSessionId().equals(senderClient.getSessionId())) {
                client.sendEvent(eventName, message);
            }
        }
    }
    public void closeLobby(String room, SocketIOClient senderClient) {
        for (SocketIOClient client : senderClient.getNamespace().getRoomOperations(room).getClients()) {
                client.leaveRoom(room);
        }
    }
}
