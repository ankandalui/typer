import { CharacterData, Data } from "@/types";

export const calculateWpm = (
  characters: CharacterData[],
  timeSpent: number
): number => {
  const correctChars = characters.filter(
    (char) => char.charColor == "text-gray-400"
  ).length;
  const minutes = timeSpent / 60;
  return Math.round(correctChars / 5 / (minutes || 1));
};

export const calculateAccuracy = (characters: CharacterData[]): number => {
  const total = characters.length;
  const correct = characters.filter(
    (char) => char.charColor === "text-gray-400"
  ).length;
  return Math.round((correct / total) * 100);
};

export const fallbackQuotes = [
  {
    content:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    content:
      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    author: "Steve Jobs",
  },
  {
    content:
      "Life is what happens when you're busy making other plans. Live in the moment and make it count.",
    author: "John Lennon",
  },
];

export const fetchRandomQuote = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      "https://api.quotable.io/random?minLength=100&maxLength=200",
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Failed to fetch quote");
    }

    const data = await response.json();
    return {
      content: data.content,
      author: data.author,
    };
  } catch (error) {
    console.error("Error fetching quote:", error);
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }
};

export const prepareText = (text: string): Data => {
  const words = text.split(" ").map((word, idx) => {
    const previousWords = text.split(" ").slice(0, idx).join(" ");
    return {
      word,
      indexFrom: previousWords.length + (idx > 0 ? 1 : 0),
    };
  });

  const characters = text.split("").map((char) => ({
    char,
    charColor: "text-gray-600",
  }));

  return {
    words,
    characters,
    cursorPosition: 0,
  };
};
