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

    for (let i=0; i<linhas.length; i++) {

        const linha = linhas[i];

        // -----------------------
        // DATA
        // -----------------------

        if (/^\d{2}-\d{2}-\d{4}$/.test(linha)) {
            dataAtual = linha;
            continue;
        }

        // -----------------------
        // HORÁRIO
        // -----------------------

        if (!/^\d{2}:\d{2}$/.test(linha))
            continue;

        const horario = linha;

        if (i+6>=linhas.length)
            continue;

        const campeonato = linhas[i+1];
        const time1 = linhas[i+2];
        const placar = linhas[i+3];
        const time2 = linhas[i+4];
        const categoria = linhas[i+5];

        if (!placar.match(/^\d+\s*-\s*\d+$/))
            continue;

        const gols = placar.split("-");
        const golsCasa = parseInt(gols[0]);
        const golsFora = parseInt(gols[1]);

        let resultado = "";
        let gp = 0;
        let gc = 0;

        if (time1 === nomeTime) {
            gp = golsCasa;
            gc = golsFora;
        } else if (time2 === nomeTime) {
            gp = golsFora;
            gc = golsCasa;
        } else {
            continue;
        }

        if (gp > gc) {
            resultado="V";
        } else if (gp < gc) {
            resultado="D";
        } else {
            resultado="E";
        }

        jogos.push({
            data:dataAtual,
            horario,
            campeonato,
            categoria,
            mandante:time1,
            visitante:time2,
            golsMandante:golsCasa,
            golsVisitante:golsFora,
            golsPro:gp,
            golsContra:gc,
            resultado
        });
    }

    return jogos;
}

function detectarTimePrincipal(texto){

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