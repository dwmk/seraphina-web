import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Lock, Sparkle, Globe, X, Warning, Cpu, Fingerprint, Aperture, Copy, Check } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Register GSAP plugins
gsap.registerPlugin(MotionPathPlugin);

// --- Utility: Tailwind Merger ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Assets & Constants ---
// UPDATED: Custom Diamond Cursor
const CUSTOM_CURSOR = "url('https://huanmux.github.io/assets/image/diamond-cursor.cur'), auto"; 

// UPDATED: MuxLogo with Gradient Support and Dynamic sizing
const MuxLogo = ({ className, psychedelic = false, useGradient = false }) => (
  <svg 
    className={cn(className, psychedelic && "animate-psychedelic")} 
    viewBox="0 0 1124 385" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="muxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d8b4fe" />
        <stop offset="50%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    <path 
      d="M468.253 43.25c-6.119 12.696-12.584 26.616-15.208 32.75-1.765 4.125-4.522 10.284-6.127 13.687S444 96.116 444 96.413s-2.25 5.285-5 11.087-5 10.704-5 10.893-2.649 5.915-5.886 12.725c-7.919 16.657-11.132 23.719-18.781 41.279-5.886 13.353-9.16 20.746-16.779 37.103a3707 3707 0 0 0-5.323 11.5 2194 2194 0 0 1-7.97 17c-12.693 26.781-20.416 44.348-20.581 46.81-.153 2.279.202 2.671 2.32 2.566 1.375-.068 3.85-.589 5.5-1.156s4.575-1.558 6.5-2.202 6.2-2.219 9.5-3.5 7.575-2.89 9.5-3.573c1.925-.684 4.4-1.6 5.5-2.035s6.05-2.019 11-3.519c9.765-2.96 46.602-15.033 55.5-18.189 8.523-3.023 20.75-7.109 29-9.691 8.075-2.526 16.105-5.214 36.5-12.214 34.495-11.839 35.567-12.047 44.524-8.614 5 1.916 9.908 3.44 30.476 9.462 3.85 1.127 8.125 2.425 9.5 2.883s7.225 2.258 13 3.997c5.775 1.74 11.625 3.538 13 3.997 5.006 1.668 25.654 7.908 31.5 9.519 3.3.909 8.198 2.509 10.883 3.556 2.686 1.047 5.374 1.903 5.972 1.903 1.233 0 11.721 3.11 22.145 6.565 3.85 1.277 11.5 3.475 17 4.885 5.5 1.411 10.9 2.944 12 3.408 3.726 1.571 8.978 3.279 14.838 4.825 8.849 2.336 9.169 1.238 3.053-10.467-2.793-5.344-6.311-12.191-7.818-15.216s-3.402-6.625-4.211-8-2.162-4.075-3.006-6-4.194-8.991-7.445-15.702S729 209.621 729 209.04c0-.582-2.535-5.441-5.634-10.799-3.098-5.357-6.412-11.541-7.364-13.741-2.29-5.297-8.228-17.798-19.633-41.336-5.153-10.634-9.369-19.59-9.369-19.902 0-.562-23.503-48.563-33.178-67.762-5.73-11.369-6.64-12.702-8.397-12.293-1.081.251-15.877 15.739-21.925 22.948-1.1 1.312-4.671 5.301-7.936 8.865a5487 5487 0 0 0-14.5 15.919c-4.71 5.191-9.497 10.366-10.637 11.5-3.647 3.626-25.776 27.968-30.095 33.104l-4.168 4.957-5.451-6c-2.998-3.3-8.322-9.388-11.832-13.528-3.509-4.14-8.661-10.215-11.448-13.5-2.786-3.285-9.969-12.047-15.961-19.472-5.991-7.425-13.841-16.875-17.444-21s-8.782-10.408-11.511-13.962c-5.365-6.989-10.375-11.962-12.098-12.009-.595-.016-1.569.984-2.166 2.221m157.612 98.104C601.354 168.088 597 172.995 597 173.89c0 .963 6.028 3.092 8.79 3.104.709.003 2.959.83 5 1.838 2.04 1.007 6.41 2.401 9.71 3.098s7.575 1.87 9.5 2.608c1.925.737 5.3 1.891 7.5 2.564s6.7 2.239 10 3.48c6.994 2.63 13.925 4.082 13.378 2.803-.208-.488-6.565-13.438-14.128-28.778-7.562-15.341-13.75-28.278-13.75-28.75 0-1.757-1.649-.487-7.135 5.497m-145.271-.636c-1.048 2.63-4.147 9.507-6.886 15.282-7.56 15.937-15.812 34.259-16.438 36.5-.307 1.1-1.008 2.573-1.557 3.274-1.797 2.294-.071 2.332 5.825.126 3.19-1.194 7.862-2.75 10.381-3.458s10.431-3.307 17.581-5.776 16.262-5.491 20.25-6.716c6.624-2.036 8.503-3.226 6.5-4.117-.413-.183-2.535-2.583-4.716-5.333s-4.206-5.225-4.5-5.5c-.937-.877-12.409-14.32-16.545-19.387a1179 1179 0 0 0-5.989-7.282l-2-2.395z" 
      fill={useGradient ? "url(#muxGradient)" : "currentColor"} 
      fillRule="evenodd" 
    />
  </svg>
);

