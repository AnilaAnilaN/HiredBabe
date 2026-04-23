"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";

interface VideoRecorderProps {
  isRecording: boolean;
  minimal?: boolean;
}

const VideoRecorder = forwardRef((props: VideoRecorderProps, ref) => {
  const { isRecording, minimal } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  useImperativeHandle(ref, () => ({
    startStream: async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsMicOn(true);
        setIsCamOn(true);
        return true;
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied. Please enable permissions.");
        return false;
      }
    },
    stopStream: () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    },
    captureFrame: () => {
      if (videoRef.current && canvasRef.current && isCamOn && streamRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL("image/jpeg", 0.5);
        }
      }
      return null;
    }
  }));

  useEffect(() => {
    // We don't auto-start anymore. We wait for manual startStream call.
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      }
    };
  }, []);

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };

  const toggleCam = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCamOn;
        setIsCamOn(!isCamOn);
      }
    }
  };

  return (
    <div className={`relative w-full overflow-hidden group ${minimal ? "h-0" : "aspect-video bg-black border-4 border-electric-yellow shadow-[10px_10px_0px_0px_#FF006E]"}`}>
      <canvas ref={canvasRef} className="hidden" />
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-hot-pink font-bold uppercase text-center p-4">
          {error}
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover grayscale contrast-125 transition-opacity duration-500 ${isCamOn ? "opacity-100" : "opacity-0"}`}
          />
          
          {!isCamOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-obsidian">
               <div className="text-silver-fox/20 scale-[4]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
               </div>
            </div>
          )}
          
          {/* Controls Overlay */}
          <div className={`absolute flex gap-2 z-50 ${minimal ? "bottom-0 right-0" : "bottom-4 right-4"}`}>
            <button 
              onClick={toggleMic}
              className={`p-3 border-2 transition-all ${isMicOn ? "bg-white/10 border-white/20 text-white" : "bg-hot-pink border-obsidian text-white"}`}
              title={isMicOn ? "Mute Mic" : "Unmute Mic"}
            >
              {isMicOn ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
            </button>
            <button 
              onClick={toggleCam}
              className={`p-3 border-2 transition-all ${isCamOn ? "bg-white/10 border-white/20 text-white" : "bg-hot-pink border-obsidian text-white"}`}
              title={isCamOn ? "Hide Cam" : "Show Cam"}
            >
              {isCamOn ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
            </button>
          </div>

          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${isRecording ? "bg-hot-pink animate-pulse" : "bg-silver-fox"}`}></div>
            <span className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">
              {isRecording ? "LIVE ANALYSIS ACTIVE" : "CAMERA STANDBY"}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 bg-obsidian/80 backdrop-blur-sm border border-electric-yellow px-3 py-1 text-[10px] text-electric-yellow font-bold uppercase tracking-tighter">
            REC: 720P // 30FPS // GEMINI_3_FL_v1
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </>
      )}
    </div>
  );
});

VideoRecorder.displayName = "VideoRecorder";
export default VideoRecorder;
