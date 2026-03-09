import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// ─── Inject Font Awesome + Styles ────────────────────────────────────────────
const FA_LINK = document.createElement('link');
FA_LINK.rel = 'stylesheet';
FA_LINK.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
document.head.appendChild(FA_LINK);

const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --ink: #0f0e17;
    --ink-60: #0f0e1799;
    --surface: #faf9f7;
    --card: #ffffff;
    --accent: #e8390e;
    --accent-dim: #e8390e18;
    --accent-soft: #fff3f0;
    --green: #0d9f6e;
    --green-dim: #0d9f6e15;
    --amber: #d97706;
    --blue: #3b82f6;
    --border: #e8e6e0;
    --shadow-xs: 0 1px 3px rgba(0,0,0,0.06);
    --shadow-sm: 0 4px 12px rgba(0,0,0,0.08);
    --shadow-md: 0 8px 32px rgba(0,0,0,0.12);
    --shadow-lg: 0 20px 60px rgba(0,0,0,0.16);
    --radius: 12px;
    --radius-lg: 20px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sora', sans-serif; background: var(--surface); color: var(--ink); }
  .cl-page { min-height: 100vh; background: var(--surface); }

  .cl-header {
    background: var(--card); border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 40; backdrop-filter: blur(12px);
  }
  .cl-header-inner {
    max-width: 1100px; margin: 0 auto; padding: 18px 24px;
    display: flex; align-items: center; gap: 20px;
  }
  .cl-back-btn {
    width: 40px; height: 40px; border-radius: 10px;
    border: 1.5px solid var(--border); background: transparent;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: var(--ink-60); transition: all .2s; font-size: 15px;
  }
  .cl-back-btn:hover { background: var(--surface); color: var(--ink); }
  .cl-header-title { font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: -.3px; }
  .cl-header-sub { font-size: 12px; color: var(--ink-60); margin-top: 2px; display: flex; align-items: center; gap: 6px; }

  .cl-steps { display: flex; align-items: center; margin-left: auto; }
  .cl-step {
    display: flex; align-items: center; gap: 7px; padding: 6px 14px;
    border-radius: 100px; font-size: 12px; font-weight: 600;
    color: var(--ink-60); transition: all .25s; cursor: default; white-space: nowrap;
  }
  .cl-step.active { background: var(--accent-dim); color: var(--accent); }
  .cl-step.done { color: var(--green); }
  .cl-step-num {
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--border); font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; transition: all .25s;
  }
  .cl-step.active .cl-step-num { background: var(--accent); color: white; }
  .cl-step.done .cl-step-num { background: var(--green); color: white; }
  .cl-step-connector { width: 24px; height: 2px; background: var(--border); }
  .cl-step-connector.done { background: var(--green); }

  .cl-progress-bar { height: 3px; background: var(--border); }
  .cl-progress-fill {
    height: 100%; background: linear-gradient(90deg, var(--accent), #ff6b35);
    transition: width .4s cubic-bezier(.4,0,.2,1);
  }

  .cl-layout {
    max-width: 1100px; margin: 0 auto; padding: 32px 24px;
    display: grid; grid-template-columns: 1fr 320px; gap: 28px; align-items: start;
  }
  @media (max-width: 900px) {
    .cl-layout { grid-template-columns: 1fr; }
    .cl-sidebar { order: -1; }
    .cl-steps { display: none; }
  }

  .cl-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .cl-card-header {
    padding: 24px 28px 20px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 14px;
  }
  .cl-card-icon {
    width: 42px; height: 42px; border-radius: 12px;
    background: var(--accent-soft); color: var(--accent);
    display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0;
  }
  .cl-card-title { font-size: 17px; font-weight: 700; letter-spacing: -.2px; }
  .cl-card-sub { font-size: 12px; color: var(--ink-60); margin-top: 2px; }
  .cl-card-body { padding: 24px 28px; }

  .cl-field { margin-bottom: 22px; }
  .cl-label {
    display: flex; align-items: center; gap: 7px;
    font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 8px;
  }
  .cl-label i { font-size: 12px; color: var(--ink-60); }
  .cl-label-req { color: var(--accent); }
  .cl-hint { font-size: 11px; color: var(--ink-60); margin-top: 5px; line-height: 1.5; display: flex; align-items: flex-start; gap: 5px; }
  .cl-hint i { margin-top: 1px; flex-shrink: 0; font-size: 10px; }
  .cl-input, .cl-textarea, .cl-select {
    width: 100%; padding: 12px 14px;
    border: 1.5px solid var(--border); border-radius: var(--radius);
    font-family: 'Sora', sans-serif; font-size: 14px; color: var(--ink);
    background: var(--card); transition: all .2s; outline: none; appearance: none;
  }
  .cl-input:focus, .cl-textarea:focus, .cl-select:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim);
  }
  .cl-input.error, .cl-textarea.error { border-color: #ef4444; }
  .cl-error { font-size: 12px; color: #ef4444; margin-top: 5px; display: flex; align-items: center; gap: 5px; }
  .cl-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
  .cl-select-wrap { position: relative; }
  .cl-select-wrap::after {
    content: ''; position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    width: 0; height: 0; pointer-events: none;
    border-left: 4px solid transparent; border-right: 4px solid transparent;
    border-top: 5px solid var(--ink-60);
  }

  .cl-input-group { position: relative; }
  .cl-input-prefix {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    font-size: 13px; font-weight: 700; color: var(--ink-60);
    font-family: 'JetBrains Mono', monospace; pointer-events: none;
  }
  .cl-input-icon-left {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--ink-60); font-size: 13px; pointer-events: none;
  }
  .cl-input-group .cl-input.has-prefix { padding-left: 36px; }
  .cl-input-group .cl-input.has-icon { padding-left: 38px; }
  .cl-char-count {
    position: absolute; right: 12px; bottom: 10px;
    font-size: 11px; color: var(--ink-60); font-family: 'JetBrains Mono', monospace;
  }

  .cl-banner {
    background: linear-gradient(135deg, #fff8f0, #fff3eb);
    border: 1px solid #fde8d0; border-radius: var(--radius);
    padding: 14px 16px; margin-bottom: 22px;
    display: flex; gap: 12px; align-items: flex-start;
  }
  .cl-banner-icon { color: var(--amber); font-size: 14px; flex-shrink: 0; margin-top: 2px; }
  .cl-banner-text { font-size: 12.5px; color: #92400e; line-height: 1.6; }
  .cl-banner-text strong { color: #78350f; }

  .cl-tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .cl-tag {
    padding: 7px 14px; border-radius: 100px;
    border: 1.5px solid var(--border); background: var(--card);
    font-size: 12.5px; font-weight: 500; color: var(--ink-60);
    cursor: pointer; transition: all .2s; user-select: none;
    display: flex; align-items: center; gap: 6px;
  }
  .cl-tag:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .cl-tag.selected { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .cl-tag i { font-size: 11px; }

  .cl-check-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)); gap: 8px; }
  .cl-check-card {
    border: 1.5px solid var(--border); border-radius: var(--radius);
    padding: 10px 12px; cursor: pointer; transition: all .2s;
    display: flex; align-items: center; gap: 9px;
    user-select: none; background: var(--card);
  }
  .cl-check-card:hover { border-color: var(--accent); background: var(--accent-soft); }
  .cl-check-card.checked { border-color: var(--accent); background: var(--accent-soft); }
  .cl-check-card input { display: none; }
  .cl-check-box {
    width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0;
    border: 2px solid var(--border); background: white;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s; color: white; font-size: 9px;
  }
  .cl-check-card.checked .cl-check-box { background: var(--accent); border-color: var(--accent); }
  .cl-check-fa { font-size: 13px; color: var(--ink-60); width: 16px; text-align: center; flex-shrink: 0; }
  .cl-check-card.checked .cl-check-fa { color: var(--accent); }
  .cl-check-label { font-size: 12px; font-weight: 500; color: var(--ink); }
  .cl-check-card.checked .cl-check-label { color: var(--accent); }

  .cl-toggle-group { display: flex; background: var(--surface); border-radius: var(--radius); padding: 4px; gap: 2px; }
  .cl-toggle-btn {
    flex: 1; padding: 9px 10px; border-radius: 9px;
    border: none; background: transparent; cursor: pointer;
    font-family: 'Sora', sans-serif; font-size: 12.5px; font-weight: 500;
    color: var(--ink-60); transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .cl-toggle-btn i { font-size: 11px; }
  .cl-toggle-btn.active { background: var(--card); color: var(--ink); box-shadow: var(--shadow-xs); font-weight: 600; }

  .cl-meal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .cl-meal-card {
    border: 1.5px solid var(--border); border-radius: var(--radius);
    padding: 16px 12px; text-align: center; cursor: pointer;
    transition: all .2s; background: var(--card);
  }
  .cl-meal-card:hover { border-color: var(--accent); }
  .cl-meal-card.on { border-color: var(--green); background: var(--green-dim); }
  .cl-meal-icon { font-size: 20px; color: var(--ink-60); margin-bottom: 8px; }
  .cl-meal-card.on .cl-meal-icon { color: var(--green); }
  .cl-meal-name { font-size: 12px; font-weight: 700; color: var(--ink-60); }
  .cl-meal-card.on .cl-meal-name { color: var(--green); }
  .cl-meal-time { font-size: 11px; color: var(--ink-60); margin-top: 3px; }

  .cl-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 22px; }
  .cl-stat-box { background: var(--surface); border-radius: var(--radius); padding: 14px 10px; text-align: center; border: 1px solid var(--border); }
  .cl-stat-icon { font-size: 16px; margin-bottom: 6px; }
  .cl-stat-val { font-size: 22px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
  .cl-stat-lbl { font-size: 11px; color: var(--ink-60); margin-top: 2px; }

  .cl-room-list { display: flex; flex-direction: column; gap: 12px; }
  .cl-room-card {
    border: 1.5px solid var(--border); border-radius: var(--radius-lg);
    background: var(--card); overflow: hidden; transition: all .2s;
  }
  .cl-room-card:hover { border-color: #d0ccc6; box-shadow: var(--shadow-xs); }
  .cl-room-head {
    padding: 14px 18px; display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid var(--border);
  }
  .cl-room-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: var(--accent-soft); color: var(--accent);
    display: flex; align-items: center; justify-content: center; font-size: 15px;
  }
  .cl-room-name { font-size: 14px; font-weight: 700; }
  .cl-room-meta { font-size: 11px; color: var(--ink-60); margin-top: 2px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .cl-room-meta span { display: flex; align-items: center; gap: 4px; }
  .cl-room-actions { margin-left: auto; display: flex; gap: 6px; }
  .cl-icon-btn {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1.5px solid var(--border); background: transparent;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: var(--ink-60); transition: all .2s;
  }
  .cl-icon-btn.edit:hover { border-color: var(--blue); background: #eff6ff; color: var(--blue); }
  .cl-icon-btn.del:hover { border-color: #ef4444; background: #fef2f2; color: #ef4444; }
  .cl-room-body { padding: 14px 18px; }
  .cl-bed-list { display: flex; flex-direction: column; gap: 8px; }
  .cl-bed-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    border-radius: 10px; background: var(--surface); border: 1px solid var(--border);
  }
  .cl-bed-name { font-size: 13px; font-weight: 600; flex: 1; }
  .cl-bed-price { font-size: 12px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
  .cl-bed-status { font-size: 10px; padding: 2px 8px; border-radius: 100px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
  .cl-bed-status.avail { background: var(--green-dim); color: var(--green); }
  .cl-bed-status.occ { background: #fee2e2; color: #dc2626; }
  .cl-add-bed-btn {
    width: 100%; margin-top: 10px; padding: 9px;
    border: 1.5px dashed var(--border); border-radius: 10px;
    background: transparent; cursor: pointer; font-family: 'Sora', sans-serif;
    font-size: 12.5px; font-weight: 500; color: var(--ink-60);
    transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .cl-add-bed-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

  .cl-add-room-btn {
    width: 100%; padding: 14px; border: 2px dashed var(--border); border-radius: var(--radius-lg);
    background: transparent; cursor: pointer; font-family: 'Sora', sans-serif;
    font-size: 13.5px; font-weight: 600; color: var(--ink-60);
    transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 9px;
  }
  .cl-add-room-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

  .cl-photo-drop {
    border: 2px dashed var(--border); border-radius: var(--radius-lg);
    padding: 32px; text-align: center; cursor: pointer;
    transition: all .2s; background: var(--surface); display: block;
  }
  .cl-photo-drop:hover { border-color: var(--accent); background: var(--accent-soft); }
  .cl-photo-drop-icon { font-size: 30px; color: var(--ink-60); margin-bottom: 10px; }
  .cl-photo-drop-text { font-size: 14px; font-weight: 600; color: var(--ink); }
  .cl-photo-drop-sub { font-size: 12px; color: var(--ink-60); margin-top: 4px; }
  .cl-photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
  .cl-photo-item { position: relative; border-radius: var(--radius); overflow: hidden; aspect-ratio: 1; }
  .cl-photo-item img { width: 100%; height: 100%; object-fit: cover; }
  .cl-photo-rm {
    position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 50%;
    background: rgba(0,0,0,0.65); color: white; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 11px;
    opacity: 0; transition: opacity .2s;
  }
  .cl-photo-item:hover .cl-photo-rm { opacity: 1; }
  .cl-photo-primary {
    position: absolute; bottom: 6px; left: 6px; font-size: 10px; font-weight: 600;
    background: rgba(0,0,0,0.65); color: white; padding: 2px 7px; border-radius: 4px;
    display: flex; align-items: center; gap: 4px;
  }

  .cl-sidebar { position: sticky; top: 90px; }
  .cl-summary-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm);
  }
  .cl-summary-header { padding: 18px 20px; background: var(--ink); color: white; }
  .cl-summary-title { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
  .cl-summary-sub { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 3px; }
  .cl-summary-body { padding: 16px 20px; }
  .cl-summary-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .cl-summary-row:last-child { border-bottom: none; }
  .cl-summary-key { font-size: 12px; color: var(--ink-60); display: flex; align-items: center; gap: 8px; }
  .cl-summary-key i { width: 14px; text-align: center; font-size: 11px; }
  .cl-summary-val { font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }

  .cl-tip-box { margin-top: 14px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 18px; }
  .cl-tip-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--amber); margin-bottom: 10px; display: flex; align-items: center; gap: 7px; }
  .cl-tip-item { font-size: 12px; color: var(--ink-60); padding: 5px 0; display: flex; gap: 9px; line-height: 1.5; align-items: flex-start; }
  .cl-tip-item i { color: var(--accent); font-size: 10px; margin-top: 3px; flex-shrink: 0; }

  .cl-nav {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 28px; border-top: 1px solid var(--border); background: var(--card);
  }
  .cl-btn {
    padding: 12px 22px; border-radius: var(--radius); border: none;
    font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 8px;
  }
  .cl-btn i { font-size: 13px; }
  .cl-btn-ghost { background: transparent; color: var(--ink-60); border: 1.5px solid var(--border); }
  .cl-btn-ghost:hover { background: var(--surface); color: var(--ink); }
  .cl-btn-primary { background: var(--accent); color: white; }
  .cl-btn-primary:hover { background: #c42c07; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(232,57,14,.3); }
  .cl-btn-success { background: var(--green); color: white; }
  .cl-btn-success:hover { background: #0a8560; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(13,159,110,.3); }
  .cl-btn:disabled { opacity: .5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  .cl-overlay {
    position: fixed; inset: 0; background: rgba(15,14,23,0.6); z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 20px; backdrop-filter: blur(4px); animation: overlayIn .2s ease;
  }
  @keyframes overlayIn { from { opacity: 0 } to { opacity: 1 } }
  .cl-modal {
    background: var(--card); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
    width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
    animation: modalIn .25s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes modalIn { from { opacity: 0; transform: scale(.92) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
  .cl-modal-head {
    padding: 22px 24px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; background: var(--card); z-index: 1;
  }
  .cl-modal-title { font-size: 17px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
  .cl-modal-title i { font-size: 15px; color: var(--accent); }
  .cl-modal-close {
    width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid var(--border);
    background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: var(--ink-60); transition: all .2s;
  }
  .cl-modal-close:hover { background: var(--surface); color: var(--ink); }
  .cl-modal-body { padding: 22px 24px; }
  .cl-modal-foot { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }

  .cl-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 200;
    background: var(--ink); color: white; padding: 14px 18px; border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 10px;
    font-size: 13.5px; font-weight: 500; max-width: 360px;
    animation: toastIn .3s cubic-bezier(.34,1.56,.64,1); border-left: 4px solid var(--accent);
  }
  .cl-toast.success { border-left-color: var(--green); }
  .cl-toast.error { border-left-color: #ef4444; }
  @keyframes toastIn { from { opacity: 0; transform: translateY(16px) scale(.95) } to { opacity: 1; transform: translateY(0) scale(1) } }
  .cl-toast i { font-size: 15px; flex-shrink: 0; }

  .cl-price-preview {
    background: linear-gradient(135deg, var(--ink) 0%, #1a1830 100%);
    border-radius: var(--radius-lg); padding: 20px 22px; margin-top: 8px; color: white;
    display: flex; align-items: center; gap: 16px;
  }
  .cl-price-badge { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .cl-price-main { font-size: 30px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
  .cl-price-unit { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px; display: flex; align-items: center; gap: 5px; }

  .cl-divider { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
  .cl-section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: var(--ink-60); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .cl-section-title i { color: var(--accent); }
  .cl-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .cl-required-note { font-size: 11px; color: var(--ink-60); margin-bottom: 20px; display: flex; align-items: center; gap: 5px; }
  .cl-empty-state { text-align: center; padding: 32px; color: var(--ink-60); }
  .cl-empty-state i { font-size: 32px; margin-bottom: 10px; display: block; color: var(--border); }
  .cl-empty-state p { font-size: 13px; line-height: 1.6; }

  .cl-phone-wrap { display: flex; }
  .cl-phone-code {
    padding: 12px 14px; border: 1.5px solid var(--border); border-right: none;
    border-radius: var(--radius) 0 0 var(--radius); background: var(--surface);
    font-size: 13px; font-weight: 600; color: var(--ink-60); white-space: nowrap;
    display: flex; align-items: center; gap: 6px;
  }
  .cl-phone-wrap .cl-input { border-radius: 0 var(--radius) var(--radius) 0; }

  .cl-stepper { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .cl-step-preset {
    padding: 5px 12px; border-radius: 100px; border: 1.5px solid var(--border);
    background: transparent; cursor: pointer; font-size: 12px; font-weight: 600;
    font-family: 'JetBrains Mono', monospace; color: var(--ink-60); transition: all .2s;
  }
  .cl-step-preset:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

  .cl-confirm-icon { font-size: 36px; text-align: center; margin-bottom: 14px; color: var(--accent); }
  .cl-confirm-title { font-size: 19px; font-weight: 700; text-align: center; margin-bottom: 8px; }
  .cl-confirm-msg { font-size: 13.5px; color: var(--ink-60); text-align: center; line-height: 1.6; }
  .cl-confirm-list { background: var(--surface); border-radius: var(--radius); padding: 14px 16px; margin-top: 18px; }
  .cl-confirm-item { font-size: 13px; color: var(--ink-60); padding: 5px 0; display: flex; align-items: center; gap: 10px; }
  .cl-confirm-item .check-icon { color: var(--green); font-size: 12px; flex-shrink: 0; }
  .cl-confirm-item .meta-icon { color: var(--ink-60); font-size: 12px; flex-shrink: 0; }
`;
document.head.appendChild(style);

// ─── Constants ───────────────────────────────────────────────────────────────
const uid = () => `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const AMENITIES = [
  { key: 'WiFi', fa: 'fa-wifi' },
  { key: 'AC', fa: 'fa-snowflake' },
  { key: 'Generator', fa: 'fa-bolt' },
  { key: 'CCTV', fa: 'fa-video' },
  { key: 'Security Guard', fa: 'fa-shield-halved' },
  { key: 'Parking', fa: 'fa-square-parking' },
  { key: 'Lift / Elevator', fa: 'fa-elevator' },
  { key: 'Laundry', fa: 'fa-shirt' },
  { key: 'Water Heater', fa: 'fa-temperature-high' },
  { key: 'Study Table', fa: 'fa-book-open' },
  { key: 'Almirah', fa: 'fa-box-archive' },
  { key: 'Kitchen', fa: 'fa-utensils' },
  { key: 'Prayer Room', fa: 'fa-mosque' },
  { key: 'Rooftop Access', fa: 'fa-building' },
];

const UTILITIES = [
  { key: 'Electricity', fa: 'fa-lightbulb' },
  { key: 'Gas', fa: 'fa-fire-flame-curved' },
  { key: 'Water', fa: 'fa-droplet' },
  { key: 'Internet', fa: 'fa-globe' },
  { key: 'Cable TV', fa: 'fa-tv' },
];

const BD_AREAS = [
  'Dhanmondi','Mirpur','Mohammadpur','Uttara','Banani','Gulshan',
  'Farmgate','Motijheel','Tejgaon','Badda','Rampura','Bashundhara',
  'Wari','Lalbagh','Azimpur','Shahbag','Eskaton','Malibagh',
];

const PRICE_PRESETS = [3000,4000,5000,6000,7000,8000,10000,12000,15000];

const STEPS = [
  { num: 1, label: 'Basic Info',  fa: 'fa-clipboard-list' },
  { num: 2, label: 'Pricing',    fa: 'fa-bangladeshi-taka-sign' },
  { num: 3, label: 'Rooms',      fa: 'fa-door-open' },
  { num: 4, label: 'Photos',     fa: 'fa-camera' },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

const InfoBanner = ({ children }) => (
  <div className="cl-banner">
    <i className="cl-banner-icon fas fa-lightbulb" />
    <p className="cl-banner-text">{children}</p>
  </div>
);

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  const icon = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' }[type] || 'fa-circle-check';
  return (
    <div className={`cl-toast ${type}`}>
      <i className={`fas ${icon}`} />
      <span>{message}</span>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, titleIcon, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="cl-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cl-modal">
        <div className="cl-modal-head">
          <h3 className="cl-modal-title">
            {titleIcon && <i className={`fas ${titleIcon}`} />}
            {title}
          </h3>
          <button className="cl-modal-close" onClick={onClose}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <div className="cl-modal-body">{children}</div>
        {footer && <div className="cl-modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

const CheckCard = ({ label, faIcon, checked, onChange }) => (
  <label className={`cl-check-card ${checked ? 'checked' : ''}`}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <div className="cl-check-box">{checked && <i className="fas fa-check" />}</div>
    <i className={`fas ${faIcon} cl-check-fa`} />
    <span className="cl-check-label">{label}</span>
  </label>
);

const Field = ({ label, labelIcon, required, hint, hintIcon, error, children }) => (
  <div className="cl-field">
    <label className="cl-label">
      {labelIcon && <i className={`fas ${labelIcon}`} />}
      {label}
      {required && <span className="cl-label-req"> *</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="cl-hint">
        <i className={`fas ${hintIcon || 'fa-circle-info'}`} />
        {hint}
      </p>
    )}
    {error && (
      <p className="cl-error">
        <i className="fas fa-triangle-exclamation" />
        {error}
      </p>
    )}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const CreateListingPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const isEditing = !!id;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingBed, setEditingBed] = useState(null);
  const [activeBedRoom, setActiveBedRoom] = useState(null);

  const [form, setForm] = useState({
    title:'', description:'', location:'', area:'',
    landmarks:'', contact:'', rules:'',
    furnished:'semi-furnished', propertyType:'mess',
    gender:'any', religion:'any',
    price:'', rooms:[],
    utilities:[], amenities:{},
    meals:{ breakfast:false, lunch:false, dinner:false },
    mealPrice:'', photos:[],
    advanceMonths:'2', negotiable:false,
  });

  const [roomForm, setRoomForm] = useState({ name:'', type:'single', floor:'', attached:false });
  const [bedForm, setBedForm] = useState({ name:'', price:'', available:true, images:[] });

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const stats = useMemo(() => {
    const beds = form.rooms.reduce((s,r) => s + r.beds.length, 0);
    const avail = form.rooms.reduce((s,r) => s + r.beds.filter(b => b.available).length, 0);
    return { rooms: form.rooms.length, beds, available: avail, occupied: beds - avail };
  }, [form.rooms]);

  const validate = useCallback(s => {
    const e = {};
    if (s === 1) {
      if (!form.title.trim()) e.title = 'Title is required';
      else if (form.title.length < 5) e.title = 'Minimum 5 characters';
      if (!form.description.trim()) e.description = 'Description is required';
      else if (form.description.length < 20) e.description = 'Minimum 20 characters';
      if (!form.location.trim()) e.location = 'Location is required';
      if (!form.contact.trim()) e.contact = 'Contact number is required';
      else if (!/^\+?[0-9]{10,15}$/.test(form.contact)) e.contact = 'Enter valid BD number (01XXXXXXXXX)';
    }
    if (s === 2) { const p = parseFloat(form.price); if (!form.price || isNaN(p) || p <= 0) e.price = 'Enter a valid price'; }
    if (s === 3 && form.rooms.length === 0) e.rooms = 'Add at least one room';
    if (s === 4 && form.photos.length === 0) e.photos = 'Add at least one photo';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const goNext = () => { if (validate(step)) setStep(s => Math.min(s + 1, 4)); };
  const goPrev = () => setStep(s => Math.max(s - 1, 1));
  const showToast = (msg, type='success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 5000); };

  // Room CRUD
  const openAddRoom = () => { setRoomForm({ name:'', type:'single', floor:'', attached:false }); setEditingRoom(null); setShowRoomModal(true); };
  const openEditRoom = r => { setRoomForm({...r}); setEditingRoom(r); setShowRoomModal(true); };
  const saveRoom = () => {
    if (!roomForm.name.trim()) { showToast('Room name is required', 'error'); return; }
    const rid = editingRoom ? editingRoom.id : uid();
    const room = { ...roomForm, id: rid, beds: editingRoom ? editingRoom.beds : [] };
    setForm(p => ({ ...p, rooms: editingRoom ? p.rooms.map(r => r.id === editingRoom.id ? room : r) : [...p.rooms, room] }));
    setShowRoomModal(false);
    showToast(editingRoom ? 'Room updated!' : 'Room added!');
  };
  const deleteRoom = rid => { setForm(p => ({ ...p, rooms: p.rooms.filter(r => r.id !== rid) })); showToast('Room removed'); };

  // Bed CRUD
  const openAddBed = rid => { setBedForm({ name:'', price:'', available:true, images:[] }); setEditingBed(null); setActiveBedRoom(rid); setShowBedModal(true); };
  const openEditBed = (bed, rid) => { setBedForm({...bed}); setEditingBed(bed); setActiveBedRoom(rid); setShowBedModal(true); };
  const saveBed = () => {
    if (!bedForm.name.trim()) { showToast('Bed name is required', 'error'); return; }
    const p2 = parseFloat(bedForm.price);
    if (!bedForm.price || isNaN(p2) || p2 <= 0) { showToast('Enter valid price', 'error'); return; }
    const nb = { ...bedForm, id: editingBed ? editingBed.id : uid(), price: p2.toString() };
    setForm(p => ({ ...p, rooms: p.rooms.map(r => r.id === activeBedRoom ? { ...r, beds: editingBed ? r.beds.map(b => b.id === editingBed.id ? nb : b) : [...r.beds, nb] } : r) }));
    setShowBedModal(false);
    showToast(editingBed ? 'Bed updated!' : 'Bed added!');
  };
  const deleteBed = (rid, bid) => { setForm(p => ({ ...p, rooms: p.rooms.map(r => r.id === rid ? { ...r, beds: r.beds.filter(b => b.id !== bid) } : r) })); showToast('Bed removed'); };

  const handlePhotos = e => {
    const files = Array.from(e.target.files);
    setForm(p => ({ ...p, photos: [...p.photos, ...files.map(f => ({ id: uid(), url: URL.createObjectURL(f), file: f }))] }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      showToast(isEditing ? 'Listing updated successfully!' : 'Listing published successfully!');
      setTimeout(() => navigate.push?.('/dashboard/owner'), 2000);
    } catch { showToast('Something went wrong. Please try again.', 'error'); }
    finally { setIsSubmitting(false); setShowConfirm(false); }
  };

  const progressWidth = `${((step-1)/3)*100}%`;
  const mealCount = Object.values(form.meals).filter(Boolean).length;

  return (
    <div className="cl-page">

      {/* Header */}
      <div className="cl-header">
        <div className="cl-header-inner">
          <button className="cl-back-btn" onClick={() => navigate.push?.('/dashboard/owner')}>
            <i className="fas fa-arrow-left" />
          </button>
          <div>
            <div className="cl-header-title">{isEditing ? 'Edit Listing' : 'Create New Listing'}</div>
            <div className="cl-header-sub">
              <i className={`fas ${STEPS[step-1].fa}`} />
              {STEPS[step-1].label} — Step {step} of 4
            </div>
          </div>
          <div className="cl-steps">
            {STEPS.map((s,i) => (
              <React.Fragment key={s.num}>
                <div className={`cl-step ${step===s.num?'active':step>s.num?'done':''}`}>
                  <span className="cl-step-num">
                    {step > s.num ? <i className="fas fa-check" style={{fontSize:10}}/> : s.num}
                  </span>
                  <i className={`fas ${s.fa}`} style={{fontSize:11}}/>
                  {s.label}
                </div>
                {i < STEPS.length-1 && <div className={`cl-step-connector ${step>s.num?'done':''}`}/>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="cl-progress-bar">
          <div className="cl-progress-fill" style={{width: progressWidth}}/>
        </div>
      </div>

      <div className="cl-layout">
        <div>
          <div className="cl-card">

            {/* ── Step 1 ── */}
            {step === 1 && (<>
              <div className="cl-card-header">
                <div className="cl-card-icon"><i className="fas fa-clipboard-list"/></div>
                <div>
                  <div className="cl-card-title">Basic Information</div>
                  <div className="cl-card-sub">Tell students about your property</div>
                </div>
              </div>
              <div className="cl-card-body">
                <InfoBanner>
                  <strong>BD Pro Tip:</strong> Listings with area name, gender preference, and nearby university get <strong>3× more views</strong> from students.
                </InfoBanner>
                <p className="cl-required-note">
                  <i className="fas fa-asterisk" style={{color:'var(--accent)',fontSize:9}}/>
                  Fields marked with * are required
                </p>

                <Field label="Listing Title" labelIcon="fa-heading" required error={errors.title}
                  hint="Include area, room type & top feature — e.g. 'Dhanmondi Men's Mess near BUET with AC & WiFi'">
                  <div className="cl-input-group">
                    <input className={`cl-input ${errors.title?'error':''}`}
                      value={form.title} onChange={e => setField('title', e.target.value)}
                      placeholder="e.g., Mirpur-10 Students Mess — AC, WiFi, 3 Meals/day" maxLength={100}/>
                    <span className="cl-char-count">{form.title.length}/100</span>
                  </div>
                </Field>

                <div className="cl-grid-2">
                  <Field label="Property Type" labelIcon="fa-building">
                    <div className="cl-select-wrap">
                      <select className="cl-select" value={form.propertyType} onChange={e => setField('propertyType', e.target.value)}>
                        <option value="mess">Mess (মেস)</option>
                        <option value="hostel">Hostel</option>
                        <option value="sublet">Sublet</option>
                        <option value="pg">PG / Paying Guest</option>
                        <option value="flat">Shared Flat</option>
                      </select>
                    </div>
                  </Field>
                  <Field label="Gender Preference" labelIcon="fa-person-half-dress">
                    <div className="cl-select-wrap">
                      <select className="cl-select" value={form.gender} onChange={e => setField('gender', e.target.value)}>
                        <option value="any">Any / Mixed</option>
                        <option value="male">Male Only (ছেলেদের)</option>
                        <option value="female">Female Only (মেয়েদের)</option>
                      </select>
                    </div>
                  </Field>
                </div>

                <Field label="Full Address" labelIcon="fa-location-dot" required error={errors.location}
                  hint="Full address helps students find you on Google Maps" hintIcon="fa-map">
                  <div className="cl-input-group">
                    <i className="fas fa-map-pin cl-input-icon-left"/>
                    <input className={`cl-input has-icon ${errors.location?'error':''}`}
                      value={form.location} onChange={e => setField('location', e.target.value)}
                      placeholder="e.g., House 14, Road 5, Dhanmondi, Dhaka-1209"/>
                  </div>
                </Field>

                <Field label="Area / Thana" labelIcon="fa-map-location-dot"
                  hint="Select your area for better search visibility">
                  <div className="cl-tags" style={{marginTop:4}}>
                    {BD_AREAS.map(a => (
                      <button key={a} className={`cl-tag ${form.area===a?'selected':''}`}
                        onClick={() => setField('area', form.area===a ? '' : a)}>
                        {form.area===a && <i className="fas fa-check"/>}
                        {a}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Nearby Landmarks" labelIcon="fa-landmark"
                  hint="Mention universities, hospitals, markets — students search by these" hintIcon="fa-graduation-cap">
                  <div className="cl-input-group">
                    <i className="fas fa-signs-post cl-input-icon-left"/>
                    <input className="cl-input has-icon" value={form.landmarks}
                      onChange={e => setField('landmarks', e.target.value)}
                      placeholder="e.g., 200m from BUET Gate, near Azimpur Bus Stand"/>
                  </div>
                </Field>

                <Field label="Description" labelIcon="fa-align-left" required error={errors.description}
                  hint="Mention mess timings, security, nearby transport, and what makes it special">
                  <div style={{position:'relative'}}>
                    <textarea className={`cl-textarea ${errors.description?'error':''}`}
                      value={form.description} onChange={e => setField('description', e.target.value)}
                      placeholder="Describe your property... Include mess timings, security, nearby transport, etc."
                      maxLength={800} rows={5}/>
                    <span className="cl-char-count">{form.description.length}/800</span>
                  </div>
                </Field>

                <div className="cl-grid-2">
                  <Field label="Contact Number" labelIcon="fa-phone" required error={errors.contact}>
                    <div className="cl-phone-wrap">
                      <div className="cl-phone-code">
                        <i className="fas fa-flag" style={{fontSize:11}}/> +880
                      </div>
                      <input className={`cl-input ${errors.contact?'error':''}`}
                        value={form.contact} onChange={e => setField('contact', e.target.value)}
                        placeholder="1XXXXXXXXX" maxLength={11}/>
                    </div>
                  </Field>
                  <Field label="Religion Preference" labelIcon="fa-place-of-worship">
                    <div className="cl-select-wrap">
                      <select className="cl-select" value={form.religion} onChange={e => setField('religion', e.target.value)}>
                        <option value="any">Any Religion</option>
                        <option value="muslim">Muslim Preferred</option>
                        <option value="hindu">Hindu Preferred</option>
                        <option value="open">Open to All</option>
                      </select>
                    </div>
                  </Field>
                </div>

                <Field label="House Rules" labelIcon="fa-list-check"
                  hint="No smoking, no guests, entry time restrictions, etc." hintIcon="fa-circle-info">
                  <textarea className="cl-textarea" value={form.rules} rows={3}
                    onChange={e => setField('rules', e.target.value)}
                    placeholder="e.g., Entry before 10 PM, no smoking, no pets, no visitors after 8 PM"/>
                </Field>

                <Field label="Furnished Status" labelIcon="fa-couch">
                  <div className="cl-toggle-group">
                    {[['fully-furnished','fa-house-chimney','Fully Furnished'],['semi-furnished','fa-couch','Semi Furnished'],['unfurnished','fa-box-open','Unfurnished']].map(([v,icon,l]) => (
                      <button key={v} className={`cl-toggle-btn ${form.furnished===v?'active':''}`} onClick={() => setField('furnished', v)}>
                        <i className={`fas ${icon}`}/>{l}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </>)}

            {/* ── Step 2 ── */}
            {step === 2 && (<>
              <div className="cl-card-header">
                <div className="cl-card-icon"><i className="fas fa-bangladeshi-taka-sign"/></div>
                <div>
                  <div className="cl-card-title">Pricing & Meals</div>
                  <div className="cl-card-sub">Set competitive rates for BD students</div>
                </div>
              </div>
              <div className="cl-card-body">
                <InfoBanner>
                  <strong>Market Rate:</strong> Dhaka student rooms range ৳3,000–15,000/month. Dhanmondi/Banani avg ৳7,000–12,000. Mirpur/Mohammadpur avg ৳3,500–6,000.
                </InfoBanner>

                <Field label="Monthly Rent (BDT)" labelIcon="fa-bangladeshi-taka-sign" required error={errors.price}
                  hint="Base price shown on listing — individual bed prices set in Rooms step">
                  <div className="cl-input-group">
                    <span className="cl-input-prefix">৳</span>
                    <input className={`cl-input has-prefix ${errors.price?'error':''}`}
                      type="number" value={form.price} onChange={e => setField('price', e.target.value)}
                      placeholder="e.g., 7000" min="0" step="500"/>
                  </div>
                  <div className="cl-stepper">
                    {PRICE_PRESETS.map(p => (
                      <button key={p} className="cl-step-preset" onClick={() => setField('price', p.toString())}>
                        ৳{p.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </Field>

                {form.price > 0 && (
                  <div className="cl-price-preview">
                    <div className="cl-price-badge"><i className="fas fa-bangladeshi-taka-sign"/></div>
                    <div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginBottom:3,textTransform:'uppercase',letterSpacing:'.5px'}}>Monthly Rent</div>
                      <div className="cl-price-main">৳{parseInt(form.price||0).toLocaleString()}</div>
                      <div className="cl-price-unit"><i className="fas fa-calendar-days"/>per bed / month</div>
                    </div>
                  </div>
                )}

                <hr className="cl-divider"/>

                <div className="cl-grid-2">
                  <Field label="Advance Deposit" labelIcon="fa-hand-holding-dollar" hint="Months of advance required upfront">
                    <div className="cl-select-wrap">
                      <select className="cl-select" value={form.advanceMonths} onChange={e => setField('advanceMonths', e.target.value)}>
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} month{n>1?'s':''} advance</option>)}
                      </select>
                    </div>
                  </Field>
                  <Field label="Price Negotiable?" labelIcon="fa-handshake">
                    <div className="cl-toggle-group">
                      <button className={`cl-toggle-btn ${form.negotiable?'active':''}`} onClick={() => setField('negotiable', true)}>
                        <i className="fas fa-check"/>Yes
                      </button>
                      <button className={`cl-toggle-btn ${!form.negotiable?'active':''}`} onClick={() => setField('negotiable', false)}>
                        <i className="fas fa-xmark"/>No
                      </button>
                    </div>
                  </Field>
                </div>

                <hr className="cl-divider"/>
                <div className="cl-section-title"><i className="fas fa-utensils"/> Meals Included</div>
                <div className="cl-meal-grid">
                  {[
                    { key:'breakfast', fa:'fa-mug-hot',      label:'Breakfast', time:'7–9 AM'  },
                    { key:'lunch',     fa:'fa-bowl-rice',    label:'Lunch',     time:'12–2 PM' },
                    { key:'dinner',    fa:'fa-plate-wheat',  label:'Dinner',    time:'7–9 PM'  },
                  ].map(m => (
                    <div key={m.key} className={`cl-meal-card ${form.meals[m.key]?'on':''}`}
                      onClick={() => setForm(p => ({ ...p, meals: { ...p.meals, [m.key]: !p.meals[m.key] } }))}>
                      <div className="cl-meal-icon"><i className={`fas ${m.fa}`}/></div>
                      <div className="cl-meal-name">
                        {form.meals[m.key] && <i className="fas fa-check" style={{marginRight:4,fontSize:10}}/>}
                        {m.label}
                      </div>
                      <div className="cl-meal-time"><i className="fas fa-clock" style={{marginRight:4,fontSize:9}}/>{m.time}</div>
                    </div>
                  ))}
                </div>

                {mealCount > 0 && (
                  <div style={{marginTop:14}}>
                    <Field label="Extra Meal Charge (if not in rent)" labelIcon="fa-circle-plus"
                      hint="Leave blank if meals are fully included in rent">
                      <div className="cl-input-group">
                        <span className="cl-input-prefix">৳</span>
                        <input className="cl-input has-prefix" type="number" value={form.mealPrice}
                          onChange={e => setField('mealPrice', e.target.value)} placeholder="Additional monthly meal cost"/>
                      </div>
                    </Field>
                  </div>
                )}

                <hr className="cl-divider"/>
                <div className="cl-section-title"><i className="fas fa-plug"/> Utilities Included</div>
                <div className="cl-tags">
                  {UTILITIES.map(u => (
                    <button key={u.key}
                      className={`cl-tag ${form.utilities.includes(u.key)?'selected':''}`}
                      onClick={() => setForm(p => ({
                        ...p,
                        utilities: p.utilities.includes(u.key)
                          ? p.utilities.filter(x => x!==u.key)
                          : [...p.utilities, u.key]
                      }))}>
                      <i className={`fas ${u.fa}`}/>
                      {u.key}
                      {form.utilities.includes(u.key) && <i className="fas fa-check" style={{fontSize:10}}/>}
                    </button>
                  ))}
                </div>
              </div>
            </>)}

            {/* ── Step 3 ── */}
            {step === 3 && (<>
              <div className="cl-card-header">
                <div className="cl-card-icon"><i className="fas fa-door-open"/></div>
                <div>
                  <div className="cl-card-title">Rooms & Beds</div>
                  <div className="cl-card-sub">Add detailed room and bed information</div>
                </div>
              </div>
              <div className="cl-card-body">
                <InfoBanner>
                  <strong>Tip:</strong> Students compare bed-by-bed. Add each bed with price &amp; availability for maximum bookings.
                </InfoBanner>

                <div className="cl-stats-grid">
                  {[
                    { label:'Rooms',      val:stats.rooms,     color:'var(--accent)', fa:'fa-door-open'    },
                    { label:'Total Beds', val:stats.beds,      color:'var(--blue)',   fa:'fa-bed'          },
                    { label:'Available',  val:stats.available, color:'var(--green)',  fa:'fa-circle-check' },
                    { label:'Occupied',   val:stats.occupied,  color:'#ef4444',       fa:'fa-circle-xmark' },
                  ].map(s => (
                    <div key={s.label} className="cl-stat-box">
                      <div className="cl-stat-icon"><i className={`fas ${s.fa}`} style={{color:s.color}}/></div>
                      <div className="cl-stat-val" style={{color:s.color}}>{s.val}</div>
                      <div className="cl-stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>

                {errors.rooms && <p className="cl-error" style={{marginBottom:14}}><i className="fas fa-triangle-exclamation"/>{errors.rooms}</p>}

                <div className="cl-room-list">
                  {form.rooms.map(room => (
                    <div key={room.id} className="cl-room-card">
                      <div className="cl-room-head">
                        <div className="cl-room-icon"><i className="fas fa-door-open"/></div>
                        <div>
                          <div className="cl-room-name">{room.name}</div>
                          <div className="cl-room-meta">
                            <span><i className="fas fa-bed"/>{room.type} room</span>
                            {room.floor && <span><i className="fas fa-layer-group"/>Floor {room.floor}</span>}
                            {room.attached && <span><i className="fas fa-shower"/>Attached Bath</span>}
                          </div>
                        </div>
                        <div className="cl-room-actions">
                          <button className="cl-icon-btn edit" title="Edit Room" onClick={() => openEditRoom(room)}>
                            <i className="fas fa-pen"/>
                          </button>
                          <button className="cl-icon-btn del" title="Delete Room" onClick={() => deleteRoom(room.id)}>
                            <i className="fas fa-trash"/>
                          </button>
                        </div>
                      </div>
                      <div className="cl-room-body">
                        <div className="cl-bed-list">
                          {room.beds.map(bed => (
                            <div key={bed.id} className="cl-bed-item">
                              <i className="fas fa-circle" style={{fontSize:9, color: bed.available ? 'var(--green)' : '#ef4444', flexShrink:0}}/>
                              <span className="cl-bed-name">{bed.name}</span>
                              <span className="cl-bed-price">৳{parseInt(bed.price).toLocaleString()}/mo</span>
                              <span className={`cl-bed-status ${bed.available?'avail':'occ'}`}>
                                <i className={`fas ${bed.available?'fa-check':'fa-xmark'}`}/>
                                {bed.available ? 'Available' : 'Occupied'}
                              </span>
                              <button className="cl-icon-btn edit" style={{width:28,height:28}} onClick={() => openEditBed(bed, room.id)}>
                                <i className="fas fa-pen"/>
                              </button>
                              <button className="cl-icon-btn del" style={{width:28,height:28}} onClick={() => deleteBed(room.id, bed.id)}>
                                <i className="fas fa-trash"/>
                              </button>
                            </div>
                          ))}
                        </div>
                        <button className="cl-add-bed-btn" onClick={() => openAddBed(room.id)}>
                          <i className="fas fa-plus"/> Add Bed to {room.name}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {form.rooms.length === 0 && (
                  <div className="cl-empty-state">
                    <i className="fas fa-door-open"/>
                    <p>No rooms added yet.<br/>Click below to add your first room.</p>
                  </div>
                )}

                <button className="cl-add-room-btn" style={{marginTop:14}} onClick={openAddRoom}>
                  <i className="fas fa-plus"/> Add New Room
                </button>
              </div>
            </>)}

            {/* ── Step 4 ── */}
            {step === 4 && (<>
              <div className="cl-card-header">
                <div className="cl-card-icon"><i className="fas fa-camera"/></div>
                <div>
                  <div className="cl-card-title">Photos &amp; Amenities</div>
                  <div className="cl-card-sub">Showcase your property to attract students</div>
                </div>
              </div>
              <div className="cl-card-body">
                <InfoBanner>
                  <strong>Photo Tips:</strong> Listings with 5+ clear photos get <strong>4× more inquiries</strong>. Show rooms, bathroom, kitchen, common area. Use good lighting.
                </InfoBanner>

                <Field label="Property Photos" labelIcon="fa-images" required error={errors.photos}
                  hint="JPG, PNG up to 10MB each · Min 1, recommended 6+" hintIcon="fa-circle-info">
                  <input type="file" multiple accept="image/*" id="photo-up" style={{display:'none'}} onChange={handlePhotos}/>
                  <label htmlFor="photo-up" className="cl-photo-drop">
                    <div className="cl-photo-drop-icon"><i className="fas fa-cloud-arrow-up"/></div>
                    <div className="cl-photo-drop-text">Click to upload photos</div>
                    <div className="cl-photo-drop-sub">
                      <i className="fas fa-image" style={{marginRight:5}}/> JPG, PNG up to 10MB · Recommended: 6+ photos
                    </div>
                  </label>
                  {form.photos.length > 0 && (
                    <div className="cl-photo-grid">
                      {form.photos.map((p,i) => (
                        <div key={p.id} className="cl-photo-item">
                          <img src={p.url} alt=""
                            onError={e => e.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f0f0f0" width="100" height="100"/></svg>'}/>
                          {i===0 && <span className="cl-photo-primary"><i className="fas fa-star" style={{fontSize:9}}/> Cover</span>}
                          <button className="cl-photo-rm" onClick={() => setForm(p2 => ({ ...p2, photos: p2.photos.filter(x => x.id!==p.id) }))}>
                            <i className="fas fa-xmark"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>

                <hr className="cl-divider"/>
                <div className="cl-section-title"><i className="fas fa-star"/> Amenities</div>
                <div className="cl-check-grid">
                  {AMENITIES.map(a => (
                    <CheckCard key={a.key} label={a.key} faIcon={a.fa}
                      checked={!!form.amenities[a.key]}
                      onChange={e => setForm(p => ({ ...p, amenities: { ...p.amenities, [a.key]: e.target.checked } }))}/>
                  ))}
                </div>
              </div>
            </>)}

            {/* Nav */}
            <div className="cl-nav">
              <button className="cl-btn cl-btn-ghost" onClick={goPrev} disabled={step===1}>
                <i className="fas fa-arrow-left"/> Previous
              </button>
              {step < 4
                ? <button className="cl-btn cl-btn-primary" onClick={goNext}>
                    Continue <i className="fas fa-arrow-right"/>
                  </button>
                : <button className="cl-btn cl-btn-success" onClick={() => setShowConfirm(true)} disabled={isSubmitting}>
                    {isSubmitting
                      ? <><i className="fas fa-spinner fa-spin"/> Saving...</>
                      : <><i className="fas fa-paper-plane"/> {isEditing ? 'Update Listing' : 'Publish Listing'}</>
                    }
                  </button>
              }
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="cl-sidebar">
          <div className="cl-summary-card">
            <div className="cl-summary-header">
              <div className="cl-summary-title"><i className="fas fa-eye"/> Listing Preview</div>
              <div className="cl-summary-sub">Updates as you fill the form</div>
            </div>
            <div className="cl-summary-body">
              {[
                { fa:'fa-heading',                key:'Title',    val: form.title || '—' },
                { fa:'fa-location-dot',           key:'Location', val: form.location || '—' },
                { fa:'fa-building',               key:'Type',     val: form.propertyType || '—' },
                { fa:'fa-person-half-dress',      key:'Gender',   val: form.gender==='any' ? 'Any' : form.gender==='male' ? 'Male Only' : 'Female Only' },
                { fa:'fa-bangladeshi-taka-sign',  key:'Rent',     val: form.price ? `৳${parseInt(form.price).toLocaleString()}/mo` : '—' },
                { fa:'fa-bed',                    key:'Beds',     val: `${stats.beds} total · ${stats.available} free` },
                { fa:'fa-utensils',               key:'Meals',    val: mealCount > 0 ? `${mealCount} meal${mealCount>1?'s':''}` : 'None' },
              ].map(row => (
                <div key={row.key} className="cl-summary-row">
                  <span className="cl-summary-key"><i className={`fas ${row.fa}`}/>{row.key}</span>
                  <span className="cl-summary-val">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cl-tip-box">
            <div className="cl-tip-title"><i className="fas fa-flag"/> BD Tips</div>
            {[
              'Add nearby university to attract students',
              'Mention bKash / Nagad payment methods',
              'Note if Azaan (prayer call) is nearby',
              'Include load-shedding generator info',
              'Mention monthly gas bill separately',
            ].map((t,i) => (
              <div key={i} className="cl-tip-item"><i className="fas fa-chevron-right"/>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Room Modal */}
      <Modal isOpen={showRoomModal} onClose={() => setShowRoomModal(false)}
        title={editingRoom ? 'Edit Room' : 'Add New Room'}
        titleIcon={editingRoom ? 'fa-pen' : 'fa-door-open'}
        footer={<>
          <button className="cl-btn cl-btn-ghost" onClick={() => setShowRoomModal(false)}>
            <i className="fas fa-xmark"/> Cancel
          </button>
          <button className="cl-btn cl-btn-primary" onClick={saveRoom}>
            <i className={`fas ${editingRoom?'fa-floppy-disk':'fa-plus'}`}/>
            {editingRoom ? 'Update Room' : 'Add Room'}
          </button>
        </>}>
        <div className="cl-grid-2">
          <Field label="Room Name" labelIcon="fa-tag" required>
            <input className="cl-input" value={roomForm.name}
              onChange={e => setRoomForm(p => ({...p, name: e.target.value}))}
              placeholder="e.g., Room 101, Block A"/>
          </Field>
          <Field label="Floor" labelIcon="fa-layer-group">
            <div className="cl-input-group">
              <i className="fas fa-layer-group cl-input-icon-left"/>
              <input className="cl-input has-icon" value={roomForm.floor}
                onChange={e => setRoomForm(p => ({...p, floor: e.target.value}))}
                placeholder="e.g., 3rd Floor"/>
            </div>
          </Field>
        </div>
        <Field label="Room Type" labelIcon="fa-bed">
          <div className="cl-toggle-group">
            {[['single','fa-bed','Single'],['double','fa-bed','Double'],['triple','fa-bed','Triple'],['dormitory','fa-people-group','Dormitory']].map(([t,icon,l]) => (
              <button key={t} className={`cl-toggle-btn ${roomForm.type===t?'active':''}`}
                onClick={() => setRoomForm(p => ({...p, type:t}))}>
                <i className={`fas ${icon}`}/>{l}
              </button>
            ))}
          </div>
        </Field>
        <CheckCard label="Attached Bathroom" faIcon="fa-shower" checked={roomForm.attached}
          onChange={e => setRoomForm(p => ({...p, attached: e.target.checked}))}/>
      </Modal>

      {/* Bed Modal */}
      <Modal isOpen={showBedModal} onClose={() => setShowBedModal(false)}
        title={editingBed ? 'Edit Bed' : 'Add New Bed'}
        titleIcon={editingBed ? 'fa-pen' : 'fa-bed'}
        footer={<>
          <button className="cl-btn cl-btn-ghost" onClick={() => setShowBedModal(false)}>
            <i className="fas fa-xmark"/> Cancel
          </button>
          <button className="cl-btn cl-btn-primary" onClick={saveBed}>
            <i className={`fas ${editingBed?'fa-floppy-disk':'fa-plus'}`}/>
            {editingBed ? 'Update Bed' : 'Add Bed'}
          </button>
        </>}>
        <div className="cl-grid-2">
          <Field label="Bed Name / Number" labelIcon="fa-tag" required>
            <input className="cl-input" value={bedForm.name}
              onChange={e => setBedForm(p => ({...p, name: e.target.value}))}
              placeholder="e.g., Bed A, Lower Bunk"/>
          </Field>
          <Field label="Monthly Price (BDT)" labelIcon="fa-bangladeshi-taka-sign" required>
            <div className="cl-input-group">
              <span className="cl-input-prefix">৳</span>
              <input className="cl-input has-prefix" type="number" value={bedForm.price}
                onChange={e => setBedForm(p => ({...p, price: e.target.value}))} placeholder="8500"/>
            </div>
          </Field>
        </div>
        <Field label="Availability Status" labelIcon="fa-circle-check">
          <div className="cl-toggle-group">
            <button className={`cl-toggle-btn ${bedForm.available?'active':''}`} onClick={() => setBedForm(p => ({...p, available:true}))}>
              <i className="fas fa-circle-check" style={{color: bedForm.available ? 'var(--green)' : undefined}}/> Available
            </button>
            <button className={`cl-toggle-btn ${!bedForm.available?'active':''}`} onClick={() => setBedForm(p => ({...p, available:false}))}>
              <i className="fas fa-circle-xmark" style={{color: !bedForm.available ? '#ef4444' : undefined}}/> Occupied
            </button>
          </div>
        </Field>
        <Field label="Bed Photos" labelIcon="fa-camera" hint="Optional but significantly boosts booking rates">
          <input type="file" multiple accept="image/*" id="bed-photo-up" style={{display:'none'}}
            onChange={e => { const files = Array.from(e.target.files); setBedForm(p => ({...p, images: [...p.images, ...files.map(f => ({ id:uid(), url:URL.createObjectURL(f), file:f }))]})); }}/>
          <label htmlFor="bed-photo-up" className="cl-photo-drop" style={{padding:'16px'}}>
            <div className="cl-photo-drop-icon" style={{fontSize:22}}><i className="fas fa-camera"/></div>
            <div style={{fontSize:13, color:'var(--ink-60)', fontWeight:500}}>Add bed photos</div>
          </label>
          {bedForm.images.length > 0 && (
            <div className="cl-photo-grid" style={{gridTemplateColumns:'repeat(4,1fr)', marginTop:10}}>
              {bedForm.images.map(img => (
                <div key={img.id} className="cl-photo-item">
                  <img src={img.url} alt=""/>
                  <button className="cl-photo-rm" style={{opacity:1}}
                    onClick={() => setBedForm(p => ({...p, images: p.images.filter(x => x.id!==img.id)}))}>
                    <i className="fas fa-xmark"/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>
      </Modal>

      {/* Confirm Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}
        title={isEditing ? 'Update Listing' : 'Publish Listing'}
        titleIcon={isEditing ? 'fa-pen-to-square' : 'fa-paper-plane'}
        footer={<>
          <button className="cl-btn cl-btn-ghost" onClick={() => setShowConfirm(false)}>
            <i className="fas fa-xmark"/> Cancel
          </button>
          <button className="cl-btn cl-btn-success" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? <><i className="fas fa-spinner fa-spin"/> Saving...</>
              : <><i className="fas fa-check"/> Yes, {isEditing ? 'Update' : 'Publish'}</>
            }
          </button>
        </>}>
        <div>
          <div className="cl-confirm-icon">
            <i className={`fas ${isEditing?'fa-pen-to-square':'fa-paper-plane'}`}/>
          </div>
          <div className="cl-confirm-title">{isEditing ? 'Update your listing?' : 'Ready to publish?'}</div>
          <div className="cl-confirm-msg">
            {isEditing
              ? 'Your listing will be updated immediately with the new details.'
              : 'Your listing will go live and be visible to students across Bangladesh. Make sure all details are accurate.'}
          </div>
          {!isEditing && (
            <div className="cl-confirm-list">
              {[
                { fa:'fa-door-open',   text:`${form.rooms.length} room${form.rooms.length!==1?'s':''}, ${stats.beds} bed${stats.beds!==1?'s':''}` },
                { fa:'fa-bangladeshi-taka-sign', text:`৳${parseInt(form.price||0).toLocaleString()}/month` },
                { fa:'fa-location-dot', text: form.location || 'No address set' },
                { fa:'fa-images',      text:`${form.photos.length} photo${form.photos.length!==1?'s':''} uploaded` },
              ].map((item,i) => (
                <div key={i} className="cl-confirm-item">
                  <i className="fas fa-check check-icon"/>
                  <i className={`fas ${item.fa} meta-icon`}/>
                  {item.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
    </div>
  );
};

export { CreateListingPage };
export default CreateListingPage;