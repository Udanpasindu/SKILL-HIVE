package com.university.skillshare_backend.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class MentionParser {
    
    // Regular expression to match @username mentions
    private static final Pattern MENTION_PATTERN = Pattern.compile("@([\\w.]+)");
    
    /**
     * Extract @username mentions from text
     * 
     * @param text The comment or post text
     * @return List of mentioned usernames (without @ symbol)
     */
    public List<String> parseMentions(String text) {
        if (text == null || text.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<String> mentions = new ArrayList<>();
        Matcher matcher = MENTION_PATTERN.matcher(text);
        
        while (matcher.find()) {
            mentions.add(matcher.group(1)); // Extract username without @
        }
        
        return mentions;
    }
}
