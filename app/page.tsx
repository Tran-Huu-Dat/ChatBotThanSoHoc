"use client";

import { useState, FormEvent, MouseEvent as ReactMouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  role: "user" | "bot";
  text: string;
};

// ================= CONFIG BACKGROUND =================

// Ký tự số/chữ bay bổng
const floatingGlyphs = [
  {
    id: 1,
    char: "1",
    top: "10%",
    left: "15%",
    size: "text-3xl",
    duration: 18,
    delay: 0,
  },
  {
    id: 2,
    char: "7",
    top: "18%",
    left: "70%",
    size: "text-4xl",
    duration: 22,
    delay: 1,
  },
  {
    id: 3,
    char: "9",
    top: "32%",
    left: "30%",
    size: "text-2xl",
    duration: 16,
    delay: 0.5,
  },
  {
    id: 4,
    char: "A",
    top: "58%",
    left: "80%",
    size: "text-3xl",
    duration: 20,
    delay: 1.2,
  },
  {
    id: 5,
    char: "K",
    top: "66%",
    left: "20%",
    size: "text-4xl",
    duration: 26,
    delay: 0.8,
  },
  {
    id: 6,
    char: "5",
    top: "14%",
    left: "50%",
    size: "text-5xl",
    duration: 24,
    delay: 0.3,
  },
  {
    id: 7,
    char: "M",
    top: "76%",
    left: "55%",
    size: "text-3xl",
    duration: 19,
    delay: 1.6,
  },
  {
    id: 8,
    char: "3",
    top: "44%",
    left: "10%",
    size: "text-2xl",
    duration: 21,
    delay: 0.9,
  },
  {
    id: 9,
    char: "Z",
    top: "28%",
    left: "85%",
    size: "text-3xl",
    duration: 23,
    delay: 0.4,
  },
  {
    id: 10,
    char: "2",
    top: "82%",
    left: "35%",
    size: "text-2xl",
    duration: 27,
    delay: 1.1,
  },
];

// Sao nhỏ lấp lánh
const starDots = [
  { id: 1, top: "6%", left: "8%" },
  { id: 2, top: "14%", left: "32%" },
  { id: 3, top: "18%", left: "68%" },
  { id: 4, top: "26%", left: "20%" },
  { id: 5, top: "30%", left: "50%" },
  { id: 6, top: "34%", left: "82%" },
  { id: 7, top: "42%", left: "12%" },
  { id: 8, top: "50%", left: "30%" },
  { id: 9, top: "55%", left: "64%" },
  { id: 10, top: "60%", left: "88%" },
  { id: 11, top: "68%", left: "18%" },
  { id: 12, top: "72%", left: "46%" },
  { id: 13, top: "78%", left: "72%" },
  { id: 14, top: "84%", left: "56%" },
];

// Đường chòm sao
const constellationLines = [
  { id: 1, top: "22%", left: "18%", width: "110px", rotate: "-18deg" },
  { id: 2, top: "38%", left: "62%", width: "140px", rotate: "12deg" },
  { id: 3, top: "64%", left: "30%", width: "120px", rotate: "-10deg" },
];

// Shooting star component
function ShootingStar({
  delay,
  top,
  left,
  duration = 2.5,
}: {
  delay: number;
  top: string;
  left: string;
  duration?: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute h-0.5 w-32 bg-gradient-to-r from-transparent via-sky-100 to-transparent opacity-0"
      style={{ top, left }}
      animate={{
        x: ["0%", "220%"],
        y: ["0%", "-160%"],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatDelay: 5,
        ease: "easeOut",
        delay,
      }}
    />
  );
}

