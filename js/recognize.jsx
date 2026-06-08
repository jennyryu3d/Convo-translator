// Real speech recognition (STT) via the browser's Web Speech API.
// Works in Chrome / Edge / Safari (webkitSpeechRecognition). Streams interim
// results as you speak, returns a final transcript on stop.
//
// Usage:
//   const rec = window.CT_RECOGNIZE.create('ko-KR', {
//     onInterim: (text) => ...,   // live partial text
//     onFinal:   (text) => ...,   // final transcript when a phrase completes
//     onEnd:     () => ...,       // recognition stopped
//     onError:   (err) => ...,
//     continuous: true,           // keep listening (hands-free) vs one phrase
//   });
//   rec.start();  rec.stop();

window.CT_RECOGNIZE = {
  supported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  create(locale, opts = {}) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    rec.lang = locale || 'en-US';
    rec.interimResults = true;
    rec.continuous = !!opts.continuous;
    rec.maxAlternatives = 1;

    let finalText = '';
    let stopped = false;

    rec.onresult = (e) => {
      let interim = '';
      let freshFinal = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const tr = e.results[i][0].transcript;
        if (e.results[i].isFinal) freshFinal += tr;
        else interim += tr;
      }
      if (freshFinal) {
        finalText = (finalText + ' ' + freshFinal).trim();
        opts.onFinal && opts.onFinal(finalText);
      }
      if (interim) {
        opts.onInterim && opts.onInterim(interim);
      }
    };

    rec.onerror = (e) => {
      opts.onError && opts.onError(e.error || 'unknown');
    };

    rec.onend = () => {
      // In continuous hands-free mode, auto-restart unless explicitly stopped.
      if (opts.continuous && !stopped) {
        try { rec.start(); return; } catch (err) {}
      }
      opts.onEnd && opts.onEnd(finalText);
    };

    return {
      raw: rec,
      start() { stopped = false; finalText = ''; try { rec.start(); } catch (e) {} },
      stop()  { stopped = true; try { rec.stop(); } catch (e) {} },
      abort() { stopped = true; try { rec.abort(); } catch (e) {} },
      getFinal() { return finalText; },
    };
  },
};
