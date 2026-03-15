import React, { useState, useEffect, useRef } from 'react';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date("March 28, 2026 09:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        mins: Math.floor((difference / 1000 / 60) % 60),
        secs: Math.floor((difference / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 md:gap-6 justify-center my-10"> 
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="glass-gloss bg-black/20 border border-white/10 w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-2xl mb-2 backdrop-blur-md">
            <span className="text-lg md:text-3xl font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] text-cyan-400 font-bold">{label}</span>
        </div>
      ))}
    </div>
  );
};

const StatusOverlay = ({ status, onClose, message }) => {
  if (status === 'idle' || status === 'submitting') {
    return status === 'submitting' ? (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="text-cyan-400 text-xl animate-pulse tracking-[0.5em] font-bold uppercase">Processing...</div>
      </div>
    ) : null;
  }

  const isSuccess = status === 'success' || status === 'found';
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
      <div className={`max-w-md w-full glass-gloss border-2 p-12 text-center rounded-[3rem] ${isSuccess ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}`}>
        <h2 className={`text-3xl font-black mb-6 uppercase ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
          {status === 'success' ? 'Confirmed' : status === 'found' ? 'Team Found' : 'Error'}
        </h2>
        <p className="text-white text-xs mb-10 leading-relaxed font-medium">
          {message}
        </p>
        <button 
          onClick={onClose}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95 ${isSuccess ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-red-500 text-white hover:bg-red-400'}`}
        >
          {isSuccess ? 'Return' : 'Retry'}
        </button>
      </div>
    </div>
  );
};

