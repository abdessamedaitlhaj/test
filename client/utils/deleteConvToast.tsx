import { useStore } from "@/store/useStore";

export const DeleteConvToast = ({
  setUndo,
  closeToast,
}: {
  setUndo: boolean;
  closeToast: () => void;
}) => {

    const { user } = useStore();

    return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="flex flex-col justify-start">
            <span className="font-semibold">{user?.username}</span>
            <span className="text-white/80 text-[14px]">
              Conv deleted!
            </span>
          </div>
        </div>
        <button onClick={() => {
            setUndo(prev => !prev)
            closeToast()
        }}>
          <span className="text-white bg-yellow_3 hover:bg-yellow_4/80 px-2 py-2 rounded">
            Undo
          </span>
        </button>
      </div>
    </div>
  );
};
