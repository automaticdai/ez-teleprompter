import { useEffect, useState } from 'react'
import { COLOR_PRESETS, LIMITS } from '../theme.js'

function Switch({ on, onClick }) {
  return (
    <button className={`switch ${on ? 'on' : ''}`} role="switch" aria-checked={on} onClick={onClick}>
      <span className="knob" />
    </button>
  )
}

function Slider({ label, value, suffix, min, max, step = 1, onChange }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="field">
      <div className="field-label">
        <span>{label}</span>
        <b>
          {value}
          {suffix}
        </b>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(to right, #fff ${pct}%, rgba(255,255,255,0.14) ${pct}%)` }}
      />
    </div>
  )
}

// The slide-over panel: text actions, look, mirror/guide, and the desktop-only
// window controls (opacity, monitor, always-on-top, remote mode).
export default function SettingsDrawer({ settings, update, onCommand, onClose, interactiveProps, locked }) {
  const [displays, setDisplays] = useState([])

  const refreshDisplays = () => window.api.getDisplays().then(setDisplays)
  useEffect(() => {
    refreshDisplays()
  }, [])

  const currentDisplay = displays.find((d) => d.current)

  return (
    <div className="drawer" {...interactiveProps}>
      <div className="drawer-head">
        <span>🎬 EZ 提词器</span>
        <button className="hud-btn" style={{ width: 30, height: 30, fontSize: 14 }} onClick={onClose} title="关闭（S）">
          ✕
        </button>
      </div>

      <div className="drawer-body">
        <div className="field-label">
          <span>文本</span>
        </div>
        <div className="grid2">
          <button className="btn" onClick={() => onCommand('openFile')}>
            📂 打开文件
          </button>
          <button className="btn" onClick={() => onCommand('toggleEdit')}>
            ✏️ 编辑文本
          </button>
        </div>

        <Slider
          label="速度"
          value={settings.speed}
          suffix="%"
          min={LIMITS.speed[0]}
          max={LIMITS.speed[1]}
          onChange={(v) => update({ speed: v })}
        />
        <Slider
          label="字号"
          value={settings.fontSize}
          suffix="px"
          min={LIMITS.fontSize[0]}
          max={LIMITS.fontSize[1]}
          onChange={(v) => update({ fontSize: v })}
        />
        <Slider
          label="行距"
          value={settings.lineHeight}
          suffix=""
          min={LIMITS.lineHeight[0]}
          max={LIMITS.lineHeight[1]}
          step={0.1}
          onChange={(v) => update({ lineHeight: Number(v.toFixed(1)) })}
        />
        <Slider
          label="面板透明度"
          value={settings.bgOpacity}
          suffix="%"
          min={LIMITS.bgOpacity[0]}
          max={LIMITS.bgOpacity[1]}
          onChange={(v) => update({ bgOpacity: v })}
        />
        <Slider
          label="窗口透明度"
          value={settings.windowOpacity}
          suffix="%"
          min={LIMITS.windowOpacity[0]}
          max={LIMITS.windowOpacity[1]}
          onChange={(v) => {
            update({ windowOpacity: v })
            window.api.setOpacity(v)
          }}
        />

        <div className="field">
          <div className="field-label">
            <span>主题</span>
          </div>
          <div className="presets">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.name}
                className="preset"
                style={{
                  background: p.bg,
                  borderColor: settings.textColor === p.text ? p.text : 'transparent'
                }}
                onClick={() => update({ textColor: p.text, bgColor: p.bg })}
              >
                <div className="preset-bar" style={{ background: p.text, boxShadow: `0 0 8px ${p.text}` }} />
                <div className="preset-name" style={{ color: p.text }}>
                  {p.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="row">
          <span>对齐</span>
          <select
            value={settings.align || 'left'}
            onChange={(e) => update({ align: e.target.value })}
            style={{ width: 120 }}
          >
            <option value="left">左对齐</option>
            <option value="center">居中</option>
            <option value="right">右对齐</option>
          </select>
        </div>

        <div className="row">
          <span>跳过空行</span>
          <Switch on={settings.skipEmptyLines} onClick={() => update({ skipEmptyLines: !settings.skipEmptyLines })} />
        </div>
        {settings.skipEmptyLines && (
          <Slider
            label="段落间距"
            value={settings.paragraphGap}
            suffix="em"
            min={LIMITS.paragraphGap[0]}
            max={LIMITS.paragraphGap[1]}
            step={0.1}
            onChange={(v) => update({ paragraphGap: Number(v.toFixed(1)) })}
          />
        )}

        <div className="row">
          <span>水平镜像（M）</span>
          <Switch on={settings.flipH} onClick={() => onCommand('toggleMirror')} />
        </div>
        <div className="row">
          <span>垂直镜像</span>
          <Switch on={settings.flipV} onClick={() => update({ flipV: !settings.flipV })} />
        </div>
        <div className="row">
          <span>阅读基准线（G）</span>
          <Switch on={settings.showGuide} onClick={() => onCommand('toggleGuide')} />
        </div>

        <div className="field-label" style={{ marginTop: 4 }}>
          <span>窗口</span>
        </div>
        <div className="grid2">
          <button className="btn" onClick={() => onCommand('toggleFullscreen')}>
            ⛶ 全屏
          </button>
          <button
            className="btn"
            onClick={() => {
              window.api.fitToDisplay()
              refreshDisplays()
            }}
          >
            ⤢ 适应屏幕
          </button>
        </div>

        {displays.length > 1 && (
          <div className="row">
            <span>显示器</span>
            <select
              value={currentDisplay ? currentDisplay.id : ''}
              onChange={(e) => {
                window.api.moveToDisplay(Number(e.target.value)).then(refreshDisplays)
              }}
              style={{ width: 150 }}
            >
              {displays.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                  {d.primary ? '（主）' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="row">
          <span>总在最前</span>
          <Switch
            on={settings.alwaysOnTop !== false}
            onClick={() => {
              const next = settings.alwaysOnTop === false
              update({ alwaysOnTop: next })
              window.api.setAlwaysOnTop(next)
            }}
          />
        </div>
        <div className="row">
          <span>锁定穿透点击（L）</span>
          <Switch on={locked === true} onClick={() => onCommand('toggleClickThrough')} />
        </div>
        <div className="row">
          <span>遥控模式（全局按键）</span>
          <Switch
            on={settings.remoteMode === true}
            onClick={() => {
              const next = !settings.remoteMode
              update({ remoteMode: next })
              window.api.setRemoteMode(next)
            }}
          />
        </div>

        <div className="hint">
          💡 按 <b>?</b>（或 ❓ 按钮）查看完整快捷键与关于。可配对蓝牙翻页器（开启“遥控模式”）或游戏手柄实现免手滚动。
        </div>

        <button className="btn full" style={{ marginTop: 12 }} onClick={() => onCommand('quit')}>
          退出
        </button>
      </div>
    </div>
  )
}
