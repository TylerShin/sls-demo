export function loadKaTexStyleSheet() {
  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.crossOrigin = 'anonymous';
  link.href = 'https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.min.css';
  head.appendChild(link);
}
