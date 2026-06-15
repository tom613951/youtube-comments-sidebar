// ==UserScript==
// @name         YouTube 评论移至右侧
// @namespace    https://github.com/tampermonkey-scripts
// @version      1.5
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

    /*
     * 关键修复：不使用 display:none 隐藏原位置评论区！
     * display:none 会导致 YouTube 内部 IntersectionObserver 无法检测到评论区，
     * 从而不会触发评论数据的 API 请求。
     * 改用 opacity:0 + pointer-events:none，保持元素在布局中可被观察。
     */
    #below > #comments:not(.ytd-comments-moved) {
      opacity: 0 !important;
      pointer-events: none !important;
      z-index: -1 !important;
      max-height: 1px !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
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

  const LOG_PREFIX = '[YouTube 评论移至右侧]';

  /**
   * 检查评论区是否已经接收到数据（YouTube 内部数据绑定完成）
   * YouTube 会在评论区可见时通过 API 获取评论数据，
   * 数据到达后会在 #comments 内部创建子组件。
   */
  function hasCommentsData(commentsEl) {
    // 检查是否有评论头部渲染器（表示数据已绑定）
    if (commentsEl.querySelector('ytd-comments-header-renderer')) return true;
    // 检查是否有评论条目（表示评论已加载）
    if (commentsEl.querySelector('ytd-comment-thread-renderer')) return true;
    // 检查是否有 item-section-renderer（表示框架已就绪）
    if (commentsEl.querySelector('ytd-item-section-renderer #contents')) return true;
    return false;
  }

  /**
   * 将评论区移动到右侧栏
   * @param {boolean} forceMove - 是否强制移动（不等待数据加载）
   */
  function moveComments(forceMove = false) {
    if (location.pathname !== '/watch') return false;

    const comments = document.querySelector(
      '#primary #comments, #below #comments, ytd-watch-flexy #comments:not(.ytd-comments-moved)'
    );
    const secondary = document.querySelector('#secondary, #secondary-inner');

    if (!comments || !secondary) return false;

    // 已经移动过了
    if (comments.classList.contains('ytd-comments-moved')) return true;

    // 除非强制移动，否则等待评论数据绑定完成再移动
    // 这样可以确保 YouTube 的内部数据流不被中断
    if (!forceMove && !hasCommentsData(comments)) {
      return false;
    }

    // 确保 #related 被隐藏 (CSS 已处理，这里做双重保险)
    const related = secondary.querySelector('#related');
    if (related) {
      related.style.display = 'none';
    }

    // 将评论区移动到右侧栏的最前面
    comments.classList.add('ytd-comments-moved');
    secondary.prepend(comments);

    console.log(`${LOG_PREFIX} ✅ 评论区已移动到右侧`);
    moved = true;

    // 移动完成后通知浏览器布局变化，确保后续的懒加载评论也能正常触发
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });

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

    const chapterPanels = document.querySelectorAll(
      'ytd-engagement-panel-section-list-renderer[target-id*="macro-markers"]'
    );

    chapterPanels.forEach(panel => {
      const isExpanded = panel.getAttribute('visibility') === 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED';
      const alreadyMoved = panel.classList.contains('ytd-chapters-panel-moved');

      if (isExpanded && !alreadyMoved) {
        panel.classList.add('ytd-chapters-panel-moved');
        secondary.prepend(panel);
        console.log(`${LOG_PREFIX} ✅ 章节面板已移至评论区顶部`);
      } else if (!isExpanded && alreadyMoved) {
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
    if (chaptersObserver) {
      chaptersObserver.disconnect();
    }

    moveChaptersPanel();

    chaptersObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'visibility') {
          const target = mutation.target;
          if (target.tagName === 'YTD-ENGAGEMENT-PANEL-SECTION-LIST-RENDERER' &&
              (target.getAttribute('target-id') || '').includes('macro-markers')) {
            moveChaptersPanel();
            return;
          }
        }
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
   * 清理当前页面状态
   */
  function resetState() {
    moved = false;

    if (pendingMoveTimer) {
      clearTimeout(pendingMoveTimer);
      pendingMoveTimer = null;
    }

    if (chaptersObserver) {
      chaptersObserver.disconnect();
      chaptersObserver = null;
    }

    document.querySelectorAll('.ytd-chapters-panel-moved').forEach(el => {
      el.classList.remove('ytd-chapters-panel-moved');
    });
  }

  /**
   * 核心调度：持续监听 DOM 变化，等待评论数据加载后再移动
   *
   * 策略说明：
   * 1. CSS 将原位置的 #comments 设为 opacity:0（而非 display:none），
   *    这样 YouTube 的 IntersectionObserver 仍能检测到它并触发评论 API 请求。
   * 2. 本函数通过 MutationObserver 监听 #comments 内部变化，
   *    一旦检测到评论数据已加载（子组件出现），立即执行移动。
   * 3. 同时设置一个 15 秒的兜底定时器，即使没检测到数据也强制移动。
   */
  function startWatchingForComments() {
    if (moved || location.pathname !== '/watch') return;

    // 先尝试立即执行（可能评论已经加载好了，比如页面刷新的情况）
    if (moveComments()) return;

    console.log(`${LOG_PREFIX} ⏳ 等待评论数据加载...`);

    // MutationObserver: 监听 #comments 内部出现子组件
    const commentsObserver = new MutationObserver(() => {
      if (moved) {
        commentsObserver.disconnect();
        return;
      }
      if (moveComments()) {
        commentsObserver.disconnect();
        console.log(`${LOG_PREFIX} ✅ 通过 DOM 监听检测到评论数据，已移动`);
      }
    });

    // 监听整个 primary 区域（因为 #comments 本身可能还没出现）
    const watchTarget = document.querySelector('ytd-watch-flexy') || document.body;
    commentsObserver.observe(watchTarget, {
      childList: true,
      subtree: true,
    });

    // 兜底：15 秒后如果还没移动成功，强制移动（即使评论还没加载也先占位）
    pendingMoveTimer = setTimeout(() => {
      if (!moved && location.pathname === '/watch') {
        commentsObserver.disconnect();
        console.log(`${LOG_PREFIX} ⏰ 超时兜底，强制移动评论区`);
        moveComments(true); // 强制移动
      }
    }, 15000);
  }

  /**
   * 处理页面导航（统一入口）
   */
  function handleNavigation() {
    resetState();

    if (location.pathname === '/watch') {
      console.log(`${LOG_PREFIX} 📺 检测到视频页面`);
      startWatchingForComments();
    }
  }

  // ========== 初始化 ==========

  // 1. 监听 YouTube SPA 导航事件
  document.addEventListener('yt-navigate-finish', handleNavigation);

  // 2. 监听 yt-page-data-updated 事件（部分场景比 yt-navigate-finish 晚触发）
  document.addEventListener('yt-page-data-updated', () => {
    if (location.pathname === '/watch' && !moved) {
      // 数据更新后短暂等待 DOM 渲染
      setTimeout(() => moveComments(), 200);
    }
  });

  // 3. popstate 事件（浏览器前进/后退按钮）
  window.addEventListener('popstate', () => {
    setTimeout(handleNavigation, 300);
  });

  // 4. 首次加载
  if (location.pathname === '/watch') {
    handleNavigation();
  }

})();
