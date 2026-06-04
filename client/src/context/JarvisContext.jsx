import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { processJarvisCommand } from '../utils/jarvisEngine';

const JarvisContext = createContext();

export const useJarvis = () => useContext(JarvisContext);

export const JarvisProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [jarvisResponse, setJarvisResponse] = useState('');
  
  const recognitionRef = useRef(null);
  const wakeWordRecognitionRef = useRef(null);
  const isActiveListeningRef = useRef(false); // To keep track of state in the end handler
  const navigate = useNavigate();
  
  const { 
    addTask, 
    toggleTask,
    deleteTask,
    addHabit,
    deleteHabit,
    toggleHabitDay,
    addTransaction,
    addNote,
    tasks,
    habits
  } = useStore();

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      // Setup Main Active Recognition (Executes commands)
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          handleFinalTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        isActiveListeningRef.current = false;
        startWakeWordListening();
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        isActiveListeningRef.current = false;
        startWakeWordListening();
      };

      // Setup Continuous Wake Word Recognition
      wakeWordRecognitionRef.current = new SpeechRecognition();
      wakeWordRecognitionRef.current.continuous = true;
      wakeWordRecognitionRef.current.interimResults = true;
      wakeWordRecognitionRef.current.lang = 'en-US';

      wakeWordRecognitionRef.current.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript.toLowerCase();
          // Check for wake word
          if (text.includes('jarvis')) {
            console.log("Wake word detected!");
            wakeWordRecognitionRef.current?.stop();
            setTimeout(() => {
              activateJarvis();
            }, 500); // Give it a moment to stop before starting main recognition
            break; // Stop parsing this result
          }
        }
      };

      wakeWordRecognitionRef.current.onerror = (event) => {
        // Ignored. usually network or no-speech.
      };

      wakeWordRecognitionRef.current.onend = () => {
        // Auto-restart continuous listening unless we are actively processing a command
        if (!isActiveListeningRef.current) {
          try {
            wakeWordRecognitionRef.current?.start();
          } catch (e) {
            // Already started
          }
        }
      };

      // Start wake word listener immediately
      startWakeWordListening();

    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }

    return () => {
      wakeWordRecognitionRef.current?.stop();
      recognitionRef.current?.stop();
    };
  }, []);

  const startWakeWordListening = () => {
    if (wakeWordRecognitionRef.current && !isActiveListeningRef.current) {
      try {
        wakeWordRecognitionRef.current.start();
      } catch (e) {
        // Ignore if already started
      }
    }
  };

  // Handle Keyboard Shortcut Ctrl + Shift + J
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      isActiveListeningRef.current = false;
      startWakeWordListening();
    } else {
      activateJarvis();
    }
  };

  const activateJarvis = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }
    
    wakeWordRecognitionRef.current?.stop();
    setTranscript('');
    setJarvisResponse('');
    setIsListening(true);
    isActiveListeningRef.current = true;
    
    try {
      // Small delay to ensure the stop() has processed before starting
      setTimeout(() => {
        recognitionRef.current?.start();
      }, 50);
    } catch(e) {
      console.error(e);
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good English voice (preferably male/Jarvis-like if available, or just a clear voice)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Microsoft Mark') || v.lang === 'en-GB' || v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.pitch = 0.9;
    utterance.rate = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  // Execution Layer
  const handleFinalTranscript = async (text) => {
    setIsListening(false);
    isActiveListeningRef.current = false;
    
    // Fuzzy match helper to handle plurals and partial matches (e.g. "drink" vs "drinks")
    const fuzzyMatch = (dbName, spokenTarget) => {
      const dbLower = (dbName || '').toLowerCase();
      const spoken = (spokenTarget || '').toLowerCase();
      if (dbLower.includes(spoken) || spoken.includes(dbLower)) return true;
      
      // Try stripping trailing 's'
      const dbSingular = dbLower.replace(/s$/, '');
      const spokenSingular = spoken.replace(/s$/, '');
      if (spoken.includes(dbSingular) || dbLower.includes(spokenSingular)) return true;
      
      // Try checking if any significant spoken word is inside the dbName
      const words = spoken.split(' ').filter(w => w.length > 3);
      for (const w of words) {
        if (dbLower.includes(w) || w.includes(dbLower)) return true;
      }
      return false;
    };

    // Process intent
    const intent = processJarvisCommand(text);
    
    // 1. Speak Response
    setJarvisResponse(intent.response);
    speak(intent.response);

    // 2. Execute Action based on Intent
    switch (intent.type) {
      case 'NAVIGATE':
        navigate(intent.path);
        break;
      
      case 'CREATE_TASK':
        // Generate payload for store
        await addTask({
          title: intent.payload.name,
          category: 'personal',
          priority: 'medium',
          day: intent.payload.day,
          description: 'Created by Jarvis',
          // Needs weekNumber and year to sync properly
          weekNumber: useStore.getState().selectedWeek,
          year: useStore.getState().selectedYear
        });
        break;
        
      case 'COMPLETE_ITEM':
        const lowerTarget = intent.targetName.toLowerCase();
        
        // Bi-directional fuzzy search: does the DB title include the spoken words, OR do the spoken words include the DB title?
        const foundTask = useStore.getState().tasks.find(t => !t.completed && fuzzyMatch(t.title, lowerTarget));
        
        if (foundTask) {
          await toggleTask(foundTask._id);
          speak(`Marked task ${foundTask.title} as complete.`);
          setJarvisResponse(`Marked task ${foundTask.title} as complete.`);
          break;
        }
        
        // 2. Search for habit matching the name
        const foundHabit = useStore.getState().habits.find(h => fuzzyMatch(h.name, lowerTarget));
        
        if (foundHabit) {
          // Check if they specified a day of the week in their command
          let dayIndex = new Date().getDay() - 1;
          if (dayIndex === -1) dayIndex = 6;
          
          if (lowerTarget.includes('monday')) dayIndex = 0;
          else if (lowerTarget.includes('tuesday')) dayIndex = 1;
          else if (lowerTarget.includes('wednesday')) dayIndex = 2;
          else if (lowerTarget.includes('thursday')) dayIndex = 3;
          else if (lowerTarget.includes('friday')) dayIndex = 4;
          else if (lowerTarget.includes('saturday')) dayIndex = 5;
          else if (lowerTarget.includes('sunday')) dayIndex = 6;
          
          const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          
          await toggleHabitDay(foundHabit._id, dayIndex);
          speak(`Marked habit ${foundHabit.name} complete for ${dayNames[dayIndex]}.`);
          setJarvisResponse(`Marked habit ${foundHabit.name} complete for ${dayNames[dayIndex]}.`);
          break;
        }

        speak(`I couldn't find a pending task or habit matching ${intent.targetName}.`);
        setJarvisResponse(`Not found: ${intent.targetName}`);
        break;
        
      case 'READ_ANALYTICS':
        // Since we don't want to make an extra API call here unless necessary, we can navigate them there
        navigate('/analytics');
        break;
        
      case 'DELETE_ITEM':
        const lowerDelTarget = intent.targetName.toLowerCase();
        // Search tasks first
        const taskToDelete = useStore.getState().tasks.find(t => fuzzyMatch(t.title, lowerDelTarget));
        if (taskToDelete) {
          await deleteTask(taskToDelete._id);
          speak(`Deleted task ${taskToDelete.title}.`);
          setJarvisResponse(`Deleted task ${taskToDelete.title}.`);
          break;
        }
        // Search habits
        const habitToDelete = useStore.getState().habits.find(h => fuzzyMatch(h.name, lowerDelTarget));
        if (habitToDelete) {
          await deleteHabit(habitToDelete._id);
          speak(`Deleted habit ${habitToDelete.name}.`);
          setJarvisResponse(`Deleted habit ${habitToDelete.name}.`);
          break;
        }
        speak(`I couldn't find anything named ${intent.targetName} to delete.`);
        setJarvisResponse(`Not found: ${intent.targetName}`);
        break;

      case 'CREATE_HABIT':
        await addHabit({
          name: intent.payload.name,
          category: 'General',
          icon: 'Activity',
          weekNumber: useStore.getState().selectedWeek,
          year: useStore.getState().selectedYear
        });
        break;

      case 'ADD_TRANSACTION':
        await addTransaction({
          type: intent.payload.type,
          amount: intent.payload.amount,
          description: intent.payload.description,
          category: intent.payload.category,
          date: new Date().toISOString()
        });
        break;

      case 'CREATE_NOTE':
        await addNote({
          title: intent.payload.title,
          content: intent.payload.content,
          tags: ['Jarvis']
        });
        break;

      case 'PLAN_WEEK':
        // Agentic task generation
        const standardTasks = [
          { title: 'Weekly Planning', day: 0 },
          { title: 'Deep Work Session', day: 1 },
          { title: 'Mid-week Review', day: 2 },
          { title: 'Deep Work Session', day: 3 },
          { title: 'Weekly Wrap-up', day: 4 }
        ];
        
        for (const t of standardTasks) {
          await addTask({
            title: t.title,
            category: 'personal',
            priority: 'medium',
            day: t.day,
            description: 'Agentically scheduled by Jarvis',
            weekNumber: useStore.getState().selectedWeek,
            year: useStore.getState().selectedYear
          });
        }
        navigate('/planner');
        break;

      default:
        break;
    }
    
    // Resume continuous listening after a short delay
    setTimeout(() => {
      startWakeWordListening();
    }, 1500);
  };

  return (
    <JarvisContext.Provider value={{
      isListening,
      toggleListening,
      transcript,
      jarvisResponse,
      speak
    }}>
      {children}
    </JarvisContext.Provider>
  );
};
