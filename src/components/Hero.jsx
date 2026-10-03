import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X, ArrowUpRight, Play, Newspaper } from "lucide-react";
import {
  VIDEO_URL, // eslint-disable-line no-unused-vars -- 视频已提升至 App 全页背景
  LOGO_AVATAR,
  HEADLINE,
  WECHAT_QR,
  NAV_LINKS,
  DRAWER_LINKS,
} from "../constants.js";
import { WORKS } from "../data/works-data.js";

/* 英雄区（修订版）：
   - 左上：头像 logo + Bon；导航：首页/作品集/B站/公众号
   - 无黑色按钮、无邮箱输入框
   - 标题：个人频道文案
   - 右下两玻璃卡 = 视频 / 文章 分类入口（点击滚到作品集并切分类） */

const CATEGORY_CARDS = [
  {
    cat: "视频",
    icon: Play,
    desc: "拆机、折腾与翻车，视频都发在 B 站。",
    cta: "只看视频作品",
  },
  {
    cat: "文章",
    icon: Newspaper,
    desc: "长文与教程沉淀在公众号，慢慢写、慢慢发。",
    cta: "只看文章作品",
  },
];

const catCount = (c) => WORKS.filter((w) => w.category === c).length;

export default function Hero({ onCategory }) {
  const [open, setOpen] = useState(false);         // 移动菜单
  const [drawerQR, setDrawerQR] = useState(false); // 抽屉内公众号二维码
  const [wechatPop, setWechatPop] = useState(false); // 桌面二维码浮层
  const sectionRef = useRef(null);

  // 开菜单锁 body 滚动
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Esc 关闭；宽度到 md 自动关闭
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setWechatPop(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <section id="top" className="relative h-screen w-full overflow-hidden">
      {/* 连续场景过渡（在视频之上、Hero 内容之下，pointer-events 穿透）：
          模糊层：backdrop-blur-xl 经 mask 从 0 连续升到满值，
          末端与 Works 的 bg-black/30 + backdrop-blur-xl 完全一致 → 接缝不可见 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh] backdrop-blur-xl"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 55%, rgb(0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 55%, rgb(0,0,0) 100%)",
        }}
      />
      {/* 暗化层：对比度/亮度向下缓慢收敛，0 → 30% 与 Works 底色衔接 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      <div ref={sectionRef} className="relative flex h-full flex-col">
        {/* ── 顶部导航 ── */}
        <nav className="flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
          {/* 头像 logo + Bon */}
          <a href="#top" className="flex items-center gap-2" aria-label="Bon 首页">
            <img
              src={LOGO_AVATAR}
              alt="Bon 头像"
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/30 lg:ring-white/50"
            />
            <span className="text-lg font-semibold text-[#010101] lg:text-white">
              Bon
            </span>
          </a>

          {/* 桌面玻璃胶囊（md+）：首页 / 作品集 / B站 / 公众号 */}
          <div className="hidden md:flex">
            <div className="flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-1.5 backdrop-blur-lg">
              {NAV_LINKS.map((l) =>
                l.wechat ? (
                  <div
                    key={l.key}
                    className="relative"
                    onMouseEnter={() => setWechatPop(true)}
                    onMouseLeave={() => setWechatPop(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setWechatPop((v) => !v)}
                      aria-expanded={wechatPop}
                      className="flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {l.label}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${
                          wechatPop ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {/* 二维码浮层 */}
                    <div
                      className={`absolute left-1/2 top-full z-50 mt-3 w-44 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/90 p-3 backdrop-blur-xl transition-all duration-200 ${
                        wechatPop
                          ? "pointer-events-auto translate-y-0 opacity-100"
                          : "pointer-events-none -translate-y-1 opacity-0"
                      }`}
                    >
                      <div className="rounded-xl bg-white p-2">
                        <img
                          src={WECHAT_QR}
                          alt="微信公众号二维码"
                          className="h-32 w-32 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <p className="mt-2 text-center text-xs text-white/60">
                        微信扫码关注
                      </p>
                    </div>
                  </div>
                ) : (
                  <a
                    key={l.key}
                    href={l.href}
                    target={l.external ? "_blank" : undefined}
                    rel={l.external ? "noopener noreferrer" : undefined}
                    className="rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {l.label}
                  </a>
                )
              )}
            </div>
          </div>

          {/* 移动汉堡（md↓）：Menu ↔ X 形变 */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "关闭菜单" : "打开菜单"}
            aria-expanded={open}
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-lg md:hidden"
          >
            <Menu
              className={`absolute h-5 w-5 transition-all duration-300 ${
                open
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
              } ${open ? "text-white" : "text-[#010101] lg:text-white"}`}
            />
            <X
              className={`absolute h-5 w-5 transition-all duration-300 ${
                open
                  ? "rotate-0 scale-100 opacity-100 text-white"
                  : "-rotate-90 scale-0 opacity-0"
              }`}
            />
          </button>
        </nav>

        {/* ── 移动菜单：遮罩 + 右侧抽屉（无底部 CTA） ── */}
        <div
          onClick={close}
          className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden="true"
        />
        <aside
          className={`fixed right-0 top-0 z-40 h-full w-72 overflow-y-auto bg-black/90 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!open}
        >
          <div className="flex flex-col gap-2 px-6 pb-10 pt-24">
            {DRAWER_LINKS.map((l, i) => {
              const delay = open ? `${(i + 1) * 60}ms` : "0ms";
              const rowCls = `flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-white ${
                open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              }`;
              const rowStyle = { transitionDelay: delay };

              if (l.wechat) {
                return (
                  <div key={l.key}>
                    <button
                      type="button"
                      style={rowStyle}
                      onClick={() => setDrawerQR((v) => !v)}
                      className={rowCls}
                    >
                      {l.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${
                          drawerQR ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {drawerQR && (
                      <div
                        className="px-4 pb-1 pt-2"
                        style={{ animation: "fade-up .3s ease both" }}
                      >
                        <div className="w-fit rounded-xl bg-white p-2">
                          <img
                            src={WECHAT_QR}
                            alt="微信公众号二维码"
                            className="h-32 w-32 object-contain"
                          />
                        </div>
                        <p className="mt-2 text-xs text-white/50">
                          微信扫码关注公众号
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <a
                  key={l.key}
                  href={l.href}
                  style={rowStyle}
                  target={l.external ? "_blank" : undefined}
                  rel={l.external ? "noopener noreferrer" : undefined}
                  onClick={close}
                  className={rowCls}
                >
                  {l.label}
                  {l.external && <ArrowUpRight className="h-4 w-4 text-white/40" />}
                </a>
              );
            })}
          </div>
        </aside>

        {/* ── 贴底主内容：左标题，右两分类卡 ── */}
        <main className="mt-auto flex flex-col gap-6 px-5 pb-8 sm:gap-8 sm:px-8 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-16">
          {/* 左：频道标题 */}
          <div className="max-w-xl">
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-[#010101] sm:text-4xl lg:text-[3.5rem] lg:text-white">
              {HEADLINE}
            </h1>
          </div>

          {/* 右：视频 / 文章 分类卡 */}
          <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto lg:gap-5">
            {CATEGORY_CARDS.map(({ cat, icon: Icon, desc, cta }) => (
              <button
                key={cat}
                type="button"
                onClick={() => onCategory(cat)}
                className="group flex flex-1 flex-col rounded-2xl bg-white/10 p-5 text-left backdrop-blur-lg transition-colors hover:bg-white/[0.14] sm:w-64 sm:flex-none sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-[#010101] lg:text-white" />
                    <span className="text-sm font-semibold text-[#010101] lg:text-white">
                      {cat}
                    </span>
                  </span>
                  <span
                    className="text-2xl font-normal tracking-tight text-[#010101] lg:text-white"
                    style={{ fontFamily: "'Silkscreen', cursive" }}
                  >
                    {catCount(cat)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#010101]/70 sm:mt-4 lg:text-white/70">
                  {desc}
                </p>
                <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-medium text-[#010101]/60 lg:text-white/60">
                  {cta}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </button>
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}
