function parseManagerZone(texto) {

    let nomeTime = document.getElementById("nomeTime").value.trim();

    if (nomeTime === "") {
        nomeTime = detectarTimePrincipal(texto);
        document.getElementById("nomeTime").value = nomeTime;
    }

    texto = normalizarTexto(texto);

    const linhas = texto
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l !== "");

    const jogos = [];

    let dataAtual = "";
    let i = 0;

    while (i < linhas.length) {

        //---------------------------------------
        // DATA
        //---------------------------------------
    
        if (ehData(linhas[i])) {
            dataAtual = linhas[i];
            i++;
            continue;
        }
    
        //---------------------------------------
        // INÍCIO DO JOGO
        //---------------------------------------
    
        const inicio = lerInicioJogo(linhas[i]);
    
        if (!inicio) {
            i++;
            continue;
        }
    
        let horario = inicio.horario;
        let campeonato;
    
        if (inicio.mobile) {
    
            campeonato = inicio.campeonato;
            i++;
    
        } else {
    
            i++;
    
            if (i >= linhas.length)
                break;
    
            campeonato = linhas[i];
            i++;
    
        }
    
        //---------------------------------------
        // TIMES E PLACAR
        //---------------------------------------
    
        if (i + 2 >= linhas.length)
            break;
    
        const mandante = linhas[i++];
        const placar = linhas[i++];
        const visitante = linhas[i++];
    
        if (!/^\d+\s*-\s*\d+$/.test(placar))
            continue;
    
        //---------------------------------------
        // TÁTICA (OPCIONAL)
        //---------------------------------------
    
        let categoria = "Sem tática";
    
        if (i < linhas.length) {
    
            const prox = linhas[i];
    
            const novaData = ehData(prox);
    
            const novoJogo = lerInicioJogo(prox);
    
            if (!novaData && !novoJogo) {
    
                categoria = prox;
                i++;
    
            }
    
        }
    
        //---------------------------------------
        // GOLS
        //---------------------------------------
    
        const gols = placar.split(/\s*-\s*/);
    
        const golsCasa = parseInt(gols[0], 10);
    
        const golsFora = parseInt(gols[1], 10);
    
        //---------------------------------------
        // IDENTIFICA O TIME ANALISADO
        //---------------------------------------
    
        let gp;
        let gc;
    
        if (mandante === nomeTime) {
    
            gp = golsCasa;
            gc = golsFora;
    
        } else if (visitante === nomeTime) {
    
            gp = golsFora;
            gc = golsCasa;
    
        } else {
    
            continue;
    
        }
    
        //---------------------------------------
        // RESULTADO
        //---------------------------------------
    
        let resultado = "E";
    
        if (gp > gc)
            resultado = "V";
        else if (gp < gc)
            resultado = "D";
    
        //---------------------------------------
        // SALVA O JOGO
        //---------------------------------------
    
        jogos.push({
    
            data: dataAtual,
    
            horario,
    
            campeonato,
    
            categoria,
    
            mandante,
    
            visitante,
    
            golsMandante: golsCasa,
    
            golsVisitante: golsFora,
    
            golsPro: gp,
    
            golsContra: gc,
    
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

function normalizarTexto(texto){

    return texto
        .replace(/\u00A0/g," ")
        .replace(/\r/g,"")
        .trim();

}

function ehData(linha) {
    return /^\d{2}-\d{2}-\d{4}$/.test(linha);
}

function lerInicioJogo(linha) {
    
    // Formato mobile
    let match = linha.match(/^(\d{2}:\d{2})\s*-\s*(.+)$/);

    if (match) {
        return {
            horario:match[1],
            campeonato:match[2],
            mobile:true
        };
    }

    // Formato desktop
    match = linha.match(/^(\d{2}:\d{2})$/);

    if (match) {
        return {
            horario:match[1],
            campeonato:null,
            mobile:false
        };
    }

    return null;
}