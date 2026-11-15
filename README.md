# YouTube 评论移至右侧 (YouTube Comments to Sidebar)

适用于 Tampermonkey / Violentmonkey / Greasemonkey 的现代化用户脚本。将 YouTube 视频下方的评论区重排至右侧推荐视频栏区域，实现一边观看视频一边浏览与互动评论。

深度重构升级至 **v3.2**，全面适配 YouTube 最新改版与网格布局，彻底解决分集区块（播放列表/剧集）、分段区块（章节/转写）与评论区的挤压与排版冲突，并引入硬件加速动效，消除展开简介时的重排卡顿。

---

## ✨ 核心特性

- **评论区右侧重排**：将视频下方的完整评论组件平滑移至右侧侧边栏，隐藏无关的推荐视频信息流。
- **浅色 / 深色主题原生融入**：
  - 精确分离明暗色彩变量体系，彻底解决浅色主题下侧边栏卡片头部出现的“黑块”问题。
  - 完美适配 YouTube 浅色模式、深色模式与微光氛围模式（Cinematics）。
- **全方位分段区块（Chapters）内嵌**：
  - 展开视频分段、章节列表或字幕转写文稿（Transcript）时，以独立卡片在右侧顶部优雅内嵌展示。
  - 保留 YouTube 原生 `#panels` 架构与 Polymer 事件绑定，拒绝粗暴挪动 DOM 导致的事件脱钩与循环抖动。
  - 面板内容区域独立平滑滚动，标题栏吸顶，支持一键随时折叠与关闭。
- **全格式分集区块（Playlist / Episodes）适配**：
  - 完美兼容视频合辑、播放列表、播客合辑、课程分集与剧集面板（TV Shows / Episodes）。
  - 原生支持播放列表的折叠状态（`collapsed`），收起时仅占一行标题栏，展开时自适应限制高度并独立滚动。
- **智能多面板共存与防冲突机制**：
  - **分段 + 分集 + 评论 三者共存**：当用户同时展开章节与播放列表时，自动触发紧凑排版模式（`has-multiple-panels`），每个面板合理压缩限高，为下方的评论区保留充足的可视空间。
- **硬件加速丝滑拉长动效（v3.2 优化）**：
  - 展开/折叠视频详情（简介）时，侧边栏高度平滑延伸对齐，采用 CSS `cubic-bezier(0.2, 0.9, 0.3, 1)` 硬件加速过渡；
  - 废弃引起 Layout Thrashing（布局抖动）的每帧 `ResizeObserver` 轮询计算，改为按状态触发单次高度分配，实现真正的 60/120fps 满帧平滑拉长。
- **评论平滑加载与无限滚动**：
  - 移除导致透明度被锁死的异常探针，进入页面即刻唤醒渲染；
  - 监听右侧评论区内部滚动触底事件，无缝触发下一页评论数据懒加载。
- **新旧布局全兼容**：
  - 双重兼容经典 `ytd-watch-flexy` 与新一代 `ytd-watch-grid` 容器。
  - 自动屏蔽 YouTube 实验性的简易侧边评论，防止双份评论区冲突。
  - 修复影院模式（Theater Mode）下遮挡视频画面的问题，保持原生侧边排列。

---

## 📦 安装使用

### 前置要求

在浏览器中安装以下任意一款用户脚本管理器：
- [Tampermonkey](https://www.tampermonkey.net/)（推荐）
- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey](https://www.greasespot.net/)

### 安装方法

1. 打开 [youtube-comments-to-side.user.js](./youtube-comments-to-side.user.js)。
2. 点击右上角的 **Raw** 按钮触发脚本管理器安装提示。
3. 确认并点击 **安装**。
4. 打开任意 YouTube 视频页面即可生效。

---

## 🏗️ 架构与实现原理

```mermaid
flowchart TD
    A[页面导航 yt-navigate-finish] --> B{是否为视频页 /watch ?}
    B -- 否 --> C[清理观察器 / 复原评论区]
    B -- 是 --> D[ensureSecondaryVisible 确保右侧栏展开]
    D --> E[隐藏 #related 推荐视频]
    E --> F[moveCommentsToSidebar 挂载评论至 #secondary-inner]
    F --> G[triggerCommentsLoad 语义化唤醒评论数据]
    G --> H[updateSidebarLayout 动态布局仲裁]
    H --> I{是否存在展开的分段/分集面板?}
    I -- 同时存在 --> J[激活 has-multiple-panels 紧凑限高 28vh]
    I -- 单个或无 --> K[正常限制单卡片高度 38vh]
    J --> L[简介展开/收起监听: setupDescriptionObserver]
    K --> L
    L --> M[单次计算目标高度 + CSS 硬件加速过渡 0.35s 补间]
    M --> N[评论区丝滑拉长/回缩，平滑无卡顿]
```

---

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。
