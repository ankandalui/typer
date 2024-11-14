"use client";
import { Data, Quote, Statistics } from "@/types";
import {
  calculateAccuracy,
  calculateWpm,
  fetchRandomQuote,
  prepareText,
} from "@/utils/helpers";
import { useCallback, useEffect, useRef, useState } from "react";
import TypingLoader from "./TypingLoader";
import { Command, Divide, Timer } from "lucide-react";

const TypingTest: React.FC = () => {
  const [data, setData] = useState<Data>({
    words: [],
    characters: [],
    cursorPosition: 0,
  });
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);

  //Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getNewQuote = async () => {
    setIsLoading(true);
    try {
      const quote = await fetchRandomQuote();
      setCurrentQuote(quote);
      setData(prepareText(quote.content));
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = useCallback(() => {
    if (!isStarted) {
      setIsStarted(true);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isStarted]);

  const handleInput = (value: string) => {
    startTimer();

    const newCharacters = [...data.characters];
    const typed = value.split("");

    typed.forEach((char, index) => {
      if (index < newCharacters.length) {
        newCharacters[index].charColor =
          char === newCharacters[index].char ? "text-gray-400" : "text-red-500";
      }
    });

    setData({
      ...data,
      characters: newCharacters,
      cursorPosition: value.length,
    });

    if (value.length === data.characters.length) {
      setIsFinished(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setStatistics([
        ...statistics,
        {
          round: statistics.length + 1,
          wpm: calculateWpm(newCharacters, 60 - timeLeft),
          accuracy: calculateAccuracy(newCharacters),
        },
      ]);
    }
  };

  const restart = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsStarted(false);
    setIsFinished(false);
    setTimeLeft(60);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    await getNewQuote();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    const initialize = async () => {
      await getNewQuote();
      inputRef.current?.focus();
    };

    // keyboard shortcuts
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        restart();
      }
    };

    initialize();
    document.addEventListener("keydown", handleKeyboardShortcut);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      document.removeEventListener("keydown", handleKeyboardShortcut);
    };
  }, []);

  if (isLoading) return <TypingLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Speed Typing Test
          </h1>
          <p className="text-gray-400">
            Improve your typing speed and accuracy
          </p>
        </div>
        {!isFinished ? (
          <div className="space-y-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-8">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400 mb-1">WPM</span>
                    <span className="text-3xl font-bold text-blue-400">
                      {isStarted
                        ? calculateWpm(data.characters, 60 - timeLeft)
                        : 0}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400" mb-1>
                      Accuracy
                    </span>
                    <span className="text-3xl font-bold text-purple-400">
                      {isStarted ? calculateAccuracy(data.characters) : 0}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-gray-400" />
                  <span className="text-2xl font-mono font-bold">
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            {currentQuote && (
              <div className="text-right text-gray-400 italic">
                - {currentQuote.author}
              </div>
            )}

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <div className="text-2xl leading-relaxed font-mono">
                {data.characters.map((char, index) => (
                  <span
                    key={index}
                    className={`${char.charColor} transition-colors duration-150
                ${
                  index === data.cursorPosition
                    ? "border-r-2 border-blue-400 animate-pulse"
                    : ""
                }
                ${char.charColor === "text-gray-400" ? "text-blue-400" : ""}
                ${
                  char.charColor === "text-red-500"
                    ? "text-red-400 bg-red-900/20"
                    : ""
                }`}
                  >
                    {char.char}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                ref={inputRef}
                className="w-full bg-gray-800/50 backdrop-blur-sm text-white p-6 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInput(e.target.value)
                }
                placeholder="Start typing to begin the test..."
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  e.target.focus()
                }
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 text-gray-400">
                <Command className="w-4 h-4" />
                <span className="text-sm">+</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded-md text-sm">
                  R
                </kbd>
                <span className="text-sm ml-2">to restart</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center">
            <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Test Complete!
            </h2>
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                <div className="text-sm text-gray-400 mb-2">
                  Words Per Minute
                </div>
                <div className="text-4xl font-bold text-blue-400">
                  {statistics[statistics.length - 1]?.wpm || 0}
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                <div className="text-sm text-gray-400 mb-2">Accuracy</div>
                <div className="text-4xl font-bold text-purple-400">
                  {statistics[statistics.length - 1]?.accuracy || 0}%
                </div>
              </div>
            </div>
            <button
              onClick={restart}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl
                       font-semibold text-lg hover:opacity-90 transition-opacity duration-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        )}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Press Ctrl/Cmd + R at any time to restart the test</p>
        </div>
      </div>
    </div>
  );
};

export default TypingTest;
