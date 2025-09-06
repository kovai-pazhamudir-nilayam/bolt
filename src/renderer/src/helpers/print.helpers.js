const defaultStyle = `
  body {
    margin: 20px;
    width:350px;
    overflow:visible !important;
  }
`;

export const printProvidedDiv = (div, style = defaultStyle, title) => {
  try {
    let popupWin = window.open("", "_blank");

    let printContents = div.innerHTML;
    let printHead = document.head.innerHTML;
    popupWin.document.write(`
      <html>
        <head>
          ${printHead}
          <style>
            ${style}
          </style>
        </head>
        <body onload="window.print();setTimeout(window.close, 0);">${printContents}
        </body>
        <script>
          document.title = ${title}
        </script>
      </html>`);

    popupWin.document.close();
  } catch (error) {
    console.log(error);
  }
};

export const printAllBase64Images = (barcodes) => {
  let win = window.open("", "_blank");
  barcodes?.map((base64) => {
    const url = `data:image/png;base64,${base64}`;
    win.document.write(
      '<img src="' +
        url +
        '" onload="window.print();window.close()" /><br/><br/>'
    );
  });
  win.focus();
};
