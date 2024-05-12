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

  document.prepend(
    document.createComment(`Mass by James Bloom. Minted May 15th 2024 with code on-chain on Ethereum L1. 

  Made with javascript ES2023 and three.js 0.144.0. Compatible with Google Chrome 124.0.6367.119 and Safari 17.4.1 (both desktop and phone).
  
  Press M to change Ethereum node. I and O to zoom in and out.`)
  );

  const style = document.createElement("style");
  head.appendChild(style);

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
})();