// ================= PAGE COMPONENT =================

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "bot",
      text: "Xin chào! Mình là trợ lý thần số học. Hãy cho mình biết ngày sinh hoặc câu hỏi của bạn 💫",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // parallax state: -0.5 -> 0.5
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (typeof window === "undefined") return;
    const { innerWidth, innerHeight } = window;
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    setMouseOffset({ x, y });
  };

  const parallax = (strength: number) => ({
    x: mouseOffset.x * strength,
    y: mouseOffset.y * strength,
  });

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: input.trim(),
    };

    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data: { reply?: string; error?: string } = await res.json();

      const botMessage: Message = {
        id: Date.now() + 1,
        role: "bot",
        text:
          data.reply ??
          data.error ??
          "Xin lỗi, hiện tại mình chưa trả lời được. Bạn thử lại sau nhé.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const botMessage: Message = {
        id: Date.now() + 1,
        role: "bot",
        text: "Có lỗi khi kết nối tới Google AI Studio. Bạn vui lòng thử lại sau ít phút.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Lớp nền gradient sâu */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#020617] via-[#02081f] to-[#020617]" />

      {/* Nebula xa (layer sâu, parallax nhẹ) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-72 -right-56 h-[520px] w-[520px] rounded-full bg-indigo-700/40 blur-3xl mix-blend-screen"
        style={{
          translateX: parallax(-20).x,
          translateY: parallax(-10).y,
        }}
        animate={{ opacity: [0.5, 0.9, 0.6] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-80 -left-64 h-[560px] w-[560px] rounded-full bg-sky-700/40 blur-3xl mix-blend-screen"
        style={{
          translateX: parallax(20).x,
          translateY: parallax(10).y,
        }}
        animate={{ opacity: [0.4, 0.85, 0.5] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Nebula gần (layer gần, parallax mạnh hơn) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-[-10%] h-[380px] w-[380px] rounded-full bg-fuchsia-500/35 blur-3xl mix-blend-screen"
        style={{
          translateX: parallax(35).x,
          translateY: parallax(20).y,
        }}
        animate={{ opacity: [0.2, 0.6, 0.3] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-1/4 right-[-8%] h-[360px] w-[360px] rounded-full bg-cyan-400/30 blur-3xl mix-blend-screen"
        style={{
          translateX: parallax(-30).x,
          translateY: parallax(-15).y,
        }}
        animate={{ opacity: [0.2, 0.55, 0.25] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sao nhỏ (layer rất xa) */}
      {starDots.map((s, idx) => (
        <motion.div
          key={s.id}
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-slate-50/90 shadow-[0_0_12px_rgba(148,163,184,0.9)]"
          style={{
            top: s.top,
            left: s.left,
            translateX: parallax(-10).x,
            translateY: parallax(-10).y,
          }}
          animate={{
            opacity: [0.15, 0.9, 0.3],
            scale: [0.7, 1.1, 0.8],
          }}
          transition={{
            duration: 3 + (idx % 5),
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: idx * 0.3,
          }}
        />
      ))}

      {/* Đường chòm sao */}
      {constellationLines.map((c, idx) => (
        <motion.div
          key={c.id}
          className="pointer-events-none absolute origin-left"
          style={{
            top: c.top,
            left: c.left,
            width: c.width,
            rotate: c.rotate,
            translateX: parallax(8).x,
            translateY: parallax(8).y,
          }}
          animate={{
            opacity: [0.15, 0.6, 0.25],
          }}
          transition={{
            duration: 6 + idx * 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="h-px w-full bg-cyan-300/40 blur-[0.5px]" />
          <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(125,211,252,0.9)]" />
          <div className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(125,211,252,0.9)]" />
        </motion.div>
      ))}

      {/* Chữ số / chữ cái bay bổng, layer gần nhất */}
      {floatingGlyphs.map((g) => (
        <motion.div
          key={g.id}
          className={`pointer-events-none absolute ${g.size} font-semibold text-slate-50`}
          style={{
            top: g.top,
            left: g.left,
            translateX: parallax(40).x,
            translateY: parallax(25).y,
          }}
          animate={{
            y: ["0%", "-12%", "0%"],
            x: ["0%", "3%", "-2%", "0%"],
            opacity: [0.08, 0.7, 0.25],
            scale: [0.9, 1.08, 0.94],
            rotate: [0, 10, -12, 0],
          }}
          transition={{
            duration: g.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: g.delay,
          }}
        >
          <span className="drop-shadow-[0_0_14px_rgba(248,250,252,0.9)]">
            {g.char}
          </span>
        </motion.div>
      ))}

      {/* Shooting stars */}
      <ShootingStar delay={1.5} top="18%" left="-10%" />
      <ShootingStar delay={4.2} top="60%" left="-12%" duration={3} />
      <ShootingStar delay={7.3} top="40%" left="-15%" duration={2.2} />

      {/* Nội dung chính (hero hoặc chatbot) */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {!showChat ? (
            // =============== HERO SECTION ===============
            <motion.section
              key="hero"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center max-w-3xl"
            >
              <motion.h1
                className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                Chào mừng đến với dự án của chúng tôi
              </motion.h1>
              <motion.p
                className="text-sm sm:text-lg text-slate-300 mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Hãy thử khám phá bản thân qua lăng kính Thần Số Học cùng AI ✨
              </motion.p>

              <motion.button
                onClick={() => setShowChat(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm sm:text-base font-semibold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-xl shadow-orange-500/40 border border-white/20"
              >
                KHÁM PHÁ NGAY
              </motion.button>
            </motion.section>
          ) : (
            // =============== CHATBOT SECTION ===============
            <motion.section
              key="chat"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-3xl"
            >
              <motion.div
                className="bg-slate-900/70 border border-slate-700/70 rounded-3xl shadow-2xl backdrop-blur-xl px-4 py-5 sm:px-6 sm:py-7 flex flex-col gap-4 h-[75vh]"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-sky-400 to-emerald-400 flex items-center justify-center text-xl"
                      animate={{ rotate: [0, 10, -5, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      🔮
                    </motion.div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-semibold">
                        Chatbot Thần Số Học
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-400">
                        Đặt câu hỏi về ngày sinh, tên, đường đời, sứ mệnh…
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs border border-emerald-400/30">
                      Online
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowChat(false)}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </div>

                {/* Vùng chat */}
                <div className="flex-1 relative mt-2">
                  <div className="absolute inset-0 rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
                    <div className="h-full w-full p-3 sm:p-4 overflow-y-auto space-y-3 custom-scrollbar">
                      <AnimatePresence initial={false}>
                        {messages.map((m) => (
                          <motion.div
                            key={m.id}
                            initial={{
                              opacity: 0,
                              y: 10,
                              x: m.role === "user" ? 20 : -20,
                            }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            exit={{
                              opacity: 0,
                              y: 10,
                              x: m.role === "user" ? 20 : -20,
                            }}
                            transition={{ duration: 0.25 }}
                            className={`flex ${
                              m.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm sm:text-base leading-relaxed shadow-sm whitespace-pre-wrap ${
                                m.role === "user"
                                  ? "bg-sky-500 text-white rounded-br-sm"
                                  : "bg-slate-800/90 text-slate-50 border border-slate-700/70 rounded-bl-sm"
                              }`}
                            >
                              {m.text}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Typing indicator */}
                      <AnimatePresence>
                        {isThinking && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, x: -20 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, y: 10, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex justify-start mt-1"
                          >
                            <div className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-800/90 border border-slate-700/70 px-3 py-2">
                              <span className="text-xs text-slate-400 mr-1">
                                Đang phân tích…
                              </span>
                              <motion.span
                                className="h-1.5 w-1.5 rounded-full bg-slate-300"
                                animate={{
                                  opacity: [0.2, 1, 0.2],
                                  y: [0, -2, 0],
                                }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                              />
                              <motion.span
                                className="h-1.5 w-1.5 rounded-full bg-slate-300"
                                animate={{
                                  opacity: [0.2, 1, 0.2],
                                  y: [0, -2, 0],
                                }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 0.8,
                                  delay: 0.15,
                                }}
                              />
                              <motion.span
                                className="h-1.5 w-1.5 rounded-full bg-slate-300"
                                animate={{
                                  opacity: [0.2, 1, 0.2],
                                  y: [0, -2, 0],
                                }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 0.8,
                                  delay: 0.3,
                                }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSend}
                  className="mt-2 flex items-center gap-2"
                >
                  <div className="flex-1 relative">
                    <input
                      className="w-full rounded-2xl bg-slate-900/80 border border-slate-700/80 px-4 py-2.5 text-sm sm:text-base outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/40 transition-all"
                      placeholder='Nhập câu hỏi: VD: "Ngày sinh 12/09/1995 nói lên điều gì?"'
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 bg-gradient-to-tr from-sky-500 to-fuchsia-500 text-sm sm:text-base font-medium shadow-lg shadow-sky-500/30 hover:shadow-fuchsia-500/30 transition-all border border-white/10"
                  >
                    Gửi
                  </motion.button>
                </form>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
