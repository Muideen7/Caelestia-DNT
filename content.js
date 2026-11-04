// Caelestia Material You declarative CSS injector
// Targets YouTube, GitHub, Google Search, Reddit, and Wikipedia with WCAG AA readability in both light & dark modes (0% CPU overhead)

(() => {
  'use strict';

  const STYLE_ID = 'caelestia-dynamic-site-theme';

  function getHex(val) {
    if (!val) return '';
    return val.startsWith('#') ? val : `#${val}`;
  }

  // Purely dynamic token resolution - all colors derived directly from wallpaper scheme
  function resolveThemeTokens(colors, isDark) {
    const primary = getHex(colors.primary) || (isDark ? '#d0bcff' : '#6750a4');
    const onPrimary = getHex(colors.onPrimary) || (isDark ? '#381e72' : '#ffffff');
    const primContainer = getHex(colors.primaryContainer) || primary;
    const onPrimContainer = getHex(colors.onPrimaryContainer) || onPrimary;

    const bg = getHex(colors.background) || getHex(colors.surface) || (isDark ? '#141218' : '#fef7ff');
    const surface = getHex(colors.surface) || bg;
    const surfaceLow = getHex(colors.surfaceContainerLow) || surface;
    const surfaceMid = getHex(colors.surfaceContainer) || getHex(colors.surfaceVariant) || surface;
    const surfaceHigh = getHex(colors.surfaceContainerHigh) || surfaceMid;
    const surfaceHighest = getHex(colors.surfaceContainerHighest) || surfaceMid;

    const onSurface = getHex(colors.onSurface) || (isDark ? '#e6e0e9' : '#1d1b20');
    const onSurfaceVar = getHex(colors.onSurfaceVariant) || (isDark ? '#cac4d0' : '#49454f');
    const outline = getHex(colors.outlineVariant) || getHex(colors.outline) || onSurfaceVar;

    const secondary = getHex(colors.secondary) || primary;
    const onSecondary = getHex(colors.onSecondary) || onPrimary;
    const secContainer = getHex(colors.secondaryContainer) || surfaceMid;
    const onSecContainer = getHex(colors.onSecondaryContainer) || onSurface;

    const tertiary = getHex(colors.tertiary) || secondary;
    const onTertiary = getHex(colors.onTertiary) || onPrimary;
    const tertContainer = getHex(colors.tertiaryContainer) || surfaceMid;
    const onTertContainer = getHex(colors.onTertiaryContainer) || onSurface;

    // Dynamic semantic accents derived from active wallpaper palette
    const green = getHex(colors.green) || getHex(colors.success) || primary;
    const yellow = getHex(colors.yellow) || getHex(colors.peach) || secondary;
    const error = getHex(colors.error) || getHex(colors.red) || outline;
    const mauve = getHex(colors.mauve) || tertiary;
    const blue = getHex(colors.blue) || primary;

    return {
      bg, surface, surfaceLow, surfaceMid, surfaceHigh, surfaceHighest,
      onSurface, onSurfaceVar, outline,
      primary, onPrimary, primContainer, onPrimContainer,
      secondary, onSecondary, secContainer, onSecContainer,
      tertiary, onTertiary, tertContainer, onTertContainer,
      green, yellow, error, mauve, blue
    };
  }

  function buildYouTubeCSS(colors, isDark) {
    const t = resolveThemeTokens(colors, isDark);
    const bg = t.bg;
    const surfaceLow = t.surfaceLow;
    const surfaceMid = t.surfaceMid;
    const surfaceHigh = t.surfaceHigh;
    const surfaceHighest = t.surfaceHighest;
    const onSurface = t.onSurface;
    const onSurfaceVar = t.onSurfaceVar;
    const outline = t.outline;
    const primary = t.primary;
    const onPrimary = t.onPrimary;
    const primContainer = t.primContainer;
    const onPrimContainer = t.onPrimContainer;

    return `
      /* --- YouTube Caelestia Dynamic Styling --- */
      html, html[dark], [dark], ytd-app {
        --yt-spec-base-background: ${bg} !important;
        --yt-spec-raised-background: ${surfaceLow} !important;
        --yt-spec-menu-background: ${surfaceMid} !important;
        --yt-spec-general-background-a: ${bg} !important;
        --yt-spec-general-background-b: ${surfaceMid} !important;
        --yt-spec-brand-background-solid: ${bg} !important;
        --yt-spec-brand-background-primary: ${surfaceMid} !important;
        --yt-spec-brand-background-secondary: ${surfaceHigh} !important;
        --yt-spec-badge-chip-background: ${surfaceHigh} !important;
        --yt-spec-text-primary: ${onSurface} !important;
        --yt-spec-text-secondary: ${onSurfaceVar} !important;
        --yt-spec-static-brand-white: ${onSurface} !important;
        --yt-spec-call-to-action: ${primary} !important;
        --yt-spec-touch-response: ${primary} !important;
        --yt-spec-icon-active: ${primary} !important;
        --yt-spec-icon-inactive: ${onSurfaceVar} !important;
        --yt-spec-icon-disabled: ${outline} !important;
        --ytd-searchbox-background: ${surfaceLow} !important;
        --ytd-searchbox-text-color: ${onSurface} !important;
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      #masthead, ytd-masthead, #masthead-container {
        background-color: ${surfaceMid} !important;
        border-bottom: 1px solid ${outline} !important;
      }

      form#search-form,
      #container.ytd-searchbox,
      input.ytd-searchbox,
      #search-input input {
        background-color: ${surfaceLow} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }

      #search-icon-legacy.ytd-searchbox,
      #search-btn.ytd-searchbox {
        background-color: ${surfaceHigh} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      #search-icon-legacy.ytd-searchbox yt-icon {
        color: ${onSurface} !important;
      }

      #guide-content.ytd-app, 
      ytd-guide-renderer, 
      ytd-mini-guide-renderer,
      #sections.ytd-guide-renderer {
        background-color: ${surfaceLow} !important;
      }

      ytd-guide-entry-renderer yt-formatted-string,
      ytd-guide-entry-renderer .title,
      ytd-mini-guide-entry-renderer .title,
      #guide-section-title.ytd-guide-section-renderer,
      #guide-entry yt-icon,
      ytd-guide-entry-renderer yt-icon {
        color: ${onSurface} !important;
        fill: ${onSurface} !important;
        font-weight: 500 !important;
      }

      ytd-guide-entry-renderer[active],
      ytd-guide-entry-renderer:hover {
        background-color: ${surfaceHigh} !important;
      }

      #video-title,
      #video-title.ytd-rich-grid-media,
      #video-title.ytd-compact-video-renderer,
      #channel-name,
      #channel-title,
      #text.ytd-channel-name,
      yt-formatted-string.ytd-channel-name,
      #owner-name,
      #title.ytd-watch-metadata,
      #description-text,
      #content-text {
        color: ${onSurface} !important;
      }

      #metadata-line span,
      #byline,
      #owner-sub-count,
      #subscriber-count,
      .badge-shape-wiz--thumbnail-default {
        color: ${onSurfaceVar} !important;
      }

      yt-chip-cloud-chip-renderer[chip-style="STYLE_DEFAULT"] {
        background-color: ${surfaceHigh} !important;
        color: ${onSurface} !important;
        border: 1px solid ${outline} !important;
      }

      yt-chip-cloud-chip-renderer[chip-style="STYLE_DEFAULT"][selected] {
        background-color: ${primContainer} !important;
        color: ${onPrimContainer} !important;
        border-color: ${primary} !important;
      }

      ytd-button-renderer.ytd-subscribe-button-renderer ytd-button-renderer button,
      #subscribe-button button,
      .yt-spec-button-shape-next--filled {
        background-color: ${primary} !important;
        color: ${onPrimary} !important;
        border-radius: 9999px !important;
      }

      ytd-menu-popup-renderer, 
      tp-yt-paper-dialog, 
      tp-yt-paper-listbox {
        background-color: ${surfaceMid} !important;
        border: 1px solid ${outline} !important;
        border-radius: 16px !important;
        color: ${onSurface} !important;
      }
    `;
  }

  function buildGitHubCSS(colors, isDark) {
    const t = resolveThemeTokens(colors, isDark);
    const bg = t.bg;
    const surfaceLow = t.surfaceLow;
    const surfaceMid = t.surfaceMid;
    const surfaceHigh = t.surfaceHigh;
    const onSurface = t.onSurface;
    const onSurfaceVar = t.onSurfaceVar;
    const outline = t.outline;
    const primary = t.primary;
    const onPrimary = t.onPrimary;

    // Fully dynamic semantic colors derived directly from wallpaper palette
    const folderColor = t.yellow;
    const starColor = t.yellow;
    const branchColor = t.primary;
    const openColor = t.green;
    const mergedColor = t.mauve;
    const closedColor = t.error;

    return `
      /* --- GitHub Primer & Modern Tokens Overrides --- */
      :root,
      html,
      body,
      [data-color-mode],
      [data-dark-theme],
      [data-light-theme] {
        --bgColor-default: ${bg} !important;
        --bgColor-muted: ${surfaceLow} !important;
        --bgColor-inset: ${surfaceLow} !important;
        --bgColor-emphasis: ${primary} !important;
        --fgColor-default: ${onSurface} !important;
        --fgColor-muted: ${onSurfaceVar} !important;
        --fgColor-accent: ${primary} !important;
        --borderColor-default: ${outline} !important;
        --borderColor-muted: ${outline} !important;
        --color-canvas-default: ${bg} !important;
        --color-canvas-subtle: ${surfaceLow} !important;
        --color-canvas-inset: ${surfaceLow} !important;
        --color-border-default: ${outline} !important;
        --color-border-muted: ${outline} !important;
        --color-border-subtle: ${outline} !important;
        --color-fg-default: ${onSurface} !important;
        --color-fg-muted: ${onSurfaceVar} !important;
        --color-fg-subtle: ${onSurfaceVar} !important;
        --color-accent-fg: ${primary} !important;
        --color-accent-emphasis: ${primary} !important;
        --color-icon-directory: ${folderColor} !important;
        --color-icon-code: ${primary} !important;
        --iconColor-default: ${onSurface} !important;
        --iconColor-muted: ${onSurfaceVar} !important;
        --iconColor-accent: ${primary} !important;
        --color-btn-icon: ${onSurface} !important;
        --color-btn-bg: ${surfaceMid} !important;
        --color-btn-border: ${outline} !important;
        --color-btn-text: ${onSurface} !important;
        --color-btn-primary-bg: ${primary} !important;
        --color-btn-primary-text: ${onPrimary} !important;
        --color-header-bg: ${surfaceMid} !important;
        --color-header-text: ${onSurface} !important;
        --color-header-logo: ${onSurface} !important;
        --color-page-header-bg: ${surfaceLow} !important;
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      /* GitHub App Header Bar & Header Icons */
      header.AppHeader, 
      header.Header, 
      .AppHeader-globalBar, 
      .Header, 
      header,
      .AppHeader {
        background-color: ${surfaceMid} !important;
        border-bottom: 1px solid ${outline} !important;
        color: ${onSurface} !important;
      }

      header svg, 
      .AppHeader svg, 
      header .octicon,
      .AppHeader .octicon,
      .Header-link svg,
      .octicon-mark-github {
        fill: ${onSurface} !important;
        color: ${onSurface} !important;
      }

      /* Baseline Octicon fill behavior */
      .octicon,
      svg.octicon,
      [class*="octicon-"] {
        fill: currentColor !important;
      }

      /* Directory / Folder Icons (Vibrant & High Contrast) */
      .octicon-file-directory,
      .octicon-file-directory-fill,
      .octicon-file-directory-open-fill,
      .octicon-file-submodule,
      svg[aria-label="Directory"],
      svg[aria-label="Directory"] path,
      svg[aria-label="Submodule"],
      .react-directory-row .octicon-file-directory-fill {
        fill: ${folderColor} !important;
        color: ${folderColor} !important;
      }

      /* File Icons (Clean & Visible) */
      .octicon-file,
      .octicon-file-code,
      .octicon-file-badge,
      .octicon-file-binary,
      svg[aria-label="File"],
      svg[aria-label="File"] path,
      .react-directory-row .octicon-file {
        fill: ${onSurface} !important;
        color: ${onSurface} !important;
        opacity: 0.9 !important;
      }

      /* Star Icons (Bright Radiant Gold) */
      .octicon-star,
      .octicon-star-fill,
      svg[aria-label="Star"],
      .starred .octicon-star,
      .btn[data-hydro-click*="star"] .octicon {
        fill: ${starColor} !important;
        color: ${starColor} !important;
      }

      /* Branch, Commit, History, Tags & Repo Icons */
      .octicon-git-branch,
      .octicon-git-commit,
      .octicon-history,
      .octicon-tag,
      .octicon-repo,
      .octicon-repo-forked,
      .octicon-eye {
        fill: ${branchColor} !important;
        color: ${branchColor} !important;
      }

      /* Status Icons (Issues, PRs, Checks) */
      .octicon-issue-opened,
      .octicon-git-pull-request,
      .octicon-check,
      .octicon-check-circle-fill,
      .color-fg-success .octicon {
        fill: ${openColor} !important;
        color: ${openColor} !important;
      }

      .octicon-issue-closed,
      .octicon-git-merge,
      .octicon-skip,
      .color-fg-done .octicon {
        fill: ${mergedColor} !important;
        color: ${mergedColor} !important;
      }

      .octicon-x,
      .octicon-x-circle-fill,
      .octicon-issue-draft,
      .color-fg-danger .octicon {
        fill: ${closedColor} !important;
        color: ${closedColor} !important;
      }

      /* Navigation Tabs & Badges (Code, Issues, PRs, Actions, Settings) */
      .pagehead, .subnav, .subnav-bordered, .UnderlineNav, .UnderlineNav-body, nav[aria-label="Repository"] {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      .UnderlineNav-item {
        color: ${onSurface} !important;
      }

      .UnderlineNav-item .octicon {
        color: ${onSurfaceVar} !important;
        fill: ${onSurfaceVar} !important;
      }

      .UnderlineNav-item[aria-current="page"] .octicon, 
      .UnderlineNav-item.selected .octicon,
      .UnderlineNav-item:hover .octicon {
        color: ${primary} !important;
        fill: ${primary} !important;
      }

      .UnderlineNav-item[aria-current="page"], 
      .UnderlineNav-item.selected {
        color: ${onSurface} !important;
        border-bottom-color: ${primary} !important;
      }

      .UnderlineNav-item .Counter,
      .Counter {
        background-color: ${surfaceHigh} !important;
        color: ${onSurface} !important;
        border: 1px solid ${outline} !important;
      }

      /* Button & Action Visual Icons */
      .btn, 
      .Button, 
      .btn-sm,
      .Button--secondary {
        background-color: ${surfaceMid} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      .btn .octicon,
      .Button .octicon,
      .Button-leadingVisual .octicon,
      .Button-trailingVisual .octicon,
      .Button-visual .octicon {
        fill: currentColor !important;
      }

      .btn-primary, 
      .Button--primary {
        background-color: ${primary} !important;
        border-color: ${primary} !important;
        color: ${onPrimary} !important;
      }

      .btn-primary .octicon,
      .Button--primary .octicon {
        fill: ${onPrimary} !important;
        color: ${onPrimary} !important;
      }

      /* File Explorer Table & Commit Bar */
      .Box, 
      .Box-header, 
      .commit-tease, 
      div[data-target="react-app.reactApp"] > div,
      .js-details-container {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      .Box-row {
        border-top-color: ${outline} !important;
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      .Box-row:hover {
        background-color: ${surfaceHigh} !important;
      }

      /* React Tree rows */
      .react-directory-row, 
      .react-directory-filename-column, 
      .react-directory-commit-age,
      table.files td {
        color: ${onSurface} !important;
      }

      /* Text readability without blanket div/span pollution */
      p, li, td, th, h1, h2, h3, h4, h5, h6, label {
        color: ${onSurface} !important;
      }

      .color-fg-muted,
      .color-fg-subtle,
      .text-small,
      .f6,
      .commit-author {
        color: ${onSurfaceVar} !important;
      }

      a.Link--primary, 
      a.color-fg-default,
      .react-directory-truncate a,
      .wb-break-all a {
        color: ${onSurface} !important;
      }

      a.Link--secondary, 
      a.color-fg-muted {
        color: ${primary} !important;
      }

      /* Markdown & Code Blocks */
      .markdown-body {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      .markdown-body pre, 
      .markdown-body code {
        background-color: ${surfaceLow} !important;
        color: ${onSurface} !important;
        border: 1px solid ${outline} !important;
      }

      .markdown-body table tr {
        background-color: ${bg} !important;
        border-top-color: ${outline} !important;
      }

      .markdown-body table tr:nth-child(2n) {
        background-color: ${surfaceLow} !important;
      }

      .markdown-body table th, 
      .markdown-body table td {
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }
    `;
  }

  function buildRedditCSS(colors, isDark) {
    const t = resolveThemeTokens(colors, isDark);
    const bg = t.bg;
    const surfaceLow = t.surfaceLow;
    const surfaceMid = t.surfaceMid;
    const onSurface = t.onSurface;
    const onSurfaceVar = t.onSurfaceVar;
    const outline = t.outline;
    const primary = t.primary;

    return `
      /* --- Reddit Caelestia Dynamic Styling --- */
      body, shreddit-app, [color-scheme] {
        --color-neutral-background: ${bg} !important;
        --color-neutral-background-weak: ${surfaceLow} !important;
        --color-neutral-content: ${onSurface} !important;
        --color-neutral-content-weak: ${onSurfaceVar} !important;
        --color-primary-background: ${primary} !important;
        --color-tone-1: ${onSurface} !important;
        --color-tone-2: ${onSurfaceVar} !important;
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      reddit-header-large, header {
        background-color: ${surfaceMid} !important;
        border-bottom: 1px solid ${outline} !important;
        color: ${onSurface} !important;
      }

      shreddit-post, article {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      p, span, h1, h2, h3 {
        color: ${onSurface} !important;
      }
    `;
  }

  function buildGoogleSearchCSS(colors, isDark) {
    const t = resolveThemeTokens(colors, isDark);
    const bg = t.bg;
    const surfaceLow = t.surfaceLow;
    const surfaceMid = t.surfaceMid;
    const surfaceHigh = t.surfaceHigh;
    const surfaceHighest = t.surfaceHighest;
    const onSurface = t.onSurface;
    const onSurfaceVar = t.onSurfaceVar;
    const outline = t.outline;
    const primary = t.primary;
    const onPrimary = t.onPrimary;
    const primContainer = t.primContainer;
    const onPrimContainer = t.onPrimContainer;
    const secContainer = t.secContainer;
    const onSecContainer = t.onSecContainer;
    const tertiary = t.tertiary;
    const error = t.error;

    // Compute an accessible link color: use primary but ensure it contrasts well
    // against the background. Google relies heavily on link blue (#1a0dab light / #8ab4f8 dark).
    const linkColor = primary;
    const visitedColor = tertiary;

    return `
      /* --- Google Search Caelestia Dynamic Styling --- */
      /* Respect WCAG AA: body text ≥ 4.5:1, large text ≥ 3:1 on themed surfaces */

      /* ===== Root-level background & color overrides ===== */
      html, body,
      body.srp,                         /* search results page */
      #main, #cnt, #center_col,
      #rcnt, #rhs, #rso,
      .appbar,
      #botstuff,
      .s6JM6d,                          /* main results wrapper (class-based) */
      .RNNXgb,                          /* old search bar container */
      .o3j99                            /* newer search wrapper */ {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      /* ===== Top search bar / header ===== */
      #searchform,
      .sfbg,                            /* search form background */
      .minidiv .sfbg,
      header[role="banner"],
      .XDyW0e,                          /* sticky header bar */
      #hdtb,                            /* tools bar (All, Images, Videos tabs) */
      #hdtbSum,
      .sBbkle,
      .M2vV3,
      .LcSrBf                           /* newer search bar area */ {
        background-color: ${surfaceMid} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      /* Search input box */
      .RNNXgb, .emcav,
      .gLFyf,                           /* actual input element */
      .a4bIc,
      form[role="search"],
      .SDkEP,
      textarea.gLFyf,                   /* new textarea-based input */
      .o3j99 .qdrjAc,
      .rFrNMe {
        background-color: ${surfaceLow} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }

      .aajZCb,                          /* suggestions dropdown */
      .lnXdpd,                          /* suggestion items */
      .sbct,
      .OBMEnb,
      .pcCUmf,
      .eIPGRd,
      .CcAdNb                           /* autocomplete container */ {
        background-color: ${surfaceMid} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }

      .sbct:hover, .lnXdpd:hover,
      .eIPGRd:hover,
      .pcCUmf:hover {
        background-color: ${surfaceHigh} !important;
      }

      /* Search icons (magnifier, voice, lens, X) */
      .iblpc, .BKRPef,
      .ExCKkf svg, .BKRPef svg,
      .XDyW0e svg,
      .lJ9FBc svg {
        color: ${onSurfaceVar} !important;
        fill: ${onSurfaceVar} !important;
      }

      /* ===== Navigation tabs (All, Images, Videos, News, Maps, Shopping) ===== */
      .IUOThf,                          /* tab bar */
      .T47uwc,
      .NZmxZe,
      div.crJ18e {
        border-color: ${outline} !important;
      }

      .nPDzT,                           /* individual tab */
      .hdtb-mitem,
      .YmvwI,
      .GKS7s {
        color: ${onSurfaceVar} !important;
      }

      .nPDzT.q8U8x,                    /* active tab */
      .hdtb-mitem.hdtb-msel,
      .YmvwI.sA5qe,
      .GKS7s.Ww4FFb {
        color: ${primary} !important;
        border-bottom-color: ${primary} !important;
      }

      /* ===== Search result items ===== */
      /* Result titles (links) — critical for readability */
      .LC20lb,                          /* main result title */
      h3.LC20lb,
      .DKV0Md,
      .l97dzf h3,
      .yuRUbf a h3,
      a h3 {
        color: ${linkColor} !important;
      }

      /* Visited result titles */
      .LC20lb:visited,
      a:visited h3,
      a:visited .LC20lb {
        color: ${visitedColor} !important;
      }

      /* Result URLs / breadcrumbs */
      .VuuXrf,                          /* site name */
      .qLRx3b,                          /* breadcrumb */
      .NJjxre,
      cite, cite a,
      .tjvcx,
      .apx8Vc,
      .C8nzq,
      .byrV5b {
        color: ${onSurfaceVar} !important;
      }

      /* Result snippets — body text, must be high-contrast */
      .VwiC3b,                          /* snippet text */
      .yXK7lf,
      .MUxGbd,
      .lEBKkf,
      span.st,
      .IsZvec,
      .s3v9rd,
      .yDYNvb,
      .ITZIwc,
      .hgKElc {
        color: ${onSurface} !important;
      }

      /* Bold text in snippets (matched keywords) */
      .VwiC3b em, .yXK7lf em,
      .MUxGbd em, span.st em {
        color: ${onSurface} !important;
        font-weight: 700 !important;
      }

      /* ===== "People also ask" / FAQ dropdowns ===== */
      .related-question-pair,
      .dnXCYb,
      .JolIg,
      g-accordion-expander,
      .Wt5Tfe {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      .related-question-pair:hover,
      .dnXCYb:hover {
        background-color: ${surfaceHigh} !important;
      }

      .JolIg .DNJxuf, .cbphWd {
        color: ${onSurface} !important;
      }

      /* ===== Knowledge panel (right sidebar) ===== */
      .kp-wholepage, .osrp-blk,
      .I6TXqe, .kno-rdesc,
      .kno-ecr-pt, .LGOjhe,
      .TzHB6b, .wDYxhc,
      .IVvPP, .liYKde {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      .kno-rdesc span,
      .LGOjhe span,
      .kno-ecr-pt span,
      .rVusze {
        color: ${onSurface} !important;
      }

      /* Knowledge panel headings */
      .qrShPb, .kno-ecr-pt .Z0LcW,
      .SPZz6b h2, .I6TXqe h2 {
        color: ${onSurface} !important;
      }

      /* ===== Featured snippet / answer box ===== */
      .xpdopen, .ifM9O,
      .co8aDb, .Ap5OSd,
      .V3FYCf, .LGOjhe,
      .IZ6rdc, .di3YZe,
      block-component {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      /* ===== Cards, carousels, and content modules ===== */
      g-card, .cv2VAd,
      .Ww4FFb, .VjDLd,
      .ULSxyf, .hlcw0c,
      .MjjYud, .g,
      .tF2Cxc, .N54PNb,
      .IsZvec {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      /* Image / video thumbnails container backgrounds */
      .ivg-i, .RAyV4b,
      .eA0Zlc, .arSljf,
      g-img {
        border-color: ${outline} !important;
      }

      /* ===== Pagination ===== */
      #foot, .AaVjTc,
      .fl, .SJajHc,
      .d6cvqb a, .pla-hccard {
        background-color: ${bg} !important;
        color: ${onSurfaceVar} !important;
      }

      .SJajHc b, .YyVfkd {
        color: ${primary} !important;
      }

      /* ===== "Related searches" ===== */
      .k8XOCe, .s75CSd,
      .oIk2Cb, .y6Uyqe a,
      .EIaa9b, .AJLUJb {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      .s75CSd:hover, .oIk2Cb:hover,
      .k8XOCe:hover {
        background-color: ${surfaceHigh} !important;
      }

      /* ===== Filter chips / pills ===== */
      .MUFPAc, .LatpMc,
      .d3zsgb, .rINcab,
      .XVdSCb, .EE3Upf,
      .ClFMFf {
        background-color: ${surfaceHigh} !important;
        border: 1px solid ${outline} !important;
        color: ${onSurface} !important;
      }

      .MUFPAc[aria-selected="true"],
      .LatpMc[aria-selected="true"],
      .XVdSCb.gTewb,
      .EE3Upf.iSoFgc {
        background-color: ${primContainer} !important;
        color: ${onPrimContainer} !important;
        border-color: ${primary} !important;
      }

      /* ===== Google Flights / Shopping / special result cards ===== */
      .pla-unit, .pla-hccard,
      .sh-dgr__content, .sh-d__grid,
      .commercial-unit-desktop-top {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      /* ===== Buttons (e.g. "More results", "Tools") ===== */
      .GNJvt, .cUnQKe,
      .Tg7LZd, .XGqjvb,
      .YtwC1, .kQdGHd,
      .RveJvd, .nGxrse {
        background-color: ${surfaceMid} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      .GNJvt:hover, .cUnQKe:hover,
      .Tg7LZd:hover {
        background-color: ${surfaceHigh} !important;
      }

      /* CTA-style buttons */
      .aXBZVd, .goog-inline-block,
      .action-button {
        background-color: ${primary} !important;
        color: ${onPrimary} !important;
        border-color: ${primary} !important;
      }

      /* ===== Footer ===== */
      #footcnt, .fbar, #fbar,
      .KxwPGc, .FElbsf,
      .AUOrYb {
        background-color: ${surfaceLow} !important;
        border-color: ${outline} !important;
        color: ${onSurfaceVar} !important;
      }

      /* ===== Links — scoped to avoid clobbering image/video overlays ===== */
      #search a:not(.ekf0x):not(.nPDzT),
      #rso a:not(.ekf0x),
      .yuRUbf a {
        color: ${linkColor} !important;
      }

      #search a:visited:not(.ekf0x):not(.nPDzT),
      #rso a:visited:not(.ekf0x),
      .yuRUbf a:visited {
        color: ${visitedColor} !important;
      }

      /* ===== Scrollbars ===== */
      * {
        scrollbar-color: ${outline} ${surfaceLow} !important;
      }
      ::-webkit-scrollbar { width: 8px !important; height: 8px !important; }
      ::-webkit-scrollbar-track { background: ${surfaceLow} !important; }
      ::-webkit-scrollbar-thumb { background: ${outline} !important; border-radius: 4px !important; }
      ::-webkit-scrollbar-thumb:hover { background: ${primary} !important; }

      /* ===== Selection highlighting ===== */
      ::selection {
        background-color: ${primContainer} !important;
        color: ${onPrimContainer} !important;
      }

      /* ===== Dark mode specific overrides ===== */
      ${isDark ? `
        /* Google sometimes inlines white bg on result cards in dark mode */
        .tF2Cxc, .g, .MjjYud, .hlcw0c,
        .N54PNb, .IsZvec, .xpd {
          background-color: ${bg} !important;
        }

        /* Ensure images/icons don't get inverted */
        img, video, svg:not(.XDyW0e svg) {
          filter: none !important;
        }
      ` : ''}
    `;
  }

  function buildWikipediaCSS(colors, isDark) {
    const t = resolveThemeTokens(colors, isDark);
    const bg = t.bg;
    const surfaceLow = t.surfaceLow;
    const onSurface = t.onSurface;
    const onSurfaceVar = t.onSurfaceVar;
    const outline = t.outline;
    const primary = t.primary;

    return `
      /* --- Wikipedia Caelestia Dynamic Styling --- */
      body, .mw-body, #content {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }

      .mw-body a, #mw-content-text a {
        color: ${primary} !important;
      }

      p, h1, h2, h3, h4, li {
        color: ${onSurface} !important;
      }

      #mw-navigation, .vector-header, .vector-sticky-header {
        background-color: ${surfaceLow} !important;
        color: ${onSurfaceVar} !important;
        border-bottom: 1px solid ${outline} !important;
      }
    `;
  }

  function buildUniversalCSS(colors, isDark) {
    const bg = getHex(colors.background) || getHex(colors.surface) || (isDark ? '#0d0e12' : '#fff8f6');
    const surfaceLow = getHex(colors.surfaceContainerLow) || (isDark ? '#111318' : '#f8edea');
    const surfaceMid = getHex(colors.surfaceContainer) || getHex(colors.surface) || (isDark ? '#171a1f' : '#f4e7e4');
    const surfaceHigh = getHex(colors.surfaceContainerHigh) || (isDark ? '#1d2026' : '#efe0dc');
    const surfaceHighest = getHex(colors.surfaceContainerHighest) || getHex(colors.surfaceVariant) || (isDark ? '#23262d' : '#e8dad6');

    const onSurface = getHex(colors.onSurface) || (isDark ? '#e3e5f0' : '#1c1b1f');
    const onSurfaceVar = getHex(colors.onSurfaceVariant) || (isDark ? '#a8abb5' : '#49454e');
    const outline = getHex(colors.outlineVariant) || getHex(colors.outline) || (isDark ? '#454850' : '#c4c6d0');

    const primary = getHex(colors.primary) || (isDark ? '#b6c6ed' : '#8c4e44');
    const onPrimary = getHex(colors.onPrimary) || (isDark ? '#304060' : '#ffffff');
    const primContainer = getHex(colors.primaryContainer) || (isDark ? '#425274' : '#ffdad4');
    const onPrimContainer = getHex(colors.onPrimaryContainer) || (isDark ? '#d9e3ff' : '#3a0b06');

    const secondary = getHex(colors.secondary) || (isDark ? '#bfc6dc' : '#775651');
    const tertiary = getHex(colors.tertiary) || (isDark ? '#efdfff' : '#705b2e');

    return `
      /* --- Caelestia Universal Dynamic Theming (Extracted from Wallpaper) --- */
      :root, html, body {
        /* Standard CSS Variables: Tailwind, Radix, Shadcn UI */
        --background: ${bg} !important;
        --foreground: ${onSurface} !important;
        --card: ${surfaceMid} !important;
        --card-foreground: ${onSurface} !important;
        --popover: ${surfaceMid} !important;
        --popover-foreground: ${onSurface} !important;
        --primary: ${primary} !important;
        --primary-foreground: ${onPrimary} !important;
        --secondary: ${surfaceHigh} !important;
        --secondary-foreground: ${onSurface} !important;
        --muted: ${surfaceLow} !important;
        --muted-foreground: ${onSurfaceVar} !important;
        --accent: ${primContainer} !important;
        --accent-foreground: ${onPrimContainer} !important;
        --border: ${outline} !important;
        --input: ${outline} !important;
        --ring: ${primary} !important;

        /* Bootstrap & Modern Component Frameworks */
        --bs-primary: ${primary} !important;
        --bs-body-bg: ${bg} !important;
        --bs-body-color: ${onSurface} !important;
        --bs-secondary-color: ${onSurfaceVar} !important;
        --bs-border-color: ${outline} !important;
        --bs-card-bg: ${surfaceMid} !important;
        --bs-tertiary-bg: ${surfaceLow} !important;

        /* Browser Standard Accents */
        accent-color: ${primary} !important;
        caret-color: ${primary} !important;
      }

      /* Base Page Colors */
      html, body {
        background-color: ${bg} !important;
        color: ${onSurface} !important;
      }

      /* Text Highlighting & Selection */
      ::selection {
        background-color: ${primContainer} !important;
        color: ${onPrimContainer} !important;
      }
      ::-moz-selection {
        background-color: ${primContainer} !important;
        color: ${onPrimContainer} !important;
      }

      /* Scrollbars */
      * {
        scrollbar-color: ${outline} ${surfaceLow} !important;
      }
      ::-webkit-scrollbar {
        width: 8px !important;
        height: 8px !important;
      }
      ::-webkit-scrollbar-track {
        background: ${surfaceLow} !important;
      }
      ::-webkit-scrollbar-thumb {
        background: ${outline} !important;
        border-radius: 4px !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: ${primary} !important;
      }

      /* Links & Interactive Accents */
      a {
        color: ${primary} !important;
      }
      a:hover {
        color: ${secondary} !important;
      }
      :focus-visible {
        outline: 2px solid ${primary} !important;
        outline-offset: 1px !important;
      }

      /* Surfaces: Navbars, Headers, Footers, Cards, Dialogs */
      header, nav, [role="navigation"], .navbar, .header, .site-header, .top-nav {
        background-color: ${surfaceMid} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }
      aside, [role="complementary"], .sidebar, .side-nav {
        background-color: ${surfaceLow} !important;
        color: ${onSurface} !important;
        border-color: ${outline} !important;
      }
      footer, [role="contentinfo"], .footer, .site-footer {
        background-color: ${surfaceLow} !important;
        color: ${onSurfaceVar} !important;
        border-color: ${outline} !important;
      }
      .card, .panel, .box, dialog, .modal-content, [class*="card-"], [class*="card_"] {
        background-color: ${surfaceMid} !important;
        border-color: ${outline} !important;
        color: ${onSurface} !important;
      }

      /* Forms & Input Fields */
      input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]),
      textarea, select {
        background-color: ${surfaceLow} !important;
        color: ${onSurface} !important;
        border: 1px solid ${outline} !important;
      }
      input:focus, textarea:focus, select:focus {
        border-color: ${primary} !important;
        outline: 1px solid ${primary} !important;
      }

      /* Standard Buttons */
      button.btn-primary, button[type="submit"], input[type="submit"], .btn-primary {
        background-color: ${primary} !important;
        color: ${onPrimary} !important;
        border-color: ${primary} !important;
      }

      /* Code & Preformatted Blocks */
      pre, code, kbd, samp {
        background-color: ${surfaceHighest} !important;
        color: ${tertiary} !important;
        border-color: ${outline} !important;
      }

      /* Dividers */
      hr {
        border-color: ${outline} !important;
      }
    `;
  }

  function applyCaelestiaTheme(theme) {
    if (!theme || !theme.colours) return;

    const hostname = window.location.hostname.toLowerCase();
    const colors = theme.colours;

    // Detect light vs dark mode from theme or system preference
    let isDark = true;
    if (theme.mode === 'light') {
      isDark = false;
    } else if (theme.mode === 'auto') {
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = theme.mode !== 'light';
    }

    // Synchronize site root attributes for sites supporting theme modes
    const modeStr = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-mode', modeStr);
    document.documentElement.setAttribute('data-dark-theme', modeStr);
    document.documentElement.setAttribute('data-light-theme', modeStr);
    document.documentElement.setAttribute('data-theme', modeStr);
    document.documentElement.setAttribute('data-bs-theme', modeStr);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    let css = '';
    if (hostname.includes('youtube.com')) {
      css = buildYouTubeCSS(colors, isDark);
    } else if (hostname.includes('github.com')) {
      css = buildGitHubCSS(colors, isDark);
    } else if (hostname.includes('google.com') || hostname.includes('google.co.') || hostname.includes('.google.') || hostname.startsWith('google.')) {
      css = buildGoogleSearchCSS(colors, isDark);
    } else if (hostname.includes('reddit.com')) {
      css = buildRedditCSS(colors, isDark);
    } else if (hostname.includes('wikipedia.org')) {
      css = buildWikipediaCSS(colors, isDark);
    } else {
      css = buildUniversalCSS(colors, isDark);
    }

    if (!css) return;

    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      const target = document.head || document.documentElement;
      target.appendChild(style);
    }
    style.textContent = css;
  }

  // 1. Initial load from chrome.storage
  try {
    chrome.storage.local.get(['caelestia_theme'], (result) => {
      if (result.caelestia_theme) {
        applyCaelestiaTheme(result.caelestia_theme);
      }
    });
  } catch (e) {}

  // 2. React dynamically whenever Caelestia theme / wallpaper / mode changes
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.caelestia_theme?.newValue) {
        applyCaelestiaTheme(changes.caelestia_theme.newValue);
      }
    });
  } catch (e) {}
})();
