// Anonimazação do nome
function anonimizarNome(nome) {
    if (!nome) return "";
  
    const partes = nome.trim().split(" ");
    if (partes.length === 1) return partes[0];
  
    return `${partes[0]} **** ${partes[partes.length - 1]}`;
  }

// Anonimazação de telefone  
function anonimizarTelefone(telefone) {
if (!telefone) return "";

const limpo = telefone.replace(/\D/g, "");
const ultimos4 = limpo.slice(-4);
return `***${ultimos4}`;
}

// Anonimazação do email
function anonimizarEmail(email) {
    if (!email || typeof email !== "string" || !email.includes("@")) return "";
  
    const [usuario, dominio] = email.split("@");
    const partesDominio = dominio.split(".");
    const extensao = partesDominio[partesDominio.length - 1];
    const nomeDominio = partesDominio[0];
  
    const primeiraParte = usuario.slice(0, 2); // primeiras letras
    const ultimaLetraUsuario = usuario.slice(-1); // última letra antes do @
    const primeiraDominio = nomeDominio.slice(0, 1); // primeira do domínio
    const penultimaExtensao = extensao.slice(0, 3); // três antes do ponto
  
    return `${primeiraParte}****${ultimaLetraUsuario}@${primeiraDominio}****${penultimaExtensao}`;
  }

// Embaralhamento estilo Fisher–Yates
function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

function randomSelection(arr, n) {
  const restantes = [...arr];
  const selecionados = [];

  while (selecionados.length < n && restantes.length > 0) {
    const idx = Math.floor(Math.random() * restantes.length);
    selecionados.push(restantes.splice(idx, 1)[0]);
  }

  return shuffle(selecionados);
}