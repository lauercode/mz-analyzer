function parseManagerZone(texto) {

    let nomeTime = document.getElementById("nomeTime").value.trim();

    if (nomeTime === "") {
        nomeTime = detectarTimePrincipal(texto);
        document.getElementById("nomeTime").value = nomeTime;
    }

    const linhas = texto
        .split(/\r?\n/)
        .map(l=>l.trim())
        .filter(l=>l!="");

    const jogos = [];

    let dataAtual = "";
    let i = 0;

    while (i < linhas.length) {

        //---------------------------------------
        // DATA
        //---------------------------------------

        if (/^\d{2}-\d{2}-\d{4}$/.test(linhas[i])) {
            dataAtual = linhas[i];
            i++;
            continue;
        }

        //---------------------------------------
        // HORÁRIO
        //---------------------------------------

        if (!/^\d{2}:\d{2}$/.test(linhas[i])) {
            i++;
            continue;
        }

        const horario = linhas[i++];
        if (i >= linhas.length) break;

        //---------------------------------------
        // CAMPEONATO
        //---------------------------------------

        const campeonato = linhas[i++];
        if (i+2 >= linhas.length) break;

        //---------------------------------------
        // TIMES E PLACAR
        //---------------------------------------

        const mandante = linhas[i++];
        const placar = linhas[i++];
        const visitante = linhas[i++];

        if (!/^\d+\s*-\s*\d+$/.test(placar))
            continue;

        //---------------------------------------
        // TÁTICA (opcional)
        //---------------------------------------

        let categoria = "Sem tática";

        if (i < linhas.length) {
            const prox = linhas[i];
            const ehHorario = /^\d{2}:\d{2}$/.test(prox);
            const ehData = /^\d{2}-\d{2}-\d{4}$/.test(prox);

            if (!ehHorario && !ehData) {
                categoria = prox;
                i++;
            }
        }

        const gols = placar.split("-");
        const golsCasa = parseInt(gols[0]);
        const golsFora = parseInt(gols[1]);

        let gp,gc;

        if (mandante === nomeTime) {
            gp = golsCasa;
            gc = golsFora;
        } else if (visitante === nomeTime) {
            gp = golsFora;
            gc = golsCasa;
        } else {
            continue;
        }

        let resultado = "E";

        if (gp > gc) {
            resultado = "V";
        } else if (gp < gc) {
            resultado = "D";
        }

        jogos.push({
            data:dataAtual,
            horario,
            campeonato,
            categoria,
            mandante,
            visitante,
            golsMandante:golsCasa,
            golsVisitante:golsFora,
            golsPro:gp,
            golsContra:gc,
            resultado
        });
    }

    return jogos;
}

function detectarTimePrincipal(texto) {

    const linhas = texto
        .split(/\r?\n/)
        .map(l=>l.trim())
        .filter(l=>l!="");

    const contagem = {};

    for (let i=1; i<linhas.length-1; i++) {
        if (!/^\d+\s*-\s*\d+$/.test(linhas[i]))
            continue;

        const casa = linhas[i-1];
        const fora = linhas[i+1];

        contagem[casa] = (contagem[casa]||0)+1;
        contagem[fora] = (contagem[fora]||0)+1;
    }

    let nome = "";
    let maior = 0;

    Object.entries(contagem).forEach(([time,total]) => {
        if (total > maior) {
            maior = total;
            nome = time;
        }
    });

    return nome;
}