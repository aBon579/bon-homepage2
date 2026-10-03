import { useEffect, useRef, useState } from "react";
import Hero from "./components/Hero.jsx";
import Portfolio from "./components/Portfolio.jsx";
import { FOOTER_COPY, VIDEO_URL } from "./constants.js";

/* 页面结构：
   - 视频 fixed 全页铺底（首屏直接叠、作品集磨砂透出）
   - 分类状态（全部/视频/文章）由 App 持有：
     英雄区右下分类卡点击 → 切分类 + 平滑滚到作品集
   - 作品集受控该状态，内部搜索与分类 AND 组合 */

export default function App() {
  const [cat, setCat] = useState("全部");
  const [query, setQuery] = useState("");
  const videoRef = useRef(null);

  // 视频静音循环：ref 强制 muted + play() 兜底
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  // 分类卡点击：切到对应分类、清空搜索、滚到作品集
  const goCategory = (c) => {
    setCat(c);
    setQuery("");
    const el = document.getElementById("works");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen w-full text-white antialiased">
      {/* 全页固定背景视频 */}
      <video
        ref={videoRef}
        className="fixed inset-0 z-0 h-full w-full object-cover"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      <div className="relative z-10">
        <Hero onCategory={goCategory} />
        <Portfolio cat={cat} setCat={setCat} query={query} setQuery={setQuery} />
        <footer className="bg-black/30 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-white/60 sm:flex-row sm:px-8 lg:px-12">
            <span>{FOOTER_COPY}</span>
            <span className="text-white/45">By DeepSeek Harness</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
