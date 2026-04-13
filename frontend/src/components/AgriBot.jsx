import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Fab, Paper, Typography, TextField, IconButton, List, ListItem,
  ListItemText, Avatar, CircularProgress, Collapse, Fade, Tooltip, Button
} from '@mui/material';
import { Chat as ChatIcon, Close, Send, SmartToy, Person, Mic, MicOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAiCompletion } from '../services/aiService';
import { supabase } from '../supabase';

const AgriBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am AgriBot, your AI farming assistant. How can I help you today?' }
  ]);
  const [userId, setUserId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputValue(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    // Attempt to scope chat history to specific user natively via Supabase
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) {
        setUserId(data.session.user.id);
      }
    };
    fetchUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
         setUserId(session?.user?.id || null);
      }
    );
    
    return () => {
      if (authListener?.subscription) {
         authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Load cached chats locally upon user resolution
  useEffect(() => {
    const storageKey = userId ? `agribot_history_${userId}` : 'agribot_history_guest';
    const cachedHistory = localStorage.getItem(storageKey);
    if (cachedHistory) {
      try {
        setMessages(JSON.parse(cachedHistory));
      } catch (e) {
        console.error('Failed to parse cached chat history', e);
      }
    } else {
      setMessages([{ role: 'assistant', content: 'Hello! I am AgriBot, your AI farming assistant. How can I help you today?' }]);
    }
  }, [userId]);

  // Persist chat updates dynamically
  useEffect(() => {
    // We only preserve context if there's actual discussion rather than just the intro wrapper natively
    if (messages.length > 1) {
       const storageKey = userId ? `agribot_history_${userId}` : 'agribot_history_guest';
       localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, userId]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInputValue(''); // Assuming user wants to start a fresh sentence
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    // IMPORTANT: If mic is active, abort it instantly to prevent lingering voice 
    // callbacks from putting the text back into the cleared input box.
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.abort();
      setIsListening(false);
    }

    const userMessage = { role: 'user', content: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      let aiResponse = await getAiCompletion(newMessages);

      const navRegex = /\[NAVIGATE:([^\]]+)\]/g;
      const match = navRegex.exec(aiResponse);
      
      if (match && match[1]) {
        const path = match[1].trim();
        aiResponse = aiResponse.replace(navRegex, '').trim();
        if (!aiResponse) aiResponse = `Taking you to ${path}...`;
        
        setTimeout(() => {
          navigate(path);
          setIsOpen(false);
        }, 1500);
      }

      setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
            70% { box-shadow: 0 0 0 16px rgba(34,197,94,0); }
            100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
          }
          @keyframes float-anim {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .chatbot-fab {
            animation: pulse-glow 2s infinite, float-anim 3s ease-in-out infinite;
          }
        `}
      </style>

      {/* Floating Action Button area */}
      {!isOpen && (
        <Box sx={{ position: 'fixed', bottom: { xs: 20, lg: 40 }, right: { xs: 16, lg: 40 }, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5 }}>
          <Fade in={!isOpen} timeout={1000}>
            <Box sx={{
              display: { xs: 'none', sm: 'block' },
              bgcolor: '#fff', px: 2, py: 1.2, borderRadius: '16px 16px 4px 16px',
              boxShadow: '0 6px 18px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9',
              animation: 'float-anim 3.5s ease-in-out infinite'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Need help with crops? 🌾
              </Typography>
            </Box>
          </Fade>
          
            <Button
            className="chatbot-fab"
            onClick={() => setIsOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: 'white',
              px: { xs: 2, lg: 3 }, py: { xs: 1, lg: 1.5 }, borderRadius: '999px',
              fontWeight: 800, fontSize: '15px',
              textTransform: 'none',
              transition: 'all 0.25s ease',
              boxShadow: '0 10px 30px rgba(34,197,94,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #15803d, #16a34a)', transform: 'scale(0.98)' },
              '&:active': { transform: 'scale(0.95)' }
            }}
            startIcon={<Typography sx={{ fontSize: 22, lineHeight: 1 }}>🤖</Typography>}
          >
            Ask SmartAgri AI
          </Button>
        </Box>
      )}

      {/* Chat Window */}
      <Fade in={isOpen}>
        <Paper
          elevation={16}
          sx={{
            position: 'fixed',
            bottom: { xs: 80, lg: 40 },
            right: { xs: 'auto', lg: 40 },
            left: { xs: '50%', lg: 'auto' },
            transform: { xs: 'translateX(-50%)', lg: 'none' },
            width: { xs: 'calc(100% - 32px)', lg: 380 },
            height: { xs: '70vh', lg: '520px' },
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1001,
            border: '1px solid #f1f5f9',
            boxShadow: '0 24px 64px rgba(0,0,0,0.15)'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2.5, bgcolor: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                <SmartToy sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>AgriBot AI</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4ade80' }} /> Online Assist
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setIsOpen(false)} sx={{ color: '#fff' }} size="small">
              <Close />
            </IconButton>
          </Box>

          {/* Messages List */}
          <List
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  p: 0,
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar sx={{ bgcolor: '#ecfdf5', width: 32, height: 32, mt: 0.5 }}>
                    <SmartToy sx={{ color: '#10b981', fontSize: 18 }} />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 1.8,
                    borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                    bgcolor: msg.role === 'user' ? '#16a34a' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#1e293b',
                    maxWidth: '80%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    border: msg.role === 'assistant' ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.5, fontWeight: 500 }}>
                    {msg.content}
                  </Typography>
                </Paper>
                {msg.role === 'user' && (
                  <Avatar sx={{ bgcolor: '#e2e8f0', width: 32, height: 32, mt: 0.5 }}>
                    <Person sx={{ color: '#64748b', fontSize: 18 }} />
                  </Avatar>
                )}
              </ListItem>
            ))}
            {isLoading && (
              <ListItem sx={{ display: 'flex', gap: 1, px: 0 }}>
                <Avatar sx={{ bgcolor: '#ecfdf5', width: 32, height: 32 }}>
                  <SmartToy sx={{ color: '#10b981', fontSize: 18 }} />
                </Avatar>
                <Paper sx={{ p: 1.5, borderRadius: '4px 20px 20px 20px', bgcolor: '#fff', border: '1px solid #f1f5f9' }}>
                  <CircularProgress size={16} sx={{ color: '#16a34a' }} />
                </Paper>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>

          {/* Input Area */}
          <Box sx={{ p: 2, bgcolor: '#fff', borderTop: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask me anything about farming..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' }
                  }
                }}
              />
              <IconButton
                onClick={toggleListening}
                disabled={isLoading || !recognitionRef.current}
                sx={{
                  bgcolor: isListening ? '#ef4444' : '#f8fafc',
                  color: isListening ? '#fff' : '#64748b',
                  border: '1px solid #e2e8f0',
                  '&:hover': { bgcolor: isListening ? '#dc2626' : '#e2e8f0' },
                  transition: 'all 0.2s',
                  animation: isListening ? 'pulse-glow 2s infinite' : 'none'
                }}
              >
                {isListening ? <MicOff fontSize="small" /> : <Mic fontSize="small" />}
              </IconButton>
              <IconButton
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                sx={{
                  bgcolor: '#16a34a',
                  color: '#fff',
                  '&:hover': { bgcolor: '#15803d' },
                  '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
                }}
              >
                <Send fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </>
  );
};

export default AgriBot;
