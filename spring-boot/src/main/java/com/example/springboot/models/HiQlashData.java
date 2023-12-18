package com.example.springboot.models;

import lombok.Data;

import java.util.*;

@Data
public class HiQlashData implements LobbyData{
    int numPlayers;
    int numRounds;
    long endTime;
    long endVoteTime;
    List<PlayerPrompts> promptsForPlayers;
    List<String> prompts = Arrays.asList(
            "Do you like Jazz1?", "Do you like Jazz2?", "Do you like Jazz3?", "Do you like Jazz4?", "Do you like Jazz5?",
            "Do you like Jazz6?", "Do you like Jazz7?", "Do you like Jazz8?", "Do you like Jazz9?", "Do you like Jazz10?"
    );
    List<PlayerScores> playerScores;

    @Data
    private class PlayerScores {
        String username;
        int score;

        public PlayerScores (String username, int score){
            this.username = username;
            this.score    = score;
        }
    }
    @Data
    private class PlayerPrompts {
        Set<String> prompts;
        String player;

        public PlayerPrompts(String player){
            this.prompts = new HashSet<String>();
            this.player  = player;
        }
    }
    public HiQlashData(int numPlayers, List<Player> players) {
        Collections.shuffle(this.prompts);

        this.numPlayers = numPlayers;
        this.numRounds  = numPlayers;

        for(int i = 0; i < numPlayers; ++i) {
            String playerName = players.get(i).getUsername();
            PlayerPrompts playerPrompts = new PlayerPrompts(playerName);

            // Initialize scores
            this.playerScores.add(new PlayerScores(playerName, 0));

            // Determine prompts for each player
            for(int j = 0; j < numRounds; ++j) {
                int promptIndex = (i + j) % numPlayers;
                playerPrompts.prompts.add(prompts.get(promptIndex));
            }

            // Add unique prompts to the player
            promptsForPlayers.add(playerPrompts);
        }


    }
}
