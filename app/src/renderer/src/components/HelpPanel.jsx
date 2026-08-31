import { useEffect } from 'react'

// A small centered overlay: how to load a script, the full shortcut list, and a
// short "about". This is the home for the reference material that used to be a
// cramped hint at the bottom of the settings drawer.
const SHORTCUTS = [
  ['空格', '播放 / 暂停'],
  ['R', '回到顶部'],
  ['↑ / ↓', '加速 / 减速'],
  ['→ / ←', '放大 / 缩小字体'],
  ['O', '打开文件（.txt / .md / .srt）'],
  ['E', '就地编辑文本（Esc 退出）'],
  ['M', '水平镜像'],
  ['G', '阅读基准线'],
  ['L', '锁定穿透点击'],
  ['F', '全屏'],
  ['H', '显示 / 隐藏控制台'],
  ['S', '设置'],
  ['?', '本帮助'],
  ['PageDown / PageUp', '播放暂停 / 回到顶部（蓝牙翻页器）']
]

export default function HelpPanel({ onClose, interactiveProps }) {
  // Esc closes, matching the editor and settings drawer.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="help-overlay" {...interactiveProps} onClick={onClose}>
      <div className="help-card" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <span>🎬 EZ 提词器</span>
          <button className="hud-btn" style={{ width: 30, height: 30, fontSize: 14 }} onClick={onClose} title="关闭（Esc）">
            ✕
          </button>
        </div>

        <div className="help-body">
          <div className="field-label">
            <span>载入文稿</span>
          </div>
          <p className="help-note">
            点击工具栏的 <b>📂 打开</b>（或按 <b>O</b>）载入 <b>.txt</b>、<b>.md</b> 或 <b>.srt</b> 文件；也可点击{' '}
            <b>✏️ 编辑</b>（按 <b>E</b>）直接在页面上输入或粘贴文本。
          </p>

          <div className="field-label" style={{ marginTop: 14 }}>
            <span>快捷键</span>
          </div>
          <div className="help-keys">
            {SHORTCUTS.map(([key, desc]) => (
              <div className="help-key-row" key={key}>
                <kbd>{key}</kbd>
                <span>{desc}</span>
              </div>
            ))}
          </div>

          <p className="help-note" style={{ marginTop: 10 }}>
            开启<b>遥控模式</b>后，以下按键改为<b>全局</b>生效（即使窗口未聚焦）：PageDown / F8 播放暂停 · PageUp
            回到顶部 · F6 / F7 减速 / 加速。翻页器的 PageDown / PageUp 在窗口聚焦时也是同样的动作。
          </p>

          <div className="field-label" style={{ marginTop: 14 }}>
            <span>关于</span>
          </div>
          <p className="help-note">
            EZ 提词器 —— 一个无边框、始终置顶的悬浮提词器。可拖动到任意位置，叠在幻灯片或摄像头之上，并用键盘、蓝牙翻页器
            （在“设置”中开启遥控模式）或游戏手柄来控制。锁定穿透点击（L）后，点击会穿透到下方的窗口。
          </p>
        </div>
      </div>
    </div>
  )
}
