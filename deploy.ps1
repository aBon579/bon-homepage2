# deploy.ps1 —— 一键部署到 GitHub Pages（构建 → dist 同步到 docs/ → 推送 main）
# 用法：在本文件夹打开 PowerShell，运行  powershell -ExecutionPolicy Bypass -File .\deploy.ps1
#       带说明提交：.\deploy.ps1 -Message "新增作品：xxx"
# 原理：Pages 从 main 分支的 /docs 目录提供静态文件（Settings → Pages → Branch: main /docs）
param([string]$Message = "")
Set-Location $PSScriptRoot

# ---- 推送：先按 git 配置（代理）走，失败自动改直连重试 ----
function Push-Repo {
    $out = git push -u origin main 2>&1 | ForEach-Object { "$_" }
    foreach ($l in $out) { Write-Host $l }
    if ($LASTEXITCODE -eq 0) { return $true }
    Write-Host "[!] 经代理推送失败，改用直连重试..."
    $out2 = git -c http.proxy= -c https.proxy= push -u origin main 2>&1 | ForEach-Object { "$_" }
    foreach ($l in $out2) { Write-Host $l }
    if ($LASTEXITCODE -eq 0) { return $true }
    return $false
}

# ---- 1) 构建生产包 ----
Write-Host "[*] npm run build ..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] 构建失败，看上面的报错"
    exit 1
}

# ---- 2) dist -> docs（Pages 服务目录）----
if (Test-Path "docs") { Remove-Item "docs" -Recurse -Force }
Copy-Item "dist" "docs" -Recurse
Write-Host "[OK] dist -> docs 同步完成"

# ---- 3) git 前置检查 ----
if (-not (Test-Path ".git")) {
    Write-Host "[X] 当前目录还不是 git 仓库。首次部署先执行（见 README.md）："
    Write-Host "    git init -b main"
    Write-Host "    git remote add origin https://github.com/aBon579/bon-homepage2.git"
    Write-Host "    .\deploy.ps1"
    exit 1
}
$remote = cmd /c 'git remote get-url origin 2>nul'
if (-not $remote) {
    Write-Host "[X] 还没有配置远程仓库。先在 GitHub 网页新建 bon-homepage2 仓库（public，不勾选初始化），"
    Write-Host "    然后执行：  git remote add origin https://github.com/aBon579/bon-homepage2.git"
    exit 1
}

git add -A
$staged = git status --porcelain

if (-not $staged) {
    # 没有文件改动：检查是否已完成过推送（用 cmd 隔离 stderr，避免 PowerShell 把它当异常）
    $upstream = cmd /c 'git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>nul'
    if ($upstream) {
        Write-Host "[=] 没有任何改动，无需部署"
        exit 0
    } else {
        Write-Host "[*] 首次部署：推送到 GitHub..."
        if (Push-Repo) {
            Write-Host "[OK] 首次推送成功！"
            Write-Host "     接下来去网页开启 Pages："
            Write-Host "     Settings -> Pages -> Source 选 Deploy from branch"
            Write-Host "     Branch 选 main / /docs -> Save"
            Write-Host "     1~2 分钟后访问 https://aBon579.github.io/bon-homepage2/"
        } else {
            Write-Host "[X] push 失败：代理和直连都不通。可开启代理软件后重试，或稍后再跑一次"
            exit 1
        }
        exit 0
    }
}

if (-not $Message) {
    $Message = "update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}
git commit -m $Message
if ($LASTEXITCODE -ne 0) { Write-Host "[X] commit 失败"; exit 1 }

if (Push-Repo) {
    Write-Host "[OK] 已推送。GitHub Pages 一般 1~2 分钟内更新，刷新网站即可看到。"
} else {
    Write-Host "[X] push 失败：代理和直连都不通。可开启代理软件后重试，或稍后再跑一次"
    exit 1
}
