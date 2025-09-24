// main_migrated.gs — ponto de entrada web para aplicação migrada
function doGet(e) {
  const tmpl = HtmlService.createTemplateFromFile('app_migrated');
  return tmpl.evaluate()
    .setTitle('Sistema Dojotai - Migrado')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}