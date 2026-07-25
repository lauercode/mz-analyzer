document.addEventListener("DOMContentLoaded",() => {
    document
        .getElementById("btnAnalisar")
        .addEventListener("click",analisar);

    document
        .getElementById("btnLimpar")
        .addEventListener("click",limpar);

    document
        .getElementById("btnLimparFiltros")
        .addEventListener("click", limparFiltros);

    [
        "filtroTatica",
        "filtroCompeticao",
        "dataInicio",
        "dataFim",
        "filtroLocal"
    ].forEach(id=>{
        document
            .getElementById(id)
            .addEventListener("change", aplicarFiltros);
    });
});

document
    .getElementById("tipoEvolucao")
    .addEventListener("change",() => {
        desenharGraficoEvolucao(partidasFiltradas);
});

let partidas = [];
let partidasFiltradas = [];

let estatisticas = null;

const btnTema = document.getElementById("btnTema");
const temaSalvo = localStorage.getItem("tema") || "dark";

aplicarTema(temaSalvo);

btnTema.onclick=() => {
    const novoTema = document.body.classList.contains("light")
        ? "dark"
        : "light";

    aplicarTema(novoTema);
};

let ordenacaoTaticas = {
    coluna: "tatica",
    asc: true
};

document
    .querySelectorAll("#tabelaTaticas thead th")
    .forEach(th => {
        th.dataset.titulo = th.textContent;
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            ordenarTabela(th.dataset.coluna);
        });
});

function analisar() {

    const texto = document.getElementById("input").value.trim();

    if (texto === "") {
        alert("Cole primeiro o histórico do ManagerZone.");
        return;
    }

    partidas = parseManagerZone(texto);

    if (partidas.length === 0) {
        document.getElementById("resultadoAnalise").style.display = "none";
        alert("Nenhuma partida foi encontrada.");
        return;
    }

    document.getElementById("resultadoAnalise").style.display = "block";
    partidasFiltradas = [...partidas];

    inicializarFiltros();
    aplicarFiltros();
}

function limpar() {

    document.getElementById("nomeTime").value = "";
    document.getElementById("input").value = "";

    document.getElementById("totalJogos").textContent = "0";
    document.getElementById("vitorias").textContent = "0";
    document.getElementById("empates").textContent = "0";
    document.getElementById("derrotas").textContent = "0";
    document.getElementById("golsPro").textContent = "0";
    document.getElementById("golsContra").textContent = "0";

    document.querySelector("#tabelaTaticas tbody").innerHTML = "";
    document.querySelector("#tabelaJogos tbody").innerHTML = "";

    destruirGraficos();

    document.getElementById("resultadoAnalise").style.display = "none";
}

function atualizarDashboard(est) {
    document.getElementById("totalJogos").textContent = est.total;
    document.getElementById("vitorias").textContent = 
        est.vitorias+" ("+
        percentual(est.vitorias,est.total)+"%)";
    document.getElementById("empates").textContent = 
        est.empates+" ("+
        percentual(est.empates,est.total)+"%)";
    document.getElementById("derrotas").textContent = 
        est.derrotas+" ("+
        percentual(est.derrotas,est.total)+"%)";
    document.getElementById("golsPro").textContent = 
        est.golsPro;
    document.getElementById("golsContra").textContent = 
        est.golsContra;
}

