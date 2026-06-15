// ==UserScript==
// @name         YouTube 评论移至右侧
// @namespace    https://github.com/tampermonkey-scripts
// @version      1.4
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

  // ========== 注入自定义样式 ==========
  GM_addStyle(`
    /* --- 隐藏右侧推荐视频 --- */
    #secondary #related {
      display: none !important;
    }

    /* --- 评论区在右侧的样式 --- */
    #secondary #comments.ytd-comments-moved {
      display: block !important;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 8px 16px 8px;
      box-sizing: border-box;
      position: sticky;
      top: 72px;
    }

    /* 让右侧栏保持可见 */
    #secondary {
      display: block !important;
      min-width: 0 !important;
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

    /* 隐藏原位置的评论区占位 (防止残留空白) */
    #below > #comments:not(.ytd-comments-moved) {
      display: none !important;
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

    /* 章节面板容器 - 移入右侧栏后的样式 */
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

    /* 深色模式 */
    html[dark] #secondary .ytd-chapters-panel-moved {
      background-color: var(--yt-spec-raised-background, #212121);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    /* 浅色模式 */
    html:not([dark]) #secondary .ytd-chapters-panel-moved {
      background-color: var(--yt-spec-raised-background, #f2f2f2);
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    /* 章节面板内部内容区域自适应 */
    #secondary .ytd-chapters-panel-moved #content.ytd-engagement-panel-section-list-renderer {
      max-height: none !important;
      overflow: visible !important;
    }

    /* 章节面板滚动条美化 */
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

    /* 章节面板标题栏固定在顶部 */
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

    /* 防止原始位置残留 */
    ytd-watch-flexy ytd-engagement-panel-section-list-renderer[target-id*="macro-markers"].ytd-chapters-panel-moved {
      visibility: visible !important;
    }

    /* 隐藏原始位置的面板（防止重复显示） */
    #panels ytd-engagement-panel-section-list-renderer[target-id*="macro-markers"][visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]:not(.ytd-chapters-panel-moved) {
      opacity: 0 !important;
      pointer-events: none !important;
      position: absolute !important;
      width: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }

    /* 迷你播放器模式下不受影响 */
    ytd-miniplayer #comments {
      display: none !important;
    }
  `);

  // ========== 核心逻辑 ==========

  let moved = false;
  let chaptersObserver = null;
  let pendingMoveTimer = null;
  let commentsWatcherActive = false;

  const LOG_PREFIX = '[YouTube 评论移至右侧]';

  /**
   * 触发 YouTube 评论区的懒加载
   * YouTube 使用 IntersectionObserver 来检测评论区是否进入视口
   * 我们需要模拟这个过程，让 YouTube 认为用户已经滚动到评论区
   */
  function triggerCommentsLoad() {
    const comments = document.querySelector('#comments ytd-comments-header-renderer, #comments #header');
    if (comments) {
      // 评论头部已存在，可能已经加载了
      return;
    }

    // 方法1: 短暂滚动到评论区位置再滚回来，触发 YouTube 的 IntersectionObserver
    const commentsEl = document.querySelector('#comments');
    if (commentsEl && !commentsEl.classList.contains('ytd-comments-moved')) {
      const savedScrollY = window.scrollY;
      // 滚动到评论区附近
      commentsEl.scrollIntoView({ behavior: 'instant', block: 'start' });

      // 短暂延迟后滚回原位
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedScrollY, behavior: 'instant' });
        });
      });
      console.log(`${LOG_PREFIX} 🔄 已触发评论区懒加载`);
    }

    // 方法2: 直接触发 ytd-comments 的 entries 回调（更可靠的后备方案）
    const ytdComments = document.querySelector('ytd-comments#comments');
    if (ytdComments) {
      // 尝试通过 Polymer 的属性触发加载
      if (typeof ytdComments.loadComments === 'function') {
        ytdComments.loadComments();
      }
      // 发送自定义滚动事件让 YouTube 检测可见性
      window.dispatchEvent(new Event('scroll'));
    }
  }

  /**
   * 将评论区移动到右侧栏
   */
  function moveComments() {
    if (location.pathname !== '/watch') return false;

    const comments = document.querySelector('#primary #comments, #below #comments');
    const secondary = document.querySelector('#secondary, #secondary-inner');

    if (!comments || !secondary) return false;

    // 已经移动过了
    if (comments.classList.contains('ytd-comments-moved')) return true;

    // 确保 #related 被隐藏 (CSS 已处理，这里做双重保险)
    const related = secondary.querySelector('#related');
    if (related) {
      related.style.display = 'none';
    }

    // 先触发懒加载（在移动前，因为移动后原始位置就没了）
    triggerCommentsLoad();

    // 将评论区移动到右侧栏的最前面
    comments.classList.add('ytd-comments-moved');
    secondary.prepend(comments);

    console.log(`${LOG_PREFIX} ✅ 评论区已移动到右侧`);
    moved = true;

    // 移动完成后再次触发懒加载（确保评论内容在新位置也能加载）
    setTimeout(() => {
      triggerCommentsLoad();
      // 确保评论在新位置的可见性被 YouTube 检测到
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('resize'));
    }, 300);

    // 评论移动完成后，开始监听章节面板
    setupChaptersPanelWatcher();

    return true;
  }

  /**
   * 查找并移动章节面板到右侧评论区顶部
   */
  function moveChaptersPanel() {
    const secondary = document.querySelector('#secondary, #secondary-inner');
    if (!secondary) return;

    // 查找所有章节相关的 engagement panel
    const chapterPanels = document.querySelectorAll(
      'ytd-engagement-panel-section-list-renderer[target-id*="macro-markers"]'
    );

    chapterPanels.forEach(panel => {
      const isExpanded = panel.getAttribute('visibility') === 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED';
      const alreadyMoved = panel.classList.contains('ytd-chapters-panel-moved');

      if (isExpanded && !alreadyMoved) {
        // 移动到 #secondary 顶部（评论区之前）
        panel.classList.add('ytd-chapters-panel-moved');
        secondary.prepend(panel);
        console.log(`${LOG_PREFIX} ✅ 章节面板已移至评论区顶部`);
      } else if (!isExpanded && alreadyMoved) {
        // 面板被关闭，移回原位并清理标记
        panel.classList.remove('ytd-chapters-panel-moved');
        const panelsContainer = document.querySelector('#panels.ytd-watch-flexy, ytd-watch-flexy #panels');
        if (panelsContainer) {
          panelsContainer.appendChild(panel);
        }
        console.log(`${LOG_PREFIX} ↩️ 章节面板已关闭并归位`);
      }
    });
  }

  /**
   * 监听章节面板的展开/关闭
   */
  function setupChaptersPanelWatcher() {
    // 避免重复监听
    if (chaptersObserver) {
      chaptersObserver.disconnect();
    }

    // 先尝试立即处理已存在的面板
    moveChaptersPanel();

    // 监听 DOM 变化，捕捉章节面板展开/关闭
    chaptersObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // 属性变化：检测 visibility 属性切换
        if (mutation.type === 'attributes' && mutation.attributeName === 'visibility') {
          const target = mutation.target;
          if (target.tagName === 'YTD-ENGAGEMENT-PANEL-SECTION-LIST-RENDERER' &&
              (target.getAttribute('target-id') || '').includes('macro-markers')) {
            moveChaptersPanel();
            return;
          }
        }
        // 子节点变化：可能新增了面板
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
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

    // 监听整个 watch 容器
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    if (watchFlexy) {
      chaptersObserver.observe(watchFlexy, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['visibility']
      });
    }
  }

  /**
   * 清理当前页面状态，为新页面做准备
   */
  function resetState() {
    moved = false;

    // 取消待执行的定时器
    if (pendingMoveTimer) {
      clearTimeout(pendingMoveTimer);
      pendingMoveTimer = null;
    }

    // 清理章节面板监听器
    if (chaptersObserver) {
      chaptersObserver.disconnect();
      chaptersObserver = null;
    }

    // 清理之前移动的章节面板标记
    document.querySelectorAll('.ytd-chapters-panel-moved').forEach(el => {
      el.classList.remove('ytd-chapters-panel-moved');
    });
  }

  /**
   * 核心调度：尝试移动评论区，带递增延迟重试
   * 使用递增延迟策略，前期快速重试，后期放慢节奏
   */
  function scheduleMove() {
    if (moved || location.pathname !== '/watch') return;

    // 尝试立即执行
    if (moveComments()) return;

    // 重试计划: 200ms, 500ms, 1s, 2s, 3s, 5s, 8s, 12s, 18s, 25s
    const delays = [200, 500, 1000, 2000, 3000, 5000, 8000, 12000, 18000, 25000];
    let attempt = 0;

    function tryMove() {
      if (moved || location.pathname !== '/watch') return;

      if (moveComments()) {
        console.log(`${LOG_PREFIX} ✅ 第 ${attempt + 1} 次重试成功`);
        return;
      }

      attempt++;
      if (attempt < delays.length) {
        pendingMoveTimer = setTimeout(tryMove, delays[attempt]);
      } else {
        console.log(`${LOG_PREFIX} ⚠️ 所有重试已用完，未能找到评论区元素`);
      }
    }

    pendingMoveTimer = setTimeout(tryMove, delays[0]);
  }

  /**
   * 持久 DOM 监听器：监测 #comments 元素出现在 DOM 中
   * 这是最可靠的方案 —— 不依赖定时器，而是在元素实际出现时立即响应
   */
  function setupPersistentWatcher() {
    if (commentsWatcherActive) return;
    commentsWatcherActive = true;

    const bodyObserver = new MutationObserver(() => {
      if (location.pathname !== '/watch') return;
      if (moved) return;

      // 检查评论区是否已出现
      const comments = document.querySelector('#primary #comments, #below #comments');
      if (comments && !comments.classList.contains('ytd-comments-moved')) {
        moveComments();
      }
    });

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 处理页面导航（统一入口）
   */
  function handleNavigation() {
    resetState();

    if (location.pathname === '/watch') {
      console.log(`${LOG_PREFIX} 📺 检测到视频页面，准备移动评论区...`);
      // 双管齐下：定时重试 + DOM 监听
      scheduleMove();
    }
  }

  // ========== 初始化 ==========

  // 1. 设置持久 DOM 监听器（始终运行，不随导航重置）
  setupPersistentWatcher();

  // 2. 监听 YouTube SPA 导航事件（最主要的导航检测方式）
  document.addEventListener('yt-navigate-finish', handleNavigation);

  // 3. 监听 yt-page-data-updated 事件（某些情况下比 yt-navigate-finish 更晚触发）
  document.addEventListener('yt-page-data-updated', () => {
    if (location.pathname === '/watch' && !moved) {
      setTimeout(scheduleMove, 300);
    }
  });

  // 4. popstate 事件（浏览器前进/后退按钮）
  window.addEventListener('popstate', () => {
    setTimeout(handleNavigation, 300);
  });

  // 5. 首次加载
  if (location.pathname === '/watch') {
    handleNavigation();
  }

})();
