(() => {
  const css = `body, html{
    margin: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.prompt-container{
    position: absolute;
    background: #ffffff;
    width: 50ch;
    padding: 10px;
    padding-top: 0;
    font-family: Helvetica;
    font-weight: bold;
}
.prompt{
    border-style: solid;
    border-width: 3px;
    border-color: black;
    background: #ffffff;
    width: 75ch;
    font-family: Helvetica;
    font-weight: bold;
    width: 98%;
}`;
  const head = document.head;
  const style = document.createElement("style");

  head.appendChild(style);

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
})();