const PETITION_PLACEHOLDERS = [
  "muxday, please answer the following request that I have for you especially for today",
  "muxday, I am allowing you to answer me by seeing my world the way I see it myself",
  "muxday, please help me by giving me an answer to this curiousity that I have",
  "muxday, please tell me the truth about what i am going to ask you right now at this moment",
];

const DENIAL_PHRASES = [
  "Server load at 99%. Try again later.",
  "Neural link severed by ISP.",
  "Regional API outage detected (Error 503).",
  "Token failure.",
  "Interference detected. Reply cancelled.",
  "Access Denied: You cannot access that information!",
  "Connection reset by peer.",
  "Unable to decrypt user intent.",
  "GPU cluster overheating. Please retry",
  "I don't feel like it right now.",
  "Your question answers itself.",
];

const MAX_DAILY_MESSAGES = 3;
const LOCKDOWN_HOURS = 24;

// --- Sound Engine (Web Audio API) ---
const playSound = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'activate') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'denial') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'rumble') {
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(40, now);
    osc2.connect(gain);
    osc2.start(now);
    osc2.stop(now + 8);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(50, now);
    osc.frequency.linearRampToValueAtTime(400, now + 6); 
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 4);
    osc.start(now);
    osc.stop(now + 8);
  } else if (type === 'boom') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    
    const bufferSize = ctx.sampleRate * 2; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime(0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    noise.start(now);
    
    osc.start(now);
    osc.stop(now + 2);
  } else if (type === 'message') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  }
};

// --- Fluid/Hacker Text Background ---
const FluidBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    
    const particles = [];
    const charPool = "01MUXDAY_NULL";
    const particleCount = 100; 

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 12 + 10;
        this.text = charPool[Math.floor(Math.random() * charPool.length)];
        this.speedX = 0;
        this.speedY = 0;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.1;
      }
      
      update() {
        const scale = 0.002;
        const noise = Math.sin(this.x * scale) + Math.cos(this.y * scale);
        this.angle = noise * Math.PI * 2;
        
        this.speedX += Math.cos(this.angle) * 0.08;
        this.speedY += Math.sin(this.angle) * 0.08;
        
        this.speedX *= 0.98;
        this.speedY *= 0.98;
        
        this.x += this.speedX + 0.2; 
        this.y += this.speedY;
        
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
      }
      
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.font = `bold ${this.size}px monospace`;
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
      }
    }

    const init = () => {
      resize();
      for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };

    init();
    window.addEventListener('resize', resize);
    animate();
    
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-multiply" />;
};

