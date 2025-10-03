import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export const Test = () => {
  let sender = "abdessamed";
  let content = "hello world this is a test message";
  let avatarurl = "https://i.pravatar.cc/150?img=3";
    const [show, setShow] = useState(true);
  return (
    <div className="bg-gray_3 p-4 flex items-center">
        <AnimatePresence>

{ show && (
<motion.div
   exit={{ opacity: 0 }}
>      <div>
          <div className="flex items-center gap-2">
            <img
              src={avatarurl}
              alt="Avatar"
              className="size-12 rounded-full mr-2"
            />
            <div className="flex flex-col justify-start">
              <span className="font-semibold">{sender}</span>
              <span className="text-white/80">
                {content.length > 15
                  ? content.substring(0, 15) + "..."
                  : content}
              </span>
            </div>
            <div className="">
                <button>
                  <span className="text-white bg-yellow_3 hover:bg-yellow_4/80 px-3 py-2 rounded">
                    view
                  </span>
                </button>
            </div>
        </div>
      </div>
</motion.div>
)}
</AnimatePresence>
<button onClick={() => setShow(!show)}>
    show
</button>
    </div>
  );
};
