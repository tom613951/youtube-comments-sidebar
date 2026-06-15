// ==UserScript==
// @name         YouTube 评论移至右侧
// @namespace    https://github.com/tampermonkey-scripts
// @version      2.0
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
  // 所有规则严格限定在 ytd-watch-flexy 下，避免影响首页等其他页面
  GM_addStyle(`
    /* --- 隐藏右侧推荐视频（仅视频页） --- */
    ytd-watch-flexy #secondary #related {
      display: none !important;
    }

    /* --- 评论区在右侧的样式 --- */
    ytd-watch-flexy #secondary #comments.ytd-comments-moved {
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
    }

    /* 强制两列布局（仅视频页） */
    ytd-watch-flexy #columns.ytd-watch-flexy {
      display: flex !important;
      flex-direction: row !important;
    }
    ytd-watch-flexy #primary.ytd-watch-flexy {
      flex: 1 1 auto !important;
      min-width: 0 !important;
      max-width: calc(100% - 426px) !important;
    }
    ytd-watch-flexy #secondary.ytd-watch-flexy {
      display: block !important;
      visibility: visible !important;
      min-width: 402px !important;
      width: 402px !important;
      max-width: 402px !important;
      flex: 0 0 402px !important;
      padding-left: 24px !important;
      box-sizing: content-box !important;
    }
    ytd-watch-flexy #secondary-inner {
      display: block !important;
      visibility: visible !important;
    }

    /* 美化滚动条 */
    ytd-watch-flexy #secondary #comments.ytd-comments-moved::-webkit-scrollbar {
      width: 6px;
    }
    ytd-watch-flexy #secondary #comments.ytd-comments-moved::-webkit-scrollbar-track {
      background: transparent;
    }
    ytd-watch-flexy #secondary #comments.ytd-comments-moved::-webkit-scrollbar-thumb {
      background-color: rgba(128, 128, 128, 0.4);
      border-radius: 3px;
    }
    ytd-watch-flexy #secondary #comments.ytd-comments-moved::-webkit-scrollbar-thumb:hover {
      background-color: rgba(128, 128, 128, 0.7);
    }

    /* 原位置评论区：不可见但保持布局（让 YouTube IO 能检测到） */
    ytd-watch-flexy #below {
      position: relative !important;
    }
    ytd-watch-flexy #below > #comments:not(.ytd-comments-moved) {
      opacity: 0 !important;
      pointer-events: none !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      z-index: -1 !important;
    }

    /* 评论标题固定 */
    ytd-watch-flexy #secondary #comments.ytd-comments-moved #header.ytd-comments-header-renderer {
      position: sticky;
      top: 0;
      z-index: 10;
      padding-top: 8px;
      padding-bottom: 8px;
    }
    html[dark] ytd-watch-flexy #secondary #comments.ytd-comments-moved #header.ytd-comments-header-renderer {
      background-color: var(--yt-spec-base-background, #0f0f0f);
    }
    html:not([dark]) ytd-watch-flexy #secondary #comments.ytd-comments-moved #header.ytd-comments-header-renderer {
      background-color: var(--yt-spec-base-background, #fff);
    }

    /* 评论宽度自适应 */
    ytd-watch-flexy #secondary #comments.ytd-comments-moved ytd-comment-thread-renderer,
    ytd-watch-flexy #secondary #comments.ytd-comments-moved ytd-comments-header-renderer {
      max-width: 100% !important;
    }

    /* 影院模式 */
    ytd-watch-flexy[theater] #secondary.ytd-watch-flexy {
      position: absolute !important;
      right: 0 !important;
      top: 0 !important;
      width: 400px !important;
      max-width: 400px !important;
      z-index: 2000 !important;
      padding-top: 12px !important;
    }
    ytd-watch-flexy[theater] #primary.ytd-watch-flexy {
      max-width: calc(100% - 424px) !important;
    }
    ytd-watch-flexy[theater] #secondary #comments.ytd-comments-moved {
      max-height: calc(100vh - 80px);
    }

    /* ========== 通用面板内嵌样式（章节 & 合辑共用） ========== */
    ytd-watch-flexy #secondary .ytd-panel-inline {
      display: block !important;
      position: relative !important;
      top: auto !important; left: auto !important;
      right: auto !important; bottom: auto !important;
      width: 100% !important; max-width: 100% !important;
      height: auto !important; max-height: 45vh;
      overflow-y: auto; overflow-x: hidden;
      z-index: 5; margin-bottom: 12px;
      border-radius: 12px; box-sizing: border-box;
    }
    html[dark] ytd-watch-flexy #secondary .ytd-panel-inline {
      background-color: var(--yt-spec-raised-background, #212121);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    html:not([dark]) ytd-watch-flexy #secondary .ytd-panel-inline {
      background-color: var(--yt-spec-raised-background, #f2f2f2);
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    ytd-watch-flexy #secondary .ytd-panel-inline #content.ytd-engagement-panel-section-list-renderer {
      max-height: none !important; overflow: visible !important;
    }
    ytd-watch-flexy #secondary .ytd-panel-inline::-webkit-scrollbar { width: 5px; }
    ytd-watch-flexy #secondary .ytd-panel-inline::-webkit-scrollbar-track { background: transparent; }
    ytd-watch-flexy #secondary .ytd-panel-inline::-webkit-scrollbar-thumb {
      background-color: rgba(128, 128, 128, 0.35); border-radius: 3px;
    }
    ytd-watch-flexy #secondary .ytd-panel-inline #header.ytd-engagement-panel-section-list-renderer {
      position: sticky; top: 0; z-index: 10; border-radius: 12px 12px 0 0;
    }
    html[dark] ytd-watch-flexy #secondary .ytd-panel-inline #header.ytd-engagement-panel-section-list-renderer {
      background-color: var(--yt-spec-raised-background, #212121);
    }
    html:not([dark]) ytd-watch-flexy #secondary .ytd-panel-inline #header.ytd-engagement-panel-section-list-renderer {
      background-color: var(--yt-spec-raised-background, #f2f2f2);
    }

    /* 章节面板：保持可见 */
    ytd-watch-flexy ytd-engagement-panel-section-list-renderer[target-id*="macro-markers"].ytd-panel-inline {
      visibility: visible !important;
    }
    /* 隐藏章节面板原始位置 */
    #panels ytd-engagement-panel-section-list-renderer[target-id*="macro-markers"][visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]:not(.ytd-panel-inline) {
      opacity: 0 !important; pointer-events: none !important;
      position: absolute !important; width: 0 !important; height: 0 !important; overflow: hidden !important;
    }

    /* ========== 合辑面板（Playlist） ========== */
    ytd-watch-flexy #secondary ytd-playlist-panel-renderer.ytd-panel-inline {
      display: block !important;
      position: relative !important;
      top: auto !important; left: auto !important;
      right: auto !important; bottom: auto !important;
      width: 100% !important; max-width: 100% !important;
      height: auto !important; max-height: 45vh;
      overflow-y: auto; overflow-x: hidden;
      z-index: 5; margin-bottom: 12px;
      border-radius: 12px; box-sizing: border-box;
    }
    /* 合辑面板内部滚动条 */
    ytd-watch-flexy #secondary ytd-playlist-panel-renderer.ytd-panel-inline::-webkit-scrollbar { width: 5px; }
    ytd-watch-flexy #secondary ytd-playlist-panel-renderer.ytd-panel-inline::-webkit-scrollbar-track { background: transparent; }
    ytd-watch-flexy #secondary ytd-playlist-panel-renderer.ytd-panel-inline::-webkit-scrollbar-thumb {
      background-color: rgba(128, 128, 128, 0.35); border-radius: 3px;
    }
    /* 合辑面板标题固定 */
    ytd-watch-flexy #secondary ytd-playlist-panel-renderer.ytd-panel-inline #header-description.ytd-playlist-panel-renderer {
      position: sticky; top: 0; z-index: 10;
    }

    ytd-miniplayer #comments { display: none !important; }
  `);

  // ========== 核心状态 ==========
  let moved = false;
  let panelsObserver = null;
  let isModifying = false; // 防止 DOM 修改触发 observer 死循环

  // ========== 工具函数 ==========

  function isWatchPage() {
    return location.pathname === '/watch';
  }

  function hasCommentsContent(el) {
    return !!(
      el.querySelector('ytd-comments-header-renderer') ||
      el.querySelector('ytd-comment-thread-renderer') ||
      el.querySelector('ytd-item-section-renderer #contents')
    );
  }

  /**
   * 强制 #secondary 可见（JS 层面移除所有隐藏手段）
   */
  function forceSecondaryVisible() {
    const secondary = document.querySelector('ytd-watch-flexy #secondary');
    if (!secondary) return;

    // 移除 hidden 属性
    secondary.removeAttribute('hidden');
    // 清除可能的内联隐藏样式
    secondary.style.removeProperty('display');
    secondary.style.removeProperty('visibility');
    secondary.style.removeProperty('opacity');

    const inner = secondary.querySelector('#secondary-inner');
    if (inner) {
      inner.removeAttribute('hidden');
      inner.style.removeProperty('display');
      inner.style.removeProperty('visibility');
    }

    // 确保 watch-flexy 的 columns 容器也是 flex
    const columns = document.querySelector('ytd-watch-flexy #columns');
    if (columns) {
      columns.removeAttribute('hidden');
    }
  }

  // ========== 评论区移动 ==========

  /**
   * 将 #comments 移回原位（SPA 导航时调用）
   */
  function returnCommentsToOriginal() {
    const c = document.querySelector('#comments.ytd-comments-moved');
    if (c) {
      c.classList.remove('ytd-comments-moved');
      const below = document.querySelector('ytd-watch-flexy #below');
      if (below) below.appendChild(c);
    }
  }

  /**
   * 核心：将评论区移动到右侧栏
   */
  function moveCommentsToSidebar() {
    if (moved || !isWatchPage()) return false;

    const comments = document.querySelector('ytd-watch-flexy #below #comments, ytd-watch-flexy #primary #comments');
    const secondary = document.querySelector('ytd-watch-flexy #secondary');
    if (!comments || !secondary) return false;
    if (comments.classList.contains('ytd-comments-moved')) { moved = true; return true; }

    // 必须等评论数据加载后再移动
    if (!hasCommentsContent(comments)) return false;

    // 隐藏推荐视频
    const related = secondary.querySelector('#related');
    if (related) related.style.display = 'none';

    // 强制右侧栏可见
    forceSecondaryVisible();

    // 移动评论到右侧栏末尾（排在面板之后）
    comments.classList.add('ytd-comments-moved');
    const inner = secondary.querySelector('#secondary-inner') || secondary;
    inner.appendChild(comments);
    moved = true;

    console.log(`${LOG} ✅ 评论区已移动到右侧`);

    // 整理面板顺序：分段 → 合辑 → 评论
    arrangeSecondaryOrder();

    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    setupPanelsWatcher();
    return true;
  }

  /**
   * 触发评论懒加载
   */
  function nudgeComments() {
    if (!isWatchPage() || moved) return;

    const comments = document.querySelector('ytd-watch-flexy #below #comments:not(.ytd-comments-moved)');
    if (!comments) return;

    // 短暂让元素正常显示并滚入视口
    const saved = window.scrollY;
    comments.style.cssText = 'position:relative!important;opacity:0.001!important;';
    comments.scrollIntoView({ behavior: 'instant', block: 'end' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: saved, behavior: 'instant' });
      requestAnimationFrame(() => { comments.style.cssText = ''; });
    });
  }

  // ========== 面板管理（章节 + 合辑） ==========

  /**
   * 处理章节面板（分段）
   */
  function handleChaptersPanel() {
    const secondary = document.querySelector('ytd-watch-flexy #secondary');
    if (!secondary) return;
    const inner = secondary.querySelector('#secondary-inner') || secondary;

    document.querySelectorAll(
      'ytd-engagement-panel-section-list-renderer[target-id*="macro-markers"]'
    ).forEach(panel => {
      const expanded = panel.getAttribute('visibility') === 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED';
      const wasMoved = panel.classList.contains('ytd-panel-inline');
      if (expanded && !wasMoved) {
        panel.classList.add('ytd-panel-inline');
        panel.dataset.panelType = 'chapters';
        inner.prepend(panel);
        console.log(`${LOG} ✅ 章节面板已内嵌`);
      } else if (!expanded && wasMoved) {
        panel.classList.remove('ytd-panel-inline');
        delete panel.dataset.panelType;
        const p = document.querySelector('ytd-watch-flexy #panels');
        if (p) p.appendChild(panel);
        console.log(`${LOG} ↩️ 章节面板已关闭`);
      }
    });
  }

  /**
   * 检查合辑面板是否有有效内容（避免空面板显示 NaN/NaN）
   */
  function hasValidPlaylistContent(el) {
    // 必须有实际的播放列表条目
    const items = el.querySelector('#items ytd-playlist-panel-video-renderer');
    if (!items) return false;
    // 检查标题是否有效
    const title = el.querySelector('#header-description .title');
    if (title && title.textContent.includes('NaN')) return false;
    return true;
  }

  /**
   * 处理合辑面板（Playlist）
   */
  function handlePlaylistPanel() {
    const secondary = document.querySelector('ytd-watch-flexy #secondary');
    if (!secondary) return;
    const inner = secondary.querySelector('#secondary-inner') || secondary;

    // 合辑面板可能在 #secondary 中，也可能作为 engagement-panel 出现
    const playlistPanel = inner.querySelector('ytd-playlist-panel-renderer:not(.ytd-panel-inline)');
    if (playlistPanel && hasValidPlaylistContent(playlistPanel)) {
      playlistPanel.classList.add('ytd-panel-inline');
      playlistPanel.dataset.panelType = 'playlist';
      console.log(`${LOG} ✅ 合辑面板已内嵌`);
    }

    // 也检查 engagement panel 形式的合辑
    document.querySelectorAll(
      'ytd-engagement-panel-section-list-renderer[target-id*="playlist"]'
    ).forEach(panel => {
      const expanded = panel.getAttribute('visibility') === 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED';
      const wasMoved = panel.classList.contains('ytd-panel-inline');
      if (expanded && !wasMoved) {
        panel.classList.add('ytd-panel-inline');
        panel.dataset.panelType = 'playlist';
        inner.appendChild(panel);
        console.log(`${LOG} ✅ 合辑 engagement 面板已内嵌`);
      } else if (!expanded && wasMoved && panel.dataset.panelType === 'playlist') {
        panel.classList.remove('ytd-panel-inline');
        delete panel.dataset.panelType;
        const p = document.querySelector('ytd-watch-flexy #panels');
        if (p) p.appendChild(panel);
      }
    });
  }

  /**
   * 整理 #secondary 内元素顺序：分段(顶) → 合辑(中) → 评论(底)
   * 只在顺序不正确时才修改 DOM，避免无意义的 DOM 操作触发 observer
   */
  function arrangeSecondaryOrder() {
    const secondary = document.querySelector('ytd-watch-flexy #secondary');
    if (!secondary) return;
    const inner = secondary.querySelector('#secondary-inner') || secondary;

    const chapters = inner.querySelector('[data-panel-type="chapters"]');
    const playlist = inner.querySelector('ytd-playlist-panel-renderer.ytd-panel-inline, [data-panel-type="playlist"]');
    const comments = inner.querySelector('#comments.ytd-comments-moved');

    // 构建期望顺序
    const desired = [chapters, playlist, comments].filter(Boolean);
    if (desired.length < 2) return; // 只有一个或没有元素，无需排序

    // 检查当前顺序是否已经正确
    const children = Array.from(inner.children);
    let lastIndex = -1;
    let orderCorrect = true;
    for (const el of desired) {
      const idx = children.indexOf(el);
      if (idx <= lastIndex) { orderCorrect = false; break; }
      lastIndex = idx;
    }
    if (orderCorrect) return;

    // 顺序不正确，重新排列
    isModifying = true;
    if (comments) inner.appendChild(comments);
    if (playlist && comments) inner.insertBefore(playlist, comments);
    else if (playlist) inner.appendChild(playlist);
    if (chapters) inner.prepend(chapters);
    isModifying = false;
    console.log(`${LOG} 📐 面板顺序已整理`);
  }

  /**
   * 统一处理所有面板并排序
   */
  function handleAllPanels() {
    isModifying = true;
    handleChaptersPanel();
    handlePlaylistPanel();
    isModifying = false;
    arrangeSecondaryOrder();
  }

  /**
   * 监听面板变化（章节展开/关闭、合辑出现）
   */
  function setupPanelsWatcher() {
    if (panelsObserver) panelsObserver.disconnect();
    handleAllPanels();
    panelsObserver = new MutationObserver(muts => {
      // 如果是我们自己在修改 DOM，跳过
      if (isModifying) return;

      let needsUpdate = false;
      for (const m of muts) {
        if (m.type === 'attributes' && m.attributeName === 'visibility') {
          if (m.target.tagName === 'YTD-ENGAGEMENT-PANEL-SECTION-LIST-RENDERER') {
            needsUpdate = true; break;
          }
        }
        if (m.type === 'childList') {
          for (const n of m.addedNodes) {
            if (n.nodeType === 1 && (
              n.tagName === 'YTD-ENGAGEMENT-PANEL-SECTION-LIST-RENDERER' ||
              n.tagName === 'YTD-PLAYLIST-PANEL-RENDERER' ||
              n.querySelector?.('ytd-engagement-panel-section-list-renderer') ||
              n.querySelector?.('ytd-playlist-panel-renderer')
            )) {
              needsUpdate = true; break;
            }
          }
          if (needsUpdate) break;
        }
      }
      if (needsUpdate) setTimeout(handleAllPanels, 200);
    });
    const wf = document.querySelector('ytd-watch-flexy');
    if (wf) panelsObserver.observe(wf, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['visibility']
    });
  }

  // ========== 全局持久监听器 ==========
  // 一个始终运行的 MutationObserver，持续检测并处理评论区
  // 不依赖特定事件时序，无论何种方式进入视频页都能工作

  let lastUrl = '';

  function onDomChange() {
    const url = location.href;

    // URL 变化 = 新页面
    if (url !== lastUrl) {
      lastUrl = url;
      if (isWatchPage()) {
        console.log(`${LOG} 📺 检测到视频页: ${url}`);
        moved = false;
        returnCommentsToOriginal();
        // 清理面板状态
        if (panelsObserver) { panelsObserver.disconnect(); panelsObserver = null; }
        document.querySelectorAll('.ytd-panel-inline').forEach(el => {
          el.classList.remove('ytd-panel-inline');
          delete el.dataset.panelType;
        });
        // 安排多次 nudge 确保评论加载
        setTimeout(nudgeComments, 300);
        setTimeout(nudgeComments, 1000);
        setTimeout(nudgeComments, 2500);
        setTimeout(nudgeComments, 5000);
        // 兜底：10s 后强制移动
        setTimeout(() => {
          if (!moved && isWatchPage()) {
            console.log(`${LOG} ⏰ 兜底强制移动`);
            const c = document.querySelector('ytd-watch-flexy #below #comments, ytd-watch-flexy #primary #comments');
            if (c && !c.classList.contains('ytd-comments-moved')) {
              forceSecondaryVisible();
              c.classList.add('ytd-comments-moved');
              const sec = document.querySelector('ytd-watch-flexy #secondary');
              const inner = sec?.querySelector('#secondary-inner') || sec;
              if (inner) { inner.appendChild(c); moved = true; setupPanelsWatcher(); }
            }
          }
        }, 10000);
      }
      return;
    }

    // 在视频页，持续尝试移动评论
    if (isWatchPage() && !moved) {
      moveCommentsToSidebar();
    }
  }

  // 使用防抖的 MutationObserver，避免高频触发
  let debounceTimer = null;
  const globalObserver = new MutationObserver(() => {
    if (isModifying) return; // 跳过自身 DOM 修改
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      onDomChange();
    }, 100);
  });

  globalObserver.observe(document.body, { childList: true, subtree: true });

  // 也监听 YouTube 专有事件
  document.addEventListener('yt-navigate-finish', () => onDomChange());
  document.addEventListener('yt-page-data-updated', () => {
    if (isWatchPage() && !moved) {
      setTimeout(nudgeComments, 200);
      setTimeout(() => onDomChange(), 400);
    }
  });
  window.addEventListener('popstate', () => setTimeout(onDomChange, 200));

  // 首次运行
  console.log(`${LOG} 🚀 脚本已加载`);
  lastUrl = location.href;
  if (isWatchPage()) {
    onDomChange();
  }

})();
