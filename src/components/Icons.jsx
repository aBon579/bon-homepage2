// B站 / 微信 内联 SVG 图标（lucide 不含品牌图标）

export function BilibiliIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect
        x="2.5"
        y="6.5"
        width="19"
        height="14"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 3.5 9.6 6.2M17 3.5 14.4 6.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7.6 11v2.2M16.4 11v2.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WechatIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M9.4 4C5.6 4 2.5 6.6 2.5 9.8c0 1.8.9 3.4 2.4 4.5l-.7 2.3 2.6-1.3c.7.2 1.5.3 2.2.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.2 8.6c-3.4 0-6.2 2.3-6.2 5.1s2.8 5.1 6.2 5.1c.7 0 1.3-.1 1.9-.3l2.5 1.2-.7-2.1c1.4-1 2.3-2.4 2.3-4 0-2.8-2.8-5-6-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="7.3" cy="8.6" r="0.9" fill="currentColor" />
      <circle cx="11.4" cy="8.6" r="0.9" fill="currentColor" />
      <circle cx="13.4" cy="13.3" r="0.8" fill="currentColor" />
      <circle cx="17" cy="13.3" r="0.8" fill="currentColor" />
    </svg>
  );
}
