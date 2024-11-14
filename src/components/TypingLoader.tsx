import { useEffect, useState } from "react";

const TypingLoader: React.FC = () => {
  const [text, setText] = useState("Loading");

  useEffect(() => {
    const interval = setInterval(() => {
      setText((current) => (current.length >= 10 ? "Loading" : current + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center">
      <div className="text-3xl font-mono text-blue-400 mb-4">{text}</div>
      <div className="text-ggray-400">Fetching a random quote for you...</div>
    </div>
  );
};

export default TypingLoader;
