"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import VideoRecorder from "@/components/interview/VideoRecorder";
import { evaluateInterview } from "@/services/gemini-service";
import {
  InterviewEvaluation,
  InterviewMode,
  PressureMode,
} from "@/types/interview";
import interviewKnowledgeBase from "../../../interviewKnowledgeBase";

type QueueItem = {
  id: string;
  text: string;
  source: "knowledge-base" | "ai" | "custom" | "follow-up";
};

type SessionResult = {
  id: string;
  question: string;
  transcript: string;
  evaluation: InterviewEvaluation;
  roleTarget: string;
  companyTarget: string;
  createdAt: string;
};

type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  0: { transcript: string };
};

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: BrowserSpeechRecognitionResult[];
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionCtor = new () => BrowserSpeechRecognition;

type VideoRecorderHandle = {
  startStream: () => Promise<boolean>;
  stopStream: () => void;
  captureFrame: () => string | null;
};

const STORAGE_KEY = "hiredbabe.session-history.v2";
const QUESTION_STORAGE_KEY = "hiredbabe.question-draft.v2";

const roleTracks = [
  {
    id: "mern",
    label: "MERN Sprint",
    role: "Senior MERN Developer",
    focus: "Frontend depth, APIs, debugging, architecture, delivery impact.",
  },
  {
    id: "frontend",
    label: "Frontend Focus",
    role: "Frontend Engineer",
    focus: "UI decisions, performance, accessibility, collaboration.",
  },
  {
    id: "pm",
    label: "PM Track",
    role: "Product Manager",
    focus: "Prioritization, stakeholder alignment, strategy, metrics.",
  },
  {
    id: "data",
    label: "Data Track",
    role: "Data Analyst",
    focus: "Experimentation, storytelling, assumptions, business impact.",
  },
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function getWordCount(text: string) {
  const words = text.trim().match(/\b[\w'-]+\b/g);
  return words ? words.length : 0;
}

function getFillerCount(text: string) {
  const matches = text
    .toLowerCase()
    .match(/\b(um|uh|like|you know|basically|actually|literally|sort of|kind of)\b/g);

  return matches ? matches.length : 0;
}

function getEstimatedWpm(text: string, durationSec: number) {
  const minutes = durationSec > 0 ? durationSec / 60 : 1;
  return Math.round(getWordCount(text) / minutes);
}

function summarizeWeaknesses(history: SessionResult[]) {
  const counts = new Map<string, number>();

  history.forEach((item) => {
    item.evaluation.weakness_tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

function getHiringSignalLabel(signal: InterviewEvaluation["hiring_signal"]) {
  switch (signal) {
    case "strong_yes":
      return "Strong Yes";
    case "lean_yes":
      return "Lean Yes";
    case "strong_no":
      return "Strong No";
    default:
      return "Borderline";
  }
}

export default function InterviewPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [interviewMode, setInterviewMode] = useState<InterviewMode>("video");
  const [pressureMode, setPressureMode] = useState<PressureMode>("coach");
  const [strictNoRetry, setStrictNoRetry] = useState(false);
  const [autoFollowUps, setAutoFollowUps] = useState(true);
  const [answerDurationSec, setAnswerDurationSec] = useState(90);

  const [roleTarget, setRoleTarget] = useState("Senior MERN Developer");
  const [companyTarget, setCompanyTarget] = useState("Google");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeContext, setResumeContext] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(roleTracks[0].id);

  const [selectedCategory, setSelectedCategory] = useState(
    interviewKnowledgeBase.categories[0].id,
  );
  const [customQuestion, setCustomQuestion] = useState("");
  const [questionQueue, setQuestionQueue] = useState<QueueItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [transcript, setTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [responseNotice, setResponseNotice] = useState<string | null>(null);
  const [serviceNotice, setServiceNotice] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(answerDurationSec);
  const [history, setHistory] = useState<SessionResult[]>([]);
  const [currentSessionResults, setCurrentSessionResults] = useState<SessionResult[]>([]);

  const videoRef = useRef<VideoRecorderHandle | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const autoStopTriggeredRef = useRef(false);

  // Hydration fix: load from localStorage after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);

    try {
      const rawQuestions = window.localStorage.getItem(QUESTION_STORAGE_KEY);
      if (rawQuestions) {
        const parsed = JSON.parse(rawQuestions);
        if (Array.isArray(parsed)) {
          setQuestionQueue(parsed);
        }
      }

      const rawHistory = window.localStorage.getItem(STORAGE_KEY);
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load local state:", err);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history, isMounted]);

  useEffect(() => {
    if (isMounted) {
      window.localStorage.setItem(QUESTION_STORAGE_KEY, JSON.stringify(questionQueue));
    }
  }, [questionQueue, isMounted]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };

    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    };
  }, []);

  useEffect(() => {
    const RecognitionCtor = (
      window as Window & {
        SpeechRecognition?: BrowserSpeechRecognitionCtor;
        webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
      }
    ).SpeechRecognition ||
      (
        window as Window & {
          webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
        }
      ).webkitSpeechRecognition;

    if (!RecognitionCtor) {
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) {
          finalTranscript += `${result[0].transcript} `;
        }
      }

      if (finalTranscript.trim()) {
        setTranscript((previous) => `${previous} ${finalTranscript}`.trim());
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const recorder = videoRef.current;
    return () => {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
      recorder?.stopStream();
    };
  }, []);

  const weaknessRadar = useMemo(() => summarizeWeaknesses(history), [history]);
  const recentAverageScore = useMemo(() => {
    if (history.length === 0) {
      return 0;
    }

    const recent = history.slice(0, 5);
    const total = recent.reduce((sum, item) => sum + item.evaluation.overall_score, 0);
    return Math.round(total / recent.length);
  }, [history]);

  const bestScore = useMemo(() => {
    return history.length > 0
      ? Math.max(...history.map((item) => item.evaluation.overall_score))
      : 0;
  }, [history]);

  const latestSessions = history.slice(0, 5);

  const speakQuestion = (text: string) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((voice) => voice.name.includes("Google") && voice.lang.startsWith("en")) ||
      voices.find((voice) => voice.lang.startsWith("en-US")) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  const persistResult = (result: SessionResult) => {
    setCurrentSessionResults((previous) => [result, ...previous]);
    setHistory((previous) => [result, ...previous].slice(0, 50));
  };

  const addQuestion = (item: QueueItem) => {
    setQuestionQueue((previous) => [...previous, item]);
  };

  const addFromKnowledgeBase = () => {
    const category = interviewKnowledgeBase.categories.find(
      (item: { id: string }) => item.id === selectedCategory,
    );

    if (!category) {
      return;
    }

    const subcategory =
      category.subcategories[Math.floor(Math.random() * category.subcategories.length)];
    const question =
      subcategory.questions[Math.floor(Math.random() * subcategory.questions.length)];

    addQuestion({
      id: createId("kb"),
      text: question.question,
      source: "knowledge-base",
    });
  };

  const generateBulkQuestions = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleTarget,
          companyTarget,
          jobDescription,
          resumeContext,
          bulk: true,
        }),
      });

      const data = (await response.json()) as {
        questions?: string[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }

      setServiceNotice(null);

      if (data.questions) {
        setQuestionQueue(
          data.questions.map((question) => ({
            id: createId("ai"),
            text: question,
            source: "ai" as const,
          })),
        );
      }
    } catch (error) {
      console.error(error);
      setServiceNotice(
        error instanceof Error
          ? error.message
          : "Gemini question generation failed. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFollowUpQuestion = async () => {
    const current = questionQueue[currentQuestionIndex];

    if (!current || !evaluation) {
      return;
    }

    setIsGeneratingFollowUp(true);

    try {
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleTarget,
          companyTarget,
          jobDescription,
          resumeContext,
          kind: "followup",
          currentQuestion: current.text,
          transcript,
          evaluationSummary: `${evaluation.top_improvement}. Weaknesses: ${evaluation.weakness_tags.join(", ")}`,
        }),
      });

      const data = (await response.json()) as {
        question?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate follow-up question");
      }

      setServiceNotice(null);

      const followUpText = data.question || evaluation.follow_up_question;
      const followUpItem: QueueItem = {
        id: createId("followup"),
        text: followUpText,
        source: "follow-up",
      };

      setQuestionQueue((previous) => {
        const updated = [...previous];
        updated.splice(currentQuestionIndex + 1, 0, followUpItem);
        return updated;
      });
    } catch (error) {
      console.error(error);
      setServiceNotice(
        error instanceof Error
          ? error.message
          : "Gemini follow-up generation failed. Please try again.",
      );
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const startInterview = () => {
    if (questionQueue.length === 0) {
      alert("Please add at least one question to the queue.");
      return;
    }

    setCurrentSessionResults([]);
    setCurrentQuestionIndex(0);
    setEvaluation(null);
    setResponseNotice(null);
    setServiceNotice(null);
    setTranscript("");
    setIsStarted(true);
  };

  const handlePermissionsAndStart = async () => {
    if (videoRef.current) {
      const success = await videoRef.current.startStream();
      if (!success) {
        return;
      }
    }

    setIsReady(true);
    startQuestion(0);
  };

  const startQuestion = (index: number) => {
    const question = questionQueue[index];

    if (!question) {
      return;
    }

    autoStopTriggeredRef.current = false;
    startedAtRef.current = Date.now();
    setCurrentQuestionIndex(index);
    setCapturedImage(null);
    setTranscript("");
    setEvaluation(null);
    setResponseNotice(null);
    setServiceNotice(null);
    setRemainingTime(answerDurationSec);
    setIsRecording(true);

    speakQuestion(question.text);

    try {
      recognitionRef.current?.start();
    } catch (error) {
      console.error("Speech recognition start failed", error);
    }

    if (interviewMode === "video") {
      window.setTimeout(() => {
        const frame = videoRef.current?.captureFrame();
        if (frame) {
          setCapturedImage(frame);
        }
      }, 4000);
    }
  };

  const buildAudioAnalysis = (durationSecValue: number, transcriptValue: string) => {
    const fillerCount = getFillerCount(transcriptValue);
    const estimatedWpm = getEstimatedWpm(transcriptValue, durationSecValue);

    return `Estimated pace: ${estimatedWpm} WPM. Filler count: ${fillerCount}. Duration: ${durationSecValue} seconds.`;
  };

  const endInterview = async () => {
    if (!isRecording) {
      return;
    }

    setIsRecording(false);
    setLoading(true);
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();

    const finalFrame =
      interviewMode === "video" ? videoRef.current?.captureFrame() || capturedImage : null;

    const durationSecValue = clamp(
      1,
      Math.round(((Date.now() - (startedAtRef.current || Date.now())) / 1000) || 1),
      600,
    );

    try {
      const result = await evaluateInterview({
        roleTarget,
        companyTarget,
        jobDescription,
        resumeContext,
        pressureMode,
        interviewMode,
        question: questionQueue[currentQuestionIndex]?.text || "",
        transcript,
        answerDurationSec: durationSecValue,
        priorWeaknesses: weaknessRadar.map(([tag]) => tag),
        audioAnalysis: buildAudioAnalysis(durationSecValue, transcript),
        imageBase64: finalFrame || undefined,
      });

      setEvaluation(result);
      setServiceNotice(null);

      if (!result.has_response) {
        setResponseNotice(result.response_status);
        return;
      }

      setResponseNotice(null);

      const sessionResult: SessionResult = {
        id: createId("result"),
        question: questionQueue[currentQuestionIndex]?.text || "",
        transcript,
        evaluation: result,
        roleTarget,
        companyTarget,
        createdAt: new Date().toISOString(),
      };

      persistResult(sessionResult);

      if (autoFollowUps && result.follow_up_question) {
        setQuestionQueue((previous) => {
          const nextQuestion = previous[currentQuestionIndex + 1];
          if (nextQuestion?.source === "follow-up") {
            return previous;
          }

          const updated = [...previous];
          updated.splice(currentQuestionIndex + 1, 0, {
            id: createId("autofollow"),
            text: result.follow_up_question,
            source: "follow-up",
          });
          return updated;
        });
      }
    } catch (error) {
      console.error(error);
      setServiceNotice(
        error instanceof Error
          ? error.message
          : "Gemini evaluation failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTimerElapsed = useEffectEvent(() => {
    void endInterview();
  });

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingTime((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          if (!autoStopTriggeredRef.current) {
            autoStopTriggeredRef.current = true;
            handleTimerElapsed();
          }
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRecording]);

  const nextQuestion = () => {
    if (currentQuestionIndex < questionQueue.length - 1) {
      startQuestion(currentQuestionIndex + 1);
    }
  };

  const retryCurrentQuestion = () => {
    if (strictNoRetry || pressureMode === "real") {
      return;
    }

    startQuestion(currentQuestionIndex);
  };

  const resetSession = () => {
    recognitionRef.current?.stop();
    videoRef.current?.stopStream();
    window.speechSynthesis.cancel();
    setIsStarted(false);
    setIsReady(false);
    setIsRecording(false);
    setTranscript("");
    setEvaluation(null);
    setResponseNotice(null);
    setServiceNotice(null);
    setCapturedImage(null);
    setCurrentQuestionIndex(0);
  };

  const latestQuestion = questionQueue[currentQuestionIndex];

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-obsidian px-3 py-8 text-silver-fox sm:px-5 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="card-brutal space-y-8 bg-white/5 p-4 sm:p-6 lg:p-10">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-hot-pink">
                Mission Control 2.0
              </p>
              <h1 className="text-3xl font-black text-electric-yellow sm:text-5xl">
                Build A Mock Interview That Actually Trains You
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-silver-fox/80 sm:text-base">
                Personalize the round with your target role, company, job description,
                resume, question mix, and pressure settings. HiredBabe will track your
                performance over time and turn each answer into a coaching loop.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-5">
                <Field label="Role Target">
                  <input
                    value={roleTarget}
                    onChange={(event) => setRoleTarget(event.target.value)}
                    className="w-full border-2 border-silver-fox bg-obsidian px-4 py-3 text-sm font-bold text-electric-yellow outline-none focus:border-hot-pink"
                    placeholder="Senior MERN Developer"
                  />
                </Field>

                <Field label="Company Target">
                  <input
                    value={companyTarget}
                    onChange={(event) => setCompanyTarget(event.target.value)}
                    className="w-full border-2 border-silver-fox bg-obsidian px-4 py-3 text-sm font-bold text-electric-yellow outline-none focus:border-hot-pink"
                    placeholder="Google"
                  />
                </Field>

                <Field label="Guided Track">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {roleTracks.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => {
                          setSelectedTrack(track.id);
                          setRoleTarget(track.role);
                        }}
                        className={`border-2 px-4 py-3 text-left transition-all ${
                          selectedTrack === track.id
                            ? "border-electric-yellow bg-electric-yellow text-obsidian"
                            : "border-silver-fox bg-obsidian text-silver-fox hover:border-hot-pink"
                        }`}
                      >
                        <div className="text-sm font-black uppercase">{track.label}</div>
                        <div className="mt-1 text-[11px] leading-5">{track.focus}</div>
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Interview Mode">
                  <div className="grid grid-cols-2 gap-2">
                    {(["video", "audio"] as InterviewMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setInterviewMode(mode)}
                        className={`border-2 px-4 py-3 text-sm font-black uppercase ${
                          interviewMode === mode
                            ? "border-electric-yellow bg-electric-yellow text-obsidian"
                            : "border-silver-fox bg-obsidian text-silver-fox"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Pressure Mode">
                  <div className="grid grid-cols-2 gap-2">
                    {(["coach", "real"] as PressureMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setPressureMode(mode)}
                        className={`border-2 px-4 py-3 text-sm font-black uppercase ${
                          pressureMode === mode
                            ? "border-hot-pink bg-hot-pink text-white"
                            : "border-silver-fox bg-obsidian text-silver-fox"
                        }`}
                      >
                        {mode === "coach" ? "Coach Mode" : "Real Round"}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="space-y-5">
                <Field label="Job Description">
                  <textarea
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    className="min-h-32 w-full border-2 border-silver-fox bg-obsidian px-4 py-3 text-sm outline-none focus:border-hot-pink"
                    placeholder="Paste the role scope, requirements, and what the company seems to value."
                  />
                </Field>

                <Field label="Resume Highlights">
                  <textarea
                    value={resumeContext}
                    onChange={(event) => setResumeContext(event.target.value)}
                    className="min-h-32 w-full border-2 border-silver-fox bg-obsidian px-4 py-3 text-sm outline-none focus:border-hot-pink"
                    placeholder="Paste your resume highlights, projects, metrics, stack, and achievements."
                  />
                </Field>

                <Field label="Pressure Settings">
                  <div className="space-y-3 border-2 border-silver-fox/50 bg-black/20 p-4">
                    <div>
                      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-silver-fox/70">
                        Answer Timer
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[60, 90, 120].map((seconds) => (
                          <button
                            key={seconds}
                            onClick={() => setAnswerDurationSec(seconds)}
                            className={`border px-3 py-2 text-xs font-black uppercase ${
                              answerDurationSec === seconds
                                ? "border-electric-yellow bg-electric-yellow text-obsidian"
                                : "border-silver-fox bg-obsidian text-silver-fox"
                            }`}
                          >
                            {seconds}s
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center justify-between gap-4 text-sm">
                      <span>Auto add interviewer follow-ups</span>
                      <input
                        type="checkbox"
                        checked={autoFollowUps}
                        onChange={(event) => setAutoFollowUps(event.target.checked)}
                        className="h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-4 text-sm">
                      <span>No retry after answer</span>
                      <input
                        type="checkbox"
                        checked={strictNoRetry}
                        onChange={(event) => setStrictNoRetry(event.target.checked)}
                        className="h-4 w-4"
                      />
                    </label>
                  </div>
                </Field>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-5">
                <Field label="Question Builder">
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        value={selectedCategory}
                        onChange={(event) => setSelectedCategory(event.target.value)}
                        className="min-w-0 flex-1 border-2 border-silver-fox bg-obsidian px-4 py-3 text-sm font-bold"
                      >
                        {interviewKnowledgeBase.categories.map(
                          (category: { id: string; label: string }) => (
                            <option key={category.id} value={category.id}>
                              {category.label}
                            </option>
                          ),
                        )}
                      </select>
                      <button
                        onClick={addFromKnowledgeBase}
                        className="border-2 border-electric-yellow bg-electric-yellow px-5 py-3 text-sm font-black uppercase text-obsidian"
                      >
                        Add From KB
                      </button>
                    </div>

                    <button
                      onClick={generateBulkQuestions}
                      disabled={isGenerating}
                      className="w-full border-2 border-hot-pink px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-hot-pink transition-all hover:bg-hot-pink hover:text-white disabled:opacity-60"
                    >
                      {isGenerating ? "Generating..." : "AI Generate 5 Tailored Questions"}
                    </button>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={customQuestion}
                        onChange={(event) => setCustomQuestion(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && customQuestion.trim()) {
                            addQuestion({
                              id: createId("custom"),
                              text: customQuestion.trim(),
                              source: "custom",
                            });
                            setCustomQuestion("");
                          }
                        }}
                        className="min-w-0 flex-1 border-2 border-silver-fox bg-obsidian px-4 py-3 text-sm"
                        placeholder="Paste your own mock interview question"
                      />
                      <button
                        onClick={() => {
                          if (!customQuestion.trim()) {
                            return;
                          }

                          addQuestion({
                            id: createId("custom"),
                            text: customQuestion.trim(),
                            source: "custom",
                          });
                          setCustomQuestion("");
                        }}
                        className="border-2 border-silver-fox px-5 py-3 text-sm font-black uppercase"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </Field>
              </div>

              <div className="space-y-4 border-2 border-dashed border-silver-fox/30 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-electric-yellow">
                      Question Queue
                    </div>
                    <div className="mt-1 text-xs text-silver-fox/70">
                      {isMounted ? `${questionQueue.length} questions ready` : "Initializing..."}
                    </div>
                  </div>
                  {questionQueue.length > 0 ? (
                    <button
                      onClick={() => setQuestionQueue([])}
                      className="text-xs font-black uppercase text-hot-pink"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                  {questionQueue.length === 0 ? (
                    <p className="text-sm italic text-silver-fox/50">
                      Add role-specific, behavioral, or technical prompts to begin.
                    </p>
                  ) : (
                    questionQueue.map((item, index) => (
                      <div
                        key={item.id}
                        className="border-l-4 border-electric-yellow bg-obsidian p-3"
                      >
                        <div className="mb-1 flex items-start justify-between gap-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-hot-pink">
                            {index + 1}. {item.source}
                          </span>
                          <button
                            onClick={() =>
                              setQuestionQueue((previous) =>
                                previous.filter((question) => question.id !== item.id),
                              )
                            }
                            className="text-sm font-black text-silver-fox/60"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-sm leading-6">{item.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={startInterview}
              className="btn-neo w-full py-5 text-base uppercase sm:text-xl"
            >
              Launch Interview Session
            </button>
          </section>

          <aside className="space-y-6">
            <DashboardCard
              title="Progress Snapshot"
              kicker="Saved locally"
              body={
                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <MetricCard label="Recent Avg" value={`${recentAverageScore}%`} />
                  <MetricCard label="Best Score" value={`${bestScore}%`} />
                  <MetricCard label="Answers Tracked" value={`${history.length}`} />
                </div>
              }
            />

            <DashboardCard
              title="Weakness Radar"
              kicker="Patterns across sessions"
              body={
                weaknessRadar.length > 0 ? (
                  <div className="space-y-3">
                    {weaknessRadar.map(([tag, count]) => (
                      <div key={tag}>
                        <div className="mb-1 flex items-center justify-between text-xs uppercase">
                          <span>{tag}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-2 bg-white/10">
                          <div
                            className="h-2 bg-hot-pink"
                            style={{ width: `${Math.min(100, count * 20)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-silver-fox/60">
                    Your recurring coaching themes will appear here once you complete a few answers.
                  </p>
                )
              }
            />

            <DashboardCard
              title="Recent Answers"
              kicker="Latest saved feedback"
              body={
                latestSessions.length > 0 ? (
                  <div className="space-y-3">
                    {latestSessions.map((item) => (
                      <div key={item.id} className="border-l-4 border-electric-yellow bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-black uppercase text-electric-yellow">
                            {item.roleTarget}
                          </span>
                          <span className="text-sm font-black text-hot-pink">
                            {item.evaluation.overall_score}%
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-silver-fox/80">
                          {item.question}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-silver-fox/60">
                    Your mock interview history will appear here after the first evaluated answer.
                  </p>
                )
              }
            />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian px-3 py-4 text-silver-fox sm:px-5 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <header className="card-brutal bg-white/5 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-hot-pink">
                  Session Active
                </p>
                <h1 className="text-2xl font-black text-electric-yellow sm:text-4xl">
                  {roleTarget}
                </h1>
                <p className="mt-2 text-sm text-silver-fox/70">
                  {companyTarget || "General"} interview simulation
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs uppercase sm:min-w-80">
                <MetricCard label="Question" value={`${currentQuestionIndex + 1}/${questionQueue.length}`} compact />
                <MetricCard label="Timer" value={`${remainingTime}s`} compact />
                <MetricCard
                  label="Mode"
                  value={pressureMode === "coach" ? "Coach" : "Real"}
                  compact
                />
              </div>
            </div>
          </header>

          <div className="relative overflow-hidden rounded-none border-4 border-electric-yellow bg-black shadow-[10px_10px_0px_0px_#FF006E]">
            {interviewMode === "video" ? (
              <VideoRecorder ref={videoRef} isRecording={isRecording} />
            ) : (
              <div className="aspect-video bg-black">
                <div className="flex h-full items-center justify-center">
                  <div className="space-y-3 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-hot-pink bg-hot-pink/20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-hot-pink"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-electric-yellow">
                      Audio Interview Mode
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isReady ? (
              <div className="absolute inset-0 flex items-center justify-center bg-obsidian/95 p-6 text-center">
                <div className="max-w-md space-y-4">
                  <h2 className="text-2xl font-black uppercase text-electric-yellow">
                    Initialize Session
                  </h2>
                  <p className="text-sm leading-6 text-silver-fox/70">
                    We only start hardware when you choose to begin. Once initialized, the
                    timer, transcript, and scoring loop will start automatically.
                  </p>
                  <button
                    onClick={handlePermissionsAndStart}
                    className="bg-hot-pink px-8 py-4 text-sm font-black uppercase tracking-[0.3em] text-white shadow-[4px_4px_0px_0px_#000]"
                  >
                    Start Round
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="card-brutal bg-hot-pink/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-hot-pink">
                Current Question
              </p>
              <p className="mt-3 text-lg font-bold italic leading-8 sm:text-2xl">
                &ldquo;{latestQuestion?.text || "Question unavailable"}&rdquo;
              </p>
              <div className="mt-4 inline-flex border border-electric-yellow px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-electric-yellow">
                Source: {latestQuestion?.source || "n/a"}
              </div>
            </div>

            <div className="card-brutal bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-electric-yellow">
                  Live Transcript
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-silver-fox/50">
                  {isRecording ? "Listening" : "Waiting"}
                </p>
              </div>
              <p className="mt-3 min-h-24 text-sm leading-7 text-silver-fox/80">
                {transcript || "Your spoken answer will appear here as the interview runs."}
              </p>
              {serviceNotice ? (
                <div className="mt-4 border border-electric-yellow bg-electric-yellow/10 p-3 text-sm leading-6 text-silver-fox">
                  {serviceNotice}
                </div>
              ) : null}
              {responseNotice ? (
                <div className="mt-4 border border-hot-pink bg-hot-pink/10 p-3 text-sm leading-6 text-silver-fox">
                  {responseNotice}
                </div>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs uppercase sm:grid-cols-4">
                <MetricCard label="Words" value={`${getWordCount(transcript)}`} compact />
                <MetricCard label="Fillers" value={`${getFillerCount(transcript)}`} compact />
                <MetricCard
                  label="Est. WPM"
                  value={`${getEstimatedWpm(transcript, Math.max(1, answerDurationSec - remainingTime || 1))}`}
                  compact
                />
                <MetricCard label="Duration" value={`${answerDurationSec - remainingTime}s`} compact />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            {isReady && isRecording ? (
              <button
                onClick={() => void endInterview()}
                className="btn-neo flex-1 !bg-hot-pink !text-white"
              >
                Finish Answer
              </button>
            ) : null}

            {isReady && !isRecording && currentQuestionIndex < questionQueue.length - 1 ? (
              <button onClick={nextQuestion} className="btn-neo flex-1">
                Next Question
              </button>
            ) : null}

            {isReady && !isRecording && !strictNoRetry && pressureMode === "coach" ? (
              <button
                onClick={retryCurrentQuestion}
                className="border-4 border-silver-fox px-6 py-4 text-sm font-black uppercase hover:bg-silver-fox hover:text-obsidian"
              >
                Retry Answer
              </button>
            ) : null}

            {isReady && !isRecording ? (
              <button
                onClick={() => void generateFollowUpQuestion()}
                disabled={isGeneratingFollowUp || !evaluation}
                className="border-4 border-electric-yellow px-6 py-4 text-sm font-black uppercase text-electric-yellow disabled:opacity-50"
              >
                {isGeneratingFollowUp ? "Generating..." : "Add Follow-Up"}
              </button>
            ) : null}

            <button
              onClick={resetSession}
              className="border-4 border-silver-fox px-6 py-4 text-sm font-black uppercase hover:bg-silver-fox hover:text-obsidian"
            >
              Reset
            </button>
            <Link
              href="/"
              className="border-4 border-silver-fox px-6 py-4 text-center text-sm font-black uppercase hover:bg-silver-fox hover:text-obsidian"
            >
              Home
            </Link>
          </div>
        </div>

        <aside className="space-y-5">
          <DashboardCard
            title="Analysis"
            kicker="Per-answer coaching"
            body={
              loading ? (
                <div className="space-y-4 py-8 text-center">
                  <div className="mx-auto h-10 w-10 animate-spin border-4 border-electric-yellow border-t-hot-pink" />
                  <p className="text-xs font-black uppercase tracking-[0.35em]">
                    Evaluating
                  </p>
                </div>
              ) : evaluation && evaluation.has_response ? (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricCard
                      label="Overall"
                      value={`${evaluation.overall_score}%`}
                      highlight="yellow"
                    />
                    <MetricCard
                      label="Hiring Signal"
                      value={getHiringSignalLabel(evaluation.hiring_signal)}
                      highlight="pink"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ScoreBar label="Technical" score={evaluation.technical_score} />
                    <ScoreBar label="Vibe" score={evaluation.vibe_score} />
                    <ScoreBar label="STAR" score={evaluation.star_score} />
                    <ScoreBar label="Clarity" score={evaluation.clarity_score} />
                    <ScoreBar label="Confidence" score={evaluation.confidence_score} />
                    <ScoreBar label="Relevance" score={evaluation.relevance_score} />
                  </div>

                  <Panel title="What Helped" content={evaluation.top_strength} tone="good" />
                  <Panel title="What Hurt" content={evaluation.top_improvement} tone="warn" />
                  <Panel title="STAR Feedback" content={evaluation.star_feedback} />
                  <Panel title="Technical Feedback" content={evaluation.technical_feedback} />
                  <Panel title="Communication Feedback" content={evaluation.vibe_feedback} />
                  <Panel title="Pacing And Fillers" content={`${evaluation.pacing_feedback} ${evaluation.filler_word_feedback}`} />
                  <Panel title="Role Fit" content={evaluation.role_fit_feedback} />

                  <Panel
                    title="Try Again Prompt"
                    content={evaluation.retry_prompt}
                    tone="yellow"
                  />

                  <div className="space-y-3 border-2 border-dashed border-electric-yellow/40 bg-electric-yellow/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-electric-yellow">
                      Stronger Version Of Your Answer
                    </p>
                    <p className="text-sm leading-7 text-silver-fox/85">
                      {evaluation.rewritten_answer}
                    </p>
                  </div>

                  <div className="space-y-3 border-2 border-dashed border-hot-pink/40 bg-hot-pink/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-hot-pink">
                      Perfect Example Answer
                    </p>
                    <p className="text-sm leading-7 text-silver-fox/85">
                      {evaluation.example_answer}
                    </p>
                  </div>

                  <ListPanel title="Action Items" items={evaluation.action_items} />
                  <ListPanel title="Detected Strengths" items={evaluation.strengths} />
                  <ListPanel title="Weakness Tags" items={evaluation.weakness_tags} pill />
                </div>
              ) : serviceNotice ? (
                <div className="border border-electric-yellow bg-electric-yellow/10 p-4 text-sm leading-7 text-silver-fox">
                  {serviceNotice}
                </div>
              ) : responseNotice ? (
                <div className="border border-hot-pink bg-hot-pink/10 p-4 text-sm leading-7 text-silver-fox">
                  {responseNotice}
                </div>
              ) : (
                <p className="py-8 text-sm leading-7 text-silver-fox/60">
                  Finish an answer to unlock the full coaching report, rewritten response,
                  retry prompt, and hiring signal.
                </p>
              )
            }
          />

          <DashboardCard
            title="Session Momentum"
            kicker="This round only"
            body={
              currentSessionResults.length > 0 ? (
                <div className="space-y-3">
                  {currentSessionResults.map((item) => (
                    <div key={item.id} className="border-l-4 border-electric-yellow bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-hot-pink">
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="text-sm font-black text-electric-yellow">
                          {item.evaluation.overall_score}%
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-silver-fox/75">
                        {item.question}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-silver-fox/60">
                  Your answer trend for this specific interview will appear here.
                </p>
              )
            }
          />
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.3em] text-silver-fox">
        {label}
      </label>
      {children}
    </div>
  );
}

function DashboardCard({
  title,
  kicker,
  body,
}: {
  title: string;
  kicker: string;
  body: React.ReactNode;
}) {
  return (
    <section className="card-brutal bg-white/5 p-4 sm:p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-hot-pink">
        {kicker}
      </p>
      <h2 className="mt-2 text-xl font-black text-electric-yellow">{title}</h2>
      <div className="mt-4">{body}</div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  compact = false,
  highlight,
}: {
  label: string;
  value: string;
  compact?: boolean;
  highlight?: "yellow" | "pink";
}) {
  const tone =
    highlight === "pink"
      ? "border-hot-pink bg-hot-pink/10 text-hot-pink"
      : highlight === "yellow"
        ? "border-electric-yellow bg-electric-yellow/10 text-electric-yellow"
        : "border-silver-fox/30 bg-black/20 text-silver-fox";

  return (
    <div className={`border p-3 ${tone}`}>
      <div className="text-[10px] font-black uppercase tracking-[0.25em]">{label}</div>
      <div className={`mt-2 font-black ${compact ? "text-sm" : "text-2xl"}`}>{value}</div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-2 border border-silver-fox/20 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-2 text-xs uppercase">
        <span>{label}</span>
        <span className="font-black text-electric-yellow">{score}%</span>
      </div>
      <div className="h-2 bg-white/10">
        <div className="h-2 bg-electric-yellow" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function Panel({
  title,
  content,
  tone,
}: {
  title: string;
  content: string;
  tone?: "good" | "warn" | "yellow";
}) {
  const styles =
    tone === "good"
      ? "border-green-500 bg-green-500/10"
      : tone === "warn"
        ? "border-hot-pink bg-hot-pink/10"
        : tone === "yellow"
          ? "border-electric-yellow bg-electric-yellow/10"
          : "border-silver-fox/20 bg-black/20";

  return (
    <div className={`border p-4 ${styles}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-silver-fox/70">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-silver-fox/85">{content}</p>
    </div>
  );
}

function ListPanel({
  title,
  items,
  pill = false,
}: {
  title: string;
  items: string[];
  pill?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="border border-silver-fox/20 bg-black/20 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-silver-fox/70">
        {title}
      </p>
      <div className={`mt-3 ${pill ? "flex flex-wrap gap-2" : "space-y-2"}`}>
        {items.map((item) =>
          pill ? (
            <span
              key={item}
              className="border border-hot-pink bg-hot-pink/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-hot-pink"
            >
              {item}
            </span>
          ) : (
            <div key={item} className="border-l-4 border-electric-yellow pl-3 text-sm leading-7">
              {item}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
