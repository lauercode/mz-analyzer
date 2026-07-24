document.addEventListener("DOMContentLoaded",() => {
    document
        .getElementById("btnAnalisar")
        .addEventListener("click",analisar);

    document
        .getElementById("btnLimpar")
        .addEventListener("click",limpar);
});

let partidas = [];
let partidasFiltradas = [];

const btnTema = document.getElementById("btnTema");
const temaSalvo = localStorage.getItem("tema") || "dark";

aplicarTema(temaSalvo);

btnTema.onclick=() => {
    const novoTema = document.body.classList.contains("light")
        ? "dark"
        : "light";

    aplicarTema(novoTema);
};

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

    const estatisticas = calcularEstatisticas(partidas);

    atualizarDashboard(estatisticas);
    preencherTabelaTaticas(estatisticas);
    preencherTabelaJogos(partidas);
    desenharGraficos(estatisticas);
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

    tbody.innerHTML = "";

    ordenarTaticas(est.taticas).forEach(([nome,cat]) => {
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

		tr.innerHTML = `
			<td>${jogo.data}</td>
			<td>${jogo.tatica}</td>
			<td>${jogo.mandante}</td>
			<td>${placar}</td>
			<td>${jogo.visitante}</td>
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

    if (!this.partidas) return [];

    let partidasFiltradas = [...this.partidas];

    //------------------------------------------------
    // Tática
    //------------------------------------------------

    const tatica = document.getElementById("filtroTatica").value;

    if (tatica !== "TODAS") {
        partidasFiltradas = partidasFiltradas.filter(j =>
            j.tatica === tatica
        );
    }

    //------------------------------------------------
    // Competição
    //------------------------------------------------

    const competicao = document.getElementById("filtroCompeticao").value;

    if (competicao !== "TODAS") {
        partidasFiltradas = partidasFiltradas.filter(j => {
            const nome = j.competicao.toUpperCase();

            switch (competicao) {
                case "LIGA":
                    return nome.includes("LIGA")
                        && !nome.includes("LIGA MUNDIAL")
                        && !nome.includes("LIGA DE AMIGOS");
                case "LIGA MUNDIAL":
                    return nome.includes("LIGA MUNDIAL");
                case "LIGA DE AMIGOS":
                    return nome.includes("LIGA DE AMIGOS");
                case "COPA OFICIAL":
                    return nome.includes("COPA OFICIAL");
                case "COPA AMIGOS":
                    return nome.includes("COPAS DE AMIGOS");
                case "AMISTOSO":
                    return nome.includes("AMISTOSO");
                case "OLHEIRO":
                    return nome.includes("OLHEIRO");
                default:
                    return true;
            }
        });
    }

    //------------------------------------------------
    // Período
    //------------------------------------------------

    const dataInicio = document.getElementById("filtroInicio").value;
    const dataFim = document.getElementById("filtroFim").value;

    if (dataInicio) {
        const inicio = new Date(dataInicio);

        partidasFiltradas = partidasFiltradas.filter(j => {
            const data = this.converterData(j.data);
            return data >= inicio;
        });
    }

    if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23,59,59);

        partidasFiltradas = partidasFiltradas.filter(j => {
            const data = this.converterData(j.data);
            return data <= fim;
        });
    }

    //------------------------------------------------
    // Casa/Fora
    //------------------------------------------------

    const chkCasa = document.getElementById("filtroCasa").checked;
    const chkFora = document.getElementById("filtroFora").checked;

    if (chkCasa && !chkFora) {
        partidasFiltradas = partidasFiltradas.filter(j => j.emCasa);
    }

    if (!chkCasa && chkFora) {
        partidasFiltradas = partidasFiltradas.filter(j => !j.emCasa);
    }

    //------------------------------------------------
    // Atualiza tudo
    //------------------------------------------------

    this.partidasFiltradas = partidasFiltradas;
	this.estatisticas = calcularEstatisticas(partidasFiltradas);
    this.atualizarDashboard(estatisticas);
    this.preencherTabelaTaticas(estatisticas);
    this.preencherTabelaJogos(partidasFiltradas);
    this.desenharGraficos(estatisticas);

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