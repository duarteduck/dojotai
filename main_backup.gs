// main.gs — ponto de entrada web
function doGet(e) {
  const tmpl = HtmlService.createTemplateFromFile('index');
  return tmpl.evaluate()
    .setTitle('Criciúmatai')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// main.gs — ponto de entrada web
function doGet(e) {
  const tmpl = HtmlService.createTemplateFromFile('index');
  return tmpl.evaluate()
    .setTitle('Criciúmatai')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
