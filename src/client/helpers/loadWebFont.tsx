export async function loadWebFont() {
  const WebFont = await import('webfontloader');

  WebFont.load({
    custom: {
      families: ['Roboto'],
      urls: ['https://assets.pluto.network/font/roboto-self.css'],
    },
  });
}
