interface LoadScriptOptions {
  src: string;
  crossOrigin?: string;
  onLoad?: () => void;
}

export function loadScript(options: LoadScriptOptions) {
  const script = document.createElement('script');
  script.src = options.src;
  if (options.crossOrigin) {
    script.crossOrigin = options.crossOrigin;
  }
  if (options.onLoad) {
    script.onload = options.onLoad;
  }
  document.body.appendChild(script);
}
