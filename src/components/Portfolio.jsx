import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  X,
  ArrowUpRight,
  Newspaper,
  Play,
  Layers,
  ChevronDown,
} from "lucide-react";
import { WORKS } from "../data/works-data.js";
import { DARK_GRADIENT, FEATURED_LINKS } from "../constants.js";

/* 作品集（方案三：Bento 精选 + 最近 + 索引）：
   中性态 = 精选磁贴（1 大 4 小）→ 最近 6 条 → 完整索引（内部滚动，页高恒定）；
   分类态（视频/文章）= 该分类最近 6 条 → 该分类完整索引（同构）；
   搜索态 = 全量结果网格（命中高亮）。磨砂视频背景与入场动画与之前一致。 */

const CATEGORIES = ["全部", "视频", "文章"];

const CAT_META = {
  全部: {
    title: "我的作品集",
    desc: "AI、NAS、DIY 的实测、教程与玩法，全部整理在这里。点卡片直达原文与视频。",
    Icon: Layers,
  },
  视频: {
    title: "视频作品",
    desc: "拆机、折腾与翻车的视频，点击直达 B 站。",
    Icon: Play,
  },
  文章: {
    title: "文章作品",
    desc: "公众号的长文与教程，点击直达原文。",
    Icon: Newspaper,
  },
};

// ── 精选与最近（模块级派生一次）──
const featuredWorks = FEATURED_LINKS.map((l) =>
  WORKS.find((w) => w.link === l)
).filter(Boolean);
const featuredSet = new Set(featuredWorks.map((w) => w.link));

const silkscreen = { fontFamily: "'Silkscreen', cursive", fontWeight: 400 };

function platformOf(link) {
  if (/bilibili\.com/i.test(link)) return "B站";
  if (/weixin\.qq\.com/i.test(link)) return "公众号";
  return "链接";
}

function matches(item, tokens) {
  if (!tokens.length) return true;
  const hay = [
    item.title,
    item.desc || "",
    (item.keywords || []).join(" "),
    item.category,
  ]
    .join("\u0000")
    .toLowerCase();
  return tokens.every((t) => hay.includes(t));
}

function Highlight({ text, tokens }) {
  if (!tokens.length) return text;
  const lower = text.toLowerCase();
  const ranges = [];
  tokens.forEach((t) => {
    let from = 0;
    let i = lower.indexOf(t, from);
    while (i !== -1) {
      ranges.push([i, i + t.length]);
      from = i + t.length;
      i = lower.indexOf(t, from);
    }
  });
  if (!ranges.length) return text;
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [ranges[0]];
  for (let k = 1; k < ranges.length; k++) {
    const last = merged[merged.length - 1];
    if (ranges[k][0] <= last[1]) last[1] = Math.max(last[1], ranges[k][1]);
    else merged.push(ranges[k]);
  }
  const out = [];
  let pos = 0;
  merged.forEach(([s, e], idx) => {
    if (s > pos) out.push(text.slice(pos, s));
    out.push(
      <mark key={idx} className="rounded-sm bg-white/25 px-0.5 text-white">
        {text.slice(s, e)}
      </mark>
    );
    pos = e;
  });
  if (pos < text.length) out.push(text.slice(pos));
  return out;
}

