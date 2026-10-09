# 阿Bon识少少 · 个人主页（bon-homepage2）

全屏视频首屏（nexum 风格）+ 磨砂作品集，React + Vite + Tailwind + lucide-react 构建，
部署在 GitHub Pages（main 分支 `/docs` 目录）。

## 文件说明

| 文件 | 作用 |
|---|---|
| `src/components/Hero.jsx` | 首屏：视频背景 / 头像导航 / 移动抽屉 / 视频·文章分类卡 |
| `src/components/Portfolio.jsx` | 作品集：Bento 精选 → 最近 6 → 完整索引 + 搜索/分类三态 |
| `src/data/works-data.js` | **作品集唯一数据源**，日常只改这个 |
| `src/constants.js` | 页面标题文案、导航、二维码/头像路径、精选选品 `FEATURED_LINKS` |
| `src/App.jsx` | 全页固定视频背景 + 分类状态（分类卡 ↔ 作品集联动） |
| `public/assets/` | `logo.webp`（左上头像）、`wechat-qr.jpg`（公众号二维码） |
| `public/favicon.svg` | 标签页图标 |
| `deploy.ps1` | 一键：构建 → 同步到 `docs/` → 提交推送 GitHub（代理不通自动改直连重试） |
| `admin.html` | 本地可视化编辑器：填表加作品 → 导出 works-data.js |
| `index.html` | 页面标题（标签名）、字体、favicon 引用 |

## 日常维护（加作品）

**方式一 · 可视化编辑器（推荐）**

1. `npm run dev` → 打开 `http://localhost:5173/admin.html`（自动载入现有数据；直接双击 admin.html 也行，首次点「导入数据文件」）
2. 填表新增/编辑 → 点 **下载 works-data.js** → 覆盖 `src\data\works-data.js`
3. 运行 `powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -Message "新增作品：xxx"`，1~2 分钟线上生效

**方式二 · 直接改数据**

1. 编辑 `src/data/works-data.js`，按现有格式追加一条（title / link / desc / keywords / category）
2. （可选）想换首页精选磁贴，把作品链接加进 `src/constants.js` 的 `FEATURED_LINKS`
3. 本地 `npm run dev` 预览确认
4. 运行 `powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -Message "新增作品：xxx"`，1~2 分钟线上生效

## 本地开发

```
npm install      # 首次
npm run dev      # http://localhost:5173/
npm run build    # 产物在 dist/
```

## 首次部署 GitHub Pages

1. GitHub 网页新建仓库（public，名字建议 `bon-homepage2`，**不要**勾选任何初始化选项）
2. 在本文件夹执行：
   ```
   git init -b main
   git remote add origin https://github.com/aBon579/bon-homepage2.git
   powershell -ExecutionPolicy Bypass -File .\deploy.ps1
   ```
   首次 push 会弹浏览器登录授权，装一次即可。
3. 仓库 Settings → Pages → Source 选 **Deploy from branch**，Branch 选 `main` / **`/docs`**，保存
4. 一两分钟后访问 `https://aBon579.github.io/bon-homepage2/`

> 换了仓库名就把上面两处 `bon-homepage2` 一起改掉（URL 与 remote 同步变）。

## 改标签名 / favicon

都在 `index.html`：标签名改 `<title>`，图标改 `public/favicon.svg`（引用行无需动）。
改完重新运行部署命令发布即可——GitHub Pages 永远以最新一次推送为准，随时可改。
