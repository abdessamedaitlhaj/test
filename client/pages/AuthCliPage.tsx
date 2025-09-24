import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { space } from "postcss/lib/list";

const STORAGE_KEY = "cliTokenInfo";

// interface CliTokenInfo { token: string; expiresAt: number; issuedAt: number; socketId?: string; }

// export default function AuthCliPage() {
//   const { socket, isConnected } = useStore();
//   const { state } = useAuth();
//   const [info, setInfo] = useState<CliTokenInfo | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   return (
//     <div className="p-6 max-w-2xl mx-auto space-y-6 text-sm">
//       <h1 className="text-xl font-bold">CLI Authorization</h1>
//       <div className="bg-yellow-100 p-4 rounded border border-yellow-300 leading-relaxed">
//         <p className="font-semibold mb-2">Disclaimer</p>
//         <ul className="list-disc ms-5 space-y-1">
//           <li>This CLI token grants limited control: matchmaking start, paddle movement, status.</li>
//           <li>Token is bound to this browser tab's socket id. Closing or refreshing invalidates it.</li>
//           <li>Only one active CLI token per user at a time. New authorization revokes the previous.</li>
//           <li>Token lifetime: 1 hour. After expiry you must re-authorize.</li>
//         </ul>
//       </div>

//       <div className="flex gap-4 items-center">

//       </div>

//     </div>
//   );
// }

