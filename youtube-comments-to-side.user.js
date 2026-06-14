// ==UserScript==
// @name         YouTube 评论移至右侧
// @namespace    https://github.com/tampermonkey-scripts
// @version      1.3
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
  let currentUrl = '';
  let chaptersObserver = null;

  /**
   * 将评论区移动到右侧栏
   */
  function moveComments() {
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

    // 将评论区移动到右侧栏的最前面
    comments.classList.add('ytd-comments-moved');
    secondary.prepend(comments);

    console.log('[YouTube 评论移至右侧] ✅ 评论区已移动到右侧');
    moved = true;

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
        console.log('[YouTube 评论移至右侧] ✅ 章节面板已移至评论区顶部');
      } else if (!isExpanded && alreadyMoved) {
        // 面板被关闭，移回原位并清理标记
        panel.classList.remove('ytd-chapters-panel-moved');
        const panelsContainer = document.querySelector('#panels.ytd-watch-flexy, ytd-watch-flexy #panels');
        if (panelsContainer) {
          panelsContainer.appendChild(panel);
        }
        console.log('[YouTube 评论移至右侧] ↩️ 章节面板已关闭并归位');
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
   * 检测页面变化（YouTube 是 SPA，页面切换不会重新加载）
   */
  function checkForPageChange() {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      moved = false;

      // 页面切换后需要等待新内容加载
      if (location.pathname === '/watch') {
        waitAndMove();
      }
    }
  }

  /**
   * 等待元素加载完成后移动评论
   */
  function waitAndMove() {
    let attempts = 0;
    const maxAttempts = 60; // 最多等待 30 秒

    const interval = setInterval(() => {
      attempts++;
      if (moveComments() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts && !moved) {
          console.log('[YouTube 评论移至右侧] ⚠️ 超时：未能找到评论区元素');
        }
      }
    }, 500);
  }

  // ========== 初始化 ==========

  // 监听 YouTube SPA 导航事件
  // YouTube 使用 yt-navigate-finish 事件来通知页面切换
  document.addEventListener('yt-navigate-finish', () => {
    moved = false;
    // 清理之前的章节面板监听器
    if (chaptersObserver) {
      chaptersObserver.disconnect();
      chaptersObserver = null;
    }
    // 清理之前移动的章节面板标记
    document.querySelectorAll('.ytd-chapters-panel-moved').forEach(el => {
      el.classList.remove('ytd-chapters-panel-moved');
    });
    if (location.pathname === '/watch') {
      // 延迟一点等待 DOM 更新
      setTimeout(waitAndMove, 800);
    }
  });

  // 同时使用 MutationObserver 作为后备方案
  const observer = new MutationObserver(() => {
    checkForPageChange();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // 首次加载
  currentUrl = location.href;
  if (location.pathname === '/watch') {
    waitAndMove();
  }

  // URL 变化监听 (popstate 用于浏览器前进/后退)
  window.addEventListener('popstate', () => {
    setTimeout(() => {
      moved = false;
      if (location.pathname === '/watch') {
        waitAndMove();
      }
    }, 500);
  });

})();
