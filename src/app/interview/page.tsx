"use client";

import { useState, useEffect, useRef } from "react";
import VideoRecorder from "@/components/interview/VideoRecorder";
import { evaluateInterview } from "@/services/gemini-service";
import { InterviewEvaluation } from "@/types/interview";
import Link from "next/link";

import interviewKnowledgeBase from "../../../interviewKnowledgeBase";

export default function InterviewPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewMode, setInterviewMode] = useState<"video" | "audio">("video");
  const [roleTarget, setRoleTarget] = useState("Senior MERN Developer");
  
  // Question Management
  const [questionQueue, setQuestionQueue] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Knowledge Base State
  const [selectedCategory, setSelectedCategory] = useState(interviewKnowledgeBase.categories[0].id);
  const [customQuestion, setCustomQuestion] = useState("");

  const [isReady, setIsReady] = useState(false);
  
  const videoRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // AI Voice Synthesis - Upgraded for Natural Flow
  const speakQuestion = (text: string) => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Preference: Neural -> Google -> Premium -> English
    const preferredVoice = voices.find(v => v.name.includes("Neural") && v.lang.startsWith("en")) ||
                           voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ||
                           voices.find(v => v.name.includes("Premium") && v.lang.startsWith("en")) ||
                           voices.find(v => v.lang.startsWith("en-US")) ||
                           voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.05; // Slightly higher for a friendly "Babe" vibe
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  // Ensure voices are loaded
  useEffect(() => {
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
  }, []);

  const generateBulkQuestions = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleTarget, bulk: true }),
      });
      const data = await response.json();
      if (data.questions) {
        setQuestionQueue(data.questions);
      } else if (data.question) {
        setQuestionQueue([data.question]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const addFromKnowledgeBase = () => {
    const category = interviewKnowledgeBase.categories.find(c => c.id === selectedCategory);
    if (category) {
      const randomSub = category.subcategories[Math.floor(Math.random() * category.subcategories.length)];
      const randomQ = randomSub.questions[Math.floor(Math.random() * randomSub.questions.length)].question;
      setQuestionQueue([...questionQueue, randomQ]);
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + " " + event.results[i][0].transcript);
          }
        }
      };
    }
  }, []);

  const startInterview = () => {
    if (questionQueue.length === 0) {
      alert("Please add at least one question to the queue!");
      return;
    }
    setIsStarted(true);
  };

  const handlePermissionsAndStart = async () => {
    if (videoRef.current) {
      const success = await videoRef.current.startStream();
      if (success) {
        setIsReady(true);
        startQuestion(0);
      }
    } else {
        // Fallback for audio mode
        setIsReady(true);
        startQuestion(0);
    }
  };

  const startQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsRecording(true);
    setEvaluation(null);
    setTranscript("");
    setCapturedImage(null);
    
    const question = questionQueue[index];
    speakQuestion(question);

    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (e) {}
    }
    
    if (interviewMode === "video") {
      setTimeout(() => {
        if (videoRef.current) {
          const frame = videoRef.current.captureFrame();
          setCapturedImage(frame);
        }
      }, 5000);
    }
  };

  const endInterview = async () => {
    setIsRecording(false);
    setLoading(true);
    window.speechSynthesis.cancel();

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    try {
      const result = await evaluateInterview({
        roleTarget: roleTarget,
        question: questionQueue[currentQuestionIndex],
        transcript: transcript,
        imageBase64: interviewMode === "video" ? (capturedImage || undefined) : undefined,
      });
      setEvaluation(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questionQueue.length - 1) {
      startQuestion(currentQuestionIndex + 1);
    }
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-obsidian text-silver-fox p-2 sm:p-4 flex items-center justify-center font-space-grotesk py-12 overflow-x-hidden">
        <div className="max-w-4xl w-full card-brutal bg-white/5 space-y-6 md:space-y-8 p-4 sm:p-8 md:p-12 border-silver-fox mx-auto">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-electric-yellow tracking-tighter uppercase break-words">Mission Control</h1>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-hot-pink font-bold">Configure your HiredBabe Session</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 overflow-hidden">
            <div className="space-y-6 min-w-0 w-full">
              {/* Target Role */}
              <div>
                <label className="block text-[10px] uppercase font-black text-silver-fox mb-2">Target Role</label>
                <input 
                  type="text" 
                  value={roleTarget}
                  onChange={(e) => setRoleTarget(e.target.value)}
                  className="w-full bg-obsidian border-2 border-silver-fox p-3 md:p-4 text-electric-yellow font-bold focus:border-hot-pink outline-none transition-all text-sm box-border"
                  placeholder="e.g. Senior Developer"
                />
              </div>

              {/* Knowledge Base */}
              <div className="w-full min-w-0 overflow-hidden">
                <label className="block text-[10px] uppercase font-black text-silver-fox mb-2">Knowledge Base Selection</label>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 bg-obsidian border-2 border-silver-fox p-3 text-silver-fox text-xs md:text-sm font-bold outline-none min-w-0"
                  >
                    {interviewKnowledgeBase.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <button onClick={addFromKnowledgeBase} className="bg-electric-yellow text-obsidian p-3 font-black text-xl hover:bg-hot-pink hover:text-white transition-all sm:w-16">+</button>
                </div>
              </div>

              {/* AI Generation */}
              <div className="w-full">
                <label className="block text-[10px] uppercase font-black text-silver-fox mb-2">AI Generation</label>
                <button 
                  onClick={generateBulkQuestions}
                  disabled={isGenerating}
                  className="w-full border-2 border-hot-pink p-3 md:p-4 text-hot-pink font-black uppercase text-[10px] sm:text-xs md:text-sm tracking-widest hover:bg-hot-pink hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? "SCANNING..." : "✨ Bulk Generate Questions"}
                </button>
              </div>

              {/* Interview Mode */}
              <div className="pt-2 w-full">
                <label className="block text-[10px] uppercase font-black text-silver-fox mb-2">Interview Mode</label>
                <div className="flex bg-obsidian border-2 border-silver-fox p-1 w-full box-border">
                  <button onClick={() => setInterviewMode("video")} className={`flex-1 py-2 md:py-3 text-[10px] md:text-xs font-bold uppercase ${interviewMode === "video" ? "bg-electric-yellow text-obsidian" : ""}`}>Video</button>
                  <button onClick={() => setInterviewMode("audio")} className={`flex-1 py-2 md:py-3 text-[10px] md:text-xs font-bold uppercase ${interviewMode === "audio" ? "bg-electric-yellow text-obsidian" : ""}`}>Audio</button>
                </div>
              </div>
            </div>

            {/* Question Queue */}
            <div className="bg-white/5 border-2 border-dashed border-silver-fox/30 p-4 md:p-6 flex flex-col w-full min-w-0 overflow-hidden box-border">
              <label className="block text-[10px] uppercase font-black text-silver-fox mb-4">Question Queue ({questionQueue.length})</label>
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[200px] md:max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-silver-fox/20 min-h-[100px]">
                {questionQueue.length === 0 ? (
                  <p className="text-[10px] md:text-xs italic opacity-30">No questions added yet.</p>
                ) : (
                  questionQueue.map((q, i) => (
                    <div key={i} className="bg-obsidian p-3 border-l-4 border-electric-yellow flex justify-between gap-4 w-full box-border">
                      <p className="text-[10px] md:text-[11px] leading-tight break-words flex-1">{q}</p>
                      <button onClick={() => setQuestionQueue(questionQueue.filter((_, idx) => idx !== i))} className="text-hot-pink font-bold shrink-0">×</button>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full">
                <input 
                  type="text" 
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Add question..."
                  className="flex-1 bg-obsidian border border-silver-fox/50 p-3 text-[10px] md:text-xs outline-none focus:border-electric-yellow min-w-0"
                  onKeyDown={(e) => { if (e.key === 'Enter' && customQuestion) { setQuestionQueue([...questionQueue, customQuestion]); setCustomQuestion(""); } }}
                />
                <button onClick={() => { if (customQuestion) { setQuestionQueue([...questionQueue, customQuestion]); setCustomQuestion(""); } }} className="bg-silver-fox text-obsidian p-3 font-bold text-[10px] md:text-xs uppercase sm:w-20 shrink-0">ADD</button>
              </div>
            </div>
          </div>

          <button onClick={startInterview} className="btn-neo w-full py-4 md:py-6 text-lg md:text-2xl mt-4 md:mt-8 shadow-[6px_6px_0px_0px_rgba(255,0,110,1)] uppercase">LAUNCH SESSION</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-silver-fox p-2 sm:p-4 md:p-8 font-space-grotesk overflow-x-hidden">
      <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left: Video & Controls (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <header className="flex flex-row justify-between items-end border-b-4 border-electric-yellow pb-4 gap-2">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-electric-yellow tracking-tighter uppercase truncate">Session Active</h1>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-hot-pink font-bold truncate">
                Q{currentQuestionIndex + 1} of {questionQueue.length}
              </p>
            </div>
            
            <div className="text-right shrink-0">
              <div className="text-[8px] sm:text-[9px] opacity-50 uppercase tracking-widest font-black">Signal</div>
              <div className="font-mono text-[10px] sm:text-xs uppercase text-electric-yellow">{interviewMode}</div>
            </div>
          </header>

          <div className="relative w-full">
            {interviewMode === "video" ? (
              <VideoRecorder ref={videoRef} isRecording={isRecording} />
            ) : (
              <div className="aspect-video bg-black border-4 border-silver-fox flex items-center justify-center relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(234,255,0,0.1)]">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--color-electric-yellow)_0%,_transparent_70%)] animate-pulse"></div>
                </div>
                <div className="z-10 flex flex-col items-center p-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-hot-pink border-4 border-obsidian rounded-full mb-3 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:h-8 md:h-10 md:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-center">Audio Signal Ready</p>
                </div>
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 scale-75 sm:scale-100 origin-bottom-right">
                    <VideoRecorder ref={videoRef} isRecording={isRecording} minimal={true} /> 
                </div>
              </div>
            )}

            {!isReady && (
              <div className="absolute inset-0 z-30 bg-obsidian/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center border-4 border-dashed border-electric-yellow/30">
                <div className="mb-4 sm:mb-6 space-y-2">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-electric-yellow uppercase leading-none">STANDBY</h3>
                  <p className="text-[9px] sm:text-[10px] md:text-sm text-silver-fox/60 max-w-xs mx-auto">Hardware will remain powered down until initialization.</p>
                </div>
                <button 
                  onClick={handlePermissionsAndStart}
                  className="bg-hot-pink text-white px-6 sm:px-10 md:px-12 py-3 sm:py-4 font-black uppercase text-xs sm:text-base md:text-xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  INITIALIZE SESSION
                </button>
              </div>
            )}
          </div>

          {/* Real-time Transcript Preview */}
          <div className="bg-obsidian border-l-4 border-electric-yellow p-3 sm:p-4 min-h-[40px] shadow-[4px_4px_0px_0px_rgba(255,0,110,0.1)]">
            <p className="text-[8px] sm:text-[9px] text-electric-yellow uppercase font-bold mb-1 opacity-50">Live Transcript</p>
            <p className="text-[10px] sm:text-xs md:text-sm italic text-silver-fox/80 line-clamp-2 sm:line-clamp-none">
              {transcript || (isRecording ? "Listening..." : "Evaluation phase...")}
            </p>
          </div>

          <div className="card-brutal bg-hot-pink/5 border-hot-pink p-3 sm:p-4 md:p-6">
            <h2 className="text-[8px] sm:text-[10px] font-bold text-hot-pink uppercase mb-1 md:mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-hot-pink rounded-full"></span>
              Question
            </h2>
            <p className="text-sm sm:text-lg md:text-2xl font-bold italic text-silver-fox leading-tight break-words">"{questionQueue[currentQuestionIndex]}"</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            {isReady && (
              isRecording ? (
                <button onClick={endInterview} className="btn-neo !bg-hot-pink !text-white !border-obsidian flex-1 py-4 md:py-6 text-sm sm:text-lg md:text-xl uppercase">
                  FINISH ANSWER
                </button>
              ) : (
                currentQuestionIndex < questionQueue.length - 1 ? (
                  <button onClick={nextQuestion} className="btn-neo flex-1 py-4 md:py-6 text-sm sm:text-lg md:text-xl animate-pulse uppercase">
                    NEXT QUESTION →
                  </button>
                ) : (
                  <Link href="/" className="btn-neo !bg-electric-yellow !text-obsidian flex-1 py-4 md:py-6 text-sm sm:text-lg md:text-xl text-center flex items-center justify-center uppercase">
                    FINISH SESSION
                  </Link>
                )
              )
            )}
            <Link href="/" className="px-6 py-4 md:py-6 border-4 border-silver-fox font-bold hover:bg-silver-fox hover:text-obsidian transition-all uppercase flex items-center justify-center text-xs sm:text-sm md:text-base">
              EXIT
            </Link>
          </div>
        </div>

        {/* Right: Results Sidebar (Full width on mobile, 1/3 on desktop) */}
        <div className="space-y-6 mt-4 md:mt-0">
          <div className="card-brutal h-full flex flex-col bg-[#0f0f0f] border-silver-fox overflow-hidden min-h-[400px] sm:min-h-[500px]">
            <h2 className="text-lg md:text-2xl mb-4 sm:mb-6 border-b-2 border-electric-yellow pb-2 px-3 uppercase font-black tracking-widest">Analysis</h2>
            
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-electric-yellow border-t-hot-pink animate-spin"></div>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest animate-pulse">Scanning Signals...</p>
              </div>
            ) : evaluation ? (
              <div className="space-y-4 sm:space-y-6 overflow-y-auto pr-1 px-3 md:px-4 scrollbar-thin scrollbar-thumb-hot-pink pb-12">
                <div className="bg-electric-yellow text-obsidian p-3 sm:p-4 text-center shadow-[4px_4px_0px_0px_#FF006E] mb-2">
                  <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Vibe Score</div>
                  <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter">{evaluation.overall_score}%</div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <ResultItem label="Vibe" value={evaluation.vibe_feedback} color="hot-pink" />
                  
                  {/* Perfect Example Answer Section */}
                  <div className="border-2 border-dashed border-electric-yellow/30 p-3 md:p-4 bg-electric-yellow/5">
                    <h3 className="text-[9px] sm:text-[10px] font-black text-electric-yellow uppercase mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                      </svg>
                      Perfect Response
                    </h3>
                    <p className="text-[9px] sm:text-[10px] md:text-[11px] leading-relaxed italic text-silver-fox/80 whitespace-pre-wrap">{evaluation.example_answer}</p>
                  </div>

                  <ResultItem label="Technical" value={evaluation.technical_feedback} color="silver-fox" />
                </div>

                <div className="pt-2 sm:pt-4 space-y-2">
                  <div className="bg-green-500/10 border border-green-500 p-2 sm:p-3">
                    <span className="text-[8px] sm:text-[9px] font-black text-green-500 uppercase block mb-1">Top Strength</span>
                    <p className="text-[9px] sm:text-[10px] leading-tight">{evaluation.top_strength}</p>
                  </div>
                  <div className="bg-hot-pink/10 border border-hot-pink p-2 sm:p-3">
                    <span className="text-[8px] sm:text-[9px] font-black text-hot-pink uppercase block mb-1">Key Improvement</span>
                    <p className="text-[9px] sm:text-[10px] leading-tight">{evaluation.top_improvement}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 space-y-4 grayscale p-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest leading-relaxed">
                  Awaiting analysis...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultItem({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: any = {
    "hot-pink": "border-hot-pink text-hot-pink",
    "electric-yellow": "border-electric-yellow text-electric-yellow",
    "silver-fox": "border-silver-fox text-silver-fox",
  };
  
  return (
    <div className={`border-l-4 ${colorMap[color]} pl-4 bg-white/5 p-3`}>
      <h3 className="text-sm font-bold uppercase mb-1">{label}</h3>
      <p className="text-[11px] leading-relaxed text-silver-fox/90">{value}</p>
    </div>
  );
}
