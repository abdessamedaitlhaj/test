import { useState, useEffect, useMemo } from "react";
import emojiList from "emoji.json";

import {
  Activity,
  Clock,
  Component,
  Flag,
  Hamburger,
  Lamp,
  Leaf,
  Plane,
  Search,
  Smile,
  Users,
} from "lucide-react";
import { useRef } from "react";
import { c } from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";

export const EmojiPicker = ({ onEmojiSelected }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmojis, setFilteredEmojis] = useState(emojiList);
  const categoryRef = useRef(null);
  const emojiElement = useRef(null);
  const [recentEmojis, setRecentEmojis] = useState([]);

  useEffect(() => {
    const results = emojiList.filter(
      (emoji) =>
        emoji.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emoji.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmojis(results);
  }, [searchTerm]);

  useEffect(() => {
    const storedEmojis = localStorage.getItem("recentEmojis");
    if (storedEmojis) {
      setRecentEmojis(JSON.parse(storedEmojis));
    }
  }, []);

  const handleEmojiClick = (emojiChar: string) => {
    onEmojiSelected(emojiChar);
    setRecentEmojis((prev) => {
      const updated = [emojiChar, ...prev.filter((e) => e !== emojiChar)];
      return updated.slice(0, 8);
    });
    localStorage.setItem("recentEmojis", JSON.stringify(recentEmojis));
  };

  useEffect(() => {
    if (emojiElement.current) {
      emojiElement.current.scrollTo({ top: 0 });
    }
  }, [searchTerm]);

  const categories = [
    [Smile, "Smileys & Emotion"],
    [Users, "Person"],
    [Activity, "Activities"],
    [Leaf, "Animals & Nature"],
    [Plane, "Travel & Places"],
    [Flag, "Flags"],
    [Lamp, "Objects"],
    [Component, "Symbols"],
    [Hamburger, "Food & Drink"],
  ];

  return (
    <>
      <div className="bg-gray_1 rounded-[20px] w-[320px] h-[400px]">
        <div className="flex flex-col bg-gray_2 rounded-t-[20px] p-3">
          <div className="relative flex items-center">
            <Search
              className="absolute text-white/80 ml-2"
              size={25}
              strokeWidth={1}
            />
            <input
              type="text"
              placeholder="search..."
              className="text-white/80  w-full border p-1 pl-10 border-white/80 rounded-[15px] bg-transparent focus:outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative mt-3 flex justify-center">
            <div
              ref={categoryRef}
              className="flex  items-center justify-between overflow-x-auto scrollbar-hidden scroll-smooth w-[300px]"
            >
              {categories.map(([Icon, label]) => (
                <button
                  key={label}
                  className="flex flex-col items-center justify-center flex-shrink-0"
                  onClick={(e) => setSearchTerm(label)}
                >
                  <Icon
                    className="text-white/80 hover:text-yellow_4/80"
                    size={20}
                    strokeWidth={1.4}
                  />
                </button>
              ))}
            </div>
          </div>

          {recentEmojis.length > 0 && (
            <div className="mt-3 flex h-[40px] items-center justify-start overflow-hidden">
              <Clock
                className="shrink-0 text-white/80"
                size={20}
                strokeWidth={1.4}
              />
              <div className="flex ml-3 gap-2">
                {recentEmojis.map((emojiChar, index) => (
                  <div className="flex items-center justify-center size-8 rounded-full hover:bg-gray_3" key={index}>
                    <button
                      onClick={() => handleEmojiClick(emojiChar)}
                      style={{ fontSize: "20px", lineHeight: 1 }}
                    >
                      {emojiChar}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className={`${recentEmojis.length > 0 ? "max-h-[240px]" : "max-h-[280px]"} overflow-auto scrollbar-hidden p-2`}
          ref={emojiElement}
        >
          <div className="grid grid-cols-6 ">
            {filteredEmojis.map((e, i) => {

              return (
                <div
                  className="hover:bg-gray_3   rounded-full size-10 flex items-center justify-center ml-1"
                  key={e.codes}
                  id={e.codes}
                >
                  <button
                    key={e.codes}
                    onClick={() => handleEmojiClick(e.char)}
                    style={{ fontSize: "28px", lineHeight: 1 }}
                  >
                    {e.char}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