// 分类小徽标
function CatBadge({ category }) {
  const isVideo = category === "视频";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isVideo ? "bg-white/15 text-white/80" : "bg-white/10 text-white/70"
      }`}
    >
      {isVideo ? <Play className="h-3 w-3" /> : <Newspaper className="h-3 w-3" />}
      {category}
    </span>
  );
}

export default function Portfolio({ cat, setCat, query, setQuery }) {
  const sectionRef = useRef(null);
  const [shown, setShown] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [hovered, setHovered] = useState(null); // 索引悬停预览数据
  const [canHover, setCanHover] = useState(false);
  const previewRef = useRef(null);

  // 悬停能力探测（触摸设备不出预览）
  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  // 切换分类/搜索时清掉悬停预览，防止预览残留已不在列表里的作品
  useEffect(() => {
    setHovered(null);
  }, [cat, query]);

  // 滚动入场（一次性）
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    const onScroll = () => setHovered(null);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // 入场/重排动画：进场前 paused，进场后按序播放；筛选变化时 key 重挂载即重播
  const anim = (i, base = 40) => ({
    animation: "fade-up .5s cubic-bezier(0.16,1,0.3,1) both",
    animationDelay: `${Math.min(i, 12) * base}ms`,
    animationPlayState: shown ? "running" : "paused",
  });

  const tokens = useMemo(
    () =>
      query
        .toLowerCase()
        .split(/\s+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [query]
  );

  const filtered = useMemo(
    () =>
      WORKS.filter(
        (w) => (cat === "全部" || w.category === cat) && matches(w, tokens)
      ),
    [tokens, cat]
  );

  const catCount = (c) =>
    c === "全部" ? WORKS.length : WORKS.filter((w) => w.category === c).length;

  // 三态：neutral（全部）/ category（视频·文章）/ search
  const mode =
    tokens.length > 0 ? "search" : cat === "全部" ? "neutral" : "category";
  // 当前视图的作品范围（分类态 = 该分类，其余 = 全部）
  const scopeWorks =
    cat === "全部" ? WORKS : WORKS.filter((w) => w.category === cat);
  // 最近更新：中性态排除精选防重复，恒取 6 条
  const recentWorks =
    mode === "neutral"
      ? WORKS.filter((w) => !featuredSet.has(w.link)).slice(0, 6)
      : scopeWorks.slice(0, 6);
  const meta = CAT_META[cat] || CAT_META["全部"];
  const MetaIcon = meta.Icon;
  const title = tokens.length > 0 ? "搜索结果" : meta.title;
  const desc =
    tokens.length > 0
      ? `关键词「${query.trim()}」的匹配作品${cat !== "全部" ? `（仅${cat}）` : ""}`
      : meta.desc;

  // 索引预览：数据走 state，位置走 DOM 直写（不触发重渲染）
  const onIndexMove = (e) => {
    const el = previewRef.current;
    if (!el) return;
    const px = Math.min(e.clientX + 24, window.innerWidth - 312);
    const py = Math.min(
      Math.max(e.clientY - 72, 12),
      Math.max(window.innerHeight - 232, 12)
    );
    el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
  };

  const large = featuredWorks[0];
  const smalls = featuredWorks.slice(1);
  const LargeIcon = large
    ? large.category === "视频"
      ? Play
      : Newspaper
    : null;

  return (
    <section
      id="works"
      ref={sectionRef}
      className="relative w-full bg-black/30 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        {/* ── 区头 + Silkscreen 计数 ── */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              <MetaIcon className="h-3.5 w-3.5" />
              Works{cat !== "全部" ? ` / ${cat}` : ""}
            </span>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {title}
              </h2>
              {cat !== "全部" && (
                <button
                  type="button"
                  onClick={() => setCat("全部")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur-lg transition-colors hover:bg-white/15 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                  返回全部
                </button>
              )}
            </div>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
              {desc}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl tracking-tight text-white" style={silkscreen}>
              {mode === "neutral" ? WORKS.length : filtered.length}
            </span>
            <span className="text-sm text-white/50">
              件作品{mode !== "neutral" && filtered.length !== WORKS.length ? ` · 共 ${WORKS.length} 件` : ""}
            </span>
          </div>
        </div>

        {/* ── 工具行：搜索 + 分类片 ── */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              placeholder={
                cat === "全部" ? "搜索作品：标题 / 关键词 / 分类…" : `在${cat}中搜索…`
              }
              aria-label="搜索作品"
              className="w-full rounded-full bg-white/10 py-3 pl-11 pr-10 text-sm text-white placeholder-white/40 outline-none backdrop-blur-lg transition-colors focus:bg-white/[0.16]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="清空搜索"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/50 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  cat === c
                    ? "bg-white font-medium text-[#010101]"
                    : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                }`}
              >
                {c} {catCount(c)}
              </button>
            ))}
          </div>
        </div>

        {/* ════════ 中性态/分类态：（中性含 Bento）→ 最近 6 → 完整索引 ════════ */}
        {mode !== "search" && (
          <>
            {/* Bento 精选：1 大 + 4 小，生成式视觉，页高恒定（仅中性态） */}
            {mode === "neutral" && (
            <div className="mt-8 grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[150px] sm:grid-cols-4 sm:gap-4">
              {large && (
                <a
                  key={large.link}
                  href={large.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={anim(0, 60)}
                  className="group relative col-span-2 row-span-2 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.14] sm:p-6"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(120% 100% at 85% 0%, rgba(255,255,255,0.10), transparent 60%)",
                    }}
                  />
                  <LargeIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-5 -right-3 h-32 w-32 text-white/[0.06] transition-all duration-700 group-hover:-translate-y-1 group-hover:text-white/[0.10]"
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <CatBadge category={large.category} />
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </div>
                  <h3 className="relative mt-3 line-clamp-2 text-lg font-semibold leading-snug text-white sm:text-2xl">
                    {large.title}
                  </h3>
                  {large.desc && (
                    <p className="relative mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">
                      {large.desc}
                    </p>
                  )}
                  <div className="relative mt-auto flex flex-wrap items-center gap-1.5 pt-4">
                    {(large.keywords || []).slice(0, 3).map((k) => (
                      <span
                        key={k}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/55"
                      >
                        {k}
                      </span>
                    ))}
                    <span className="ml-auto text-xs text-white/50">
                      {platformOf(large.link)} · {large.category} →
                    </span>
                  </div>
                </a>
              )}

              {smalls.map((w, i) => (
                <a
                  key={w.link}
                  href={w.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={anim(i + 1, 60)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.14]"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(100% 80% at 90% 0%, rgba(255,255,255,0.08), transparent 65%)",
                    }}
                  />
                  {w.category === "视频" ? (
                    <Play
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 text-white/[0.06] transition-all duration-700 group-hover:-translate-y-1 group-hover:text-white/[0.10]"
                    />
                  ) : (
                    <Newspaper
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 text-white/[0.06] transition-all duration-700 group-hover:-translate-y-1 group-hover:text-white/[0.10]"
                    />
                  )}
                  <div className="relative flex items-center justify-between gap-2">
                    <CatBadge category={w.category} />
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </div>
                  <h3 className="relative mt-2 line-clamp-2 text-sm font-semibold leading-snug text-white">
                    {w.title}
                  </h3>
                  <span className="relative mt-auto pt-2 text-[11px] text-white/45">
                    {platformOf(w.link)}
                  </span>
                </a>
              ))}
            </div>
            )}

            {/* 最近更新（6 条；中性态与分类态同构） */}
            <div className="mt-10 flex items-end justify-between" style={anim(5, 50)}>
              <div>
                <h3 className="text-lg font-semibold text-white sm:text-xl">
                  最近更新
                </h3>
                <p className="mt-1 text-sm text-white/50">
                  最新收录的 {recentWorks.length} 件作品
                </p>
              </div>
              <span className="text-sm text-white/45">
                {recentWorks.length} / {scopeWorks.length}
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {recentWorks.map((w, i) => (
                <a
                  key={w.link}
                  href={w.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={anim(i + 6, 40)}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <CatBadge category={w.category} />
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </div>
                  <h4 className="mt-3 text-base font-semibold leading-snug text-white">
                    {w.title}
                  </h4>
                  {w.desc ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">
                      {w.desc}
                    </p>
                  ) : null}
                  {w.keywords && w.keywords.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {w.keywords.slice(0, 4).map((k) => (
                        <span
                          key={k}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/55"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/50">
                    <span>{platformOf(w.link)}</span>
                    <span className="inline-flex items-center gap-1 text-white/65 transition-colors group-hover:text-white">
                      {w.category === "视频" ? "观看视频" : "阅读原文"} →
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* 完整索引：展开为内部滚动面板 → 页高恒定，承载无限增长 */}
            <div className="mt-8 text-center" style={anim(18, 40)}>
              <button
                type="button"
                onClick={() => setIndexOpen((v) => !v)}
                aria-expanded={indexOpen}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur-lg transition-colors hover:bg-white/15 hover:text-white"
              >
                完整索引（{scopeWorks.length}）
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    indexOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {indexOpen && (
                <div
                  style={{ animation: "fade-up .35s cubic-bezier(0.16,1,0.3,1) both" }}
                  className="mt-4 text-left"
                >
                  <div
                    className="max-h-[68vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.06] p-2 backdrop-blur-lg"
                    onMouseMove={canHover ? onIndexMove : undefined}
                    onMouseLeave={() => setHovered(null)}
                    style={
                      scopeWorks.length > 8
                        ? {
                            maskImage:
                              "linear-gradient(to bottom, rgb(0,0,0) calc(100% - 36px), rgba(0,0,0,0))",
                            WebkitMaskImage:
                              "linear-gradient(to bottom, rgb(0,0,0) calc(100% - 36px), rgba(0,0,0,0))",
                          }
                        : undefined
                    }
                  >
                    <p className="px-3 pb-2 pt-1 text-xs text-white/40 sm:px-4">
                      点击任意行在新标签打开 · 悬停查看预览
                    </p>
                    {scopeWorks.map((w) => (
                      <a
                        key={w.link}
                        href={w.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={canHover ? () => setHovered(w) : undefined}
                        className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-300 hover:bg-white/[0.07] sm:gap-4 sm:px-4 sm:py-3.5"
                      >
                        <span
                          className="w-7 shrink-0 text-right text-xs text-white/35"
                          style={silkscreen}
                        >
                          {String(WORKS.indexOf(w) + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/85 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white sm:text-base">
                          {w.title}
                        </span>
                        <span className="hidden shrink-0 items-center gap-2 text-xs text-white/45 sm:flex">
                          <span>{platformOf(w.link)}</span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                            {w.category}
                          </span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-white/40 transition-colors group-hover:text-white" />
                      </a>
                    ))}
                  </div>

                  {/* 桌面端光标跟随预览卡（触摸设备不渲染） */}
                  {canHover && (
                    <div
                      ref={previewRef}
                      aria-hidden="true"
                      className={`pointer-events-none fixed left-0 top-0 z-50 w-72 rounded-2xl border border-white/10 bg-black/80 p-4 text-left backdrop-blur-xl transition-opacity duration-200 ${
                        hovered ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ transitionProperty: "opacity" }}
                    >
                      {hovered && (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <CatBadge category={hovered.category} />
                            <span className="text-[11px] text-white/45">
                              {platformOf(hovered.link)}
                            </span>
                          </div>
                          <p className="mt-2.5 line-clamp-2 text-sm font-semibold leading-snug text-white">
                            {hovered.title}
                          </p>
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/55">
                            {hovered.desc || (hovered.keywords || []).join(" · ")}
                          </p>
                          <p className="mt-2.5 text-xs text-white/60">
                            {hovered.category === "视频" ? "观看视频" : "阅读原文"} →
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════ 搜索态：关键词激活 → 全量结果网格 ════════ */}
        {mode === "search" &&
          (filtered.length > 0 ? (
            <div
              key={`${cat}|${query}`}
              className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
            >
              {filtered.map((w, i) => (
                <a
                  key={w.link + i}
                  href={w.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={anim(i, 35)}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <CatBadge category={w.category} />
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold leading-snug text-white">
                    <Highlight text={w.title} tokens={tokens} />
                  </h3>
                  {w.desc ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">
                      <Highlight text={w.desc} tokens={tokens} />
                    </p>
                  ) : null}
                  {w.keywords && w.keywords.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {w.keywords.slice(0, 4).map((k) => (
                        <span
                          key={k}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/55"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/50">
                    <span>{platformOf(w.link)}</span>
                    <span className="inline-flex items-center gap-1 text-white/65 transition-colors group-hover:text-white">
                      {w.category === "视频" ? "观看视频" : "阅读原文"} →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center backdrop-blur-lg">
              <p className="text-base font-medium text-white">没有找到匹配的作品</p>
              <p className="mt-2 text-sm text-white/55">换个关键词试试，或清空筛选条件</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCat("全部");
                }}
                className="mt-5 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={DARK_GRADIENT}
              >
                清空搜索
              </button>
            </div>
          ))}
      </div>
    </section>
  );
}