function preencherTabelaTaticas(est) {
    const tbody = document.querySelector("#tabelaTaticas tbody");

    let lista = Object.entries(est.taticas);

    lista.sort((a,b) => {

        const catA = a[1];
        const catB = b[1];
    
        switch (ordenacaoTaticas.coluna) {
    
            case "tatica":
                return ordenacaoTaticas.asc
                    ? a[0].localeCompare(b[0])
                    : b[0].localeCompare(a[0]);
    
            case "jogos":
                return ordenacaoTaticas.asc
                    ? catA.jogos-catB.jogos
                    : catB.jogos-catA.jogos;
    
            case "vitorias":
                return ordenacaoTaticas.asc
                    ? catA.vitorias-catB.vitorias
                    : catB.vitorias-catA.vitorias;
    
            case "empates":
                return ordenacaoTaticas.asc
                    ? catA.empates-catB.empates
                    : catB.empates-catA.empates;
    
            case "derrotas":
                return ordenacaoTaticas.asc
                    ? catA.derrotas-catB.derrotas
                    : catB.derrotas-catA.derrotas;
    
            case "golsPro":
                return ordenacaoTaticas.asc
                    ? catA.golsPro-catB.golsPro
                    : catB.golsPro-catA.golsPro;
    
            case "golsContra":
                return ordenacaoTaticas.asc
                    ? catA.golsContra-catB.golsContra
                    : catB.golsContra-catA.golsContra;
    
            case "aproveitamento":
                return ordenacaoTaticas.asc
                    ? catA.aproveitamento-catB.aproveitamento
                    : catB.aproveitamento-catA.aproveitamento;
    
            default:
                return 0;
        }
    
    });

    tbody.innerHTML = "";

    lista.forEach(([nome,cat]) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${nome}</td>
            <td>${cat.jogos}</td>
            <td>${cat.vitorias}</td>
            <td>${cat.empates}</td>
            <td>${cat.derrotas}</td>
            <td>${cat.golsPro}</td>
            <td>${cat.golsContra}</td>
            <td>${cat.aproveitamento.toFixed(1)}%</td>
        `;

        tbody.appendChild(tr);
    });

    atualizarCabecalhoOrdenacao();
}

function preencherTabelaJogos(jogos) {
    const tbody = document.querySelector("#tabelaJogos tbody");

    tbody.innerHTML = "";

    jogos.forEach(jogo => {
        const placar = 
            jogo.golsMandante + 
            " x " + 
            jogo.golsVisitante;
        const tr = document.createElement("tr");

		// Colore a linha conforme o resultado
		if (jogo.resultado === "V") {
			tr.classList.add("vitoria");
		} else if (jogo.resultado === "E") {
			tr.classList.add("empate");
		} else {
			tr.classList.add("derrota");
		}

        const mandante = jogo.emCasa
            ? `<strong>${jogo.mandante}</strong>`
            : jogo.mandante;

        const visitante = !jogo.emCasa
            ? `<strong>${jogo.visitante}</strong>`
            : jogo.visitante;

		tr.innerHTML = `
			<td>${formatarData(jogo.data)}</td>
			<td>${jogo.tatica}</td>
			<td>${mandante}</td>
			<td>${placar}</td>
			<td>${visitante}</td>
			<td><strong>${jogo.resultado}</strong></td>
		`;

        tbody.appendChild(tr);
    });
}

/**
 * Preenche automaticamente os filtros da tela
 */
function inicializarFiltros() {

    // ===== Tática =====
    const selectTatica = document.getElementById("filtroTatica");

    selectTatica.innerHTML =
        '<option value="">Todas</option>';

    const taticas = [...new Set(
        partidas
            .map(p => p.tatica)
            .filter(c => c && c.trim() !== "")
    )].sort();

    taticas.forEach(tatica => {

        const option = document.createElement("option");
        option.value = tatica;
        option.textContent = tatica;

        selectTatica.appendChild(option);
    });


    // ===== Competição =====
    const selectCompeticao = document.getElementById("filtroCompeticao");

    selectCompeticao.innerHTML =
        '<option value="">Todas</option>';

    const competicoes = [...new Set(
        partidas
            .map(p => p.competicao)
            .filter(c => c && c.trim() !== "")
    )].sort();

    competicoes.forEach(competicao => {

        const option = document.createElement("option");
        option.value = competicao;
        option.textContent = competicao;

        selectCompeticao.appendChild(option);
    });
}

function aplicarFiltros() {

    if (!partidas.length) return [];
    
    partidasFiltradas = [...partidas];

    //------------------------------------------------
    // Tática
    //------------------------------------------------

    const tatica = document.getElementById("filtroTatica").value;

    if (tatica !== "") {
        partidasFiltradas =
            partidasFiltradas.filter(j => j.tatica === tatica);
    }

    //------------------------------------------------
    // Competição
    //------------------------------------------------

    const competicao = document.getElementById("filtroCompeticao").value;

    if (competicao !== "") {
        partidasFiltradas =
            partidasFiltradas.filter(j =>
                j.competicao === competicao
            );
    }

    //------------------------------------------------
    // Período
    //------------------------------------------------

    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;

    if (dataInicio) {
        const inicio = new Date(dataInicio);

        partidasFiltradas = partidasFiltradas.filter(j => {
            const data = converterData(j.data);
            return data >= inicio;
        });
    }

    if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23,59,59);

        partidasFiltradas = partidasFiltradas.filter(j => {
            const data = converterData(j.data);
            return data <= fim;
        });
    }

    //------------------------------------------------
    // Casa/Fora
    //------------------------------------------------

    const local = document.getElementById("filtroLocal").value;

    if (local === "CASA") {
        partidasFiltradas = partidasFiltradas.filter(j => j.emCasa);
    }

    if (local === "FORA" ) {
        partidasFiltradas = partidasFiltradas.filter(j => !j.emCasa);
    }

    //------------------------------------------------
    // Atualiza tudo
    //------------------------------------------------

    estatisticas = calcularEstatisticas(partidasFiltradas);
    atualizarDashboard(estatisticas);
    preencherTabelaTaticas(estatisticas);
    preencherTabelaJogos(partidasFiltradas);
    desenharGraficos(estatisticas);
    preencherTabelaCasaFora(estatisticas);

    return partidasFiltradas;
}

function converterData(dataTexto) {
    const partes = dataTexto.split("-");
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1;
    const ano = parseInt(partes[2]);

    return new Date(ano, mes, dia);
}

function aplicarTema(tema) {
    if (tema === "light") {
        document.body.classList.add("light");
        btnTema.textContent="☀️";
    } else {
        document.body.classList.remove("light");
        btnTema.textContent="🌙";
    }

    localStorage.setItem("tema", tema);
}

function formatarData(data){
    return data.replace(/-/g,"/");
}

function ordenarTabela(coluna) {
    if (ordenacaoTaticas.coluna === coluna) {
        ordenacaoTaticas.asc =! ordenacaoTaticas.asc;
    } else {
        ordenacaoTaticas.coluna = coluna;
        ordenacaoTaticas.asc = true;
    }

    atualizarCabecalhoOrdenacao();
    preencherTabelaTaticas(estatisticas);
}

function atualizarCabecalhoOrdenacao() {
    document
        .querySelectorAll("#tabelaTaticas thead th")
        .forEach(th => {
            const coluna = th.dataset.coluna;
            // texto original
            th.textContent = th.dataset.titulo;
            th.classList.remove("ordenado");

            if (coluna === ordenacaoTaticas.coluna) {
                th.classList.add("ordenado");
                th.textContent += ordenacaoTaticas.asc
                    ? " ▲"
                    : " ▼";
            }
        });
}

function limparFiltros() {
    document.getElementById("filtroTatica").value = "";
    document.getElementById("filtroCompeticao").value = "";
    document.getElementById("dataInicio").value = "";
    document.getElementById("dataFim").value = "";
    document.getElementById("filtroLocal").value = "";

    aplicarFiltros();
}

function preencherTabelaCasaFora(est) {
    document.getElementById("cfJogosCasa").textContent = est.casa.jogos;
    document.getElementById("cfJogosFora").textContent = est.fora.jogos;

    document.getElementById("cfVCasa").textContent = est.casa.vitorias;
    document.getElementById("cfVFora").textContent = est.fora.vitorias;

    document.getElementById("cfECasa").textContent = est.casa.empates;
    document.getElementById("cfEFora").textContent = est.fora.empates;

    document.getElementById("cfDCasa").textContent = est.casa.derrotas;
    document.getElementById("cfDFora").textContent = est.fora.derrotas;

    document.getElementById("cfGPCasa").textContent = est.casa.golsPro;
    document.getElementById("cfGPFora").textContent = est.fora.golsPro;

    document.getElementById("cfGCCasa").textContent = est.casa.golsContra;
    document.getElementById("cfGCFora").textContent = est.fora.golsContra;

    document.getElementById("cfSaldoCasa").textContent = est.casa.saldo;
    document.getElementById("cfSaldoFora").textContent = est.fora.saldo;

    document.getElementById("cfApCasa").textContent = 
        est.casa.aproveitamento.toFixed(1)+"%";

    document.getElementById("cfApFora").textContent = 
        est.fora.aproveitamento.toFixed(1)+"%";
}