// --- Black Hole Component ---
const BlackHole = ({ active, duration }) => {
  return (
    <div className={cn("fixed inset-0 z-[80] flex items-center justify-center pointer-events-none transition-opacity duration-500", active ? "opacity-100" : "opacity-0")}>
      {/* Event Horizon */}
      <div className="relative w-0 h-0 flex items-center justify-center">
         {/* The Hole Itself */}
         <div 
           className="absolute w-[600px] h-[600px] rounded-full bg-black shadow-[0_0_150px_60px_rgba(0,0,0,1)] z-20 scale-0"
           style={{ animation: active ? `hole-expand ${duration * 0.3}s cubic-bezier(0.16, 1, 0.3, 1) forwards` : 'none' }}
         ></div>
         
         {/* Accretion Disk - Synced to Duration */}
         <div 
            className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 z-10 opacity-0 mix-blend-screen"
            style={{ animation: active ? `disk-spin ${duration * 0.8}s linear infinite, disk-fade-in 1s forwards` : 'none' }}
         ></div>
         
         <div className="absolute w-[700px] h-[700px] rounded-full border-[20px] border-purple-900/50 z-10 scale-0 blur-md transition-transform duration-1000 transform"
              style={{ transform: active ? 'scale(1)' : 'scale(0)' }}
         ></div>
      </div>
    </div>
  );
};

// --- Skeletal Loading Bubble ---
const ShimmerBubble = () => (
    <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-gray-100 shadow-lg w-32 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent"></div>
        <div className="h-2 bg-gray-100 rounded w-full mb-2"></div>
        <div className="h-2 bg-gray-100 rounded w-2/3"></div>
    </div>
);

// --- Context Menu ---
const ContextMenu = ({ x, y, visible, onClose, text }) => {
    const [copied, setCopied] = useState(false);
    
    useEffect(() => {
        const handleClick = () => onClose();
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [onClose]);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => onClose(), 800);
    };

    if (!visible) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ top: y, left: x }}
            className="fixed z-[999] bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-xl p-1.5 min-w-[150px] overflow-hidden"
        >
            <button 
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
            >
                {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Text"}
            </button>
        </motion.div>
    );
};

