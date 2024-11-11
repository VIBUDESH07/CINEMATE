//@ts-nocheck
"use client";
import { FC, useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const VoiceReader: FC = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [timeElapsed, setTimeElapsed] = useState(0);

  // Ensure useEffect is always called
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (listening) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }

    if (timeElapsed >= 20) {
      SpeechRecognition.stopListening();
    }

    return () => {
      if (timer) clearInterval(timer);
      setTimeElapsed(0);
    };
  }, [listening, timeElapsed]);

  // If the browser doesn't support speech recognition, display a message.
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>;
  }

  return (
    <div>
      <h1 className="lg:text-5xl font-bold underline decoration-wavy text-2xl">
        Speech to Text Reader
      </h1>
      <p className="mt-6 pb-32 mb-4 rounded-md bg-base-100 lg:w-96 lg:h-48 w-64 h-64 overflow-auto p-4">
        <span className="ml-2 font-bold text-xl bg-base-100">Recognized Text:</span>
        {transcript || "Speak something to start transcription..."}
      </p>
      <p className="mb-2 text-xl font-bold">
        Microphone: {listening ? "Listening..." : "Off"}
      </p>
      <div className="flex gap-3 items-center">
        <button
          className="btn btn-primary btn-sm rounded-full w-16 h-16 flex justify-center items-center"
          onClick={() => {
            if (listening) {
              SpeechRecognition.stopListening();
            } else {
              resetTranscript();
              SpeechRecognition.startListening();
            }
          }}
        >
          {listening ? (
            <FaMicrophoneSlash className="text-3xl" />
          ) : (
            <FaMicrophone className="text-3xl" />
          )}
        </button>
        <button className="btn btn-accent btn-sm" onClick={resetTranscript}>
          Reset
        </button>
      </div>
      {listening && (
        <p className="mt-2 text-gray-600 text-sm">
          Auto-stopping in {20 - timeElapsed} seconds...
        </p>
      )}
    </div>
  );
};

export default VoiceReader;
