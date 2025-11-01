import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { Send, SmartToy, Person } from '@mui/icons-material';
import { chatAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';

// Component to render markdown text
const MarkdownText = ({ content }) => {
  const parseMarkdown = (text) => {
    const parts = [];
    let currentIndex = 0;

    // Regular expression to match **bold** text
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold part
      if (match.index > currentIndex) {
        parts.push({ type: 'text', content: text.slice(currentIndex, match.index) });
      }
      // Add the bold part
      parts.push({ type: 'bold', content: match[1] });
      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(currentIndex) });
    }

    return parts;
  };

  const lines = content.split('\n');

  return (
    <Box>
      {lines.map((line, lineIndex) => {
        const parts = parseMarkdown(line);

        return (
          <Typography
            key={lineIndex}
            variant="body1"
            component="div"
            sx={{ mb: lineIndex < lines.length - 1 ? 1 : 0 }}
          >
            {parts.map((part, partIndex) => (
              part.type === 'bold' ? (
                <strong key={partIndex}>{part.content}</strong>
              ) : (
                <span key={partIndex}>{part.content}</span>
              )
            ))}
          </Typography>
        );
      })}
    </Box>
  );
};

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name}! I'm FitSage, your AI fitness coach. I'm here to help you with workout tips, nutrition advice, motivation, and answer any fitness-related questions. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Prepare conversation history for API
      const history = newMessages
        .slice(1, -1) // Skip initial greeting and current message
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await chatAPI.send({
        message: userMessage,
        conversationHistory: history,
      });

      // Add assistant response
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response.data.response },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          AI Coach
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get personalized guidance and motivation
        </Typography>
      </Box>

      {/* Messages Container */}
      <Paper
        sx={{
          flex: 1,
          p: 3,
          mb: 2,
          overflowY: 'auto',
          backgroundColor: 'background.default',
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              mb: 3,
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {message.role === 'assistant' && (
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 2,
                  width: 40,
                  height: 40,
                }}
              >
                <SmartToy />
              </Avatar>
            )}
            <Box
              sx={{
                maxWidth: '70%',
                p: 2,
                borderRadius: 2,
                backgroundColor: message.role === 'user' ? 'primary.main' : 'white',
                color: message.role === 'user' ? 'white' : 'text.primary',
                boxShadow: 1,
              }}
            >
              {message.role === 'assistant' ? (
                <MarkdownText content={message.content} />
              ) : (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
              )}
            </Box>
            {message.role === 'user' && (
              <Avatar
                sx={{
                  bgcolor: 'secondary.main',
                  ml: 2,
                  width: 40,
                  height: 40,
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || <Person />}
              </Avatar>
            )}
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                mr: 2,
                width: 40,
                height: 40,
              }}
            >
              <SmartToy />
            </Avatar>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: 'white',
                boxShadow: 1,
              }}
            >
              <CircularProgress size={20} />
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Input Area */}
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Ask me anything about fitness, nutrition, or wellness..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          sx={{ mr: 1 }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
            },
          }}
        >
          <Send />
        </IconButton>
      </Paper>
    </Box>
  );
}
