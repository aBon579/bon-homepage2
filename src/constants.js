// ── 全局常量：规格（视频 URL / SVG / 渐变 / 玻璃令牌）+ 个人站信息 ──

export const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4";

// 规格要求的 logo 路径（24×24, viewBox 0 0 256 256）
export const LOGO_PATH =
  "M 128 128 C 128 198.692 70.692 256 0 256 C 0 185.308 57.308 128 128 128 Z M 128 128 C 198.692 128 256 185.308 256 256 C 185.308 256 128 198.692 128 128 Z M 0 0 C 70.692 0 128 57.308 128 128 C 57.308 128 0 70.692 0 0 Z M 256 0 C 256 70.692 198.692 128 128 128 C 128 57.308 185.308 0 256 0 Z";

// 深色纵向渐变（保留给空态按钮等）
export const DARK_GRADIENT = {
  background: "linear-gradient(to bottom, #2B2B2B, #101010)",
};

export const BILI_URL = "https://space.bilibili.com/277640994";
export const WECHAT_QR = "assets/wechat-qr.jpg";
export const LOGO_AVATAR = "assets/logo.webp";

// 个人频道标题（替代原英文 headline）
export const HEADLINE = "Build, tinker, and make tech work.";

// 桌面玻璃胶囊导航：首页 / 作品集 / B站 / 公众号（公众号在 B站右边，带 ChevronDown）
export const NAV_LINKS = [
  { key: "top", label: "首页", href: "#top" },
  { key: "works", label: "作品集", href: "#works" },
  { key: "bili", label: "B站", href: BILI_URL, external: true },
  { key: "wechat", label: "公众号", href: "#", wechat: true },
];

export const DRAWER_LINKS = NAV_LINKS;

// Bento 精选（方案三）：第 1 条为大磁贴，其余为小磁贴；按作品链接挑选
export const FEATURED_LINKS = [
  "https://mp.weixin.qq.com/s/cbpUhRzt7w1BX5vCOT4h0g", // DSH上架飞牛 · 养鲸（大）
  "https://mp.weixin.qq.com/s/D9u9Nvpuz-cdslqiEqemsA", // 一切皆插件
  "https://t.bilibili.com/1246060520480440324?share_source=pc_native", // 飞牛音乐来了（视频）
  "https://t.bilibili.com/1254202897960271874?share_source=pc_native", // NAS+老旧音箱 HomePod（视频）
  "https://mp.weixin.qq.com/s/C8OkUGgSYd7HyZU7oLzOog", // NAS管家计划篇一
];

export const FOOTER_COPY = "© 2026 Bon · 作品集 · B站 · 公众号";
