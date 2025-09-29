import { useState, useEffect } from "react";
import emojiList from "emoji.json";
import { Search } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export const EmojiPicker = ({ onEmojiSelected }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmojis, setFilteredEmojis] = useState(emojiList);
  const categoryRef = useRef(null);

  useEffect(() => {
    const results = emojiList.filter(
      (emoji) =>
        emoji.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emoji.codes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emoji.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmojis(results);
  }, [searchTerm]);

  const handleEmojiClick = (emojiChar) => {
    onEmojiSelected(emojiChar);
  };

  const scrollCategory = (dir) => {
    const container = categoryRef.current;
    if (!container) return;
    const scrollAmount = 80;
    container.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const categories = [
    "All",
    "Smileys & Emotion",
    "People & Body",
    "Animals & Nature",
    "Food & Drink",
    "Travel & Places",
    "Activities",
    "Objects",
    "Symbols",
    "Flags",
  ];



  return (
    <>
      <div className="bg-gray_3 rounded-[20px] w-[300px] h-[400px]">
        <div className="flex flex-col bg-gray_2 rounded-t-[20px] p-3">
            <div className="relative flex items-center">
              <Search className="absolute text-yellow_4/80 ml-2" size={25} />
              <input
                type="text"
                placeholder="search..."
                className="text-white/60 w-full border-2 p-1 pl-10 border-yellow_4/80 rounded-[15px] bg-transparent focus:outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative mt-3">
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-yellow_4/80 hover:bg-yellow_4  text-gray_1 rounded-full p-1 z-10"
                onClick={() => scrollCategory("left")}
              >
                <ChevronLeft size={20} />
              </button>
              <div
                ref={categoryRef}
                className="flex gap-2 mx-6 overflow-x-auto scrollbar-hidden scroll-smooth"
              >
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="shrink-0 text-[12px] text-white/70 px-3 py-1 bg-gray_2 rounded-full whitespace-nowrap cursor-pointer hover:bg-gray_3"
                    onClick={() => cat === "All" ? setSearchTerm("") : setSearchTerm(cat)}
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-yellow_4/80 hover:bg-yellow_4 text-gray_1 rounded-full p-1 z-10"
                onClick={() => scrollCategory("right")}
              >
                <ChevronRight size={20} />
              </button>
            </div>
        </div>
      <div className="overflow-auto scrollbar-hidden h-[280px] px-2">
        <div className="grid grid-cols-4 gap-2 mt-4">
          {filteredEmojis.map((e) => (
            <div className="hover:bg-gray_2 rounded-full size-12 flex items-center justify-center">
                <button
                  key={e.codes}
                  onClick={() => handleEmojiClick(e.char)}
                  style={{ fontSize: "28px", lineHeight: 1 }}
                >
                  {e.char}
                </button>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};
