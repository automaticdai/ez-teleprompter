// The glass control bar. Every button routes through the same `onCommand`
// dispatch used by the keyboard / remote / gamepad, so there is one source of
// truth for actions. It renders in two modes:
//   - `docked` (default home now): inside the detached console window, always
//     shown, no drag grip — the window itself is positioned by the main process.
//   - floating: the legacy in-prompter overlay (kept for flexibility).
// `interactiveProps` re-enables the mouse while the prompter is click-through.
export default function Hud({
  visible,
  docked,
  playing,
  locked,
  fullscreen,
  editing,
  speed,
  fontSize,
  onCommand,
  interactiveProps
}) {
  return (
    <div className={`hud ${docked ? 'docked' : ''} ${visible ? '' : 'hidden'}`} {...interactiveProps}>
      {!docked && (
        <div className="hud-grip" title="拖动移动">
          ⋮⋮
        </div>
      )}

      <button className="hud-btn primary" title="播放 / 暂停（空格）" onClick={() => onCommand('playPause')}>
        {playing ? '⏸' : '▶'}
      </button>
      <button className="hud-btn" title="回到顶部（R）" onClick={() => onCommand('reset')}>
        ↺
      </button>

      <div className="hud-divider" />

      <button className="hud-btn" title="减速（↓）" onClick={() => onCommand('speedDown')}>
        −
      </button>
      <div className="hud-readout">
        <b>{speed}</b>速度
      </div>
      <button className="hud-btn" title="加速（↑）" onClick={() => onCommand('speedUp')}>
        +
      </button>

      <div className="hud-divider" />

      <button className="hud-btn" title="缩小字体（←）" onClick={() => onCommand('fontDown')}>
        A−
      </button>
      <div className="hud-readout">
        <b>{fontSize}</b>字号
      </div>
      <button className="hud-btn" title="放大字体（→）" onClick={() => onCommand('fontUp')}>
        A+
      </button>

      <div className="hud-divider" />

      <button
        className={`hud-btn ${locked ? 'active' : ''}`}
        title="锁定穿透点击（L）"
        onClick={() => onCommand('toggleClickThrough')}
      >
        {locked ? '🔒' : '🔓'}
      </button>
      <button
        className={`hud-btn ${fullscreen ? 'active' : ''}`}
        title="全屏（F）"
        onClick={() => onCommand('toggleFullscreen')}
      >
        ⛶
      </button>

      <div className="hud-divider" />

      <button className="hud-btn" title="打开文件（O）" onClick={() => onCommand('openFile')}>
        📂
      </button>
      <button
        className={`hud-btn ${editing ? 'active' : ''}`}
        title="编辑文本（E）"
        onClick={() => onCommand('toggleEdit')}
      >
        ✏️
      </button>
      <button className="hud-btn" title="设置（S）" onClick={() => onCommand('toggleSettings')}>
        ⚙
      </button>
      <button className="hud-btn" title="帮助与快捷键（?）" onClick={() => onCommand('toggleHelp')}>
        ❓
      </button>
    </div>
  )
}