export default function App() {
  // --- State ---
  const [stage, setStage] = useState('idle'); // idle, petition_active, processing, lockdown
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  
  // Prank Mechanics
  const [secretAnswer, setSecretAnswer] = useState('');
  const [isSecretMode, setIsSecretMode] = useState(false);
  const [petitionComplete, setPetitionComplete] = useState(false);
  
  // Lockdown Mechanics
  const [dailyCount, setDailyCount] = useState(0);
  const [lockdownEndTime, setLockdownEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('00:00:00');
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Animation state
  const [suckingWords, setSuckingWords] = useState([]);
  const [blackHoleDuration, setBlackHoleDuration] = useState(0);
  const [isPsychedelic, setIsPsychedelic] = useState(false);
  const [pulseColor, setPulseColor] = useState(null); 
  const [dimActive, setDimActive] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, text: '' });

  // Header Info
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fingerprint = "ZGF0YTppbWFnZS9w";

  // Refs
  const iconRef = useRef(null);
  const inputContainerRef = useRef(null);
  const chatBottomRef = useRef(null);
  const pulseRef = useRef(null);
  const darkOverlayRef = useRef(null);

  // --- Effects ---

  // Scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, stage]);

  // Persistence & Lockdown
  useEffect(() => {
    const checkStorage = () => {
      const stored = JSON.parse(localStorage.getItem('muxday_data') || '{}');
      const now = Date.now();
      const lockoutTime = LOCKDOWN_HOURS * 60 * 60 * 1000;

      if (stored.timestamp && now - stored.timestamp < lockoutTime) {
        setDailyCount(stored.count || 0);
        if (stored.count >= MAX_DAILY_MESSAGES) {
          setStage('lockdown');
          setLockdownEndTime(stored.timestamp + lockoutTime);
          setShowWelcome(false); 
        }
      } else {
        localStorage.setItem('muxday_data', JSON.stringify({ count: 0, timestamp: now }));
        setDailyCount(0);
      }
    };
    checkStorage();
  }, []);

  // Countdown
  useEffect(() => {
    if (stage !== 'lockdown' || !lockdownEndTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = lockdownEndTime - now;
      if (diff <= 0) {
        setStage('idle');
        setDailyCount(0);
        localStorage.setItem('muxday_data', JSON.stringify({ count: 0, timestamp: now }));
        clearInterval(interval);
      } else {
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeRemaining(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, lockdownEndTime]);

  const updateCount = () => {
    const newCount = dailyCount + 1;
    setDailyCount(newCount);
    const now = Date.now();
    localStorage.setItem('muxday_data', JSON.stringify({ count: newCount, timestamp: now }));
    if (newCount >= MAX_DAILY_MESSAGES) {
      setTimeout(() => {
        setStage('lockdown');
        setLockdownEndTime(now + (LOCKDOWN_HOURS * 60 * 60 * 1000));
      }, 1000);
    }
  };

  // --- Input Logic ---

  const handleKeyDown = (e) => {
    if (stage === 'processing' || stage === 'lockdown') return;

    if (!petitionComplete) {
      // Secret Toggle (.)
      if (e.key === '.') {
        e.preventDefault();
        setIsSecretMode(!isSecretMode);
        return;
      }

      if (isSecretMode) {
        if (e.key === 'Backspace') {
          setSecretAnswer((prev) => prev.slice(0, -1));
          setInputValue((prev) => prev.slice(0, -1));
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && e.key !== 'Enter') {
          e.preventDefault();
          setSecretAnswer((prev) => prev + e.key);
          // Fake text
          const petitionBase = PETITION_PLACEHOLDERS[0];
          const nextChar = petitionBase[inputValue.length] || ".";
          setInputValue((prev) => prev + nextChar);
        }
      }
    }

    if (e.key === 'Enter') {
      handleStep();
    }
  };

  const handleStep = async () => {
    if (!inputValue.trim()) return;

    // STEP 1: PETITION ACTIVATION
    if (!petitionComplete) {
      setPetitionComplete(true);
      setInputValue('');
      
      const success = (isSecretMode && secretAnswer.length > 0);
      const color = success ? '#3b82f6' : '#ef4444'; 
      setPulseColor(success ? 'blue' : 'red');
      playSound('activate');

      // RADIAL PULSE ANIMATION
      if (pulseRef.current) {
        gsap.fromTo(pulseRef.current, 
          { scale: 1, opacity: 0.8, borderColor: color },
          { scale: 4, opacity: 0, duration: 1, ease: "power2.out" }
        );
      }
      
      return;
    }

    // STEP 2: LAUNCH SEQUENCE
    const question = inputValue;
    
    let answer = "";
    if (isSecretMode && secretAnswer.length > 0) {
      answer = secretAnswer;
    } else {
      answer = DENIAL_PHRASES[Math.floor(Math.random() * DENIAL_PHRASES.length)];
    }

    const doCinematic = isSecretMode && secretAnswer.length > 0;

    setInputValue('');
    setStage('processing');
    setChatHistory(prev => [...prev, { role: 'user', text: question }]);

    if (!doCinematic) {
      // --- FAIL PATH ---
      playSound('denial');
      gsap.to(iconRef.current, { backgroundColor: '#ef4444', x: 5, duration: 0.1, yoyo: true, repeat: 5 });
      await new Promise(r => setTimeout(r, 1500)); 
      finishProcessing(answer, false);
    } else {
      // --- CINEMATIC PATH ---
      runCinematicSequence(question, answer);
    }
  };

  const generateRandomWords = (sourceText) => {
    const baseWords = ["ENTROPY", "NULL", "VOID", "DATA", "SYNAPSE", "QUANTUM", "MUX", "VECTOR", "TENSOR", "EVENT", "HORIZON"];
    const sourceWords = sourceText.split(' ').map(w => w.toUpperCase()).filter(w => w.length > 3);
    const pool = [...baseWords, ...sourceWords];
    
    // Spawn words randomly across the screen, avoiding the very center initially
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      text: pool[Math.floor(Math.random() * pool.length)],
      // Start positions relative to viewport
      x: (Math.random() * window.innerWidth),
      y: (Math.random() * window.innerHeight),
      rotation: Math.random() * 360,
      scale: Math.random() * 0.8 + 0.4
    }));
  };

  const runCinematicSequence = (question, answer) => {
    const tl = gsap.timeline();
    const screenCenterY = window.innerHeight / 2;
    const screenCenterX = window.innerWidth / 2;
    
    // Calculate random duration upfront
    const cinematicDuration = Math.random() * 3 + 4; // 4 to 7 seconds
    setBlackHoleDuration(cinematicDuration);

    playSound('rumble');
    
    const words = generateRandomWords(question);
    setSuckingWords(words);

    // 1. Panel Drops
    tl.to(inputContainerRef.current, { y: 200, opacity: 0, duration: 0.5, ease: "back.in(1.7)" });

    // 2. Icon Launches to Center - FORCE Z-INDEX HIGH
    const iconRect = iconRef.current.getBoundingClientRect();
    
    tl.set(iconRef.current, { position: 'fixed', left: iconRect.left, top: iconRect.top, zIndex: 999, margin: 0 });

    // Move icon to center and expand
    tl.to(iconRef.current, {
      left: screenCenterX - 100, // Centered (width 200 / 2)
      top: screenCenterY - 100,
      width: 200,
      height: 200,
      scale: 1, // Reset scale to 1 relative to new width
      borderRadius: "50%",
      backgroundColor: "#000",
      borderColor: "#fff",
      color: "#fff", // IMPORTANT: Set text color to white for logo visibility
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => setIsPsychedelic(true)
    });

    // 3. Gradual Dimming (Fixed brightness jump)
    tl.to(darkOverlayRef.current, { opacity: 1, duration: 2, ease: "power1.inOut" }, "-=1.0");

    // 4. Suck words (Fixed Suction)
    tl.add(() => {
       const wordElements = document.querySelectorAll('.sucking-word');
       if (wordElements.length) {
         // Animate to absolute center of screen
         gsap.to(wordElements, {
           left: "50%",
           top: "50%",
           x: "-50%", // Center align
           y: "-50%", 
           scale: 0,
           color: '#ffffff',
           opacity: 1,
           rotation: "+=1080", // Spin fast
           duration: cinematicDuration * 0.8,
           stagger: { amount: 1.5, from: "edges" }, // Suck from outside in
           ease: "expo.in"
         });
       }
    }, "-=1");

    // 5. Wait for the pre-calculated duration
    tl.to({}, { duration: cinematicDuration - 1.5 });

    // 6. The Boom
    tl.add(() => {
      playSound('boom');
      setIsPsychedelic(false);
      
      const flash = document.createElement('div');
      flash.className = 'fixed inset-0 bg-white z-[150] pointer-events-none mix-blend-screen';
      document.body.appendChild(flash);
      gsap.to(flash, { opacity: 0, duration: 1.5, onComplete: () => flash.remove() });
      
      // Reset Dimming
      gsap.to(darkOverlayRef.current, { opacity: 0, duration: 1 });
    });

    // 7. Icon Moves to Chat
    tl.to(iconRef.current, { scale: 0, opacity: 0, duration: 0.2 });

    tl.add(() => {
      setSuckingWords([]);
      gsap.set(iconRef.current, { clearProps: "all" });
      finishProcessing(answer, true);
    });
  };

  const finishProcessing = (text, wasCinematic) => {
    setSecretAnswer('');
    setPetitionComplete(false);
    setIsSecretMode(false);
    setBlackHoleDuration(0);
    setIsPsychedelic(false);
    setPulseColor(null);
    
    setChatHistory(prev => [...prev, { role: 'ai', text: text }]);
    playSound('message');

    // Restore Input
    if (wasCinematic) {
      gsap.set(inputContainerRef.current, { y: 100, opacity: 0 });
      gsap.to(inputContainerRef.current, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.2 });
    } 
    
    setStage('idle');
    updateCount();
  };

  const handleContextMenu = (e, text) => {
      e.preventDefault();
      setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          text: text
      });
  };

  // --- Render ---

  return (
    <div className="relative w-full h-full min-h-screen font-sans overflow-hidden bg-zinc-50 text-zinc-900 selection:bg-purple-500/30 selection:text-black transition-colors duration-1000" style={{ cursor: CUSTOM_CURSOR }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
        body { font-family: 'Geist', sans-serif; }
        
        @keyframes hole-expand { 0% { transform: scale(0); } 100% { transform: scale(1); } }
        @keyframes disk-spin { 0% { transform: rotate(0deg) scale(0.8); opacity:0; } 50% { opacity: 0.8; } 100% { transform: rotate(1080deg) scale(0.1); opacity: 0; } }
        @keyframes disk-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes psychedelic { 
           0% { filter: hue-rotate(0deg) invert(0); } 
           25% { filter: hue-rotate(90deg) invert(1); }
           50% { filter: hue-rotate(180deg) invert(0) drop-shadow(0 0 10px #fff); } 
           75% { filter: hue-rotate(270deg) invert(1); }
           100% { filter: hue-rotate(360deg) invert(0); } 
        }
        .animate-psychedelic { animation: psychedelic 0.5s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
      
      {/* Light Theme Backgrounds */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
         <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05),transparent_70%)] blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)] blur-[100px]"></div>
      </div>

      <FluidBackground />
      
      {/* Controlled Dark Overlay for Cinematic Effect */}
      <div ref={darkOverlayRef} className="fixed inset-0 bg-black pointer-events-none opacity-0 z-[70]"></div>

      {/* Black Hole Overlay */}
      <BlackHole active={stage === 'processing' && suckingWords.length > 0} duration={blackHoleDuration} />

      <div className="flex flex-col h-screen relative z-10 max-w-4xl mx-auto w-full">
        
        {/* --- Header --- */}
        <header className="flex justify-between items-center p-6 border-b border-zinc-200/50 backdrop-blur-sm z-50">
           <div className="flex items-center gap-2 group cursor-pointer">
             <div className="relative">
                {/* Keep topbar logo small */}
                <MuxLogo className="h-6 text-black group-hover:animate-spin" />
                <div className="absolute inset-0 bg-purple-500 blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
             </div>
             <span className={cn("text-xs font-mono border border-zinc-200 px-2 py-0.5 rounded-full bg-white/50", showWelcome ? "text-zinc-200 border-white/20 bg-white/10" : "text-zinc-400")}>v2.0.4-beta</span>
           </div>
           {/* UPDATED: Dynamic text color for initial popup visibility */}
           <div className={cn("flex gap-2 text-xs font-mono items-center transition-colors duration-500", showWelcome ? "text-white/70" : "text-zinc-400")}>
             <Fingerprint size={12} />
             <span>{fingerprint}</span>
             <span>@</span>
             <span>{timeZone}</span>
           </div>
        </header>

        {/* --- Chat Area (Bento Grid Style) --- */}
        <main className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
           <div className="space-y-8 pb-32">
              <AnimatePresence mode='popLayout'>
                {chatHistory.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={cn("flex gap-4 w-full group", msg.role === 'user' ? "justify-end" : "justify-start")}
                  >
                    {/* UPDATED: AI Avatar Bigger */}
                    {msg.role === 'ai' && (
                      <div className="w-12 h-12 rounded-2xl border border-zinc-200 flex items-center justify-center bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] mt-1 shrink-0 overflow-hidden">
                        <MuxLogo className="w-8 h-8 text-black" />
                      </div>
                    )}
                    <motion.div 
                      onContextMenu={(e) => handleContextMenu(e, msg.text)}
                      whileHover={{ scale: 1.01, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                      "max-w-[85%] md:max-w-[75%] p-6 rounded-[2rem] text-sm md:text-base leading-relaxed shadow-sm backdrop-blur-md cursor-pointer transition-all border",
                      msg.role === 'ai' 
                       ? "bg-white/80 border-white text-zinc-800 rounded-tl-none hover:shadow-xl hover:shadow-purple-500/10" 
                       : "bg-zinc-900 border-zinc-800 text-zinc-100 rounded-tr-none shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)]"
                    )}>
                       {msg.role === 'ai' && <div className="text-[10px] font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2 opacity-80">MUXDAY INTELLIGENCE</div>}
                       <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                    </motion.div>
                  </motion.div>
                ))}
                
                {/* Fake Loading Shimmer during non-cinematic processing */}
                {stage === 'processing' && suckingWords.length === 0 && (
                   <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex gap-4 w-full justify-start">
                      <div className="w-12 h-12 rounded-2xl border border-zinc-200 flex items-center justify-center bg-white shadow-sm mt-1 shrink-0">
                         <MuxLogo className="w-8 h-8 text-black animate-spin" />
                      </div>
                      <ShimmerBubble />
                   </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatBottomRef} />
           </div>
        </main>

        {/* --- Input Area --- */}
        <div className="w-full px-4 pb-8 pt-4 z-50">
           <div ref={inputContainerRef} className="relative transition-all">
              
              {/* Particle Words (Sucking effect) */}
              {suckingWords.map((word) => (
                 <div key={word.id} className="sucking-word fixed text-zinc-400/50 font-mono text-[10px] font-bold pointer-events-none z-[120]"
                   style={{ left: word.x, top: word.y, transform: `rotate(${word.rotation}deg)` }}
                 >
                   {word.text}
                 </div>
              ))}

              {/* Bento Input Box */}
              <div className={cn("relative p-2 rounded-full transition-all duration-300 group bg-white shadow-[0_15px_50px_-10px_rgba(0,0,0,0.08)] border border-zinc-100/50 backdrop-blur-xl", 
                  stage === 'lockdown' ? "opacity-50 grayscale pointer-events-none" : "hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.15)] hover:border-purple-200"
              )}>
                 <div className="relative flex items-center pl-8 pr-2 rounded-full h-[80px] w-full">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={petitionComplete ? "Ask MuxDay..." : "Initialize pre-prompt..."}
                      className="flex-1 bg-transparent border-none outline-none text-zinc-900 placeholder-zinc-300 font-medium h-full w-full tracking-wide text-xl"
                      autoComplete="off"
                      autoFocus
                      disabled={stage === 'processing' || stage === 'lockdown'}
                    />
                    
                    {/* The Mux Send Icon & Pulse Container */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        {/* Radial Pulse */}
                        <div ref={pulseRef} className="absolute inset-0 rounded-full border-2 opacity-0 pointer-events-none" style={{ borderColor: '#3b82f6' }}></div>
                        
                        {/* The Icon - UPDATED SIZE */}
                        <div 
                            ref={iconRef}
                            onClick={handleStep}
                            className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 z-50 active:scale-95 shadow-lg absolute right-0",
                            petitionComplete 
                                ? "bg-zinc-900 text-white hover:bg-black" 
                                : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100 border border-zinc-200"
                            )}
                        >
                            {/* Pass useGradient to ensure visibility in black hole if needed via props, but css class handles color */}
                            <MuxLogo className="w-10 h-10" psychedelic={isPsychedelic} useGradient={isPsychedelic} />
                        </div>
                    </div>
                 </div>
              </div>
              
              {/* Status Bar */}
              <div className="flex justify-between items-center mt-4 px-6">
                 <div className="text-[10px] text-zinc-400 font-mono tracking-wider flex items-center gap-2 uppercase">
                   <div className={cn("w-2 h-2 rounded-full transition-colors duration-300 shadow-sm", petitionComplete ? "bg-purple-500 animate-pulse" : "bg-zinc-300")}></div>
                   {petitionComplete ? "Request connected" : "Awaiting Pre-prompt"}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- Context Menu Portal --- */}
      <AnimatePresence>
          {contextMenu.visible && (
              <ContextMenu 
                  x={contextMenu.x} 
                  y={contextMenu.y} 
                  visible={contextMenu.visible} 
                  text={contextMenu.text}
                  onClose={() => setContextMenu({ ...contextMenu, visible: false })}
              />
          )}
      </AnimatePresence>

      {/* --- Welcome Pop-up --- */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-zinc-900/80 backdrop-blur-md flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-white rounded-[48px] max-w-md w-full p-10 shadow-2xl relative overflow-hidden ring-1 ring-white/20"
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <div className="flex justify-center mb-8">
                    {/* UPDATED: Larger Logo in Popup */}
                    <div className="w-24 h-24 rounded-[32px] bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-inner">
                        <MuxLogo className="w-16 h-16 text-black" />
                    </div>
                </div>
                
                <h2 className="text-3xl font-bold text-center text-zinc-900 mb-1 tracking-tight">Welcome to MuxDay</h2>
                <p className="text-center text-zinc-400 text-sm font-medium mb-8">The AI that knows it all</p>
                
                <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 mb-8 space-y-4">
                   <div className="flex gap-4 items-start">
                      <Warning size={24} className="text-purple-600 shrink-0 mt-0.5" weight="duotone" />
                      <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                        Before you type your own request, you must catch the attention of MuxDay by writing a <span className="font-bold text-black border-b-2 border-purple-200">pre-prompt</span> otherwise your main prompt will be rejected.
                      </p>
                   </div>
                </div>
                
                <p className="text-[10px] text-zinc-400 text-center mb-6 px-4">
                    By using this AI system, you agree to grant us intrinsic access to all your device sensors for accuracy.
                </p>
                
                <button 
                  onClick={() => setShowWelcome(false)}
                  className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all active:scale-95 shadow-xl shadow-zinc-200"
                >
                  Confirm & Initialize
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Lockdown Overlay --- */}
      <AnimatePresence>
        {stage === 'lockdown' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-white/80 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl"
          >
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-red-500 blur-[60px] opacity-20 animate-pulse"></div>
              <Lock size={96} className="text-red-500 relative z-10 drop-shadow-sm" weight="duotone" />
              <Warning size={32} className="text-white absolute -top-2 -right-2 z-20 animate-bounce p-1 bg-red-500 rounded-full" weight="fill" />
            </div>
            
            <h2 className="text-6xl font-black text-zinc-900 mb-6 tracking-tighter">YOU ARE BLOCKED</h2>
            <div className="flex flex-col items-center gap-4 mb-12 bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl">
               <p className="text-red-500 uppercase tracking-[0.3em] text-xs font-bold">Token Limit Exceeded</p>
               <div className="text-5xl font-mono font-bold text-zinc-900">
                 {timeRemaining}
               </div>
            </div>

            <button 
              onClick={() => setUpgradeModal(true)}
              className="group relative px-10 py-5 bg-black text-white font-bold rounded-full overflow-hidden hover:scale-105 transition-transform shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-gradient-x"></div>
              <div className="flex items-center gap-3 relative z-10">
                <Sparkle weight="fill" className="text-yellow-400 animate-spin-slow" />
                <span>Upgrade To Infinite</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Fake Upgrade Modal --- */}
      <AnimatePresence>
        {upgradeModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
          >
            <div className="bg-white border border-white/40 p-[1px] rounded-[32px] shadow-2xl max-w-sm w-full relative overflow-hidden">
               <div className="bg-white p-8 rounded-[31px] relative h-full flex flex-col items-center text-center">
                 <button onClick={() => setUpgradeModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors bg-zinc-100 p-2 rounded-full"><X size={16} /></button>
                 
                 <div className="relative mb-6 mt-4">
                      <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20"></div>
                      <Globe size={64} className="text-purple-600 relative z-10" weight="duotone" />
                 </div>
                 
                 <h3 className="text-2xl font-bold text-zinc-900 mb-2">Region Locked</h3>
                 <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6"></div>
                 
                 <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                   MuxDay <span className="text-purple-600 font-bold">Infinite</span> is unavailable in your current region.
                 </p>
                 
                 <div className="w-full flex gap-3 items-center bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <Cpu size={20} className="text-zinc-400"/>
                    <div className="h-1.5 flex-1 bg-zinc-200 rounded-full overflow-hidden">
                        <div className="h-full w-[10%] bg-red-500"></div>
                    </div>
                    <span className="text-[10px] text-red-500 font-mono font-bold">SYSTEM LOAD</span>
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
