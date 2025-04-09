// Variáveis globais
let excelData = null;
let resultadoSorteioPCD = [];
let resultadoSorteioGeral = [];
let reservaSorteioPCD = [];
let reservaSorteioGeral = [];

// Leitura do Excel (somente armazena os dados)
document.getElementById("excelFileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const data = event.target.result;
    const workbook = XLSX.read(data, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    excelData = XLSX.utils.sheet_to_json(worksheet);

    // Conta os tipos de inscrição
    const pcdSim = excelData.filter(item => String(item.VagaPCD || "").trim().toLowerCase() === "sim");
    const pcdNao = excelData.filter(item => {
      const val = String(item.VagaPCD || "").trim().toLowerCase();
      return val === "não" || val === "nao";
    });

    // Exibe mensagem com resumo das inscrições
    const mensagemContainer = document.getElementById("mensagemInscricoes");
    mensagemContainer.innerHTML = `
      <div class="alert alert-primary border border-dark shadow-sm p-4 mt-4" role="alert">
        <h3 class="alert-heading text-center mb-4">
          📊 Resumo das Inscrições
        </h3>
        <div class="row text-center">
          <div class="col-md-4 mb-2">
            <div class="fw-bold text-uppercase text-secondary" style="font-size: 0.9rem;">Total de Inscrições</div>
            <div class="display-6 text-dark fw-bold">${excelData.length.toLocaleString('pt-BR')}</div>
          </div>
          <div class="col-md-4 mb-2">
            <div class="fw-bold text-uppercase text-secondary" style="font-size: 0.9rem;">Ampla Concorrência</div>
            <div class="display-6 text-primary fw-bold">${pcdNao.length.toLocaleString('pt-BR')}</div>
          </div>
          <div class="col-md-4 mb-2">
            <div class="fw-bold text-uppercase text-secondary" style="font-size: 0.9rem;">PCD</div>
            <div class="display-6 text-success fw-bold">${pcdSim.length.toLocaleString('pt-BR')}</div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById("sorteioBtn").classList.remove("d-none");
  };

  reader.readAsBinaryString(file);
});

// Realiza o sorteio com contagem regressiva
document.getElementById("sorteioBtn").addEventListener("click", function () {
  const botao = this;
  const contadorDiv = document.getElementById("contadorSorteio");

  if (!excelData) {
    alert("Selecione um arquivo Excel antes de realizar o sorteio.");
    return;
  }

  if (resultadoSorteioPCD.length > 0 || resultadoSorteioGeral.length > 0) {
    alert("O sorteio já foi realizado. Atualize a página para reiniciar.");
    return;
  }

  // Desabilita o botão e inicia a contagem regressiva
  botao.disabled = true;
  let segundos = 5;

  contadorDiv.innerHTML = `
    <div class="alert alert-warning text-center" role="alert">
      Sorteio será realizado em <strong><span id="contador">${segundos}</span></strong> segundos...
    </div>
  `;

  const intervalo = setInterval(() => {
    segundos--;
    document.getElementById("contador").textContent = segundos;

    if (segundos === 0) {
      clearInterval(intervalo);
      contadorDiv.innerHTML = "";

      // Realiza o sorteio após a contagem
      const pcdSim = excelData.filter(item => String(item.VagaPCD || "").trim().toLowerCase() === "sim");
      const pcdNao = excelData.filter(item => {
        const val = String(item.VagaPCD || "").trim().toLowerCase();
        return val === "não" || val === "nao";
      });

      resultadoSorteioPCD = randomSelection(pcdSim, 5);
      resultadoSorteioGeral = randomSelection(pcdNao, 45);

      document.getElementById("resultados").innerHTML = "";
      renderResultadoTabela("resultados", "Vagas para Pessoas com Deficiência", resultadoSorteioPCD);
      renderResultadoTabela("resultados", "Vagas Ampla Concorrência", resultadoSorteioGeral);

      document.getElementById("reservaBtn").classList.remove("d-none");

    }
  }, 1000);
});

// Sortear Cadastro Reserva com contagem regressiva
document.getElementById("reservaBtn").addEventListener("click", function () {
  const botao = this;
  const contadorDiv = document.getElementById("contadorReserva");

  botao.disabled = true;
  let segundos = 5;

  contadorDiv.innerHTML = `
    <div class="alert alert-warning text-center mt-3" role="alert">
      Cadastro reserva será sorteado em <strong><span id="contador">${segundos}</span></strong> segundos...
    </div>
  `;

  const intervalo = setInterval(() => {
    segundos--;
    document.getElementById("contador").textContent = segundos;

    if (segundos === 0) {
      clearInterval(intervalo);
      contadorDiv.innerHTML = "";

      const todosIDsSorteados = [
        ...resultadoSorteioPCD.map(p => p.NumeroSorteio),
        ...resultadoSorteioGeral.map(p => p.NumeroSorteio)
      ];

      // Remove os já sorteados
      const pcdSimDisponiveis = excelData.filter(item =>
        String(item.VagaPCD || "").trim().toLowerCase() === "sim" &&
        !todosIDsSorteados.includes(item.NumeroSorteio)
      );

      const pcdNaoDisponiveis = excelData.filter(item => {
        const val = String(item.VagaPCD || "").trim().toLowerCase();
        return (val === "não" || val === "nao") &&
               !todosIDsSorteados.includes(item.NumeroSorteio);
      });

      // Sorteio reserva
      reservaSorteioPCD = randomSelection(pcdSimDisponiveis, 5);
      reservaSorteioGeral = randomSelection(pcdNaoDisponiveis, 45);

      // Exibe resultados
      renderResultadoTabela("resultados", "Cadastro Reserva - PCD", reservaSorteioPCD);
      renderResultadoTabela("resultados", "Cadastro Reserva - Ampla Concorrência", reservaSorteioGeral);

      // Exibe botão exportar e oculta botão de reserva
      document.getElementById("exportarBtn").classList.remove("d-none");
      document.getElementById("reservaDiv")?.classList.add("d-none");
    }
  }, 1000);
});


// Geração apenas do quadro resumo com colunas (sem tabela)
function renderResultadoTabela(containerId, titulo, dados) {
  const container = document.getElementById(containerId);

  // Título do bloco
  const tituloEl = document.createElement("h5");
  tituloEl.className = "mt-5 mb-3 fw-bold";
  tituloEl.textContent = titulo;

  // Define cor do quadro com base no título
  let alertClass = "alert-secondary";
  if (titulo.toLowerCase().includes("pcd")) {
    alertClass = "alert-success";
  } else if (titulo.toLowerCase().includes("ampla")) {
    alertClass = "alert-primary";
  } else if (titulo.toLowerCase().includes("reserva")) {
    alertClass = "alert-warning";
  }

  // Monta os números sorteados em colunas com até 5 por coluna
  const numeros = dados.map(item => item.NumeroSorteio);
  const colunas = [];
  const linhasPorColuna = 5;

  for (let i = 0; i < numeros.length; i += linhasPorColuna) {
    colunas.push(numeros.slice(i, i + linhasPorColuna));
  }

  let colunasHtml = '<div class="row mt-3 justify-content-start">';
  colunas.forEach(col => {
    colunasHtml += '<div class="col-auto"><ul class="list-unstyled">';
    col.forEach(num => {
      colunasHtml += `<li style="font-size: 1.1rem; line-height: 1.8;" class="fw-bold">${num}</li>`;
    });
    colunasHtml += '</ul></div>';
  });
  colunasHtml += '</div>';

  // Cria bloco de resumo com os números
  const quadroResumo = document.createElement("div");
  quadroResumo.className = `alert ${alertClass} text-dark mt-3`;
  quadroResumo.innerHTML = `
    <strong>Números sorteados (${titulo}):</strong>
    ${colunasHtml}
  `;

  // Adiciona tudo ao container
  container.appendChild(tituloEl);
  container.appendChild(quadroResumo);
}




// Exporta os resultados para Excel
document.getElementById("exportarBtn").addEventListener("click", function () {
  if (
    resultadoSorteioPCD.length === 0 ||
    resultadoSorteioGeral.length === 0
  ) {
    alert("Realize o sorteio antes de exportar os resultados.");
    return;
  }

  const wb = XLSX.utils.book_new();

  // Sorteio principal
  const ws1 = XLSX.utils.json_to_sheet(resultadoSorteioPCD);
  XLSX.utils.book_append_sheet(wb, ws1, "PCD");

  const ws2 = XLSX.utils.json_to_sheet(resultadoSorteioGeral);
  XLSX.utils.book_append_sheet(wb, ws2, "Geral");

  // Sorteio reserva, se existir
  if (reservaSorteioPCD.length > 0) {
    const ws3 = XLSX.utils.json_to_sheet(reservaSorteioPCD);
    XLSX.utils.book_append_sheet(wb, ws3, "Reserva PCD");
  }

  if (reservaSorteioGeral.length > 0) {
    const ws4 = XLSX.utils.json_to_sheet(reservaSorteioGeral);
    XLSX.utils.book_append_sheet(wb, ws4, "Reserva Geral");
  }

  XLSX.writeFile(wb, "resultados_sorteio.xlsx");
});