const { useState, useEffect, useRef, useCallback, useMemo } = React;

// Custom Icon wrapper to render Lucide HTML attributes dynamically
const Icon = React.memo(({ name, className = "", size = 20 }) => {
    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [name]);
    return <i data-lucide={name} className={`${className}`} style={{ width: size, height: size }}></i>;
});

// Default Mock Data
const DEFAULT_CONTACTS = [
    { id: '1', name: 'Robert Jenkins', phone: '(555) 123-4567', relation: 'Dad', role: 'Primary Guardian' },
    { id: '2', name: 'Officer Davis', phone: '(555) 987-6543', relation: 'Campus Security', role: 'Police Liaison' },
    { id: '3', name: 'Emma Jenkins', phone: '(555) 246-8135', relation: 'Sister', role: 'Local Friend' }
];

const DEFAULT_HAZARDS = [
    { id: 'h1', lat: 40.7322, lng: -73.9990, type: 'Poor Lighting', desc: 'Mercer St alleyway has broken streetlights.', severity: 'amber' },
    { id: 'h2', lat: 40.7290, lng: -73.9945, type: 'Aggressive Animals', desc: 'Pack of stray dogs spotted behind construction yard.', severity: 'amber' },
    { id: 'h3', lat: 40.7345, lng: -73.9925, type: 'Suspicious Activity', desc: 'Isolated pathway under scaffoldings with loiterers.', severity: 'red' }
];

const DESTINATIONS = [
    { id: 'd1', name: 'NYU Bobst Library', coords: [40.729986, -73.997235], dist: '0.4 km', time: '5 mins' },
    { id: 'd2', name: 'Union Square Park', coords: [40.735863, -73.991084], dist: '1.1 km', time: '14 mins' },
    { id: 'd3', name: 'Greenwich Village Dorm', coords: [40.732551, -74.001648], dist: '0.6 km', time: '8 mins' }
];

const MOCK_MESSAGES = [
    { sender: 'ai', text: "Hello! I am Aegis Guardian, your safety AI. If you're walking alone or feel unsafe, let me know. You can type, speak, or click one of the quick prompts below to get started.", time: new Date() }
];