const GlassCard = ({ title, color, children, delay }) => (
  <div 
    className="animate-float relative overflow-hidden glass-gloss bg-white/10 border border-white/20 rounded-[2.5rem] p-8 md:p-12 mb-12 transition-all duration-700 hover:bg-white/15 hover:border-white/40"
    style={{ animationDelay: delay }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    <h2 className={`relative z-10 text-xl md:text-2xl font-bold mb-6 tracking-tighter ${color} drop-shadow-lg uppercase`}>
      {title}
    </h2>
    <div className="relative z-10 text-[10px] md:text-xs text-white/90 leading-relaxed">
      {children}
    </div>
  </div>
);

const InputField = ({ label, placeholder, type = "text", required, name, maxLength }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-[8px] uppercase tracking-widest text-white/60 ml-1">
      {label} {required && <span className="text-pink-500">*</span>}
    </label>
    <input 
      name={name}
      type={type} 
      placeholder={placeholder} 
      required={required}
      maxLength={maxLength}
      className="bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400 transition-all placeholder:opacity-20 text-[10px] w-full" 
    />
  </div>
);

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // CHANGED: Default state starts with 2 members
  const [members, setMembers] = useState([1, 2]);
  const [status, setStatus] = useState('idle'); 
  const [overlayMessage, setOverlayMessage] = useState('');
  
  // Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [leaderEmail, setLeaderEmail] = useState('');
  const [editPin, setEditPin] = useState('');
  
  const formRef = useRef(null);

  // YOUR GOOGLE APPS SCRIPT URL HERE
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbywnfM4jzNx6z5-ZQcuoCeNjabAZolJO6ghjoAHsUkT952fmfmd2k_oce74TwzNXgLH/exec";

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScroll <= 0 ? 0 : window.scrollY / totalScroll;
      setScrollProgress(progress);
      document.documentElement.style.setProperty('--scroll', progress.toFixed(4));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    const formDataObj = Object.fromEntries(new FormData(e.target));
    const payload = {
      action: isEditMode ? 'update' : 'register',
      email: isEditMode ? leaderEmail : formDataObj['Member1_Email'],
      pin: isEditMode ? editPin : formDataObj['Edit_PIN'], 
      formData: formDataObj
    };

    const sendData = new FormData();
    sendData.append("payload", JSON.stringify(payload));

    try {
      const response = await fetch(SCRIPT_URL, { 
        method: 'POST', 
        body: sendData
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setOverlayMessage(isEditMode ? 'Team details updated successfully.' : 'Your team has been successfully registered. See you on March 28th.');
        setStatus('success');
        if (!isEditMode) e.target.reset();
        
        setIsEditMode(false);
        setLeaderEmail('');
        setEditPin('');
        setMembers([1, 2]); // Reset to 2 members after submission
      } else {
        throw new Error(result.message || "Operation failed");
      }
    } catch (err) {
      setOverlayMessage(err.message || 'Critical error during processing. Please check your connection.');
      setStatus('error');
    }
  };

  const handleVerifyUnlock = async () => {
    if (!leaderEmail || !editPin) return;
    setStatus('submitting');
    
    const payload = { action: 'verifyEdit', email: leaderEmail, pin: editPin };
    
    const sendData = new FormData();
    sendData.append("payload", JSON.stringify(payload));

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: sendData
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setStatus('idle');
        setIsEditMode(true);
        
        const data = result.data;
        if (formRef.current) {
          Object.keys(data).forEach(key => {
            if (formRef.current.elements[key]) {
              formRef.current.elements[key].value = data[key];
            }
          });
        }
        
        let count = 1;
        while(data[`Member${count+1}_Name`]) count++;
        // CHANGED: Math.max ensures it never drops below 2 fields during edit
        setMembers(Array.from({length: Math.max(2, count)}, (_, i) => i + 1));
        
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setOverlayMessage(err.message || 'Failed to verify team. Check your Email and PIN.');
      setStatus('error');
    }
  };

  const checkRegistration = async () => {
    const email = document.getElementById('checkEmail').value;
    if (!email) return;
    setStatus('submitting');
    
    const payload = { action: 'check', email: email };
    
    const sendData = new FormData();
    sendData.append("payload", JSON.stringify(payload));

    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: sendData
      });
      
      const data = await res.json();
      if (data.status === 'found') {
        setOverlayMessage(`Team "${data.team}" is registered.`);
        setStatus('found');
      } else {
        setOverlayMessage(data.message || 'This email is not linked to any registered team.');
        setStatus('error');
      }
    } catch (err) {
      setOverlayMessage('Connection failed. Try again later.');
      setStatus('error');
    }
  };

  const addMember = () => members.length < 5 && setMembers([...members, members.length + 1]);
  
  // CHANGED: Only allow removing if there are more than 2 members
  const removeMember = () => members.length > 2 && setMembers(members.slice(0, -1));

  const overlayAlpha = 0.4 + (scrollProgress * 0.4);
  const sunsetColor = `rgba(${255 - scrollProgress * 150}, ${100 - scrollProgress * 100}, ${50 + scrollProgress * 50}, ${overlayAlpha})`;
  const nightColor = `rgba(${20 - scrollProgress * 20}, ${10 - scrollProgress * 10}, ${40 + scrollProgress * 20}, 0.9)`;

  return (
    <div className="relative min-h-screen w-full selection:bg-pink-500 selection:text-white">
      
      <StatusOverlay status={status} message={overlayMessage} onClose={() => setStatus('idle')} />

      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-300 ease-out dynamic-sunset"
        style={{ 
          backgroundImage: `linear-gradient(${sunsetColor}, ${nightColor}), url('unnamed.jpg')`,
          backgroundPosition: `50% ${scrollProgress * 100}%`
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto py-20 px-6">
        
        <header className="text-center mb-32 h-[90vh] flex flex-col justify-center items-center w-full">
          {/* The fix: text-[10vw] for mobile, scaling up gracefully on larger screens */}
          <h1 className="text-[10vw] sm:text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tighter text-white drop-shadow-[0_15px_40px_rgba(0,0,0,1)] uppercase leading-none whitespace-nowrap">
            RETRO<span className="text-pink-500">HACK</span>
          </h1>
          <Countdown />
          <div className="mt-4 flex flex-col items-center gap-4">
            <p className="text-cyan-400 text-[10px] tracking-[0.5em] animate-pulse uppercase font-bold">
              Scroll Down
            </p>
            <div className="w-[2px] h-16 bg-gradient-to-b from-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          </div>
        </header>

        <GlassCard title="ABOUT RETROHACK" color="text-pink-400" delay="0s">
          <p className="mb-4">
            RetroHack is an 8-hour long hackathon organized by the <span className="text-white font-bold">CSI UEMK Student Chapter</span> to test the mettle of students between the two IEM campuses.
          </p>
          <p>
            The event is scheduled for <span className="text-cyan-400">28th March, 2026, </span><span className="text-yellow-400">9:00 AM onwards</span>. Prepare your logic, set your screens and prepare for 28th!
          </p>
        </GlassCard>

        <GlassCard title={isEditMode ? "EDITING REGISTRATION" : "REGISTRATION PANEL"} color={isEditMode ? "text-orange-400" : "text-cyan-400"} delay="0.2s">
          {isEditMode && (
             <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/50 rounded-xl text-orange-400 text-xs font-bold tracking-widest uppercase">
               Editing as: {leaderEmail}
             </div>
          )}
          
          <form ref={formRef} className="space-y-12" onSubmit={handleSubmit}>
            <div className="p-6 bg-white/5 border border-white/20 rounded-2xl flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Team Name" name="TeamName" placeholder="ENTER TEAM NAME" required={true}/>
                <InputField label="Campus Name" name="CampusName" placeholder="ENTER CAMPUS NAME" required={true}/>
              </div>
              {!isEditMode && (
                <div className="mt-2 border-t border-white/10 pt-4">
                   <p className="text-[9px] text-pink-400 mb-2 uppercase tracking-widest font-bold">Create a Secret PIN to edit your form later</p>
                   <InputField label="Secret Edit PIN" name="Edit_PIN" type="password" placeholder="e.g. 4040" required={true} maxLength={6}/>
                </div>
              )}
            </div>

            {members.map((num) => (
              <div key={num} className="space-y-8 pt-10 border-t border-white/30 first:border-t-0 first:pt-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-white text-sm tracking-widest opacity-80 ">MEMBER {num} DETAILS </h3>
                  {num === 1 && <span className="text-[10px] border border-green-500 text-green-500 px-2 py-1 rounded tracking-tighter bg-green-500/10 font-bold">TEAM_LEADER</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Name" name={`Member${num}_Name`} placeholder="Full Name" required={true}/>
                  <InputField label="Email" name={`Member${num}_Email`} placeholder="e.g. johndoe@example.com" type="email" required={true}/>
                  <InputField label="Mobile" name={`Member${num}_Mobile`} placeholder="Contact No." required={true}/>
                  <InputField label="Year" name={`Member${num}_Year`} placeholder="e.g. 2nd Year" required={true}/>
                  <InputField label="Department" name={`Member${num}_Dept`} placeholder="e.g. CSE" required={true}/>
                  <InputField label="Enrolment ID" name={`Member${num}_ID`} placeholder="Registration No." required={true}/>
                </div>
              </div>
            ))}
            
            <div className="flex flex-col gap-4 pt-6">
              <div className="flex gap-4">
                {members.length < 5 && (
                  <button type="button" onClick={addMember} className="flex-1 bg-white/5 border border-white/20 text-white py-4 rounded-xl hover:bg-white/20 transition-all text-[9px] font-bold tracking-widest uppercase active:scale-95">
                    + Add Member ({members.length}/5)
                  </button>
                )}
                {/* CHANGED: Condition ensures button only shows if there are more than 2 members */}
                {members.length > 2 && (
                  <button type="button" onClick={removeMember} className="flex-1 bg-red-500/10 border border-red-500/20 text-red-400 py-4 rounded-xl hover:bg-red-500/20 transition-all text-[9px] font-bold tracking-widest uppercase active:scale-95">
                    - Remove Member
                  </button>
                )}
              </div>
              <button 
                type="submit" 
                className={`w-full font-black py-6 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all uppercase tracking-widest text-xs active:scale-95 disabled:opacity-50 ${isEditMode ? 'bg-orange-400 text-black hover:bg-orange-300' : 'bg-cyan-500 text-black hover:bg-pink-500 hover:text-white'}`}
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Processing...' : (isEditMode ? 'Update Registration' : 'Register')}
              </button>
            </div>
          </form>
        </GlassCard>

        {!isEditMode && (
          <GlassCard title="EDIT REGISTRATION" color="text-orange-400" delay="0.3s">
            <div className="flex flex-col gap-6">
              <p className="text-white/60 text-[10px] leading-relaxed">Made a typo? Enter the Team Leader's email and your Secret PIN to unlock your registration.</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  placeholder="Leader Email" 
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-orange-400 transition-all placeholder:opacity-20 text-[10px]"
                />
                <input 
                  type="password"
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  placeholder="Secret PIN" 
                  maxLength={6}
                  className="w-full sm:w-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-orange-400 transition-all placeholder:opacity-20 text-[10px] text-center"
                />
                <button 
                  onClick={handleVerifyUnlock}
                  className="bg-orange-400 text-black px-8 py-4 rounded-xl font-bold text-[10px] hover:bg-orange-300 transition-all active:scale-95 uppercase tracking-widest"
                >
                  Unlock
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        <GlassCard title="REGISTRATION CHECK" color="text-yellow-400" delay="0.4s">
          <div className="flex flex-col gap-6">
            <p className="text-white/60 text-[10px] leading-relaxed">Verify if your team's registration is active. Enter the Team Leader's email address below.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                id="checkEmail"
                type="email"
                placeholder="leader-comms@grid.com" 
                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-yellow-400 transition-all placeholder:opacity-20 text-[10px]"
              />
              <button 
                onClick={checkRegistration}
                className="bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold text-[10px] hover:bg-yellow-300 transition-all active:scale-95 uppercase tracking-widest"
              >
                Verify
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="CONTACTS" color="text-purple-400" delay="0.5s">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[12px] tracking-tighter">
            {[["Pritam", "7863986430"], ["Ashna", "9874140007"], ["Rupsa", "9831464699"], ["Nakul", "8240309231"], ["Tanishtha", "8584835901"]].map(([name, phone]) => (
              <div key={name} className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-orange-400/50 transition-colors">
                <span className="text-orange-400 uppercase font-bold text-[10px] tracking-widest">{name}</span>
                <span className="text-white font-mono">{phone}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <footer className="h-60 flex flex-col items-center justify-center gap-4 opacity-40 text-center">
          <div className="w-16 h-[1px] bg-white/30" />
          <p className="text-[8px] tracking-[1em] uppercase">RetroHack by CSI UEMK Student Chapter | 2026</p>
          <p className="text-[6px] tracking-widest text-cyan-400">on 28th March, 2026</p>
        </footer>
      </div>
    </div>
  );
}