const AuthCliPage = () => {
  const { socket, isConnected } = useStore();
  const { state } = useAuth();
  const [info, setInfo] = useState<CliTokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (info) {
      navigator.clipboard.writeText(info.token);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }
  };

  // If socket disconnects while we have a token, invalidate locally so user can re-authorize.
  useEffect(() => {
    if (!isConnected && info) {
      localStorage.removeItem(STORAGE_KEY);
      setInfo(null);
    }
  }, [isConnected, info]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setInfo(parsed);
      } catch {}
    }
  }, []);

  // Token is only considered valid if socket is currently connected.
  // Token is only considered valid if socket is currently connected and not expired.
  const isTokenValid = !!(
    info &&
    info.socketId === socket?.id &&
    Date.now() < info.expiresAt &&
    isConnected
  );
  const [remainingMin, setRemainingMin] = useState(0);

  // Timer effect: only runs when token is valid
  useEffect(() => {
    if (isTokenValid) {
      const update = () => {
        if (info) {
          const mins = Math.max(
            0,
            Math.floor((info.expiresAt - Date.now()) / 60000)
          );
          setRemainingMin(mins);
        }
      };
      update();
      const interval = setInterval(update, 1000); // update every second for responsiveness
      return () => clearInterval(interval);
    } else {
      setRemainingMin(0);
    }
  }, [isTokenValid, info]);

  const authorize = async () => {
    if (!socket || !socket.id) {
      setError("Socket not connected");
      return;
    }
    if (isTokenValid) {
      revoke();

      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/api/authcli/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.user?.accessToken}`,
        },
        body: JSON.stringify({ socketId: socket.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      const newInfo: CliTokenInfo = {
        token: data.token,
        expiresAt: data.expiresAt,
        issuedAt: Date.now(),
        socketId: socket.id,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newInfo));
      setInfo(newInfo);
      // Emit join event for CLI socket to ensure matchmaking works
      if (socket && state.user?.user?.id) {
        socket.emit("join", state.user.user.id);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const revoke = async () => {
    if (!info) return;
    setLoading(true);
    setError(null);
    try {
      await fetch("http://localhost:3000/api/authcli/revoke", {
        method: "POST",
        headers: { Authorization: `Bearer ${info.token}` },
      });
    } catch {
    } finally {
      setLoading(false);
      localStorage.removeItem(STORAGE_KEY);
      setInfo(null);
    }
  };

  // Invalidate if socket id changed (reconnection with new id)
  useEffect(() => {
    if (info && socket?.id && info.socketId && info.socketId !== socket.id) {
      localStorage.removeItem(STORAGE_KEY);
      setInfo(null);
    }
  }, [socket?.id, info]);

  return (
    <div className="flex flex-col space-y-10 items-center p-4 w-[825px]">
      <span className="text-[30px] font-bold text-[40px] w-[691px] h-[48px] block text-center">
        PLay with{" "}
        <span
          style={{
            background: "linear-gradient(to right, #ebca24, #857214)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Command Line
        </span>
      </span>
      <div className="p-6 bg-gray_3/70 rounded-[29px]">
        <strong className="text-lg">
          Disclamer<span className="text-yellow_4 ml-2">!</span>
        </strong>
        <p className="mt-2 font-extralight text-[15px] leading-10">
          This CLI token grants limited control: matchmaking start, paddle
          movement, status. Token is bound to this browser tab's socket id.
          Closing or refreshing invalidates it. Only one active CLI token per
          user at a time. New authorization revokes the previous. Token
          lifetime: 1 hour. After expiry you must re-authorize.
        </p>
      </div>
      {error && <div className="text-red_1/80">{error}</div>}
      {!isConnected && (
        <div className="">
          <span className="text-[14px] text-yellow_4/80">
            Socket disconnected. Reconnect will require new authorization.
          </span>
        </div>
      )}
      <div className="flex gap-8 items-center justify-between w-full">
        <div
          className={`flex items-center justify-center ${
            isTokenValid ? "gradient_red" : "gradient_yellow"
          } gradient_yellow text-white rounded-[15px] p-4 w-[314px] h-[56px] duration-300 ease-in-out hover:scale-110 `}
        >
          <button disabled={loading} onClick={authorize}>
            <span className="text-center">
              {isTokenValid
                ? `Revoke`
                : loading
                ? "Authorizing..."
                : "I Authorize"}
            </span>
          </button>
        </div>

        <div
          className={`flex items-center justify-center bg-gray_2 p-4 rounded-[15px] w-[314px] h-[56px] ${
            info
              ? "transition-all  duration-300 ease-in-out hover:scale-110"
              : "text-white/50 cursor-not-allowed bg-gray_1"
          }`}
        >
          <button disabled={!info || !isTokenValid} onClick={handleCopy}>
            {!isCopied ? (
              <span>
                Click to{" "}
                <span className={`${info && "text-yellow_4"}`}>
                  copy your token
                </span>
              </span>
            ) : (
              <span className="text-yellow_4">Copied!</span>
            )}
          </button>
        </div>
      </div>
      {info && (
        <div className="w-full">
          <p className="text-end text-white/80">
            Valid for <span className="text-yellow_4">{remainingMin}</span> min{" "}
          </p>
          <div className="mt-4 border border-gray_3 p-3 rounded break-words text-xs w-full">
            <code>{info.token}</code>
          </div>
        </div>
      )}
      <div className="p-6 bg-gray_3 rounded-lg w-full">
        <strong className="text-lg">
          Usage<span className="text-yellow_4 ml-2">( using CURL ) </span>
        </strong>
        <div className="flex flex-col space-y-4 bg-black p-6 rounded-lg mt-4 overflow-x-auto">
          <p className="max-w-[800px] font-extralight text-sm text-nowrap ">
            curl -H "Authorization: Bearer &lt;TOKEN&gt;" -X POST
            http:localhost:3000/api/cli/start
          </p>
          <p className="max-w-[800px] font-extralight text-sm text-nowrap">
            curl -H "Authorization: Bearer &lt;TOKEN&gt;" -H 'Content-Type:
            application/json' -d {'direction":"up'}{" "}
            http://localhost:3000/api/cli/move
          </p>
          <p className="max-w-[800px] font-extralight text-sm text-nowrap">
            curl -H "Authorization: Bearer &lt;TOKEN&gt;"
            http://localhost:3000/api/cli/status
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCliPage;
