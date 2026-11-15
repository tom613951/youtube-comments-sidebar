// ==UserScript==
// @name         YouTube 评论移至右侧
// @namespace    https://github.com/tampermonkey-scripts
// @version      3.2
// @description  将 YouTube 评论区移至右侧侧边栏，完美适配浅色/深色主题，智能兼容分集区块（播放列表/剧集）、分段区块（章节/转写）等侧边内容，多面板智能共存防冲突，简介展开丝滑硬件加速动效
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

  // =========================================================================
  // 1. 样式系统：主题精准适配 + 布局防冲突 + 硬件加速动效
  // =========================================================================
  GM_addStyle(`
    /* --- 隐藏右侧推荐视频（仅视频页） --- */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #related {
      display: none !important;
    }

    /* --- 隐藏 YouTube 原生实验性简易侧边评论，防止与移动评论冲突 --- */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"] {
      display: none !important;
    }

    /* --- 侧边栏及两列布局增强（仅视频页生效） --- */
    :is(ytd-watch-flexy, ytd-watch-grid) #columns:is(.ytd-watch-flexy, .ytd-watch-grid) {
      display: flex !important;
      flex-direction: row !important;
    }
    :is(ytd-watch-flexy, ytd-watch-grid) #primary:is(.ytd-watch-flexy, .ytd-watch-grid) {
      flex: 1 1 auto !important;
      min-width: 0 !important;
      max-width: calc(100% - 426px) !important;
    }
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary:is(.ytd-watch-flexy, .ytd-watch-grid) {
      display: block !important;
      visibility: visible !important;
      min-width: 360px !important;
      width: var(--ytd-watch-flexy-sidebar-width, 420px) !important;
      max-width: 650px !important;
      flex: 0 0 var(--ytd-watch-flexy-sidebar-width, 420px) !important;
      padding-left: 24px !important;
      box-sizing: content-box !important;
    }
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary-inner {
      display: flex !important;
      flex-direction: column !important;
      visibility: visible !important;
    }

    /* =====================================================================
       2. 分段区块 / Engagement Panels 通用内嵌卡片化
       涵盖：章节(macro-markers/chapters)、字幕转写(transcript)、剧集/课程(episodes)等
       ===================================================================== */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels {
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      position: relative !important;
    }

    /* 展开状态的 Engagement Panel：内嵌紧凑卡片，不霸占全屏 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] {
      display: flex !important;
      flex-direction: column !important;
      position: relative !important;
      width: 100% !important;
      max-height: min(38vh, 360px) !important;
      height: auto !important;
      margin-bottom: 12px !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }

    /* 多面板并存状态下（分段 + 分集）：自动缩小至紧凑尺寸，为评论区留足空间 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary-inner.has-multiple-panels #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"],
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary-inner.has-multiple-panels ytd-playlist-panel-renderer#playlist:not([hidden]) {
      max-height: min(28vh, 260px) !important;
    }

    /* 面板内容独立滚动 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] #content {
      flex: 1 1 auto !important;
      max-height: calc(min(38vh, 360px) - 52px) !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
    }
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary-inner.has-multiple-panels #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] #content {
      max-height: calc(min(28vh, 260px) - 52px) !important;
    }

    /* 解除章节、转写面板内部强制的高度限制 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] ytd-macro-markers-list-renderer,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] #contents.ytd-macro-markers-list-renderer,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] ytd-transcript-renderer,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] #body.ytd-transcript-renderer {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
    }

    /* 面板标题栏吸顶 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] #header {
      position: sticky !important;
      top: 0 !important;
      z-index: 10 !important;
      border-radius: 12px 12px 0 0 !important;
    }

    /* 未展开的面板彻底不占空间 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer:not([visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]) {
      display: none !important;
      height: 0 !important;
      margin: 0 !important;
    }

    /* =====================================================================
       3. 分集区块 / 播放列表（Playlist / Courses / Series）内嵌优化
       ===================================================================== */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist:not([hidden]) {
      display: flex !important;
      flex-direction: column !important;
      position: relative !important;
      width: 100% !important;
      max-height: min(40vh, 380px) !important;
      height: auto !important;
      margin-bottom: 12px !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }

    /* 播放列表折叠状态完美适配 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist[collapsed]:not([hidden]) {
      max-height: 56px !important;
      height: 56px !important;
      overflow: hidden !important;
      margin-bottom: 12px !important;
    }

    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist:not([hidden]) #container {
      height: auto !important;
      max-height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist:not([hidden]) #items {
      flex: 1 1 auto !important;
      max-height: calc(min(40vh, 380px) - 60px) !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
    }
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary-inner.has-multiple-panels ytd-playlist-panel-renderer#playlist:not([hidden]) #items {
      max-height: calc(min(28vh, 260px) - 60px) !important;
    }

    /* 播放列表头部吸顶 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist:not([hidden]) #header-description,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist:not([hidden]) .header {
      position: sticky !important;
      top: 0 !important;
      z-index: 10 !important;
    }

    /* 隐藏非播放列表页面中残留的旧面板 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist[hidden] {
      display: none !important;
    }

    /* =====================================================================
       4. 主题色彩自适应（精确区分浅色与深色，彻底解决顶部黑色色块）
       ===================================================================== */
    /* 浅色主题（默认） */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"],
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist:not([hidden]) {
      background-color: var(--yt-spec-raised-background, #f8f8f8) !important;
      border: 1px solid var(--yt-spec-10-percent-layer, rgba(0, 0, 0, 0.1)) !important;
    }
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] #header,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist:not([hidden]) #header-description,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist:not([hidden]) .header,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #comments.ytd-comments-moved #header.ytd-comments-header-renderer {
      background-color: var(--yt-spec-base-background, #ffffff) !important;
      color: var(--yt-spec-text-primary, #0f0f0f) !important;
    }

    /* 深色主题 */
    :is(html[dark], [dark], ytd-app[dark]) :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"],
    :is(html[dark], [dark], ytd-app[dark]) :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist:not([hidden]) {
      background-color: var(--yt-spec-raised-background, #212121) !important;
      border: 1px solid var(--yt-spec-10-percent-layer, rgba(255, 255, 255, 0.1)) !important;
    }
    :is(html[dark], [dark], ytd-app[dark]) :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] #header,
    :is(html[dark], [dark], ytd-app[dark]) :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist:not([hidden]) #header-description,
    :is(html[dark], [dark], ytd-app[dark]) :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer#playlist:not([hidden]) .header,
    :is(html[dark], [dark], ytd-app[dark]) :is(ytd-watch-flexy, ytd-watch-grid) #secondary #comments.ytd-comments-moved #header.ytd-comments-header-renderer {
      background-color: var(--yt-spec-base-background, #0f0f0f) !important;
      color: var(--yt-spec-text-primary, #f1f1f1) !important;
    }

    /* =====================================================================
       5. 移动至右侧的评论区样式及硬件加速丝滑过渡
       ===================================================================== */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #comments.ytd-comments-moved {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: sticky !important;
      top: 72px;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      padding: 0 8px 16px 8px !important;
      box-sizing: border-box !important;
      pointer-events: auto !important;
      margin-top: 4px;
      flex: 1 1 auto !important;
      /* 硬件加速平滑动效：杜绝多帧重排导致的抖动与卡顿 */
      transition: max-height 0.35s cubic-bezier(0.2, 0.9, 0.3, 1) !important;
      will-change: max-height;
    }

    /* 评论标题栏吸顶 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #comments.ytd-comments-moved #header.ytd-comments-header-renderer {
      position: sticky;
      top: 0;
      z-index: 10;
      padding-top: 8px;
      padding-bottom: 8px;
    }

    /* 评论项宽度适应 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #comments.ytd-comments-moved ytd-comment-thread-renderer,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #comments.ytd-comments-moved ytd-comments-header-renderer {
      max-width: 100% !important;
    }

    /* 优雅滚动条 */
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #comments.ytd-comments-moved::-webkit-scrollbar,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer #content::-webkit-scrollbar,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer #items::-webkit-scrollbar {
      width: 6px;
    }
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #comments.ytd-comments-moved::-webkit-scrollbar-track,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer #content::-webkit-scrollbar-track,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer #items::-webkit-scrollbar-track {
      background: transparent;
    }
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #comments.ytd-comments-moved::-webkit-scrollbar-thumb,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #panels ytd-engagement-panel-section-list-renderer #content::-webkit-scrollbar-thumb,
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary ytd-playlist-panel-renderer #items::-webkit-scrollbar-thumb {
      background-color: var(--yt-spec-badge-chip-background, rgba(128, 128, 128, 0.35));
      border-radius: 3px;
    }
    :is(ytd-watch-flexy, ytd-watch-grid) #secondary #comments.ytd-comments-moved::-webkit-scrollbar-thumb:hover {
      background-color: var(--yt-spec-text-secondary, rgba(128, 128, 128, 0.65));
    }

    /* miniplayer 隐藏评论 */
    ytd-miniplayer #comments {
      display: none !important;
    }
  `);

  // =========================================================================
  // 6. 核心状态与观察器
  // =========================================================================
  let moved = false;
  let lastUrl = '';
  let panelsObserver = null;
  let descObserver = null;
  let layoutRafId = null;

  function isWatchPage() {
    return location.pathname === '/watch';
  }

  /**
   * 确保 #secondary 和 #secondary-inner 可见
   */
  function ensureSecondaryVisible() {
    const secondary = document.querySelector(':is(ytd-watch-flexy, ytd-watch-grid) #secondary');
    if (!secondary) return;

    secondary.removeAttribute('hidden');
    secondary.style.removeProperty('display');
    secondary.style.removeProperty('visibility');
    secondary.style.removeProperty('opacity');

    const inner = secondary.querySelector('#secondary-inner');
    if (inner) {
      inner.removeAttribute('hidden');
      inner.style.removeProperty('display');
      inner.style.removeProperty('visibility');
    }

    const columns = document.querySelector(':is(ytd-watch-flexy, ytd-watch-grid) #columns');
    if (columns) {
      columns.removeAttribute('hidden');
    }
  }

  /**
   * 触发 YouTube 内部评论加载接口
   */
  function triggerCommentsLoad(commentsEl) {
    if (!commentsEl) return;

    try {
      if (typeof commentsEl.onVisible === 'function') {
        commentsEl.onVisible();
      }
      if (typeof commentsEl.onPrescanVisible === 'function') {
        commentsEl.onPrescanVisible();
      }

      const itemSection = commentsEl.querySelector('ytd-item-section-renderer#sections');
      if (itemSection) {
        if (typeof itemSection.triggerInitialContinuations === 'function') {
          itemSection.triggerInitialContinuations();
        }
        if (typeof itemSection.onVisible === 'function') {
          itemSection.onVisible();
        }
      }

      const continuation = commentsEl.querySelector('ytd-continuation-item-renderer');
      if (continuation) {
        if (typeof continuation.triggerContinuation === 'function') {
          continuation.triggerContinuation();
        }
        if (typeof continuation.onVisible === 'function') {
          continuation.onVisible();
        }
      }
    } catch (e) {}
  }

  /**
   * 核心布局自适应与防冲突更新
   * 单次计算最终高度，配合 CSS transition 产生 60fps 丝滑展开/折叠动效
   */
  function updateSidebarLayout() {
    if (layoutRafId) cancelAnimationFrame(layoutRafId);
    layoutRafId = requestAnimationFrame(() => {
      const secondary = document.querySelector(':is(ytd-watch-flexy, ytd-watch-grid) #secondary');
      if (!secondary) return;
      const inner = secondary.querySelector('#secondary-inner') || secondary;

      // 1. 检查是否存在展开的 engagement panel（分段/转写/剧集）
      const expandedPanel = inner.querySelector(
        '#panels ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]'
      );

      // 2. 检查播放列表（分集）是否真正有效且显示
      const playlist = inner.querySelector('ytd-playlist-panel-renderer#playlist');
      const isPlaylistActive = !!(
        playlist &&
        !playlist.hasAttribute('hidden') &&
        playlist.style.display !== 'none' &&
        location.search.includes('list=')
      );

      // 若非播放列表页面但残留了未加 hidden 的 playlist，予以隐藏纠正
      if (playlist && !location.search.includes('list=') && !playlist.hasAttribute('hidden')) {
        playlist.setAttribute('hidden', '');
      }

      // 3. 标记多面板并存状态
      if (expandedPanel && isPlaylistActive) {
        inner.classList.add('has-multiple-panels');
      } else {
        inner.classList.remove('has-multiple-panels');
      }

      // 4. 简介展开状态感知与动态定高（单次赋值，GPU 补间）
      const comments = inner.querySelector('#comments.ytd-comments-moved');
      if (comments) {
        comments.style.removeProperty('opacity');
        comments.style.removeProperty('height');
        comments.style.removeProperty('position');

        const expander = document.querySelector('ytd-text-inline-expander');
        const desc = document.querySelector('ytd-watch-metadata #description, #primary #description');
        const isDescExpanded = expander?.hasAttribute('is-expanded');

        const viewportLimit = window.innerHeight - 120;

        if (isDescExpanded && desc) {
          // 简介展开时：侧边栏精准顺滑拉长至与简介底部对齐
          const descRect = desc.getBoundingClientRect();
          const commentsRect = comments.getBoundingClientRect();
          const availableToDescBottom = descRect.bottom - commentsRect.top;
          const targetHeight = Math.max(viewportLimit, availableToDescBottom);
          comments.style.maxHeight = Math.round(targetHeight) + 'px';
        } else {
          // 简介收起时：限制在视口可用高度内
          comments.style.maxHeight = Math.round(viewportLimit) + 'px';
        }
      }
    });
  }

  /**
   * 监听简介区域展开/收起切换
   * 针对 is-expanded 属性触发单次更新，杜绝逐帧 reflow 造成的卡顿
   */
  function setupDescriptionObserver() {
    if (descObserver) {
      descObserver.disconnect();
      descObserver = null;
    }

    const expander = document.querySelector('ytd-text-inline-expander');
    if (!expander) return;

    descObserver = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'is-expanded') {
          updateSidebarLayout();
          break;
        }
      }
    });

    descObserver.observe(expander, {
      attributes: true,
      attributeFilter: ['is-expanded']
    });

    // 兼听点击交互，确保即时触发动画
    if (!expander.dataset.hasClickListener) {
      expander.dataset.hasClickListener = 'true';
      expander.addEventListener('click', e => {
        const btn = e.target.closest('#expand, #collapse, tp-yt-paper-button');
        if (btn) {
          requestAnimationFrame(() => setTimeout(updateSidebarLayout, 20));
        }
      });
    }
  }

  /**
   * 监听评论区内部滚动，当滚动至底部时触发下一页加载（无限滚动）
   */
  function setupCommentsScrollListener(commentsEl) {
    if (!commentsEl || commentsEl.dataset.hasScrollListener === 'true') return;
    commentsEl.dataset.hasScrollListener = 'true';

    commentsEl.addEventListener(
      'scroll',
      () => {
        if (commentsEl.scrollTop + commentsEl.clientHeight >= commentsEl.scrollHeight - 300) {
          const continuation = commentsEl.querySelector('ytd-continuation-item-renderer');
          if (continuation) {
            try {
              if (typeof continuation.triggerContinuation === 'function') {
                continuation.triggerContinuation();
              } else if (typeof continuation.onVisible === 'function') {
                continuation.onVisible();
              }
            } catch (err) {}
          }
        }
      },
      { passive: true }
    );
  }

  /**
   * 将评论区移动到右侧栏末尾
   */
  function moveCommentsToSidebar() {
    if (moved || !isWatchPage()) return false;

    // 寻找评论区容器
    const comments = document.querySelector(
      ':is(ytd-watch-flexy, ytd-watch-grid) #comments, ytd-comments#comments, ytd-comments'
    );
    const secondary = document.querySelector(':is(ytd-watch-flexy, ytd-watch-grid) #secondary');
    if (!comments || !secondary) return false;

    // 确保右侧栏可见并隐藏推荐视频
    ensureSecondaryVisible();
    const related = secondary.querySelector('#related');
    if (related) related.style.display = 'none';

    // 移动评论区至 #secondary-inner 末尾
    const inner = secondary.querySelector('#secondary-inner') || secondary;

    // 彻底清除干扰的内联样式
    comments.style.removeProperty('opacity');
    comments.style.removeProperty('height');
    comments.style.removeProperty('position');
    comments.classList.add('ytd-comments-moved');
    inner.appendChild(comments);
    moved = true;

    console.log(`${LOG} ✅ 评论区已移至右侧侧边栏`);

    // 立即触发评论数据拉取与首屏初始化
    triggerCommentsLoad(comments);

    // 绑定内部无限滚动加载
    setupCommentsScrollListener(comments);

    // 绑定简介展开监听器
    setupDescriptionObserver();

    // 立即更新布局
    updateSidebarLayout();

    // 启动面板变动监听
    setupPanelsWatcher();

    return true;
  }

  /**
   * 将评论区放回原处（SPA 导航离开视频页时）
   */
  function returnCommentsToOriginal() {
    const comments = document.querySelector('#comments.ytd-comments-moved');
    if (comments) {
      comments.classList.remove('ytd-comments-moved');
      comments.style.maxHeight = '';
      comments.style.removeProperty('opacity');
      comments.style.removeProperty('height');
      comments.style.removeProperty('position');
      const below = document.querySelector(
        ':is(ytd-watch-flexy, ytd-watch-grid) #primary-inner #below, :is(ytd-watch-flexy, ytd-watch-grid) #below'
      );
      if (below) below.appendChild(comments);
    }
  }

  /**
   * 监听分段（Engagement Panels）与分集（Playlist）的状态变动
   */
  function setupPanelsWatcher() {
    if (panelsObserver) panelsObserver.disconnect();

    const watchContainer = document.querySelector('ytd-watch-flexy, ytd-watch-grid');
    if (!watchContainer) return;

    panelsObserver = new MutationObserver(mutations => {
      let needsUpdate = false;
      for (const m of mutations) {
        if (m.type === 'attributes') {
          if (m.attributeName === 'visibility' || m.attributeName === 'hidden' || m.attributeName === 'collapsed') {
            needsUpdate = true;
            break;
          }
        } else if (m.type === 'childList') {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1) {
              const tag = node.tagName;
              if (
                tag === 'YTD-ENGAGEMENT-PANEL-SECTION-LIST-RENDERER' ||
                tag === 'YTD-PLAYLIST-PANEL-RENDERER' ||
                tag === 'YTD-COMMENT-THREAD-RENDERER' ||
                tag === 'YTD-COMMENTS-HEADER-RENDERER' ||
                tag === 'YTD-TEXT-INLINE-EXPANDER' ||
                node.querySelector?.('ytd-engagement-panel-section-list-renderer, ytd-playlist-panel-renderer, ytd-comment-thread-renderer')
              ) {
                needsUpdate = true;
                break;
              }
            }
          }
          if (needsUpdate) break;
        }
      }

      if (needsUpdate) {
        setupDescriptionObserver();
        updateSidebarLayout();
      }
    });

    panelsObserver.observe(watchContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['visibility', 'hidden', 'collapsed']
    });
  }

  /**
   * 页面变动与单页路由导航响应
   */
  function onDomChange() {
    const currentUrl = location.href;

    // URL 变化（新页面）
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      moved = false;

      if (!isWatchPage()) {
        returnCommentsToOriginal();
        if (panelsObserver) {
          panelsObserver.disconnect();
          panelsObserver = null;
        }
        if (descObserver) {
          descObserver.disconnect();
          descObserver = null;
        }
        return;
      }

      console.log(`${LOG} 📺 进入视频页: ${currentUrl}`);

      // 阶段性检测并尝试移动
      setTimeout(moveCommentsToSidebar, 200);
      setTimeout(moveCommentsToSidebar, 800);
      setTimeout(moveCommentsToSidebar, 2000);
      setTimeout(moveCommentsToSidebar, 4000);
      return;
    }

    // 仍在视频页，持续检测
    if (isWatchPage() && !moved) {
      moveCommentsToSidebar();
    }
  }

  // =========================================================================
  // 7. 全局事件监听与初始化
  // =========================================================================

  // 全局 DOM 防抖监听器
  let debounceTimer = null;
  const globalObserver = new MutationObserver(() => {
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      onDomChange();
    }, 150);
  });
  globalObserver.observe(document.body, { childList: true, subtree: true });

  // YouTube 专有导航事件
  document.addEventListener('yt-navigate-finish', () => onDomChange());
  document.addEventListener('yt-page-data-updated', () => {
    if (isWatchPage()) {
      onDomChange();
    }
  });

  window.addEventListener('popstate', () => setTimeout(onDomChange, 200));

  // 仅在视口尺寸改变时重新适配，杜绝页面滚动时的重复计算
  window.addEventListener(
    'resize',
    () => {
      if (moved && isWatchPage()) updateSidebarLayout();
    },
    { passive: true }
  );

  // 初始加载
  console.log(`${LOG} 🚀 脚本加载完成 (v3.2)`);
  lastUrl = location.href;
  if (isWatchPage()) {
    onDomChange();
  }
})();
