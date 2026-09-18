# YouTube 评论移至右侧

一个适用于 Tampermonkey / Greasemonkey 的用户脚本。将 YouTube 视频下方的评论区重排至右侧推荐视频栏区域，实现观看视频的同时浏览评论。

## 功能特性

- **评论区位置重排**：将视频下方的评论组件移至右侧侧边栏。
- **隐藏推荐视频**：隐藏右侧推荐视频信息流。
- **章节面板内嵌**：展开视频分段或章节标签时，章节面板在右侧独立内嵌显示，不遮挡评论内容。
- **播放列表面板内嵌**：视频所在合辑与播放列表面板在右侧内嵌显示。
- **面板层级排版**：当分段面板、播放列表与评论区共存时，按照分段 -> 播放列表 -> 评论区的结构自适应排列。
- **视图与主题兼容**：支持默认视图与影院模式，适配浅色与深色主题。
- **独立滚动条**：各区域支持独立滚动控制。
- **单页导航状态同步**：处理 YouTube 单页应用（SPA）页面跳转，重置相关布局状态。

## 安装步骤

### 前置要求

已安装以下任一脚本管理扩展：
- [Tampermonkey](https://www.tampermonkey.net/)
- [Greasemonkey](https://www.greasespot.net/)
- [Violentmonkey](https://violentmonkey.github.io/)

### 安装方法

1. 打开 [youtube-comments-to-side.user.js](./youtube-comments-to-side.user.js)。
2. 点击 **Raw** 按钮触发扩展安装提示。
3. 确认并点击 **安装**。

## 实现机制

- 使用 MutationObserver 监听 DOM 树结构变更。
- 监听 yt-navigate-finish 事件响应单页导航跳转。
- 基于 CSS position: sticky 实现面板标题吸顶。
- 监听章节与合辑面板的可见性与子节点变动，结合防抖函数动态刷新布局。

## 开源协议

本项目采用 [MIT](LICENSE) 协议开源。