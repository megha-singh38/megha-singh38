import { useEffect, useMemo, useState } from 'react'

import resumePdfUrl from '../assets/MeghaResumeSWE.pdf?url'
import page1Url from '../assets/pese/essay-page-1.jpeg?url'
import page2Url from '../assets/pese/essay-page-2.jpeg?url'
import page3Url from '../assets/pese/essay-page-3.jpeg?url'

function joinBase(path) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${String(path).replace(/^\//, '')}`
}

async function probe(url) {
  // Some hosts disallow HEAD; try HEAD then fall back to GET.
  const tryReq = async (method) => {
    const res = await fetch(url, { method, cache: 'no-store' })
    const ct = res.headers.get('content-type') || ''
    const len = res.headers.get('content-length') || ''
    return { ok: res.ok, status: res.status, statusText: res.statusText, contentType: ct, contentLength: len, method }
  }

  try {
    return await tryReq('HEAD')
  } catch {
    try {
      return await tryReq('GET')
    } catch (e) {
      return { ok: false, status: 0, statusText: String(e?.message || e), contentType: '', contentLength: '', method: 'FETCH' }
    }
  }
}

async function sniff(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { Range: 'bytes=0-63' },
    })

    const buf = await res.arrayBuffer()
    const bytes = new Uint8Array(buf)
    const ascii = Array.from(bytes)
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
      .join('')

    // Cheap signatures
    const isPdf = ascii.startsWith('%PDF-')
    const isHtml = ascii.toLowerCase().includes('<!doctype html') || ascii.toLowerCase().includes('<html')
    const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff

    return {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get('content-type') || '',
      contentLength: res.headers.get('content-length') || '',
      signature: isPdf ? 'PDF' : isJpeg ? 'JPEG' : isHtml ? 'HTML' : 'UNKNOWN',
      first64: ascii,
    }
  } catch (e) {
    return { ok: false, status: 0, contentType: '', contentLength: '', signature: 'ERROR', first64: String(e?.message || e) }
  }
}

function Row({ label, url }) {
  const [result, setResult] = useState(null)
  const [sniffed, setSniffed] = useState(null)

  useEffect(() => {
    let alive = true
    probe(url).then((r) => alive && setResult(r))
    sniff(url).then((r) => alive && setSniffed(r))
    return () => { alive = false }
  }, [url])

  return (
    <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <strong style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{label}</strong>
        <a href={url} target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.9 }}>
          {url}
        </a>
      </div>
      <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.85 }}>
        {result
          ? `${result.ok ? 'OK' : 'FAIL'} · ${result.method} · ${result.status} ${result.statusText} · ${result.contentType || 'no content-type'}${result.contentLength ? ` · ${result.contentLength} bytes` : ''}`
          : 'Checking...'}
      </div>
      <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.75 }}>
        {sniffed
          ? `Sniff: ${sniffed.signature} · ${sniffed.status} · ${sniffed.contentType || 'no content-type'}${sniffed.contentLength ? ` · ${sniffed.contentLength} bytes` : ''}`
          : 'Sniffing...'}
      </div>
    </div>
  )
}

export default function DebugAssets() {
  const baseUrl = import.meta.env.BASE_URL || '/'
  const urls = useMemo(() => ({
    pdf: resumePdfUrl,
    img1: page1Url,
    img2: page2Url,
    img3: page3Url,
  }), [])

  return (
    <section id="debug-assets" className="resume-section">
      <div className="container">
        <p className="section-label">Debug</p>
        <h2 className="section-title">Asset Load Check</h2>

        <div style={{ marginTop: 18, padding: 18, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.9 }}>
            BASE_URL: <strong>{baseUrl}</strong>
          </div>

          <Row label="Resume PDF" url={urls.pdf} />
          <Row label="Essay image 1" url={urls.img1} />
          <Row label="Essay image 2" url={urls.img2} />
          <Row label="Essay image 3" url={urls.img3} />

          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <img src={urls.img1} alt="Essay page 1" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#0d0d12' }}>
              <object data={urls.pdf} type="application/pdf" width="100%" height="720">
                <div style={{ padding: 16, fontFamily: 'var(--font-mono)' }}>
                  PDF embed failed. Open it directly: <a href={urls.pdf} target="_blank" rel="noreferrer">{urls.pdf}</a>
                </div>
              </object>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

