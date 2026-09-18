/**
 * Formulários do site miriamribas.com.br → Planilha Google + aviso por e-mail
 * -------------------------------------------------------------------------------------
 * Recebe dois formulários:
 *   - Cadastro de apoiadores (página Apoie)  → aba "Cadastros"
 *   - Fale com a Míriam (home)               → aba "Fale com a Míriam"  (campo tipo = "mensagem")
 *
 * Publicar (logado na conta da Míriam, miriamribas1963@gmail.com):
 * 1. Crie a planilha "Cadastros do site · Míriam Ribas 55188" em https://sheets.new
 * 2. Menu Extensões → Apps Script. Apague o conteúdo e cole este arquivo inteiro. Salve.
 * 3. Implantar → Nova implantação → engrenagem → App da Web.
 *    Executar como: Eu · Quem pode acessar: Qualquer pessoa → Implantar → Autorizar acesso.
 * 4. Copie a URL do app da Web (termina em /exec) e passe para o Claude colocar em
 *    assets/js/main.js, campo formEndpoint.
 * Cada envio grava uma linha na aba certa e manda um e-mail para EMAIL_AVISO.
 * Ao editar este script depois, publique em Implantar → Gerenciar implantações → editar → Nova versão
 * (assim a URL /exec continua a mesma).
 */
var EMAIL_AVISO = "Miriamribas55188@gmail.com";

var CADASTRO = {
  aba: "Cadastros",
  cabecalho: ["Data/hora", "Nome", "WhatsApp", "Bairro/cidade", "Voluntário(a)", "Como conheceu", "Consentimento LGPD", "Página de origem"]
};
var MENSAGEM = {
  aba: "Fale com a Míriam",
  cabecalho: ["Data/hora", "Nome", "WhatsApp", "E-mail", "Mensagem", "Consentimento LGPD", "Página de origem"]
};

function doPost(e) {
  var p = (e && e.parameter) || {};

  // robôs costumam preencher o campo escondido "site"
  if (p.site) return resposta_();
  if (p.lgpd !== "Sim") return resposta_();

  var nome = limpa_(p.nome, 80);
  var whatsapp = limpa_(p.whatsapp, 20);
  var digitos = whatsapp.replace(/\D/g, "");
  if (!nome || digitos.length < 10 || digitos.length > 13) return resposta_();

  if (p.tipo === "mensagem") {
    var email = limpa_(p.email, 120);
    var texto = limpa_(p.mensagem, 1500);
    if (!texto) return resposta_();
    grava_(MENSAGEM, [new Date(), nome, whatsapp, email, texto, "Sim", limpa_(p.origem, 200)],
      "Nova mensagem no site · " + nome,
      "Nome: " + nome + "\nWhatsApp: " + whatsapp + "\nE-mail: " + (email || "-") + "\n\nComo a Míriam pode ajudar:\n" + texto);
    return resposta_();
  }

  var bairro = limpa_(p.bairro, 80);
  if (!bairro) return resposta_();
  var voluntario = limpa_(p.voluntario, 3), como = limpa_(p.como_conheceu, 40);
  grava_(CADASTRO, [new Date(), nome, whatsapp, bairro, voluntario, como, "Sim", limpa_(p.origem, 200)],
    "Novo cadastro no site · " + nome,
    "Nome: " + nome + "\nWhatsApp: " + whatsapp + "\nBairro/cidade: " + bairro +
    "\nVoluntário(a): " + voluntario + "\nComo conheceu: " + como);
  return resposta_();
}

// grava uma linha na aba (cria a aba e o cabeçalho na primeira vez) e avisa por e-mail
function grava_(tipo, linha, assunto, corpo) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(tipo.aba) || ss.insertSheet(tipo.aba);
    if (sh.getLastRow() === 0) {
      sh.appendRow(tipo.cabecalho);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, tipo.cabecalho.length).setFontWeight("bold");
    }
    sh.appendRow(linha);
    try {
      MailApp.sendEmail({ to: EMAIL_AVISO, subject: assunto, body: corpo + "\n\nPlanilha: " + ss.getUrl() });
    } catch (err) {}
  } finally {
    lock.releaseLock();
  }
}

// corta o tamanho e neutraliza fórmulas (texto começando com = + - @ vira texto puro na planilha)
function limpa_(v, max) {
  var s = String(v == null ? "" : v).replace(/\r\n?/g, "\n").replace(/[\t]+/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function resposta_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput("Formulários do site Míriam Ribas 55188: ok");
}