// Interactive 3D WebGL Splash Screen using Three.js
function SplashScreen({ onEnter, onQuickAction }) {
    const containerRef = useRef(null);
    const [fadeClass, setFadeClass] = useState("opacity-100");
    const [isScanning, setIsScanning] = useState(true);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanText, setScanText] = useState("Initializing Aegis core systems...");

    useEffect(() => {
        if (!isScanning) return;
        const scanSteps = [
            { prog: 20, text: "Calibrating Edge AI voice sensors..." },
            { prog: 45, text: "Locking GPS location satellites..." },
            { prog: 70, text: "Syncing Circle Guardian beacons..." },
            { prog: 85, text: "Fetching local crowd safety rating..." },
            { prog: 100, text: "Aegis Secure Node Online. Status: Guarding." }
        ];
        
        let stepIdx = 0;
        const interval = setInterval(() => {
            if (stepIdx < scanSteps.length) {
                setScanProgress(scanSteps[stepIdx].prog);
                setScanText(scanSteps[stepIdx].text);
                stepIdx++;
            } else {
                clearInterval(interval);
                setIsScanning(false);
            }
        }, 350);
        return () => clearInterval(interval);
    }, [isScanning]);

    useEffect(() => {
        if (!window.THREE || !containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // 1. Scene Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // 2. Objects Creation
        const geometry = new THREE.SphereGeometry(1.6, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xef4444,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);

        const innerGeom = new THREE.IcosahedronGeometry(1.1, 1);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const innerGlobe = new THREE.Mesh(innerGeom, innerMat);
        scene.add(innerGlobe);

        const particleCount = 150;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = 2.0 + Math.random() * 0.4;
            
            positions[i] = r * Math.sin(phi) * Math.cos(theta);
            positions[i+1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i+2] = r * Math.cos(phi);
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.04,
            transparent: true,
            opacity: 0.7
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        let mouseX = 0, mouseY = 0;
        const onMouseMove = (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) / 300;
            mouseY = (e.clientY - window.innerHeight / 2) / 300;
        };
        window.addEventListener('mousemove', onMouseMove);

        let animId;
        const animate = () => {
            animId = requestAnimationFrame(animate);

            globe.rotation.y += 0.004;
            globe.rotation.x += 0.001;
            innerGlobe.rotation.y -= 0.002;
            particles.rotation.y += 0.001;

            scene.rotation.y += (mouseX - scene.rotation.y) * 0.05;
            scene.rotation.x += (mouseY - scene.rotation.x) * 0.05;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('mousemove', onMouseMove);
            if (containerRef.current && renderer.domElement) {
                try {
                    containerRef.current.removeChild(renderer.domElement);
                } catch(e){}
            }
            geometry.dispose();
            material.dispose();
            innerGeom.dispose();
            innerMat.dispose();
            particleGeometry.dispose();
            particleMaterial.dispose();
        };
    }, []);

    const handleEnter = () => {
        setFadeClass("opacity-0 transition-opacity duration-700 ease-out pointer-events-none");
        setTimeout(onEnter, 700);
    };

    const handleQuickActionClick = (type) => {
        setFadeClass("opacity-0 transition-opacity duration-700 ease-out pointer-events-none");
        setTimeout(() => {
            onQuickAction(type);
        }, 700);
    };

    return (
        <div className={`fixed inset-0 z-50 bg-[#04080e] flex items-center justify-center p-4 md:p-8 text-white font-sans ${fadeClass} overflow-y-auto`}>
            {/* Glowing background highlights */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-650/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center z-10 relative">
                
                {/* 3D GLOBE DISPLAY */}
                <div className="md:col-span-6 flex flex-col items-center text-center">
                    <div ref={containerRef} className="w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 relative flex items-center justify-center mb-2"></div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">AEGISNET</h1>
                    <p className="text-xs font-black text-red-500 tracking-[0.3em] uppercase mt-1">AI Personal Safety Node</p>
                </div>

                {/* CYBER DIAGNOSTICS & EMERGENCY COMMAND DECK */}
                <div className="md:col-span-6 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-left">
                    
                    {isScanning ? (
                        /* INITIAL SCANNING VIEW */
                        <div className="py-8 space-y-5">
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-xs text-red-500 uppercase tracking-widest">Aegis Diagnostics</h3>
                                <p className="text-[10px] text-slate-400">Verifying secure node parameters...</p>
                            </div>
                            
                            {/* Glowing Terminal Printout */}
                            <div className="bg-black/50 p-4 rounded-xl border border-slate-800/50 font-mono text-[10px] text-cyan-400 space-y-1 min-h-[70px] leading-relaxed shadow-inner">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                    <span>{scanText}</span>
                                </div>
                                <div className="text-slate-500 text-[9px]">Node IP: 127.0.0.1 (VPN SECURE)</div>
                            </div>

                            {/* Diagnostics Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                                    <span>Scan Integrity</span>
                                    <span>{scanProgress}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-red-600 to-cyan-400 h-full transition-all duration-300"
                                        style={{ width: `${scanProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* LIVE DEPLOYED DASHBOARD VIEW */
                        <>
                            {/* Radial Threat Indicator */}
                            <div className="flex items-center gap-4 bg-black/30 p-3 rounded-2xl border border-slate-800/50 shadow-inner">
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                    <svg className="w-12 h-12 -rotate-90">
                                        <circle cx="24" cy="24" r="20" className="stroke-slate-800 fill-none" strokeWidth="4" />
                                        <circle cx="24" cy="24" r="20" className="stroke-emerald-500 fill-none" strokeWidth="4" strokeDasharray="125" strokeDashoffset="10" />
                                    </svg>
                                    <span className="absolute text-xs font-black font-mono text-emerald-400">96%</span>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Network Threat Index</div>
                                    <div className="text-xs font-extrabold text-emerald-400 mt-0.5 uppercase tracking-wide">🟢 Zone Secure (NYU)</div>
                                </div>
                            </div>

                            {/* Checklist widget */}
                            <div className="space-y-2">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider">System Checklist</div>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="p-2 bg-slate-850/50 rounded-xl border border-slate-800/30 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                                        <span className="text-slate-300 font-bold">GPS Geolocation</span>
                                    </div>
                                    <div className="p-2 bg-slate-850/50 rounded-xl border border-slate-800/30 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                                        <span className="text-slate-300 font-bold">Edge AI Mic</span>
                                    </div>
                                    <div className="p-2 bg-slate-850/50 rounded-xl border border-slate-800/30 flex items-center gap-1.5 col-span-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                                        <span className="text-slate-300 font-bold">Guardian Network: 3 Active Circle Beacons</span>
                                    </div>
                                </div>
                            </div>

                            {/* Direct Duress Actions (The Unique Feature) */}
                            <div className="space-y-2 pt-1 border-t border-slate-800/60">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Emergency Duress Launchpad</div>
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => handleQuickActionClick('call')}
                                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition"
                                        title="Simulate Fake Call instantly"
                                    >
                                        <Icon name="phone" size={16} />
                                        <span className="text-[9px] font-black mt-1 uppercase">Fake Call</span>
                                    </button>
                                    <button 
                                        onClick={() => handleQuickActionClick('cover')}
                                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 transition"
                                        title="Open Notes Cover Screen instantly"
                                    >
                                        <Icon name="eye-off" size={16} />
                                        <span className="text-[9px] font-black mt-1 uppercase">Notepad</span>
                                    </button>
                                    <button 
                                        onClick={() => handleQuickActionClick('sos')}
                                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-red-650/15 hover:bg-red-600/30 border border-red-500/40 text-red-500 transition animate-pulse"
                                        title="Trigger Silent SOS instantly"
                                    >
                                        <Icon name="shield-alert" size={16} />
                                        <span className="text-[9px] font-black mt-1 uppercase">Silent SOS</span>
                                    </button>
                                </div>
                            </div>

                            {/* Main Enter Button */}
                            <button 
                                onClick={handleEnter}
                                className="w-full py-4 bg-gradient-to-r from-red-650 to-red-750 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <span>Initialize Active Patrol Node</span>
                                <Icon name="chevron-right" size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Main App Component
function App() {
    // Basic settings
    const [showSplash, setShowSplash] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [currentTab, setCurrentTab] = useState('shield'); // 'shield' | 'companion' | 'switch' | 'circle'
    
    // Safety & SOS States
    const [sosActive, setSosActive] = useState(false);
    const [sosCountdown, setSosCountdown] = useState(0);
    const [sosReason, setSosReason] = useState('');
    const [contacts, setContacts] = useState(() => {
        const saved = localStorage.getItem('aegis_contacts');
        return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
    });
    const [sentAlerts, setSentAlerts] = useState([]);
    
    // Dead Man's Switch (Journey Timer) States
    const [deadManActive, setDeadManActive] = useState(false);
    const [deadManTime, setDeadManTime] = useState(900); // 15 mins default
    const [deadManDuration, setDeadManDuration] = useState(900);
    const [showPinPad, setShowPinPad] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [userPin, setUserPin] = useState('1234');
    const [pinError, setPinError] = useState('');

    // Stealth Screens
    const [showFakeCall, setShowFakeCall] = useState(false);
    const [fakeCallState, setFakeCallState] = useState('ringing'); // 'ringing' | 'connected'
    const [fakeCallTime, setFakeCallTime] = useState(0);
    const [fakeCallCaller, setFakeCallCaller] = useState('Dad');
    const [showCoverScreen, setShowCoverScreen] = useState(false);
    const [coverNotes, setCoverNotes] = useState([
        { id: '1', title: 'Shopping List', content: '- Milk\n- Eggs\n- Whole wheat bread\n- Chicken breast\n- Toilet paper' },
        { id: '2', title: 'Bio 101 Exam Notes', content: 'Mitosis vs Meiosis:\nMitosis results in two identical diploid cells.\nMeiosis produces four genetic variants of haploid gametes.\nRemember to review cellular respiration ATP count.' }
    ]);
    const [activeCoverNote, setActiveCoverNote] = useState('1');

    // Edge AI Distress & Voice Detection
    const [voiceMonitoring, setVoiceMonitoring] = useState(false);
    const [recognizedWords, setRecognizedWords] = useState('');
    const [decibels, setDecibels] = useState(20);

    // AI Safety Companion
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const [walkModeActive, setWalkModeActive] = useState(false);
    const [speechSynthesizing, setSpeechSynthesizing] = useState(false);

    // Map & GPS Route settings
    const [hazards, setHazards] = useState(() => {
        const saved = localStorage.getItem('aegis_hazards');
        return saved ? JSON.parse(saved) : DEFAULT_HAZARDS;
    });
    const [userLocation, setUserLocation] = useState([40.730823, -73.997330]); // Start at Washington Square Park NYC
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState('safe'); // 'safe' | 'standard' | 'hazard'
    const [journeyActive, setJourneyActive] = useState(false);
    const [journeyStep, setJourneyStep] = useState(0);
    const [reportLatLng, setReportLatLng] = useState(null);
    const [reportType, setReportType] = useState('Poor Lighting');
    const [reportDesc, setReportDesc] = useState('');
    
    // Live Family Circle Simulator
    const [circleMembers, setCircleMembers] = useState([
        { id: 'm1', name: 'Emma (Sister)', coords: [40.7350, -74.0020], battery: 92, status: 'Safe at Home', color: 'bg-emerald-500', markerColor: 'emerald' },
        { id: 'm2', name: 'Dad (Robert)', coords: [40.7250, -73.9900], battery: 78, status: 'Commuting', color: 'bg-amber-500', markerColor: 'amber' }
    ]);

    // Refs
    const sirenRef = useRef(null);
    const ringtoneRef = useRef(null);
    const speechRecognitionRef = useRef(null);
    const audioContextRef = useRef(null);
    const volumeIntervalRef = useRef(null);
    const fakeCallIntervalRef = useRef(null);
    const deadManIntervalRef = useRef(null);
    const journeyIntervalRef = useRef(null);
    const synthUtteranceRef = useRef(null);

    // Save helpers
    useEffect(() => {
        localStorage.setItem('aegis_contacts', JSON.stringify(contacts));
    }, [contacts]);

    useEffect(() => {
        localStorage.setItem('aegis_hazards', JSON.stringify(hazards));
    }, [hazards]);

    // Handle Theme Dark/Light
    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [darkMode]);

    // Web Audio Siren Synthesizer
    const playSiren = useCallback(() => {
        if (sirenRef.current) return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const modulationGain = audioCtx.createGain();
            const mainGain = audioCtx.createGain();

            osc1.type = 'sawtooth';
            osc2.type = 'sine';

            osc1.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc2.frequency.setValueAtTime(2.5, audioCtx.currentTime); // LFO at 2.5Hz

            modulationGain.gain.setValueAtTime(250, audioCtx.currentTime); // Pitch swing width
            mainGain.gain.setValueAtTime(0.12, audioCtx.currentTime); // Moderate alarm volume

            osc2.connect(modulationGain);
            modulationGain.connect(osc1.frequency);

            osc1.connect(mainGain);
            mainGain.connect(audioCtx.destination);

            osc1.start();
            osc2.start();

            sirenRef.current = { ctx: audioCtx, osc1, osc2, mainGain };
        } catch (e) {
            console.error("Failed to generate audio siren", e);
        }
    }, []);

    const stopSiren = useCallback(() => {
        if (sirenRef.current) {
            try {
                sirenRef.current.osc1.stop();
                sirenRef.current.osc2.stop();
                sirenRef.current.ctx.close();
            } catch(e) {}
            sirenRef.current = null;
        }
    }, []);

    // Web Audio Phone Cadence Synthesizer
    const playRingtone = useCallback(() => {
        if (ringtoneRef.current) return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const mainGain = audioCtx.createGain();

            osc1.type = 'sine';
            osc2.type = 'sine';
            
            // Standard US dual-tone ringer frequencies
            osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc2.frequency.setValueAtTime(480, audioCtx.currentTime);

            osc1.connect(mainGain);
            osc2.connect(mainGain);
            mainGain.connect(audioCtx.destination);

            mainGain.gain.setValueAtTime(0, audioCtx.currentTime);

            osc1.start();
            osc2.start();

            let ringing = false;
            const ringCadence = () => {
                if (!audioCtx || audioCtx.state === 'closed') return;
                if (ringing) {
                    mainGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.15);
                } else {
                    mainGain.gain.setTargetAtTime(0.18, audioCtx.currentTime, 0.15);
                }
                ringing = !ringing;
            };

            ringCadence(); // Ring immediately
            const interval = setInterval(ringCadence, 2000); // Toggle ring every 2 seconds

            ringtoneRef.current = { ctx: audioCtx, osc1, osc2, mainGain, interval };
        } catch(e) {
            console.error("Ringtone synth failed", e);
        }
    }, []);

    const stopRingtone = useCallback(() => {
        if (ringtoneRef.current) {
            try {
                clearInterval(ringtoneRef.current.interval);
                ringtoneRef.current.osc1.stop();
                ringtoneRef.current.osc2.stop();
                ringtoneRef.current.ctx.close();
            } catch(e){}
            ringtoneRef.current = null;
        }
    }, []);

    // TTS speaker helper
    const speakText = (text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        
        // Remove markdown symbols or links for cleaner speaking
        const cleanedText = text.replace(/[*#_\-\[\]\(\)]/g, " ").replace(/\d+\./g, "");
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => setSpeechSynthesizing(true);
        utterance.onend = () => setSpeechSynthesizing(false);
        utterance.onerror = () => setSpeechSynthesizing(false);
        
        synthUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setSpeechSynthesizing(false);
    };

    // SOS trigger sequence
    const triggerSOSAlert = (reason) => {
        setSosReason(reason);
        setSosCountdown(3); // 3 seconds count down
        setSosActive(true);
        // Clean up normal navigations
        setJourneyActive(false);
        setDeadManActive(false);
    };

    // SOS Countdown logic
    useEffect(() => {
        let timer;
        if (sosActive && sosCountdown > 0) {
            timer = setTimeout(() => {
                setSosCountdown(prev => prev - 1);
            }, 1000);
        } else if (sosActive && sosCountdown === 0) {
            // SOS mode engaged!
            playSiren();
            
            // Compile simulated SMS alerts
            const lat = userLocation[0].toFixed(6);
            const lng = userLocation[1].toFixed(6);
            const smsText = `🚨 AEGISNET EMERGENCY SOS! 🚨\nUser: Alex Jenkins (Critical Distress)\nCoordinates: Lat ${lat}, Lng ${lng}\nReason: ${sosReason || "Manual SOS Action"}\nBattery: 84%\nTrack Route: http://aegisnet.org/track/alex_j`;
            
            const newAlerts = contacts.map(c => ({
                id: Date.now() + Math.random().toString(),
                contactName: c.name,
                phone: c.phone,
                role: c.role,
                message: smsText,
                sentTime: new Date().toLocaleTimeString()
            }));
            
            setSentAlerts(newAlerts);
            
            // Show standard browser notification if permitted
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("AEGISNET: SOS TRIGGERED!", {
                    body: `Distress alert dispatched to ${contacts.length} emergency contacts!`,
                    icon: "/favicon.ico"
                });
            }
        }
        return () => clearTimeout(timer);
    }, [sosActive, sosCountdown, playSiren, userLocation, contacts, sosReason]);

    // Dead Man's Switch countdown timer
    useEffect(() => {
        if (deadManActive && deadManTime > 0) {
            deadManIntervalRef.current = setInterval(() => {
                setDeadManTime(prev => {
                    if (prev <= 1) {
                        clearInterval(deadManIntervalRef.current);
                        // Trigger SOS!
                        triggerSOSAlert("Dead Man's Switch Check-in Timeout");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(deadManIntervalRef.current);
    }, [deadManActive]);

    // Live moving simulator for circle family members
    useEffect(() => {
        const interval = setInterval(() => {
            setCircleMembers(prev => prev.map(m => {
                // slightly drift coords
                const latOffset = (Math.random() - 0.5) * 0.0004;
                const lngOffset = (Math.random() - 0.5) * 0.0004;
                const newCoords = [m.coords[0] + latOffset, m.coords[1] + lngOffset];
                
                // simulate battery slow discharge
                const newBattery = Math.max(5, m.battery - (Math.random() > 0.8 ? 1 : 0));
                
                return {
                    ...m,
                    coords: newCoords,
                    battery: newBattery
                };
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Continuous voice recognition controller
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        if (voiceMonitoring) {
            try {
                const rec = new SpeechRecognition();
                rec.continuous = true;
                rec.interimResults = false;
                rec.lang = 'en-US';

                rec.onresult = (event) => {
                    const result = event.results[event.results.length - 1];
                    const text = result[0].transcript.toLowerCase();
                    setRecognizedWords(text);

                    // Red Distress Flags
                    const redKeywords = [
                        "aegis help", "aegis net", "call the police", "emergency", 
                        "being followed", "help me now", "save me", "please help"
                    ];
                    
                    if (redKeywords.some(keyword => text.includes(keyword))) {
                        triggerSOSAlert("Voice Distress Phrase Recognized");
                    }
                };

                rec.onerror = (e) => {
                    console.error("Speech Recognition Error", e);
                };

                rec.onend = () => {
                    // Loop start
                    if (voiceMonitoring && speechRecognitionRef.current) {
                        try { speechRecognitionRef.current.start(); } catch(e){}
                    }
                };

                rec.start();
                speechRecognitionRef.current = rec;

                // Also initialize real mic analysis for screams (Web Audio)
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        const source = audioCtx.createMediaStreamSource(stream);
                        const analyser = audioCtx.createAnalyser();
                        analyser.fftSize = 256;
                        source.connect(analyser);

                        const bufferLength = analyser.frequencyBinCount;
                        const dataArray = new Uint8Array(bufferLength);
                        audioContextRef.current = { ctx: audioCtx, analyser, stream };

                        let screamThrottle = false;
                        const checkScream = () => {
                            if (!audioContextRef.current) return;
                            analyser.getByteFrequencyData(dataArray);
                            let sum = 0;
                            for(let i=0; i<bufferLength; i++) sum += dataArray[i];
                            const average = sum / bufferLength;
                            
                            // Map decibels for UI display
                            setDecibels(Math.round(average));

                            // Loud scream anomaly threshold (>85 out of 255)
                            if (average > 85 && !screamThrottle) {
                                screamThrottle = true;
                                triggerSOSAlert("Loud Scream Anomaly Detected");
                                setTimeout(() => { screamThrottle = false; }, 3000);
                            }
                            volumeIntervalRef.current = requestAnimationFrame(checkScream);
                        };
                        checkScream();
                    })
                    .catch(err => {
                        console.warn("Speech volume check blocked or unsupported", err);
                    });

            } catch(e) {
                console.error("Web Speech activation failed", e);
            }
        } else {
            // Stop listeners
            if (speechRecognitionRef.current) {
                speechRecognitionRef.current.onend = null;
                try { speechRecognitionRef.current.stop(); } catch(e){}
                speechRecognitionRef.current = null;
            }
            if (volumeIntervalRef.current) {
                cancelAnimationFrame(volumeIntervalRef.current);
                volumeIntervalRef.current = null;
            }
            if (audioContextRef.current) {
                try {
                    audioContextRef.current.stream.getTracks().forEach(track => track.stop());
                    audioContextRef.current.ctx.close();
                } catch(e){}
                audioContextRef.current = null;
            }
            setDecibels(0);
            setRecognizedWords('');
        }

        return () => {
            if (speechRecognitionRef.current) {
                speechRecognitionRef.current.onend = null;
                try { speechRecognitionRef.current.stop(); } catch(e){}
            }
            if (volumeIntervalRef.current) cancelAnimationFrame(volumeIntervalRef.current);
            if (audioContextRef.current) {
                try {
                    audioContextRef.current.stream.getTracks().forEach(track => track.stop());
                    audioContextRef.current.ctx.close();
                } catch(e){}
            }
        };
    }, [voiceMonitoring]);

    // Active Simulated Walk Companion Speech Timer
    useEffect(() => {
        let timer;
        if (walkModeActive && !sosActive && currentTab === 'companion') {
            const companionSpeeches = [
                "Hey, I'm right here with you. Just keep a steady, confident pace.",
                "How are you doing? Remember to check your surroundings. If there is a car or pedestrian nearby, let me know.",
                "I've got the map loaded. We are walking along the high-lighting path. You're doing great.",
                "If anyone approaches you, click the 'Fake Call' button immediately to start our mock dialog.",
                "I'm keeping Emma and your Dad updated. Your live route has a 98 percent safety rating."
            ];
            
            let speakIndex = 0;
            const speakRoutine = () => {
                if (!walkModeActive || sosActive) return;
                const text = companionSpeeches[speakIndex % companionSpeeches.length];
                
                // Add message to chat log
                setMessages(prev => [...prev, {
                    sender: 'ai',
                    text: `[Active Walk Companion] ${text}`,
                    time: new Date()
                }]);
                
                speakText(text);
                speakIndex++;
                
                // schedule next in 30 seconds
                timer = setTimeout(speakRoutine, 25000);
            };
            
            timer = setTimeout(speakRoutine, 3000); // Start first chat call after 3s
        }
        return () => clearTimeout(timer);
    }, [walkModeActive, sosActive, currentTab]);

    // Fake call duration timer
    useEffect(() => {
        if (showFakeCall && fakeCallState === 'connected') {
            fakeCallIntervalRef.current = setInterval(() => {
                setFakeCallTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(fakeCallIntervalRef.current);
            setFakeCallTime(0);
        }
        return () => clearInterval(fakeCallIntervalRef.current);
    }, [showFakeCall, fakeCallState]);

    // Request notification permissions on boot
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Trigger fake incoming call
    const handleTriggerFakeCall = (caller = "Dad") => {
        setFakeCallCaller(caller);
        setFakeCallState('ringing');
        setShowFakeCall(true);
        playRingtone();
    };

    const handleAcceptCall = () => {
        stopRingtone();
        setFakeCallState('connected');
        // Let the fake caller speak to make it sound incredibly realistic
        speakText(`Hey! Glad I reached you. Are you on your way back from campus? Let me stay on the line with you until you get home.`);
    };

    const handleDeclineCall = () => {
        stopRingtone();
        stopSpeaking();
        setShowFakeCall(false);
    };

    // Safe PIN verification
    const handlePinSubmit = () => {
        if (pinInput === userPin) {
            setDeadManActive(false);
            setPinInput('');
            setShowPinPad(false);
            setPinError('');
            
            // alert sound for confirmation
            if ('vibrate' in navigator) navigator.vibrate([100]);
        } else {
            setPinError('Invalid PIN! Try again.');
            setPinInput('');
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        }
    };

    const handlePinCancel = () => {
        setShowPinPad(false);
        setPinInput('');
        setPinError('');
    };

    // Chat handling
    const handleSendMessage = (textToSend = null) => {
        const text = textToSend || inputValue;
        if (!text.trim()) return;

        const userMsg = { sender: 'user', text: text, time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Generate context-aware AI response
        setTimeout(() => {
            const aiResp = generateAIResponse(text);
            const aiMsg = { sender: 'ai', text: aiResp.text, options: aiResp.options, time: new Date() };
            setMessages(prev => [...prev, aiMsg]);
            
            // Speak if walk companion mode is active
            if (walkModeActive || speechSynthesizing) {
                speakText(aiResp.text);
            }
        }, 750);
    };

    const generateAIResponse = (userMsg) => {
        const msg = userMsg.toLowerCase();
        
        if (msg.includes("follow") || msg.includes("stalk") || msg.includes("behind me")) {
            return {
                text: "I understand you're feeling unsafe. Stay calm. \n1. Do not head home directly (don't reveal where you live). \n2. Turn towards a well-lit main street immediately. There's Broadway just 300m ahead. \n3. Look for an open business (e.g., the 24/7 deli on the corner). \n4. Keep talking to me or click 'Fake Call' to deter them. Would you like me to dial a Fake Call now?",
                options: ["Yes, start Fake Call", "Check map for safe zones", "Pre-draft emergency SMS"]
            };
        }
        
        if (msg.includes("help") || msg.includes("emergency") || msg.includes("danger") || msg.includes("trigger sos")) {
            return {
                text: "I am ready. If you are in immediate danger, please double-tap the RED SOS button. \nOtherwise, let's keep talking. Head to a populated area. I'm tracking your location and have pre-drafted an emergency text for your guardians.",
                options: ["Trigger SOS Now", "Draft Emergency Note", "Find closest safe zone"]
            };
        }
        
        if (msg.includes("de-escalate") || msg.includes("confront") || msg.includes("guy") || msg.includes("aggressive")) {
            return {
                text: "De-escalation guidelines in progress: \n- Maintain a distance of at least 2 arm-lengths. \n- Keep your hands open and visible. \n- Avoid raising your voice or sounding combative. Speak in a quiet, firm tone.\n- Do not threaten or make sudden movements.\n- Back away slowly toward a public area. Do not turn your back completely if they are close.",
                options: ["Start Walk Companion", "Trigger Fake Call"]
            };
        }
        
        if (msg.includes("talk") || msg.includes("walk") || msg.includes("companion") || msg.includes("scared")) {
            return {
                text: "Let's talk. I'll keep speaking to keep you company and make it clear you are connected to someone. Just repeat after me or reply. How does the street lighting look right now?",
                options: ["It's very dark", "I see some people", "I'm almost at my dorm"]
            };
        }

        if (msg.includes("draft") || msg.includes("note") || msg.includes("dispatch")) {
            return {
                text: `Here is your pre-drafted Emergency Dispatch Note:\n"Emergency Report - AegisNet Secure Node.\nLocation: Lat ${userLocation[0].toFixed(5)}, Lng ${userLocation[1].toFixed(5)} (NYC Washington Sq Park area)\nActive user: Alex Jenkins\nSignal: Manual Dispatch Request\nBattery: 84%\nSituation: High Alert Commute."\n\nClick 'Copy Dispatch Note' below to copy.`,
                options: ["Copy Dispatch Note", "Send to Primary Guardian"]
            };
        }
        
        return {
            text: "I'm here as your AegisNet Safety Companion. You can ask me how to de-escalate a confrontation, request routes to the nearest safe zones, or activate 'Talk to me' mode so I read active conversational prompts to you while you walk.",
            options: ["Find Safe Route", "Show Safety Checklist", "Activate Walk Mode"]
        };
    };

    // Copy dispatch notes to clipboard
    const copyDispatchToClipboard = () => {
        const lat = userLocation[0].toFixed(5);
        const lng = userLocation[1].toFixed(5);
        const dispatchText = `Emergency Report - AegisNet Secure Node.\nLocation: Lat ${lat}, Lng ${lng}\nActive user: Alex Jenkins\nSignal: Manual Dispatch Request\nBattery: 84%\nSituation: Alert Safe Route Commute.`;
        
        navigator.clipboard.writeText(dispatchText)
            .then(() => {
                alert("Dispatch note copied to clipboard! Ready to paste into SMS or Emergency dispatch portals.");
            })
            .catch(err => {
                console.error("Clipboard copy failed", err);
            });
    };

    // Live GPS Journey Simulator
    const startJourneySim = (dest, routeType) => {
        setSelectedDestination(dest);
        setSelectedRoute(routeType);
        setJourneyActive(true);
        setJourneyStep(0);
        
        // Define coordinates list for route simulation based on destination & type
        let coordinates = [];
        const start = [40.730823, -73.997330];
        const end = dest.coords;
        
        if (routeType === 'safe') {
            // Broadway Route (Emerald Safe Route - well-lit, open shops)
            coordinates = [
                start,
                [40.730221, -73.993422], // Corner shop
                [40.731422, -73.991201], // Well-lit Ave
                [40.733500, -73.991100], // High-traffic square
                end
            ];
        } else if (routeType === 'standard') {
            coordinates = [
                start,
                [40.731112, -73.996112],
                [40.733000, -73.994000],
                end
            ];
        } else {
            // Hazard route (Poor lighting, short but risky)
            coordinates = [
                start,
                [40.729986, -73.996112], // dark alley entrance
                [40.730000, -73.994000], // unsafe pin location
                [40.733000, -73.993000],
                end
            ];
        }

        let step = 0;
        journeyIntervalRef.current = setInterval(() => {
            step++;
            if (step >= coordinates.length) {
                clearInterval(journeyIntervalRef.current);
                setJourneyActive(false);
                setSelectedDestination(null);
                setUserLocation(end);
                alert("🎉 Safe Journey Completed! You have reached your destination securely.");
            } else {
                setJourneyStep(step);
                setUserLocation(coordinates[step]);
                
                // If walking along hazard route, AI Companion warns user!
                if (routeType === 'hazard' && step === 1) {
                    setMessages(prev => [...prev, {
                        sender: 'ai',
                        text: "⚠️ WARNING: You have entered a reported poor lighting zone. I suggest checking in or enabling Edge AI Voice listening now.",
                        time: new Date()
                    }]);
                    speakText("Warning, you have entered a poorly lit zone. Check your surroundings.");
                }
            }
        }, 1000);
    };

    const stopJourneySim = () => {
        clearInterval(journeyIntervalRef.current);
        setJourneyActive(false);
        setSelectedDestination(null);
        setUserLocation([40.730823, -73.997330]); // Reset to start
    };

    // Submitting a new hazard report from Map double-click/long-press
    const handleSubmitHazard = (e) => {
        e.preventDefault();
        if (!reportLatLng) return;
        
        const newHazard = {
            id: 'h_' + Date.now(),
            lat: reportLatLng[0],
            lng: reportLatLng[1],
            type: reportType,
            desc: reportDesc || `Reported ${reportType} flag.`,
            severity: reportType === 'Suspicious Activity' ? 'red' : 'amber'
        };
        
        setHazards(prev => [...prev, newHazard]);
        setReportLatLng(null);
        setReportDesc('');
        alert(`🚨 Hazard report for "${reportType}" added successfully! Map updated.`);
    };

    // Contact CRUD
    const handleAddContact = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const name = fd.get('name');
        const phone = fd.get('phone');
        const relation = fd.get('relation');
        const role = fd.get('role');
        
        if (!name || !phone) return;

        const newContact = {
            id: 'c_' + Date.now(),
            name,
            phone,
            relation,
            role
        };

        setContacts(prev => [...prev, newContact]);
        e.target.reset();
    };

    const handleDeleteContact = (id) => {
        setContacts(prev => prev.filter(c => c.id !== id));
    };

    // Safe cancel SOS button
    const handleCancelSOS = () => {
        stopSiren();
        setSosActive(false);
        setSosCountdown(0);
        setSentAlerts([]);
    };

    return (
        <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 dark:bg-navy-950">
            {showSplash && (
                <SplashScreen 
                    onEnter={() => setShowSplash(false)} 
                    onQuickAction={(actionType) => {
                        setShowSplash(false);
                        if (actionType === 'sos') triggerSOSAlert('Splash Launcher Emergency');
                        if (actionType === 'call') handleTriggerFakeCall('Mom');
                        if (actionType === 'cover') setShowCoverScreen(true);
                    }}
                />
            )}
            
            {/* Desktop Navigation Sidebar / Mobile Title Header */}
            <aside className="w-full md:w-80 bg-white dark:bg-navy-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-navy-800 flex flex-col z-20 shadow-md">
                
                {/* Header Brand */}
                <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-navy-800 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 text-white md:bg-none md:text-slate-800 md:dark:text-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                            <Icon name="shield-alert" className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-base leading-tight tracking-tight">AegisNet</h1>
                            <p className="text-[10px] text-slate-300 md:text-slate-500 md:dark:text-slate-400 font-medium">COMMUNITY SAFETY GUARDIAN</p>
                        </div>
                    </div>
                    
                    {/* Top utility widgets */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700 transition"
                            title="Toggle Light/Dark Theme"
                        >
                            <Icon name={darkMode ? "sun" : "moon"} size={18} />
                        </button>
                    </div>
                </div>

                {/* Dashboard Overall Status Alert Indicator */}
                <div className="p-4 border-b border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/50">
                    <div className="flex items-center gap-3 bg-white dark:bg-navy-800/80 p-3 rounded-xl border border-slate-100 dark:border-navy-700/50 shadow-sm">
                        <div className="relative">
                            <span className={`flex h-3 w-3 rounded-full ${sosActive ? 'bg-red-500 animate-ping-slow' : 'bg-emerald-500 animate-pulse'}`}></span>
                            <span className={`absolute top-0 right-0 inline-flex rounded-full h-3 w-3 ${sosActive ? 'bg-red-600' : 'bg-emerald-500'}`}></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Device Status</div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                {sosActive ? 'CRITICAL SOS SIGNALING' : deadManActive ? 'DMS active - Monitoring' : 'Secure Walk Active'}
                            </div>
                        </div>
                        {voiceMonitoring && (
                            <div className="flex items-center gap-1 bg-red-500/10 text-red-500 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                                <Icon name="mic" size={10} />
                                LISTENING
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab selections */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar hidden md:block">
                    <button 
                        onClick={() => setCurrentTab('shield')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-sm transition-all duration-150 ${currentTab === 'shield' ? 'bg-navy-900 text-white dark:bg-red-600 dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                    >
                        <Icon name="map" size={20} />
                        <span>Interactive Hazard Map</span>
                    </button>
                    <button 
                        onClick={() => setCurrentTab('companion')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-sm transition-all duration-150 ${currentTab === 'companion' ? 'bg-navy-900 text-white dark:bg-red-600 dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                    >
                        <Icon name="message-square" size={20} />
                        <span>Guardian AI Chat</span>
                        {walkModeActive && <span className="ml-auto w-2 h-2 rounded-full bg-red-500"></span>}
                    </button>
                    <button 
                        onClick={() => setCurrentTab('switch')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-sm transition-all duration-150 ${currentTab === 'switch' ? 'bg-navy-900 text-white dark:bg-red-600 dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                    >
                        <Icon name="clock" size={20} />
                        <span>Dead Man Switch & PIN</span>
                        {deadManActive && <span className="ml-auto text-xs px-2 py-0.5 rounded bg-amber-500 text-white font-mono">{Math.floor(deadManTime/60)}:{(deadManTime%60).toString().padStart(2,'0')}</span>}
                    </button>
                    <button 
                        onClick={() => setCurrentTab('circle')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-sm transition-all duration-150 ${currentTab === 'circle' ? 'bg-navy-900 text-white dark:bg-red-600 dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'}`}
                    >
                        <Icon name="users" size={20} />
                        <span>Guardian Circle</span>
                        <span className="ml-auto text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 font-bold">{contacts.length}</span>
                    </button>
                </nav>

                {/* Micro-Panel: Direct Stealth Actions near bottom (Thumb Zone) */}
                <div className="p-4 border-t border-slate-100 dark:border-navy-800 grid grid-cols-2 gap-2 bg-slate-50 dark:bg-navy-900">
                    <button 
                        onClick={() => handleTriggerFakeCall('Mom')}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 transition shadow-sm font-bold text-xs"
                    >
                        <Icon name="phone" className="text-emerald-500 mb-1" size={18} />
                        Fake Call
                    </button>
                    <button 
                        onClick={() => setShowCoverScreen(true)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 transition shadow-sm font-bold text-xs"
                    >
                        <Icon name="eye-off" className="text-amber-500 mb-1" size={18} />
                        Cover Screen
                    </button>
                </div>
            </aside>

            {/* Main Interactive Screen Frame */}
            <main className="flex-1 flex flex-col relative overflow-hidden h-full">
                
                {/* Dynamic Content Switching Panels */}
                <div className="flex-1 relative overflow-hidden">
                    {currentTab === 'shield' && (
                        <ShieldTab 
                            userLocation={userLocation}
                            setUserLocation={setUserLocation}
                            hazards={hazards}
                            contacts={contacts}
                            selectedDestination={selectedDestination}
                            selectedRoute={selectedRoute}
                            journeyActive={journeyActive}
                            journeyStep={journeyStep}
                            startJourneySim={startJourneySim}
                            stopJourneySim={stopJourneySim}
                            reportLatLng={reportLatLng}
                            setReportLatLng={setReportLatLng}
                            reportType={reportType}
                            setReportType={setReportType}
                            reportDesc={reportDesc}
                            setReportDesc={setReportDesc}
                            handleSubmitHazard={handleSubmitHazard}
                            circleMembers={circleMembers}
                            triggerSOSAlert={triggerSOSAlert}
                            voiceMonitoring={voiceMonitoring}
                            setVoiceMonitoring={setVoiceMonitoring}
                            decibels={decibels}
                        />
                    )}

                    {currentTab === 'companion' && (
                        <CompanionTab 
                            messages={messages}
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            handleSendMessage={handleSendMessage}
                            walkModeActive={walkModeActive}
                            setWalkModeActive={setWalkModeActive}
                            speechSynthesizing={speechSynthesizing}
                            stopSpeaking={stopSpeaking}
                            copyDispatchToClipboard={copyDispatchToClipboard}
                        />
                    )}

                    {currentTab === 'switch' && (
                        <SwitchTab 
                            deadManActive={deadManActive}
                            setDeadManActive={setDeadManActive}
                            deadManTime={deadManTime}
                            setDeadManTime={setDeadManTime}
                            deadManDuration={deadManDuration}
                            setDeadManDuration={setDeadManDuration}
                            showPinPad={showPinPad}
                            setShowPinPad={setShowPinPad}
                            pinInput={pinInput}
                            setPinInput={setPinInput}
                            userPin={userPin}
                            setUserPin={setUserPin}
                            pinError={pinError}
                            handlePinSubmit={handlePinSubmit}
                            handlePinCancel={handlePinCancel}
                            handleTriggerFakeCall={handleTriggerFakeCall}
                            setShowCoverScreen={setShowCoverScreen}
                        />
                    )}

                    {currentTab === 'circle' && (
                        <CircleTab 
                            contacts={contacts}
                            handleAddContact={handleAddContact}
                            handleDeleteContact={handleDeleteContact}
                            circleMembers={circleMembers}
                        />
                    )}
                </div>

                {/* Mobile Bottom Navigation Bar (Thumb Zone) */}
                <div className="md:hidden bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800 grid grid-cols-4 py-2 px-1 z-20 shadow-lg">
                    <button 
                        onClick={() => setCurrentTab('shield')}
                        className={`flex flex-col items-center py-1 transition ${currentTab === 'shield' ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        <Icon name="map" size={20} />
                        <span className="text-[10px] mt-0.5">Map</span>
                    </button>
                    <button 
                        onClick={() => setCurrentTab('companion')}
                        className={`flex flex-col items-center py-1 transition ${currentTab === 'companion' ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        <div className="relative">
                            <Icon name="message-square" size={20} />
                            {walkModeActive && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>}
                        </div>
                        <span className="text-[10px] mt-0.5">AI Chat</span>
                    </button>
                    <button 
                        onClick={() => setCurrentTab('switch')}
                        className={`flex flex-col items-center py-1 transition ${currentTab === 'switch' ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        <Icon name="clock" size={20} />
                        <span className="text-[10px] mt-0.5">Timer</span>
                    </button>
                    <button 
                        onClick={() => setCurrentTab('circle')}
                        className={`flex flex-col items-center py-1 transition ${currentTab === 'circle' ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        <Icon name="users" size={20} />
                        <span className="text-[10px] mt-0.5">Circle</span>
                    </button>
                </div>

                {/* Oversized Critical Action SOS Button Floater (Thumb Zone) */}
                <button 
                    onClick={() => triggerSOSAlert("Manual Quick SOS Action")}
                    className="absolute bottom-16 md:bottom-6 right-6 z-30 w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-red-600/40 animate-sonar"
                    title="INSTANT SOS ALARM"
                >
                    <span className="font-extrabold text-sm tracking-wider">SOS</span>
                </button>
            </main>

            {/* FULL SCREEN EMERGENCY SOS COUNTDOWN & ALERT MODAL */}
            {sosActive && (
                <div className="fixed inset-0 z-50 bg-red-700 text-white flex flex-col items-center justify-center p-6 text-center animate-pulse-fast">
                    {sosCountdown > 0 ? (
                        <div className="space-y-6 max-w-md">
                            <h2 className="text-4xl font-extrabold tracking-tight">PRE-SOS ACTIVE</h2>
                            <p className="text-lg text-red-100 font-medium">Dispatching emergency contacts alerts in...</p>
                            <div className="w-36 h-36 rounded-full bg-white/20 border-4 border-white flex items-center justify-center mx-auto shadow-2xl">
                                <span className="text-7xl font-extrabold font-mono">{sosCountdown}</span>
                            </div>
                            <p className="text-sm text-red-200">Tap CANCEL immediately if this is a mistake.</p>
                            <button 
                                onClick={handleCancelSOS}
                                className="w-full py-4 bg-white text-red-700 rounded-2xl font-black text-lg hover:bg-red-100 transition shadow-lg"
                            >
                                CANCEL SOS SIGNAL
                            </button>
                        </div>
                    ) : (
                        <div className="w-full max-w-lg space-y-6 relative flex flex-col h-full justify-between py-6">
                            <div className="space-y-2">
                                <div className="inline-flex w-16 h-16 rounded-full bg-white text-red-600 items-center justify-center shadow-lg mb-2">
                                    <Icon name="shield-alert" size={32} />
                                </div>
                                <h2 className="text-4xl font-black tracking-tight leading-none">SOS ALARM ACTIVE</h2>
                                <p className="text-red-100 text-sm">AegisNet Beacon Broadcasting Live Geolocation</p>
                            </div>

                            {/* SMS Logs Dispatch Summary */}
                            <div className="bg-black/25 backdrop-blur rounded-2xl p-4 text-left border border-white/10 space-y-3 flex-1 overflow-y-auto no-scrollbar my-4">
                                <div className="text-xs text-red-300 font-bold uppercase tracking-wider">Dispatched Alerts Log</div>
                                {sentAlerts.length > 0 ? (
                                    <div className="space-y-3">
                                        {sentAlerts.map(alert => (
                                            <div key={alert.id} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                <div className="flex justify-between font-bold text-xs">
                                                    <span>{alert.contactName} ({alert.role})</span>
                                                    <span className="text-[10px] text-red-300">{alert.sentTime}</span>
                                                </div>
                                                <p className="text-xs text-red-100 font-mono mt-1 whitespace-pre-line">{alert.message}</p>
                                                <div className="text-[10px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                    SMS SENT (SIMULATED)
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-red-200">Preparing contact pipelines...</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs text-red-200 font-mono">
                                    <span>Location: {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}</span>
                                    <span>Battery: 84%</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={handleCancelSOS}
                                        className="py-4 bg-white text-red-700 rounded-2xl font-black text-sm hover:bg-red-50 transition shadow-lg"
                                    >
                                        I AM SAFE (Enter PIN)
                                    </button>
                                    <a 
                                        href="tel:911" 
                                        className="py-4 bg-black text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black/80 transition shadow-lg"
                                    >
                                        <Icon name="phone-call" size={16} />
                                        CALL 911 DIRECT
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* FAKE INCOMING CALL FULL SCREEN OVERLAY */}
            {showFakeCall && (
                <div className="fixed inset-0 z-50 bg-[#121212] text-white flex flex-col justify-between py-12 px-8 font-sans">
                    {fakeCallState === 'ringing' ? (
                        <>
                            {/* Ringing UI */}
                            <div className="text-center space-y-3 mt-12">
                                <div className="text-xs tracking-widest text-slate-400 font-semibold uppercase">Incoming Call</div>
                                <h3 className="text-4xl font-normal tracking-tight">{fakeCallCaller}</h3>
                                <div className="text-xs text-emerald-500 font-bold tracking-wide animate-pulse">AegisNet Guard Call</div>
                            </div>

                            {/* Call Accept / Decline Buttons (Apple UI mock style) */}
                            <div className="max-w-xs w-full mx-auto grid grid-cols-2 gap-12 mb-12">
                                <button 
                                    onClick={handleDeclineCall}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition">
                                        <Icon name="phone" className="text-white rotate-[135deg]" size={28} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">Decline</span>
                                </button>
                                <button 
                                    onClick={handleAcceptCall}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition animate-bounce">
                                        <Icon name="phone" className="text-white" size={28} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">Accept</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Connected/Active conversation UI */}
                            <div className="text-center space-y-3 mt-12">
                                <h3 className="text-4xl font-normal tracking-tight">{fakeCallCaller}</h3>
                                <div className="text-sm font-mono text-slate-400">
                                    {Math.floor(fakeCallTime / 60)}:{(fakeCallTime % 60).toString().padStart(2, '0')}
                                </div>
                            </div>

                            {/* Active call keypad mockup */}
                            <div className="max-w-xs w-full mx-auto grid grid-cols-3 gap-6 text-center my-6">
                                {['mic-off', 'keypad', 'volume-2', 'plus', 'video', 'contacts'].map((ico, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-1">
                                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-slate-300">
                                            <Icon name={ico === 'keypad' ? 'grid' : ico === 'contacts' ? 'users' : ico} size={20} />
                                        </div>
                                        <span className="text-[10px] text-slate-400 capitalize">{ico.replace('-off','')}</span>
                                    </div>
                                ))}
                            </div>

                            {/* End Call Button */}
                            <div className="flex justify-center mb-12">
                                <button 
                                    onClick={handleDeclineCall}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition">
                                        <Icon name="phone" className="text-white rotate-[135deg]" size={28} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-semibold">End Call</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* STEALTH COVER SCREEN: NOTE PAD APP */}
            {showCoverScreen && (
                <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 flex flex-col font-sans select-none">
                    
                    {/* Header bar looking like mundane notes folder */}
                    <header className="p-4 bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 font-semibold text-sm">
                            <Icon name="chevron-left" size={16} />
                            <span>Notes Folder</span>
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saved Notes</div>
                        
                        {/* Hidden Exit action: Long press this, or double click it, or simple click with disclaimer for judging demo */}
                        <button 
                            onClick={() => setShowCoverScreen(false)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 text-slate-500 dark:text-zinc-400 font-bold"
                            title="Judging Mode: Click to return to Safe App"
                        >
                            Exit Notepad
                        </button>
                    </header>

                    {/* Main notepad splitter */}
                    <div className="flex-1 flex overflow-hidden">
                        
                        {/* Notepad sidebar list */}
                        <aside className="w-1/3 bg-white dark:bg-zinc-850 border-r border-slate-200 dark:border-zinc-700 p-2 space-y-2 overflow-y-auto no-scrollbar">
                            {coverNotes.map(note => (
                                <button
                                    key={note.id}
                                    onClick={() => setActiveCoverNote(note.id)}
                                    className={`w-full text-left p-3 rounded-lg border transition ${activeCoverNote === note.id ? 'border-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/5' : 'border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                                >
                                    <h4 className="font-extrabold text-xs truncate text-yellow-600 dark:text-yellow-500">{note.title}</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-1">{note.content}</p>
                                </button>
                            ))}
                            
                            <button 
                                onClick={() => {
                                    const newNote = {
                                        id: 'n_' + Date.now(),
                                        title: 'New Note ' + (coverNotes.length + 1),
                                        content: ''
                                    };
                                    setCoverNotes([...coverNotes, newNote]);
                                    setActiveCoverNote(newNote.id);
                                }}
                                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 font-bold text-[10px] hover:bg-slate-100 dark:hover:bg-zinc-800"
                            >
                                <Icon name="plus" size={12} /> Add Note
                            </button>
                        </aside>

                        {/* Notepad Text Editor */}
                        <article className="flex-1 bg-white dark:bg-zinc-900 p-4 flex flex-col">
                            {(() => {
                                const activeNote = coverNotes.find(n => n.id === activeCoverNote);
                                if (!activeNote) return null;
                                return (
                                    <>
                                        <input 
                                            type="text" 
                                            value={activeNote.title}
                                            onChange={(e) => {
                                                const title = e.target.value;
                                                setCoverNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, title } : n));
                                            }}
                                            className="w-full font-black text-lg bg-transparent border-0 outline-none text-slate-800 dark:text-zinc-100 mb-2 focus:ring-0"
                                            placeholder="Note Title"
                                        />
                                        <textarea
                                            value={activeNote.content}
                                            onChange={(e) => {
                                                const content = e.target.value;
                                                setCoverNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, content } : n));
                                            }}
                                            className="w-full flex-1 bg-transparent border-0 outline-none resize-none text-xs text-slate-600 dark:text-zinc-300 focus:ring-0 leading-relaxed"
                                            placeholder="Start writing..."
                                        />
                                    </>
                                );
                            })()}
                        </article>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// SUB-TAB COMPONENTS
// ==========================================

// TAB 1: SHIELD (MAP, GPS, HAZARDS, VOICE TRIGGERS)
function ShieldTab({ 
    userLocation, setUserLocation, hazards, contacts,
    selectedDestination, selectedRoute, journeyActive, journeyStep, startJourneySim, stopJourneySim,
    reportLatLng, setReportLatLng, reportType, setReportType, reportDesc, setReportDesc, handleSubmitHazard,
    circleMembers, triggerSOSAlert, voiceMonitoring, setVoiceMonitoring, decibels
}) {
    const mapInstanceRef = useRef(null);
    const routePolylinesRef = useRef({ safe: null, standard: null, hazard: null });
    const hazardMarkersRef = useRef([]);
    const circleMarkersRef = useRef([]);
    const userMarkerRef = useRef(null);

    // Initialize Leaflet Map
    useEffect(() => {
        // Create map element
        const map = L.map('map-container', {
            zoomControl: false
        }).setView(userLocation, 15);

        // Add Standard OSM Tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.control.zoom({ position: 'topleft' }).addTo(map);
        mapInstanceRef.current = map;

        // Custom divIcon for the live user location
        const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-60"></div>
                    <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        // Set user marker
        const userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map);
        userMarkerRef.current = userMarker;

        // Click handler to drop a hazard pin
        map.on('click', (e) => {
            setReportLatLng([e.latlng.lat, e.latlng.lng]);
        });

        return () => {
            map.remove();
        };
    }, []);

    // Update user location marker dynamically during simulation
    useEffect(() => {
        if (userMarkerRef.current && mapInstanceRef.current) {
            userMarkerRef.current.setLatLng(userLocation);
            
            // Keep map panning to center user during live walk journey
            if (journeyActive) {
                mapInstanceRef.current.panTo(userLocation);
            }
        }
    }, [userLocation, journeyActive]);

    // Plot hazard alert pins on the map
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers
        hazardMarkersRef.current.forEach(m => m.remove());
        hazardMarkersRef.current = [];

        // Custom divIcon generator for hazards
        const makeHazardIcon = (severity) => {
            const color = severity === 'red' ? 'bg-red-500 border-red-200' : 'bg-amber-500 border-amber-200';
            return L.divIcon({
                className: 'custom-hazard-marker',
                html: `
                    <div class="relative flex items-center justify-center">
                        <div class="absolute w-6 h-6 ${color} rounded-full animate-ping opacity-45"></div>
                        <div class="w-5 h-5 ${color} rounded-full border-2 text-white flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
        };

        // Render hazards
        hazards.forEach(h => {
            const marker = L.marker([h.lat, h.lng], { icon: makeHazardIcon(h.severity) })
                .bindPopup(`<div class="p-1 font-sans">
                    <strong class="text-xs font-black block">${h.type}</strong>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">${h.desc}</span>
                </div>`)
                .addTo(mapInstanceRef.current);
            hazardMarkersRef.current.push(marker);
        });
    }, [hazards]);

    // Plot Family Circle members on the map
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers
        circleMarkersRef.current.forEach(m => m.remove());
        circleMarkersRef.current = [];

        // Custom divIcon for members
        const makeMemberIcon = (initials, name, colorClass) => {
            const border = colorClass === 'bg-emerald-500' ? 'border-emerald-200' : 'border-amber-200';
            return L.divIcon({
                className: 'custom-member-marker',
                html: `
                    <div class="relative flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full ${colorClass} text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-lg">
                            ${initials}
                        </div>
                        <div class="bg-slate-900/90 text-white text-[8px] px-1 py-0.5 rounded shadow mt-0.5 font-medium whitespace-nowrap">
                            ${name}
                        </div>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
        };

        // Render circle members
        circleMembers.forEach(m => {
            const initials = m.name.split(' ')[0][0] + (m.name.split(' ')[1] ? m.name.split(' ')[1][0] : '');
            const marker = L.marker(m.coords, { icon: makeMemberIcon(initials, m.name.split(' ')[0], m.color) })
                .bindPopup(`<div class="p-1 text-xs">
                    <strong>${m.name}</strong><br/>
                    <span class="text-[10px] text-slate-400">Status: ${m.status} | Batt: ${m.battery}%</span>
                </div>`)
                .addTo(mapInstanceRef.current);
            circleMarkersRef.current.push(marker);
        });
    }, [circleMembers]);

    // Draw route polylines on selection
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Remove old routes
        Object.keys(routePolylinesRef.current).forEach(key => {
            if (routePolylinesRef.current[key]) {
                routePolylinesRef.current[key].remove();
                routePolylinesRef.current[key] = null;
            }
        });

        if (!selectedDestination) return;

        const start = [40.730823, -73.997330];
        const end = selectedDestination.coords;

        // Mock coordinate paths
        const pathSafe = [
            start,
            [40.730221, -73.993422],
            [40.731422, -73.991201],
            [40.733500, -73.991100],
            end
        ];

        const pathStandard = [
            start,
            [40.731112, -73.996112],
            [40.733000, -73.994000],
            end
        ];

        const pathHazard = [
            start,
            [40.729986, -73.996112], // poor lighting area
            [40.730000, -73.994000],
            [40.733000, -73.993000],
            end
        ];

        // Draw and color code routes
        // Safe Route (Green, Thick)
        routePolylinesRef.current.safe = L.polyline(pathSafe, {
            color: '#10b981',
            weight: selectedRoute === 'safe' ? 7 : 4,
            opacity: selectedRoute === 'safe' ? 0.9 : 0.4,
            dashArray: selectedRoute === 'safe' ? '8, 8' : '0'
        }).addTo(mapInstanceRef.current);

        // Standard Route (Amber/Blue)
        routePolylinesRef.current.standard = L.polyline(pathStandard, {
            color: '#3b82f6',
            weight: selectedRoute === 'standard' ? 7 : 4,
            opacity: selectedRoute === 'standard' ? 0.9 : 0.4
        }).addTo(mapInstanceRef.current);

        // Unsafe / Hazard Alley route (Red)
        routePolylinesRef.current.hazard = L.polyline(pathHazard, {
            color: '#f59e0b',
            weight: selectedRoute === 'hazard' ? 7 : 4,
            opacity: selectedRoute === 'hazard' ? 0.9 : 0.4
        }).addTo(mapInstanceRef.current);

        // Zoom map to fit selected route coordinates
        const group = new L.featureGroup([
            routePolylinesRef.current.safe,
            routePolylinesRef.current.standard,
            routePolylinesRef.current.hazard
        ]);
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [40, 40] });

    }, [selectedDestination, selectedRoute]);

    return (
        <div className="h-full w-full flex flex-col relative">
            
            {/* Interactive Leaflet Map Shell */}
            <div className="flex-1 relative">
                <div id="map-container" className="h-full w-full z-10"></div>
                
                {/* Floating GPS Route Configuration Overlay Panel */}
                <div className="absolute top-4 left-4 z-20 max-w-sm w-[calc(100%-2rem)] bg-white/95 dark:bg-navy-900/95 backdrop-blur border border-slate-100 dark:border-navy-800 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Safe-Path AI Router</h3>
                        </div>
                        {journeyActive && (
                            <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                GPS Tracking
                            </span>
                        )}
                    </div>

                    {!journeyActive ? (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Select Destination</label>
                                <select 
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-700 dark:text-slate-200 outline-none font-bold"
                                    onChange={(e) => {
                                        const dest = DESTINATIONS.find(d => d.id === e.target.value);
                                        startJourneySim(dest, 'safe');
                                    }}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Choose your target destination...</option>
                                    {DESTINATIONS.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.dist})</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                                <span className="font-semibold text-slate-500 dark:text-slate-300">Safe-Path AI</span> generates routes prioritized by street lighting coverage, crowd density, and open businesses. Double-click the map anytime to drop safety alerts.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{selectedDestination?.name}</span>
                                    <div className="text-[10px] text-slate-400 mt-0.5">Commute Path: <span className="capitalize font-bold text-emerald-500">{selectedRoute} route</span></div>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono font-bold text-red-500 dark:text-red-400">Step {journeyStep + 1}/5</span>
                                </div>
                            </div>
                            
                            {/* Simulated Route Progress bar */}
                            <div className="w-full bg-slate-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-emerald-500 h-full transition-all duration-500"
                                    style={{ width: `${((journeyStep + 1)/5)*100}%` }}
                                ></div>
                            </div>

                            {/* Selector to manually override route type on the fly */}
                            <div className="grid grid-cols-3 gap-1.5">
                                <button 
                                    onClick={() => startJourneySim(selectedDestination, 'safe')}
                                    className={`py-2 px-1 text-[10px] font-extrabold rounded-lg border transition ${selectedRoute === 'safe' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 dark:bg-navy-800 text-slate-500 border-transparent hover:bg-slate-100'}`}
                                >
                                    🟢 Safe path
                                </button>
                                <button 
                                    onClick={() => startJourneySim(selectedDestination, 'standard')}
                                    className={`py-2 px-1 text-[10px] font-extrabold rounded-lg border transition ${selectedRoute === 'standard' ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-50 dark:bg-navy-800 text-slate-500 border-transparent hover:bg-slate-100'}`}
                                >
                                    🔵 Standard
                                </button>
                                <button 
                                    onClick={() => startJourneySim(selectedDestination, 'hazard')}
                                    className={`py-2 px-1 text-[10px] font-extrabold rounded-lg border transition ${selectedRoute === 'hazard' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 dark:bg-navy-800 text-slate-500 border-transparent hover:bg-slate-100'}`}
                                >
                                    🟡 Unlit Alley
                                </button>
                            </div>

                            <button 
                                onClick={stopJourneySim}
                                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                            >
                                Cancel Navigation
                            </button>
                        </div>
                    )}
                </div>

                {/* Floating Pocket AI Anomaly Audio Wave Widget */}
                <div className="absolute top-4 right-4 z-20 bg-white/95 dark:bg-navy-900/95 border border-slate-100 dark:border-navy-800 rounded-2xl p-3 shadow-xl flex items-center gap-3">
                    <button 
                        onClick={() => setVoiceMonitoring(!voiceMonitoring)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow-md ${voiceMonitoring ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'}`}
                        title={voiceMonitoring ? "Voice monitoring active. Click to turn off." : "Turn on Pocket Voice trigger"}
                    >
                        <Icon name="mic" size={18} />
                    </button>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Edge AI Audio</div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
                            {voiceMonitoring ? 'DISTRESS MONITOR ACTIVE' : 'AUDIO DETECTOR OFF'}
                        </div>
                        {voiceMonitoring && (
                            <div className="flex gap-0.5 items-end h-3 mt-1">
                                {[...Array(6)].map((_, i) => {
                                    // Generate responsive wave height based on decibels or sine wave fallback
                                    const amp = decibels > 0 ? (decibels / 120) * 12 : Math.sin(Date.now() / 200 + i) * 6 + 6;
                                    return (
                                        <div 
                                            key={i} 
                                            className="w-0.5 bg-red-500 rounded-full transition-all duration-75"
                                            style={{ height: `${Math.max(2, amp)}px` }}
                                        ></div>
                                    );
                                })}
                                <span className="text-[8px] text-red-500 font-bold ml-1.5 font-mono">{decibels} dB</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL: SUBMIT HAZARD POPUP (Triggered when map is clicked) */}
                {reportLatLng && (
                    <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-navy-800">
                                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Report Safety Hazard Pin</h3>
                                <button onClick={() => setReportLatLng(null)} className="text-slate-400 hover:text-slate-600">
                                    <Icon name="x" size={18} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmitHazard} className="space-y-3">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Hazard Category</label>
                                    <select 
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-850 text-slate-800 dark:text-slate-100 outline-none font-bold"
                                    >
                                        <option value="Poor Lighting">Poor Lighting</option>
                                        <option value="Aggressive Animals">Aggressive Animals</option>
                                        <option value="Suspicious Activity">Suspicious Activity</option>
                                        <option value="Isolated Pathway">Isolated Pathway</option>
                                        <option value="Other Danger">Other Danger</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Situation Description</label>
                                    <textarea 
                                        value={reportDesc}
                                        onChange={(e) => setReportDesc(e.target.value)}
                                        placeholder="Add brief details about the issue..."
                                        className="w-full text-xs p-3 h-20 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-850 text-slate-800 dark:text-slate-100 outline-none resize-none focus:ring-1 focus:ring-red-500"
                                        required
                                    />
                                </div>

                                <div className="text-[10px] text-slate-400 font-mono">
                                    Location: {reportLatLng[0].toFixed(5)}, {reportLatLng[1].toFixed(5)}
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition shadow-md uppercase tracking-wider"
                                >
                                    Pin Live Alert Map
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// TAB 2: GUARDIAN COMPANION CHAT PANEL
function CompanionTab({ 
    messages, inputValue, setInputValue, handleSendMessage,
    walkModeActive, setWalkModeActive, speechSynthesizing, stopSpeaking, copyDispatchToClipboard
}) {
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom of conversation
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleQuickReply = (text) => {
        handleSendMessage(text);
    };

    return (
        <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-navy-950 font-sans">
            
            {/* Top Companion Controller Header */}
            <div className="p-4 border-b border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 flex items-center justify-between flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-navy-900 flex items-center justify-center text-white shadow-md">
                        <Icon name="message-square" size={20} />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Guardian AI Companion</h2>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active De-escalation Node</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Walk Mode / Speech toggler */}
                    <button 
                        onClick={() => {
                            if (walkModeActive) stopSpeaking();
                            setWalkModeActive(!walkModeActive);
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition shadow-sm ${walkModeActive ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'}`}
                        title="Enable TTS voice to companion you on walks"
                    >
                        <Icon name={walkModeActive ? "volume-2" : "volume-x"} size={14} />
                        <span>Walk Mode</span>
                    </button>
                    
                    <button 
                        onClick={copyDispatchToClipboard}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700 transition"
                        title="Pre-draft emergency dispatch coordinates note"
                    >
                        <Icon name="file-text" size={16} />
                    </button>
                </div>
            </div>

            {/* Conversational Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.map((msg, index) => {
                    const isAI = msg.sender === 'ai';
                    return (
                        <div key={index} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
                            <div className="max-w-[85%] flex items-start gap-2.5">
                                {isAI && (
                                    <div className="w-8 h-8 rounded-lg bg-navy-950 dark:bg-red-600 text-white flex items-center justify-center shadow flex-shrink-0 mt-0.5">
                                        <Icon name="bot" size={16} />
                                    </div>
                                )}
                                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm font-medium ${isAI ? 'bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800 text-slate-700 dark:text-slate-200 rounded-tl-none' : 'bg-navy-900 dark:bg-red-600 text-white rounded-tr-none'}`}>
                                    <p className="whitespace-pre-line">{msg.text}</p>
                                </div>
                            </div>
                            
                            {/* Render Quick-Action Option Cards if present */}
                            {isAI && msg.options && (
                                <div className="flex flex-wrap gap-2 mt-2 ml-10">
                                    {msg.options.map((opt, oIdx) => (
                                        <button
                                            key={oIdx}
                                            onClick={() => {
                                                if (opt === "Copy Dispatch Note") {
                                                    copyDispatchToClipboard();
                                                } else {
                                                    handleQuickReply(opt);
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black border border-slate-200/50 dark:border-navy-700/50 transition-all active:scale-95 shadow-sm"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={chatEndRef}></div>
            </div>

            {/* Chat Input form (Thumb Zone) */}
            <div className="p-4 border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 flex-shrink-0">
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex gap-2"
                >
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Describe your threat, route query, or safety concern..."
                        className="flex-1 bg-slate-50 dark:bg-navy-850 text-xs px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 outline-none focus:border-red-500 font-medium"
                    />
                    <button 
                        type="submit"
                        className="w-12 h-12 bg-navy-900 hover:bg-navy-950 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-lg transition"
                    >
                        <Icon name="send" size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

// TAB 3: DEAD MAN'S SWITCH TIMER & SECURITY PIN CONFIG
function SwitchTab({ 
    deadManActive, setDeadManActive, deadManTime, setDeadManTime, deadManDuration, setDeadManDuration,
    showPinPad, setShowPinPad, pinInput, setPinInput, userPin, setUserPin, pinError, handlePinSubmit, handlePinCancel,
    handleTriggerFakeCall, setShowCoverScreen
}) {
    
    // Quick presets
    const handleSetDuration = (seconds) => {
        setDeadManDuration(seconds);
        setDeadManTime(seconds);
    };

    const handlePinPress = (val) => {
        if (pinInput.length < 4) {
            setPinInput(prev => prev + val);
        }
    };

    const handlePinClear = () => {
        setPinInput('');
    };

    return (
        <div className="h-full w-full flex flex-col p-4 bg-slate-50 dark:bg-navy-950 overflow-y-auto no-scrollbar font-sans space-y-4">
            
            {/* Header branding */}
            <div className="bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md">
                        <Icon name="clock" size={20} />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Journey Check-In Timer</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stealth Dead Man's Switch</p>
                    </div>
                </div>
            </div>

            {/* Countdown / Control Card */}
            <div className="bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800 p-6 rounded-3xl shadow-lg text-center flex flex-col items-center space-y-4">
                
                {!deadManActive ? (
                    <>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-slate-700 dark:text-slate-200">Configure Commute Duration</h3>
                            <p className="text-[10px] text-slate-400">If you do not check-in with your PIN before the timer ends, SOS alerts trigger automatically.</p>
                        </div>

                        {/* Large digital readout */}
                        <div className="text-5xl font-black font-mono text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-navy-950 py-4 px-6 rounded-2xl border border-slate-100 dark:border-navy-850">
                            {Math.floor(deadManDuration / 60)}:{(deadManDuration % 60).toString().padStart(2, '0')}
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
                            {[
                                { label: '10s', val: 10 },
                                { label: '5m', val: 300 },
                                { label: '15m', val: 900 },
                                { label: '30m', val: 1800 }
                            ].map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSetDuration(preset.val)}
                                    className={`py-2 text-xs font-black rounded-xl border transition ${deadManDuration === preset.val ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-slate-50 dark:bg-navy-800 text-slate-500 border-transparent hover:bg-slate-100'}`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom Sliders */}
                        <div className="w-full max-w-xs py-2">
                            <input 
                                type="range" 
                                min="10" 
                                max="3600" 
                                step="10"
                                value={deadManDuration}
                                onChange={(e) => handleSetDuration(parseInt(e.target.value))}
                                className="w-full accent-amber-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1 uppercase">
                                <span>Short demo</span>
                                <span>1 hour</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setDeadManActive(true)}
                            className="w-full max-w-xs py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm tracking-wide transition shadow-lg shadow-amber-500/20"
                        >
                            ARM MONITORING CHECK-IN
                        </button>
                    </>
                ) : (
                    <>
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1.5 text-xs text-red-500 font-black uppercase tracking-wider animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                                Dead Man Switch Armed
                            </div>
                            <p className="text-[10px] text-slate-400">Keep phone accessible. Ready your PIN verification code.</p>
                        </div>

                        {/* Glowing Count down clock */}
                        <div className={`text-6xl font-black font-mono py-4 px-6 rounded-3xl border transition-all duration-300 ${deadManTime < 30 ? 'bg-red-500/10 text-red-500 border-red-500 animate-pulse' : 'bg-amber-500/10 text-amber-500 border-amber-500'}`}>
                            {Math.floor(deadManTime / 60)}:{(deadManTime % 60).toString().padStart(2, '0')}
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                            <button 
                                onClick={() => setShowPinPad(true)}
                                className="py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-xl font-extrabold text-xs transition shadow-md"
                            >
                                Check-in (PIN)
                            </button>
                            <button 
                                onClick={() => setDeadManTime(prev => prev + 300)} // Extend 5 mins
                                className="py-3 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 rounded-xl font-extrabold text-xs border border-slate-200/50 dark:border-navy-700 transition"
                            >
                                +5 Mins (Extend)
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Emergency PIN Input Overlay (Pad style for stress situations) */}
            {showPinPad && (
                <div className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center">
                        <div className="space-y-1">
                            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">Confirm Secure Safe PIN</h3>
                            <p className="text-[10px] text-slate-400">Enter pin code to disarm the emergency distress clock. Default PIN is <span className="font-black text-amber-500">1234</span>.</p>
                        </div>

                        {/* PIN Output Circles */}
                        <div className="flex justify-center gap-4 py-2">
                            {[...Array(4)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`w-4 h-4 rounded-full border-2 transition ${pinInput.length > i ? 'bg-slate-800 dark:bg-white border-slate-800 dark:border-white' : 'border-slate-300 dark:border-navy-700 bg-transparent'}`}
                                ></div>
                            ))}
                        </div>

                        {pinError && <div className="text-red-500 font-bold text-[11px] animate-shake">{pinError}</div>}

                        {/* Numeric Keyboard (Thumb Grid) */}
                        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handlePinPress(num.toString())}
                                    className="w-14 h-14 rounded-full bg-slate-50 dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-black text-lg transition flex items-center justify-center mx-auto shadow-sm"
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                onClick={handlePinClear}
                                className="w-14 h-14 rounded-full text-slate-400 font-extrabold text-xs transition flex items-center justify-center mx-auto hover:text-slate-600"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => handlePinPress('0')}
                                className="w-14 h-14 rounded-full bg-slate-50 dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-black text-lg transition flex items-center justify-center mx-auto shadow-sm"
                            >
                                0
                            </button>
                            <button
                                onClick={handlePinSubmit}
                                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition flex items-center justify-center mx-auto shadow-md"
                            >
                                Enter
                            </button>
                        </div>

                        <button 
                            onClick={handlePinCancel}
                            className="w-full py-3 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Stealth & Utilities Settings Block */}
            <div className="bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800 p-4 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-navy-800">
                    Stealth & Cover Settings
                </h3>

                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-navy-850 p-3 rounded-xl">
                        <div>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Deterrence Caller ID</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Customize fake incoming contact label.</span>
                        </div>
                        <input 
                            type="text"
                            value={userPin}
                            onChange={(e) => setUserPin(e.target.value)}
                            placeholder="PIN code"
                            className="w-16 text-center text-xs p-2 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-800 dark:text-slate-100 outline-none font-bold"
                            maxLength={4}
                            title="Safe PIN deactivator"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => handleTriggerFakeCall('Mom')}
                            className="p-3 border border-slate-200 dark:border-navy-800 rounded-xl bg-slate-50 dark:bg-navy-850 text-slate-700 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-100 transition"
                        >
                            Test Ring (Mom)
                        </button>
                        <button 
                            onClick={() => setShowCoverScreen(true)}
                            className="p-3 border border-slate-200 dark:border-navy-800 rounded-xl bg-slate-50 dark:bg-navy-850 text-slate-700 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-100 transition"
                        >
                            Open Notepad Cover
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// TAB 4: FAMILY TRUSTED CIRCLE & CONTACTS
function CircleTab({ contacts, handleAddContact, handleDeleteContact, circleMembers }) {
    return (
        <div className="h-full w-full flex flex-col p-4 bg-slate-50 dark:bg-navy-950 overflow-y-auto no-scrollbar font-sans space-y-4">
            
            {/* Live Trusted Tracker Status cards */}
            <div className="space-y-2">
                <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider pb-1">
                    Live Guardian Trackers
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {circleMembers.map(member => (
                        <div key={member.id} className="bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center relative">
                                <span className={`w-3.5 h-3.5 rounded-full ${member.color} text-white font-bold text-[8px] flex items-center justify-center border-2 border-white absolute -bottom-1 -right-1`}>
                                    ✔
                                </span>
                                <Icon name="user" className="text-slate-500" size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 block">{member.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono font-bold">{member.battery}% Batt</span>
                                </div>
                                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                    <span>{member.status}</span>
                                    <span className="font-mono text-[9px] text-slate-400">Tracking Active</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contacts Management card */}
            <div className="bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800 p-4 rounded-3xl shadow-sm space-y-4">
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-navy-800">
                    <div>
                        <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">Emergency Contacts</h3>
                        <p className="text-[10px] text-slate-400">These contacts receive automated SMS pings during SOS alerts.</p>
                    </div>
                    <Icon name="users" className="text-slate-400" size={18} />
                </div>

                {/* Contacts CRUD form */}
                <form onSubmit={handleAddContact} className="grid grid-cols-2 gap-2 pb-4 border-b border-dashed border-slate-100 dark:border-navy-800">
                    <input 
                        type="text" 
                        name="name"
                        placeholder="Guardian Name"
                        className="col-span-2 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-850 text-slate-800 dark:text-slate-100 outline-none"
                        required
                    />
                    <input 
                        type="tel" 
                        name="phone"
                        placeholder="Phone (e.g. 555-123-4567)"
                        className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-850 text-slate-800 dark:text-slate-100 outline-none"
                        required
                    />
                    <input 
                        type="text" 
                        name="relation"
                        placeholder="Relation (e.g. Sister)"
                        className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-850 text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <select 
                        name="role"
                        className="col-span-2 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-850 text-slate-700 dark:text-slate-300 outline-none"
                    >
                        <option value="Primary Guardian">Primary Guardian</option>
                        <option value="Local Friend">Local Friend</option>
                        <option value="Police Dispatch">Police Dispatch Liaison</option>
                    </select>
                    <button 
                        type="submit"
                        className="col-span-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm"
                    >
                        Add Secure Contact
                    </button>
                </form>

                {/* Contacts List */}
                <div className="space-y-2">
                    {contacts.map(c => (
                        <div key={c.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-900/50">
                            <div>
                                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 block">{c.name} ({c.relation})</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{c.phone} | <span className="font-bold text-red-500 dark:text-red-400">{c.role}</span></span>
                            </div>
                            <button 
                                onClick={() => handleDeleteContact(c.id)}
                                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition"
                            >
                                <Icon name="trash-2" size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Render React App
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
