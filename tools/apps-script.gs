/**
 * Cadastro de apoiadores do site miriamribas.com.br → Planilha Google + aviso por e-mail
 * -------------------------------------------------------------------------------------
 * Publicar (logado na conta da Míriam, miriamribas1963@gmail.com):
 * 1. Crie a planilha "Cadastros do site · Míriam Ribas 55188" em https://sheets.new
 * 2. Menu Extensões → Apps Script. Apague o conteúdo e cole este arquivo inteiro. Salve.
 * 3. Implantar → Nova implantação → engrenagem → App da Web.
 *    Executar como: Eu · Quem pode acessar: Qualquer pessoa → Implantar → Autorizar acesso.
 * 4. Copie a URL do app da Web (termina em /exec) e passe para o Claude colocar em
 *    assets/js/main.js, campo formEndpoint.
 * Cada envio grava uma linha na aba "Cadastros" e manda um e-mail para EMAIL_AVISO.
 * Ao editar este script depois, publique em Implantar → Gerenciar implantações → editar → Nova versão
 * (assim a URL /exec continua a mesma).
 */
var EMAIL_AVISO = "Miriamribas55188@gmail.com";
var ABA = "Cadastros";
var CABECALHO = ["Data/hora", "Nome", "WhatsApp", "Bairro/cidade", "Voluntário(a)", "Como conheceu", "Consentimento LGPD", "Página de origem"];

function doPost(e) {
  var p = (e && e.parameter) || {};

  // robôs costumam preencher o campo escondido "site"
  if (p.site) return resposta_();

  var nome = limpa_(p.nome, 80);
  var whatsapp = limpa_(p.whatsapp, 20);
  var bairro = limpa_(p.bairro, 80);
  var digitos = whatsapp.replace(/\D/g, "");
  if (!nome || !bairro || digitos.length < 10 || digitos.length > 13 || p.lgpd !== "Sim") return resposta_();

  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
    if (sh.getLastRow() === 0) {
      sh.appendRow(CABECALHO);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, CABECALHO.length).setFontWeight("bold");
    }
    sh.appendRow([
      new Date(), nome, whatsapp, bairro,
      limpa_(p.voluntario, 3), limpa_(p.como_conheceu, 40), "Sim", limpa_(p.origem, 200)
    ]);

    try {
      MailApp.sendEmail({
        to: EMAIL_AVISO,
        subject: "Novo cadastro no site · " + nome,
        body: "Nome: " + nome + "\nWhatsApp: " + whatsapp + "\nBairro/cidade: " + bairro +
              "\nVoluntário(a): " + limpa_(p.voluntario, 3) + "\nComo conheceu: " + limpa_(p.como_conheceu, 40) +
              "\n\nPlanilha: " + ss.getUrl()
      });
    } catch (err) {}
  } finally {
    lock.releaseLock();
  }
  return resposta_();
}

// corta o tamanho e neutraliza fórmulas (texto começando com = + - @ vira texto puro na planilha)
function limpa_(v, max) {
  var s = String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function resposta_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput("Cadastro do site Míriam Ribas 55188: ok");
}
