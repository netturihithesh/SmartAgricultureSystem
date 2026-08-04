import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Fab, Paper, Typography, TextField, IconButton, List, ListItem,
  ListItemText, Avatar, CircularProgress, Collapse, Fade, Tooltip, Button, useTheme
} from '@mui/material';
import { Chat as ChatIcon, Close, Send, SmartToy, Person, Mic, MicOff, OpenInFull, CloseFullscreen } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAiCompletion } from '../services/aiService';
import { supabase } from '../supabase';

// Lightweight markdown renderer — no extra library needed
const MarkdownMessage = ({ content, color }) => {
  const parseInline = (text) => {
    const parts = [];
    // Regex to match **bold**, *italic*, `code`
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`/g;
    let last = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) parts.push(text.slice(last, match.index));
      if (match[1]) parts.push(<strong key={match.index}>{match[1]}</strong>);
      else if (match[2]) parts.push(<em key={match.index}>{match[2]}</em>);
      else if (match[3]) parts.push(
        <code key={match.index} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace', fontSize: '0.85em' }}>
          {match[3]}
        </code>
      );
      last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length ? parts : text;
  };

  const lines = content.split('\n');
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { elements.push(<br key={i} />); i++; continue; }

    // Numbered list item: "1. text"
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const startNum = parseInt(numMatch[1], 10);
      const listItems = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        const m = l.match(/^(\d+)\.\s+(.*)/);
        if (!m) break;
        listItems.push(<li key={i} style={{ marginBottom: 2 }}>{parseInline(m[2])}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} start={startNum} style={{ margin: '4px 0', paddingLeft: 20 }}>{listItems}</ol>);
      continue;
    }

    // Bullet: "* text" or "- text"
    const bulletMatch = line.match(/^[\*\-]\s+(.*)/);
    if (bulletMatch) {
      const listItems = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        const m = l.match(/^[\*\-]\s+(.*)/);
        if (!m) break;
        listItems.push(<li key={i} style={{ marginBottom: 2 }}>{parseInline(m[1])}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} style={{ margin: '4px 0', paddingLeft: 20 }}>{listItems}</ul>);
      continue;
    }

    // Heading: "## text"
    const headingMatch = line.match(/^#+\s+(.*)/);
    if (headingMatch) {
      elements.push(
        <p key={i} style={{ fontWeight: 800, fontSize: '0.95em', margin: '6px 0 2px' }}>
          {parseInline(headingMatch[1])}
        </p>
      );
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} style={{ margin: '2px 0' }}>{parseInline(line)}</p>
    );
    i++;
  }

  return (
    <div style={{ fontSize: '0.875rem', lineHeight: 1.6, fontWeight: 500, color }}>
      {elements}
    </div>
  );
};

const AgriBot = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
        <Box sx={{ position: 'fixed', bottom: { xs: 20, lg: 32 }, right: { xs: 20, lg: 32 }, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5 }}>
          <Fade in={!isOpen} timeout={1000}>
            <Box sx={{
              display: { xs: 'none', sm: 'block' },
              bgcolor: isDarkMode ? 'rgba(10, 13, 11, 0.7)' : 'rgba(255, 255, 255, 0.9)', 
              px: 2, py: 1.2, borderRadius: '16px 16px 4px 16px',
              backdropFilter: 'blur(10px)', 
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              boxShadow: isDarkMode ? '0 6px 18px rgba(0,0,0,0.5)' : '0 6px 18px rgba(0,0,0,0.1)',
              animation: 'float-anim 3.5s ease-in-out infinite'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                Need help with crops? 🌾
              </Typography>
            </Box>
          </Fade>
          
            <Button
            className="chatbot-fab"
            onClick={() => setIsOpen(true)}
            sx={{
              background: isDarkMode ? 'rgba(10, 13, 11, 0.8)' : '#fff',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${isDarkMode ? '#39FF6A' : '#2E7D32'}`,
              color: isDarkMode ? '#39FF6A' : '#2E7D32',
              px: { xs: 2, lg: 3 }, py: { xs: 1, lg: 1.5 }, borderRadius: '999px',
              fontWeight: 800, fontSize: '15px',
              textTransform: 'none',
              transition: 'all 0.25s ease',
              boxShadow: isDarkMode ? '0 10px 30px rgba(57,255,106,0.15)' : '0 10px 30px rgba(46,125,50,0.1)',
              '&:hover': { background: isDarkMode ? '#39FF6A' : '#2E7D32', color: '#fff', transform: 'scale(0.98)' },
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
            bottom: { xs: 80, lg: 32 },
            right: { xs: 'auto', lg: 32 },
            left: { xs: '50%', lg: 'auto' },
            transform: { xs: 'translateX(-50%)', lg: 'none' },
            width: isExpanded ? { xs: 'calc(100% - 32px)', lg: 800 } : { xs: 'calc(100% - 32px)', lg: 380 },
            height: isExpanded ? { xs: '85vh', lg: '80vh' } : { xs: '70vh', lg: '520px' },
            transition: 'all 0.3s ease',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1001,
            bgcolor: isDarkMode ? 'rgba(10, 13, 11, 0.85)' : '#fff',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            boxShadow: isDarkMode ? '0 24px 64px rgba(0,0,0,0.5)' : '0 24px 64px rgba(0,0,0,0.1)'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2.5, bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, color: isDarkMode ? '#fff' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 40, height: 40 }}>
                <SmartToy sx={{ fontSize: 24, color: '#39FF6A' }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>AgriBot AI</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#39FF6A' }} /> Online Assist
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => setIsExpanded(!isExpanded)} sx={{ color: isDarkMode ? '#fff' : '#475569' }} size="small">
                {isExpanded ? <CloseFullscreen fontSize="small" /> : <OpenInFull fontSize="small" />}
              </IconButton>
              <IconButton onClick={() => setIsOpen(false)} sx={{ color: isDarkMode ? '#fff' : '#475569', ml: 0.5 }} size="small">
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Messages List */}
          <List
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: 'transparent',
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
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', width: 32, height: 32, mt: 0.5, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <SmartToy sx={{ color: '#39FF6A', fontSize: 18 }} />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 1.8,
                    borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                    bgcolor: msg.role === 'user' ? (isDarkMode ? '#39FF6A' : '#2E7D32') : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                    color: msg.role === 'user' ? (isDarkMode ? '#000' : '#fff') : (isDarkMode ? '#e2e8f0' : '#334155'),
                    maxWidth: '80%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: msg.role === 'assistant' ? (isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)') : 'none'
                  }}
                >
                  <MarkdownMessage
                    content={msg.content}
                    color={msg.role === 'user'
                      ? (isDarkMode ? '#000' : '#fff')
                      : (isDarkMode ? '#e2e8f0' : '#334155')
                    }
                  />
                </Paper>
                {msg.role === 'user' && (
                  <Avatar sx={{ bgcolor: 'rgba(57,255,106,0.2)', width: 32, height: 32, mt: 0.5 }}>
                    <Person sx={{ color: '#39FF6A', fontSize: 18 }} />
                  </Avatar>
                )}
              </ListItem>
            ))}
            {isLoading && (
              <ListItem sx={{ display: 'flex', gap: 1, px: 0 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', width: 32, height: 32 }}>
                  <SmartToy sx={{ color: '#39FF6A', fontSize: 18 }} />
                </Avatar>
                <Paper sx={{ p: 1.5, borderRadius: '4px 20px 20px 20px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)' }}>
                  <CircularProgress size={16} sx={{ color: isDarkMode ? '#39FF6A' : '#2E7D32' }} />
                </Paper>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>

          {/* Input Area */}
          <Box sx={{ p: 2, bgcolor: 'transparent', borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
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
                  input: { color: isDarkMode ? '#e2e8f0' : '#1e293b' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                    '& fieldset': { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                    '&:hover fieldset': { borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: isDarkMode ? '#39FF6A' : '#2E7D32' }
                  }
                }}
              />
              <IconButton
                onClick={toggleListening}
                disabled={isLoading || !recognitionRef.current}
                sx={{
                  bgcolor: isListening ? '#ef4444' : 'rgba(255,255,255,0.05)',
                  color: isListening ? '#fff' : '#64748b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: isListening ? '#dc2626' : 'rgba(255,255,255,0.1)' },
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
                  bgcolor: isDarkMode ? '#39FF6A' : '#2E7D32',
                  color: isDarkMode ? '#000' : '#fff',
                  '&:hover': { bgcolor: isDarkMode ? '#2fe058' : '#1B5E20' },
                  '&.Mui-disabled': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0', color: '#64748b' }
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
