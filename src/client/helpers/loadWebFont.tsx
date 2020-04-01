import WebFont from 'webfontloader';

export function loadWebFont() {
  WebFont.load({
    custom: {
      families: ['Roboto'],
      urls: ['https://assets.pluto.network/font/roboto-self.css'],
    },
    timeout: 3000,
  });
}
