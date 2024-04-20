(() => {
  const css = `body { margin: 0; }`;
  const head = document.head;
  const style = document.createElement("style");

  head.appendChild(style);

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
})();
