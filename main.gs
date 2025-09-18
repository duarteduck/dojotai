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

/**
 * Serve o protótipo do Layout v2.0 para testes
 * Para usar no menu: acao="function", destino="doGetPrototipo"
 */
function doGetPrototipo() {
  console.log('🎨 Carregando protótipo Layout v2.0');

  const tmpl = HtmlService.createTemplateFromFile('prototipo_layout_v2');
  return tmpl.evaluate()
    .setTitle('Sistema Dojotai - Layout v2.0 (Protótipo)')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
