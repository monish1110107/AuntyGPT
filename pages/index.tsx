import { useState, useRef } from 'react'
import Head from 'next/head'
import { AUNTY_PERSONAS, SUGGESTION_CHIPS } from '@/components/personas'

type Mode = 'situation' | 'linkedin'
type Phase = 'input' | 'loading' | 'output'

interface AuntyResponse {
  response: string
  auntyName: string
  auntyEmoji: string
}

export default function Home() {
  const [selectedAunty, setSelectedAunty] = useState('punjabi')
  const [situation, setSituation] = useState('')
  const [linkedinText, setLinkedinText] = useState('')
  const [mode, setMode] = useState<Mode>('situation')
  const [phase, setPhase] = useState<Phase>('input')
  const [result, setResult] = useState<AuntyResponse | null>(null)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const outputRef = useRef<HTMLDivElement>(null)

  const loadingMessages = [
    "Aunty ji is putting down her chai... ☕",
    "Consulting the colony gossip network... 📡",
    "Preparing unsolicited advice... 🙏",
    "Checking your kundli... ✨",
    "Calling Sharma ji for comparison data... 📞",
  ]
  const [loadingMsg] = useState(() =>
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
  )

  const currentAunty = AUNTY_PERSONAS.find(a => a.id === selectedAunty)!

  const triggerConfetti = () => {
    const colors = ['#FF6B00', '#E91E8C', '#FFD700', '#25D366', '#00A86B']
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div')
      el.className = 'confetti-piece'
      el.style.left = Math.random() * 100 + 'vw'
      el.style.background = colors[Math.floor(Math.random() * colors.length)]
      el.style.animationDelay = Math.random() * 0.5 + 's'
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 2500)
    }
  }

  const showToastMsg = (msg: string) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleSubmit = async () => {
    const text = mode === 'situation' ? situation.trim() : linkedinText.trim()
    if (!text) return

    setPhase('loading')
    setError('')

    try {
      const endpoint = mode === 'situation' ? '/api/roast' : '/api/linkedin-roast'
      const body = mode === 'situation'
        ? { situation: text, auntyId: selectedAunty }
        : { linkedinText: text, auntyId: selectedAunty }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      setResult(data)
      setPhase('output')
      triggerConfetti()
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setPhase('input')
    }
  }

  const handleReset = () => {
    setPhase('input')
    setResult(null)
    setSituation('')
    setLinkedinText('')
    setError('')
  }

  const getShareText = () => {
    if (!result) return ''
    return `😂 ${result.auntyName} had THOUGHTS about my life choices:\n\n"${result.response}"\n\nGet roasted by your aunty 👉 auntygpt.vercel.app`
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getShareText())
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getShareText())
    showToastMsg('Copied! Now share it 😂')
  }

  const inputText = mode === 'situation' ? situation : linkedinText
  const canSubmit = inputText.trim().length > 3

  return (
    <>
      <Head>
        <title>AuntyGPT 👆 — Get Roasted by an Indian Aunty</title>
      </Head>

      <div className="page-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-inner">
            <h1>Aunty<span>GPT</span></h1>
            <p className="header-sub">
              Tell aunty your life choices. Receive unsolicited advice. 😂
            </p>
          </div>
        </header>

        {/* Aunty Selector */}
        <section className="aunty-section">
          <div className="section-label">Step 1 — Choose your aunty</div>
          <div className="aunty-grid">
            {AUNTY_PERSONAS.map(aunty => (
              <div
                key={aunty.id}
                className={`aunty-card ${selectedAunty === aunty.id ? 'selected' : ''}`}
                onClick={() => setSelectedAunty(aunty.id)}
              >
                <span className="aunty-emoji">{aunty.emoji}</span>
                <div className="aunty-name">{aunty.name}</div>
                <div className="aunty-vibe">{aunty.vibe}</div>
              </div>
            ))}
          </div>

          {/* Mode Toggle */}
          <div className="section-label">Step 2 — What should aunty review?</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[
              { id: 'situation', label: '💬 My Life Situation', desc: 'Tell aunty what\'s going on' },
              { id: 'linkedin', label: '💼 My LinkedIn Profile', desc: 'Paste your bio / headline' },
            ].map(opt => (
              <div
                key={opt.id}
                onClick={() => setMode(opt.id as Mode)}
                style={{
                  flex: 1,
                  background: mode === opt.id ? '#FFF3E8' : 'white',
                  border: `2.5px solid ${mode === opt.id ? 'var(--saffron)' : '#E8D5C0'}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', marginBottom: 3 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Input */}
        <section className="input-section">
          <label className="input-label">
            Step 3 — {mode === 'situation' ? 'Tell aunty what\'s happening in your life' : 'Paste your LinkedIn bio / headline / about section'}
          </label>

          {mode === 'situation' ? (
            <>
              <textarea
                className="main-input"
                placeholder="E.g. I got a job offer in Bangalore but I'm not sure if I should move..."
                value={situation}
                onChange={e => setSituation(e.target.value)}
                maxLength={500}
                rows={3}
                disabled={phase === 'loading'}
              />
              <div style={{ textAlign: 'right', fontSize: 12, color: '#BBA898', marginTop: 4 }}>
                {situation.length}/500
              </div>
              <div className="chips">
                {SUGGESTION_CHIPS.map(chip => (
                  <button
                    key={chip}
                    className="chip"
                    onClick={() => setSituation(chip)}
                    disabled={phase === 'loading'}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <textarea
                className="main-input"
                placeholder="Paste your LinkedIn About section, headline, or job description here..."
                value={linkedinText}
                onChange={e => setLinkedinText(e.target.value)}
                maxLength={800}
                rows={4}
                disabled={phase === 'loading'}
              />
              <div style={{ textAlign: 'right', fontSize: 12, color: '#BBA898', marginTop: 4, marginBottom: 16 }}>
                {linkedinText.length}/800
              </div>
            </>
          )}

          {error && (
            <div style={{
              background: '#FFF0F0',
              border: '1.5px solid #FFB3B3',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 14,
              color: '#CC0000',
              marginBottom: 16
            }}>
              ⚠️ {error}
            </div>
          )}

          {phase !== 'output' && (
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!canSubmit || phase === 'loading'}
            >
              {phase === 'loading' ? (
                <div className="btn-inner">
                  <span>Consulting aunty...</span>
                </div>
              ) : (
                <div className="btn-inner">
                  <span>{currentAunty.emoji}</span>
                  <span>Ask {currentAunty.name}</span>
                  <span>→</span>
                </div>
              )}
            </button>
          )}
        </section>

        {/* Loading */}
        {phase === 'loading' && (
          <div className="loading-wrap">
            <div className="loading-dots">
              <span /><span /><span />
            </div>
            <div className="loading-text">{loadingMsg}</div>
          </div>
        )}

        {/* Output */}
        {phase === 'output' && result && (
          <section className="output-section slide-up" ref={outputRef}>
            <div className="output-header">
              <div className="output-title">
                {currentAunty.emoji} Aunty has spoken!
              </div>
              <div className="output-actions">
                <button className="action-btn btn-share" onClick={handleWhatsAppShare}>
                  <span>📤</span> Share on WhatsApp
                </button>
                <button className="action-btn btn-copy" onClick={handleCopy}>
                  <span>📋</span> Copy
                </button>
                <button className="action-btn btn-again" onClick={handleReset}>
                  <span>🔄</span> Try Again
                </button>
              </div>
            </div>

            {/* WhatsApp UI */}
            <div className="wa-phone" id="aunty-card">
              <div className="wa-topbar">
                <div className="wa-avatar-circle">{result.auntyEmoji}</div>
                <div className="wa-contact-info">
                  <div className="wa-contact-name">{result.auntyName}</div>
                  <div className="wa-contact-status">online — typing vigorously...</div>
                </div>
              </div>
              <div className="wa-body">
                {/* User message bubble */}
                <div className="wa-user-msg">
                  {mode === 'situation' ? situation : '📎 LinkedIn Profile shared'}
                  <div className="wa-time">now ✓✓</div>
                </div>
                {/* Aunty response */}
                <div className="wa-bubble">
                  {result.response}
                  <div className="wa-time">now ✓✓</div>
                </div>
              </div>
            </div>

            {/* Share nudge */}
            <div className="share-nudge">
              <p>😂 Aunty ki baat dosto tak pahunchao — forward karo!</p>
              <button className="wa-share-btn" onClick={handleWhatsAppShare}>
                <span>📤</span> Forward on WhatsApp
              </button>
            </div>

            {/* Try another aunty */}
            <div style={{
              marginTop: 20,
              background: 'white',
              border: '1.5px solid #E8D5C0',
              borderRadius: 16,
              padding: '16px 20px',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--dark)' }}>
                🔁 See what other aunties say about this
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {AUNTY_PERSONAS.filter(a => a.id !== selectedAunty).map(aunty => (
                  <button
                    key={aunty.id}
                    onClick={() => { setSelectedAunty(aunty.id); handleReset(); }}
                    style={{
                      background: '#FFF3E8',
                      border: '1.5px solid var(--saffron)',
                      borderRadius: 20,
                      padding: '6px 14px',
                      fontSize: 13,
                      fontFamily: "'Baloo 2', cursive",
                      fontWeight: 600,
                      color: 'var(--saffron)',
                      cursor: 'pointer',
                    }}
                  >
                    {aunty.emoji} {aunty.name}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <footer className="footer">
          Made with 🧡 and too much chai &nbsp;·&nbsp; AuntyGPT
        </footer>
      </div>

      {showToast && (
        <div className="copied-toast">{toastMsg}</div>
      )}
    </>
  )
}
