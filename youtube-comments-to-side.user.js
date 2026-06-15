// ==UserScript==
// @name         YouTube 评论移至右侧
// @namespace    https://github.com/tampermonkey-scripts
// @version      1.7
// @description  将 YouTube 评论区从视频下方移动到右侧推荐视频区域，隐藏推荐视频，章节面板内嵌显示
// @author       Antigravity
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const LOG = '[YT-Comments-Sidebar]';

  // ========== 注入自定义样式 ==========
  GM_addStyle(`
    /* --- 隐藏右侧推荐视频 --- */
    #secondary #related {
      display: none !important;
    }

    /* --- 评论区在右侧的样式（已移动后生效） --- */
    #secondary #comments.ytd-comments-moved {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: sticky !important;
      top: 72px;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 8px 16px 8px;
      box-sizing: border-box;
      pointer-events: auto !important;
      z-index: auto !important;
    }

    /* 强制右侧栏可见并设定宽度 */
    /* YouTube 可能在 SPA 导航时隐藏 #secondary 或将其压缩为 0 宽度 */
    ytd-watch-flexy #columns.ytd-watch-flexy {
      display: flex !important;
      flex-direction: row !important;
    }
    ytd-watch-flexy #primary.ytd-watch-flexy {
      flex: 1 !important;
      min-width: 0 !important;
      max-width: calc(100% - 402px - 24px) !important;
    }
    ytd-watch-flexy #secondary.ytd-watch-flexy,
    #secondary {
      display: block !important;
      min-width: 402px !important;
      width: 402px !important;
      max-width: 402px !important;
      flex-shrink: 0 !important;
      flex-basis: 402px !important;
      padding-left: 24px !important;
      box-sizing: content-box !important;
    }
    /* 确保 #secondary-inner 也可见 */
    #secondary #secondary-inner,
    #secondary-inner {
      display: block !important;
    }

    /* 美化滚动条 */
    #secondary #comments.ytd-comments-moved::-webkit-scrollbar {
      width: 6px;
    }
    #secondary #comments.ytd-comments-moved::-webkit-scrollbar-track {
      background: transparent;
    }
    #secondary #comments.ytd-comments-moved::-webkit-scrollbar-thumb {
      background-color: rgba(128, 128, 128, 0.4);
      border-radius: 3px;
    }
    #secondary #comments.ytd-comments-moved::-webkit-scrollbar-thumb:hover {
      background-color: rgba(128, 128, 128, 0.7);
    }

    /*
     * 关键：原位置的评论区保持在布局中但视觉不可见。
     * 不使用 display:none / max-height:1px，
     * 因为 YouTube 依赖 IntersectionObserver 来决定是否加载评论，
     * 元素必须在布局中占据正常空间，才能被 IO 检测到。
     *
     * 使用 position:absolute 脱离文档流（不占空间），
     * 但仍然保持完整尺寸让 IO 可以观测到。
     */
    #below {
      position: relative !important;
    }
    #below > #comments:not(.ytd-comments-moved) {
      opacity: 0 !important;
      pointer-events: none !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      z-index: -1 !important;
      /* 注意：不限制 height/max-height，让元素保持完整尺寸 */
    }

    /* 评论区标题栏微调 */
    #secondary #comments.ytd-comments-moved #header.ytd-comments-header-renderer {
      position: sticky;
      top: 0;
      z-index: 10;
      padding-top: 8px;
      padding-bottom: 8px;
    }

    /* 适配深色模式下的评论区标题背景 */
    html[dark] #secondary #comments.ytd-comments-moved #header.ytd-comments-header-renderer {
      background-color: var(--yt-spec-base-background, #0f0f0f);
    }
    html:not([dark]) #secondary #comments.ytd-comments-moved #header.ytd-comments-header-renderer {
      background-color: var(--yt-spec-base-background, #fff);
    }

    /* 评论输入框和评论项宽度自适应 */
    #secondary #comments.ytd-comments-moved ytd-comment-thread-renderer,
    #secondary #comments.ytd-comments-moved ytd-comments-header-renderer {
      max-width: 100% !important;
    }

    /* 影院模式下也保持右侧评论可见 */
    ytd-watch-flexy[theater] #secondary.ytd-watch-flexy {
      display: block !important;
      position: absolute;
      right: 0;
      top: 0;
      width: 400px;
      max-width: 400px;
      z-index: 2000;
      padding-top: 12px;
    }
    ytd-watch-flexy[theater] #secondary #comments.ytd-comments-moved {
      max-height: calc(100vh - 80px);
    }

    /* ========== 章节面板（Chapters）内嵌样式 ========== */
    #secondary .ytd-chapters-panel-moved {
      display: block !important;
      position: relative !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      bottom: auto !important;
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      max-height: 45vh;
      overflow-y: auto;
      overflow-x: hidden;
      z-index: 5;
      margin-bottom: 12px;
      border-radius: 12px;
      box-sizing: border-box;
    }

    html[dark] #secondary .ytd-chapters-panel-moved {
      background-color: var(--yt-spec-raised-background, #212121);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    html:not([dark]) #secondary .ytd-chapters-panel-moved {
      background-color: var(--yt-spec-raised-background, #f2f2f2);
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    #secondary .ytd-chapters-panel-moved #content.ytd-engagement-panel-section-list-renderer {
      max-height: none !important;
      overflow: visible !important;
    }

    #secondary .ytd-chapters-panel-moved::-webkit-scrollbar {
      width: 5px;
    }
    #secondary .ytd-chapters-panel-moved::-webkit-scrollbar-track {
      background: transparent;
    }
    #secondary .ytd-chapters-panel-moved::-webkit-scrollbar-thumb {
      background-color: rgba(128, 128, 128, 0.35);
      border-radius: 3px;
    }
    #secondary .ytd-chapters-panel-moved::-webkit-scrollbar-thumb:hover {
      background-color: rgba(128, 128, 128, 0.6);
    }

    #secondary .ytd-chapters-panel-moved #header.ytd-engagement-panel-section-list-renderer {
      position: sticky;
      top: 0;
      z-index: 10;
      border-radius: 12px 12px 0 0;
    }
    html[dark] #secondary .ytd-chapters-panel-moved #header.ytd-engagement-panel-section-list-renderer {
      background-color: var(--yt-spec-raised-background, #212121);
    }
    html:not([dark]) #secondary .ytd-chapters-panel-moved #header.ytd-engagement-panel-section-list-renderer {
      background-color: var(--yt-spec-raised-background, #f2f2f2);
    }

    ytd-watch-flexy ytd-engagement-panel-section-list-renderer[target-id*="macro-markers"].ytd-chapters-panel-moved {
      visibility: visible !important;
    }

    #panels ytd-engagement-panel-section-list-renderer[target-id*="macro-markers"][visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]:not(.ytd-chapters-panel-moved) {
      opacity: 0 !important;
      pointer-events: none !important;
      position: absolute !important;
      width: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }

    ytd-miniplayer #comments {
      display: none !important;
    }
  `);

  // ========== 核心状态 ==========

  let moved = false;
  let chaptersObserver = null;
  let commentsContentObserver = null;
  let fallbackTimer = null;

  // ========== 评论区移动逻辑 ==========

  /**
   * 检查评论区是否已接收到 YouTube 数据
   */
  function hasCommentsContent(el) {
    return !!(
      el.querySelector('ytd-comments-header-renderer') ||
      el.querySelector('ytd-comment-thread-renderer') ||
      el.querySelector('ytd-item-section-renderer #contents')
    );
  }

  /**
   * 将 #comments 移回 #below（原始位置），让 YouTube 正常加载数据
   */
  function returnCommentsToOriginal() {
    const movedComments = document.querySelector('#secondary #comments.ytd-comments-moved');
    if (!movedComments) return;

    movedComments.classList.remove('ytd-comments-moved');
    const below = document.querySelector('#below');
    if (below) {
      below.appendChild(movedComments);
      console.log(`${LOG} ↩️ 评论区已移回原位，等待 YouTube 加载新数据`);
    }
  }

  /**
   * 将 #comments 移动到右侧 #secondary
   */
  function moveCommentsToSidebar() {
    if (moved || location.pathname !== '/watch') return false;

    const comments = document.querySelector('#below #comments, #primary #comments');
    const secondary = document.querySelector('#secondary');

    if (!comments || !secondary) return false;
    if (comments.classList.contains('ytd-comments-moved')) { moved = true; return true; }

    // 隐藏推荐视频
    const related = secondary.querySelector('#related');
    if (related) related.style.display = 'none';

    // 移动
    comments.classList.add('ytd-comments-moved');
    secondary.prepend(comments);
    moved = true;

    console.log(`${LOG} ✅ 评论区已移动到右侧`);

    // 通知浏览器布局变化
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // 启动章节面板监听
    setupChaptersPanelWatcher();
    return true;
  }

  /**
   * 强制触发 YouTube 的评论加载机制
   * 通过短暂滚动到 #comments 位置让 IntersectionObserver 触发
   */
  function nudgeCommentsLoading() {
    const comments = document.querySelector('#below #comments:not(.ytd-comments-moved)');
    if (!comments) return;

    // 方法1: 派发滚动事件刺激 IO 重新检测
    window.dispatchEvent(new Event('scroll'));

    // 方法2: 短暂将元素滚入视口再滚回
    const scrollY = window.scrollY;
    comments.style.position = 'relative';
    comments.style.opacity = '0.001';
    comments.scrollIntoView({ behavior: 'instant', block: 'end' });

    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      requestAnimationFrame(() => {
        comments.style.position = '';
        comments.style.opacity = '';
      });
    });

    console.log(`${LOG} 🔄 已触发评论加载 (scroll nudge)`);
  }

  // ========== 章节面板逻辑 ==========

  function moveChaptersPanel() {
    const secondary = document.querySelector('#secondary');
    if (!secondary) return;

    document.querySelectorAll(
      'ytd-engagement-panel-section-list-renderer[target-id*="macro-markers"]'
    ).forEach(panel => {
      const isExpanded = panel.getAttribute('visibility') === 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED';
      const alreadyMoved = panel.classList.contains('ytd-chapters-panel-moved');

      if (isExpanded && !alreadyMoved) {
        panel.classList.add('ytd-chapters-panel-moved');
        secondary.prepend(panel);
        console.log(`${LOG} ✅ 章节面板已移至评论区顶部`);
      } else if (!isExpanded && alreadyMoved) {
        panel.classList.remove('ytd-chapters-panel-moved');
        const panels = document.querySelector('ytd-watch-flexy #panels');
        if (panels) panels.appendChild(panel);
        console.log(`${LOG} ↩️ 章节面板已关闭并归位`);
      }
    });
  }

  function setupChaptersPanelWatcher() {
    if (chaptersObserver) chaptersObserver.disconnect();
    moveChaptersPanel();

    chaptersObserver = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'visibility') {
          if (m.target.tagName === 'YTD-ENGAGEMENT-PANEL-SECTION-LIST-RENDERER' &&
              (m.target.getAttribute('target-id') || '').includes('macro-markers')) {
            moveChaptersPanel();
            return;
          }
        }
        if (m.type === 'childList') {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1 && (
              node.tagName === 'YTD-ENGAGEMENT-PANEL-SECTION-LIST-RENDERER' ||
              node.querySelector?.('ytd-engagement-panel-section-list-renderer[target-id*="macro-markers"]')
            )) {
              setTimeout(moveChaptersPanel, 200);
              return;
            }
          }
        }
      }
    });

    const wf = document.querySelector('ytd-watch-flexy');
    if (wf) {
      chaptersObserver.observe(wf, {
        childList: true, subtree: true,
        attributes: true, attributeFilter: ['visibility']
      });
    }
  }

  // ========== 导航与生命周期 ==========

  /**
   * 清理所有状态和定时器
   */
  function cleanup() {
    moved = false;
    if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
    if (commentsContentObserver) { commentsContentObserver.disconnect(); commentsContentObserver = null; }
    if (chaptersObserver) { chaptersObserver.disconnect(); chaptersObserver = null; }
    document.querySelectorAll('.ytd-chapters-panel-moved').forEach(el =>
      el.classList.remove('ytd-chapters-panel-moved')
    );
  }

  /**
   * 核心流程：处理新的视频页面
   *
   * 1. 清理状态
   * 2. 将 #comments 移回 #below 原位（如果之前被移走了）
   * 3. 等待 YouTube 加载评论数据（IntersectionObserver 需要元素在原位）
   * 4. 评论数据到达后，立即将 #comments 移至 #secondary
   */
  function handleWatchPage() {
    cleanup();

    // Step 1: 如果之前移动过评论，先移回原位
    returnCommentsToOriginal();

    console.log(`${LOG} 📺 开始监控评论加载...`);

    // Step 2: 短暂延迟后触发评论加载
    // 延迟是为了让 YouTube 的 DOM 更新完成
    setTimeout(nudgeCommentsLoading, 500);
    setTimeout(nudgeCommentsLoading, 1500);
    setTimeout(nudgeCommentsLoading, 3000);

    // Step 3: 监听 #comments 内部出现评论内容
    commentsContentObserver = new MutationObserver(() => {
      if (moved) { commentsContentObserver.disconnect(); return; }

      const comments = document.querySelector('#below #comments, #primary #comments');
      if (comments && hasCommentsContent(comments)) {
        commentsContentObserver.disconnect();
        console.log(`${LOG} 📬 检测到评论数据已加载`);
        moveCommentsToSidebar();
      }
    });

    const watchTarget = document.querySelector('ytd-watch-flexy') || document.body;
    commentsContentObserver.observe(watchTarget, { childList: true, subtree: true });

    // Step 4: 先检查一次（评论可能已经加载好了）
    const existingComments = document.querySelector('#below #comments, #primary #comments');
    if (existingComments && hasCommentsContent(existingComments)) {
      console.log(`${LOG} 📬 评论数据已存在，直接移动`);
      commentsContentObserver.disconnect();
      moveCommentsToSidebar();
      return;
    }

    // Step 5: 兜底定时器 - 10 秒后强制移动
    fallbackTimer = setTimeout(() => {
      if (!moved && location.pathname === '/watch') {
        console.log(`${LOG} ⏰ 10s 超时兜底，强制移动`);
        if (commentsContentObserver) commentsContentObserver.disconnect();
        moveCommentsToSidebar();
      }
    }, 10000);
  }

  /**
   * 处理页面导航事件
   */
  function handleNavigation() {
    if (location.pathname === '/watch') {
      handleWatchPage();
    } else {
      cleanup();
    }
  }

  // ========== 初始化 ==========

  // YouTube SPA 导航事件
  document.addEventListener('yt-navigate-finish', () => {
    console.log(`${LOG} 🧭 yt-navigate-finish → ${location.pathname}`);
    handleNavigation();
  });

  // 页面数据更新事件（某些场景晚于 yt-navigate-finish）
  document.addEventListener('yt-page-data-updated', () => {
    if (location.pathname === '/watch' && !moved) {
      console.log(`${LOG} 📦 yt-page-data-updated，检查评论...`);
      const c = document.querySelector('#below #comments, #primary #comments');
      if (c && hasCommentsContent(c)) {
        moveCommentsToSidebar();
      } else {
        // 再次触发加载
        setTimeout(nudgeCommentsLoading, 300);
      }
    }
  });

  // 浏览器前进/后退
  window.addEventListener('popstate', () => setTimeout(handleNavigation, 300));

  // 首次加载
  console.log(`${LOG} 🚀 脚本已加载，当前路径: ${location.pathname}`);
  if (location.pathname === '/watch') {
    handleWatchPage();
  }

})();
