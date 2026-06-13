// Real speech recognition (STT) via the browser's Web Speech API.
// Works in Chrome / Edge / Safari (webkitSpeechRecognition).
//
// Mobile robustness:
// • primeMic() requests getUserMedia FIRST (on a user gesture) so the mic
//   permission is granted cleanly and persistently before SpeechRecognition
//   starts — this avoids the Android "can't ask for permission" loop.
// • auto-restart on transient 'no-speech'/'aborted' while still active.

window.CT_RECOGNIZE = {
  _primed: false,

  supported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  // Ask for mic permission via getUserMedia, then release the stream.
  // Returns 'ok' | 'denied' | 'overlay' | 'nodevice' | 'unsupported'.
  async primeMic() {
    if (this._primed) return 'ok';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return 'unsupported';
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop — we only needed the permission grant.
      stream.getTracks().forEach(t => t.stop());
      this._primed = true;
      return 'ok';
    } catch (e) {
      const name = (e && e.name) || '';
      if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied';
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'nodevice';
      if (name === 'NotReadableError' || name === 'AbortError') return 'overlay';
      return 'denied';
    }
  },

  create(locale, opts = {}) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    rec.lang = locale || 'en-US';
    rec.interimResults = true;
    rec.continuous = !!opts.continuous;
    rec.maxAlternatives = 1;

    let finalText = '';   // committed text from prior (restarted) sessions + this session's finals
    let committed = '';   // finalized text carried across continuous auto-restarts
    let stopped = false;

    // Rebuild the transcript from the FULL results list each event (instead of
    // appending per fired result). Continuous recognition can re-fire the same
    // segment, and appending duplicated words; rebuilding from index 0 avoids
    // that. `committed` preserves text across auto-restarts.
    rec.onresult = (e) => {
      let cur = '';
      let interim = '';
      for (let i = 0; i < e.results.length; i++) {
        const tr = e.results[i][0].transcript;
        if (e.results[i].isFinal) cur += tr;
        else interim += tr;
      }
      const base = committed ? committed + ' ' : '';
      if (cur) {
        finalText = (base + cur).trim();
        opts.onFinal && opts.onFinal(finalText);
      }
      if (interim) {
        opts.onInterim && opts.onInterim((base + interim).trim());
      }
    };

    rec.onerror = (e) => {
      const err = (e && e.error) || 'unknown';
      // 'no-speech' / 'aborted' are transient — let onend decide to restart.
      if (err === 'no-speech' || err === 'aborted') return;
      opts.onError && opts.onError(err);
    };

    rec.onend = () => {
      // In continuous mode, keep listening through pauses: snapshot what's been
      // finalized so far, then restart a fresh session (whose results start
      // empty) — base + new results stays duplicate-free.
      if (!stopped && opts.continuous) {
        committed = finalText;
        try { rec.start(); return; } catch (err) {}
      }
      opts.onEnd && opts.onEnd(finalText);
    };

    return {
      raw: rec,
      start() { stopped = false; finalText = ''; committed = ''; try { rec.start(); } catch (e) {} },
      stop()  { stopped = true; try { rec.stop(); } catch (e) {} },
      abort() { stopped = true; try { rec.abort(); } catch (e) {} },
      getFinal() { return finalText; },
    };
  },

  // High-level helper: prime permission, then start recognition.
  // Calls opts.onPermission(status) if priming fails so the UI can guide the user.
  async startWithPermission(locale, opts = {}) {
    if (!this.supported()) { opts.onPermission && opts.onPermission('unsupported'); return null; }
    const status = await this.primeMic();
    if (status !== 'ok') { opts.onPermission && opts.onPermission(status); return null; }
    const rec = this.create(locale, opts);
    if (rec) rec.start();
    return rec;
  },
};

// Shared, user-friendly Korean guidance for a permission failure.
window.CT_MIC_HELP = function(status) {
  switch (status) {
    case 'denied':
      return '마이크 권한이 거부됐어요. 주소창 왼쪽 자물쇠(또는 ⓘ) → 권한 → 마이크 → 허용으로 바꾼 뒤 다시 시도해 주세요.';
    case 'overlay':
      return '다른 앱의 떠 있는 창(버블·음량 표시 등)이 마이크를 막고 있어요. 그 창을 닫고 다시 시도해 주세요.';
    case 'nodevice':
      return '마이크를 찾을 수 없어요. 헤드셋·마이크 연결을 확인해 주세요.';
    case 'unsupported':
      return '이 브라우저는 음성 인식을 지원하지 않아요. Chrome 또는 Safari 최신 버전에서 사용해 주세요.';
    default:
      return '마이크를 사용할 수 없어요. 잠시 후 다시 시도해 주세요.';
  }
};
