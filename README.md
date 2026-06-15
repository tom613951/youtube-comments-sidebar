# YouTube 评论移至右侧 🎬💬

一个 Tampermonkey / Greasemonkey 油猴脚本，将 YouTube 评论区从视频下方移动到右侧推荐视频区域，让你在观看视频的同时轻松浏览评论。

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 📌 评论区右移 | 将评论区从视频下方移至右侧栏 |
| 🚫 隐藏推荐视频 | 完全隐藏右侧推荐视频列表 |
| 📑 章节面板内嵌 | 点击分段/章节标签后，章节面板（分段）在右侧独立内嵌显示，不再覆盖评论 |
| 💿 合辑面板内嵌 | 视频所在的播放列表（合辑）面板同样内嵌显示，不再覆盖评论 |
| 📐 智能面板排序 | 多个面板并存时遵循：分段（最顶） → 合辑（中间） → 评论区（最底）的规则自动排版 |
| 🎬 影院模式支持 | 影院模式下右侧评论栏依然可见 |
| 🌙 深色模式适配 | 自动适配 YouTube 的浅色/深色主题 |
| 📜 独立滚动 | 各面板和评论区均支持独立滚动，带美化滚动条 |
| 🔄 SPA 导航兼容 | 正确处理 YouTube 页面内跳转与状态重置，防止出现 NaN 等脏数据 |

## 📸 效果预览

**默认状态**：评论区替代右侧推荐视频

**打开章节面板**：章节面板出现在评论区顶部，两者独立滚动互不干扰

## 📦 安装方法

### 前置要求

安装以下任一浏览器扩展：
- [Tampermonkey](https://www.tampermonkey.net/)（推荐）
- [Greasemonkey](https://www.greasespot.net/)
- [Violentmonkey](https://violentmonkey.github.io/)

### 安装步骤

1. 点击 [`youtube-comments-to-side.user.js`](./youtube-comments-to-side.user.js) 查看脚本源码
2. 点击 **Raw** 按钮，油猴扩展会自动弹出安装提示
3. 点击 **安装** 即可

或者手动安装：
1. 打开 Tampermonkey 管理面板 → **添加新脚本**
2. 将 `youtube-comments-to-side.user.js` 的内容粘贴进去，替换默认模板
3. 按 `Ctrl + S` 保存

## 🛠️ 技术细节

- 使用 `MutationObserver` 监听 YouTube SPA 页面导航和 DOM 变化
- 监听 `yt-navigate-finish` 事件处理页面内跳转
- 通过 CSS `position: sticky` 实现评论区、章节与合辑标题固定
- 章节面板与合辑面板通过监听 `visibility` 变化及内部 DOM 突变（子节点变更）来动态校验、自动排版，并支持防抖刷新

## 📋 兼容性

- ✅ Chrome + Tampermonkey
- ✅ Firefox + Greasemonkey / Tampermonkey
- ✅ Edge + Tampermonkey
- ✅ YouTube 浅色/深色模式
- ✅ YouTube 默认/影院模式

## 📄 License

MIT License
