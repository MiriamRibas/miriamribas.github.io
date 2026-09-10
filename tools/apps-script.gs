/**
 * Cadastro de apoiadores → Planilha Google + aviso por e-mail
 * -----------------------------------------------------------
 * Como publicar (5 minutos):
 * 1. Crie uma planilha no Google Drive da campanha chamada "Cadastros do site · Míriam Ribas".
 * 2. Menu Extensões → Apps Script. Apague o conteúdo e cole este arquivo.
 * 3. Implantar → Nova implantação → Tipo: App da Web → Executar como: você · Acesso: Qualquer pessoa.
 * 4. Copie a URL gerada (termina em /exec) e cole em assets/js/main.js, campo formEndpoint.
 * A cada envio, o script grava uma linha na aba "Cadastros" e manda um e-mail para EMAIL_AVISO.
 */
var EMAIL_AVISO = "Miriamribas55188@gmail.com";
var ABA = "Cadastros";

function doPost(e) {
  var p = (e && e.parameter) || {};
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["Data/hora", "Nome", "WhatsApp", "Bairro/cidade", "Voluntário(a)", "Como conheceu", "Origem (URL)"]);
    sh.setFrozenRows(1);
  }
  sh.appendRow([new Date(), p.nome || "", p.whatsapp || "", p.bairro || "", p.voluntario || "", p.como_conheceu || "", p.origem || ""]);
  try {
    MailApp.sendEmail({
      to: EMAIL_AVISO,
      subject: "Novo cadastro no site · " + (p.nome || "sem nome"),
      body: "Nome: " + p.nome + "\nWhatsApp: " + p.whatsapp + "\nBairro/cidade: " + p.bairro + "\nVoluntário(a): " + p.voluntario + "\nComo conheceu: " + p.como_conheceu + "\nOrigem: " + p.origem + "\n\nPlanilha: " + ss.getUrl()
    });
  } catch (err) {}
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput("ok");
}
