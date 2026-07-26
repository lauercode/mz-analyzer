function parseManagerZone(texto) {

    let nomeTime = document
        .getElementById("nomeTime")
        .value
        .trim();

    if (!nomeTime) {
        nomeTime = detectarTimePrincipal(texto);
        document.getElementById("nomeTime").value = nomeTime;
    }

    texto = normalizarTexto(texto);

    const linhas = texto.split("\n");

    const secoes = separarPorData(texto);

    const jogos = [];

    for (const secao of secoes) {

        const partidas = separarJogos(secao.linhas);

        partidas.forEach(partida => {

            const jogo = interpretarJogo(
                secao.data,
                partida,
                nomeTime
            );

            if (jogo)
                jogos.push(jogo);

        });

    }

    return jogos;

}

function separarPorData(texto){

    const linhas = texto
        .split("\n")
        .map(l=>l.trim())
        .filter(Boolean);

    const secoes=[];

    let atual=null;

    linhas.forEach(linha=>{

        if(ehData(linha)){

            atual={
                data:linha,
                linhas:[]
            };

            secoes.push(atual);

            return;
        }

        if(atual){

            atual.linhas.push(linha);

        }

    });

    return secoes;

}

function separarJogos(linhas){

    const jogos = [];

    let jogoAtual = [];

    for(let i=0;i<linhas.length;i++){

        const linha = linhas[i];

        //---------------------------------------
        // Novo jogo
        //---------------------------------------

        if(lerInicioJogo(linha)){

            if(jogoAtual.length){

                jogos.push(jogoAtual);

            }

            jogoAtual = [];

        }

        if(jogoAtual){

            jogoAtual.push(linha);

        }

    }

    if(jogoAtual.length){

        jogos.push(jogoAtual);

    }

    return jogos;

}

function interpretarJogo(
    data,
    linhasJogo,
    nomeTime
) {

    const inicio = lerInicioJogo(linhasJogo[0]);

    if (!inicio)
        return;

    //------------------------------------
    // Horário
    //------------------------------------

    const horario = inicio.horario;

    //------------------------------------
    // Competição
    //------------------------------------

    let indice = 1;

    const linhasCompeticao = [];

    if(inicio.competicao){

        linhasCompeticao.push(inicio.competicao);
    
    }

    while (
        indice < linhasJogo.length &&
        !ehPlacar(linhasJogo[indice])
    ) {

        // se a próxima linha for placar,
        // esta linha é o mandante

        if (
            indice + 1 < linhasJogo.length &&
            ehPlacar(linhasJogo[indice + 1])
        ) {
            break;
        }

        linhasCompeticao.push(linhasJogo[indice]);
        indice++;
    }

    const competicao =
        normalizarCompeticao(linhasCompeticao);

    //------------------------------------
    // Times
    //------------------------------------

    if (indice + 2 >= linhasJogo.length)
        return;

    const mandante = linhasJogo[indice++];
    const placar = linhasJogo[indice++];
    const visitante = linhasJogo[indice++];

    //------------------------------------
    // Extras
    //------------------------------------

    const extras = linhasJogo.slice(indice);

    return salvarJogo(
        data,
        horario,
        competicao,
        mandante,
        placar,
        visitante,
        extras,
        nomeTime
    );

}

function descobrirTatica(extras) {

    if (extras.length === 0)
        return "Sem tática";

    if (extras.length === 1)
        return extras[0];

    return extras.join(" ");

}

function detectarTimePrincipal(texto) {

    texto = normalizarTexto(texto);

    const linhas = texto.split("\n");

    const contagem = {};

    for (let i = 1; i < linhas.length - 1; i++) {

        if (!ehPlacar(linhas[i]))
            continue;

        const mandante = linhas[i - 1];
        const visitante = linhas[i + 1];

        contagem[mandante] = (contagem[mandante] || 0) + 1;
        contagem[visitante] = (contagem[visitante] || 0) + 1;
    }

    let nome = "";
    let maior = 0;

    for (const [time, quantidade] of Object.entries(contagem)) {

        if (quantidade > maior) {
            maior = quantidade;
            nome = time;
        }

    }

    return nome;

}

function normalizarCompeticao(partes){

    return partes
        .join(" ")
        .replace(/\s+/g," ")
        .replace(/\s*»\s*/g," » ")
        .trim();

}

function normalizarTexto(texto) {

    return texto

        // espaços especiais
        .replace(/\u00A0/g, " ")

        // zero width spaces
        .replace(/[\u200B-\u200D\uFEFF]/g, "")

        // quebra Windows
        .replace(/\r/g, "")

        // tabs
        .replace(/\t/g, " ")

        // espaços duplicados
        .replace(/[ ]+/g, " ")

        // normaliza linhas
        .split("\n")
        .map(l => l.trim())

        // remove linhas vazias
        .filter(l => l !== "")

        .join("\n");

}

function ehHorario(linha){

    return /^\d{2}:\d{2}$/.test(linha)
        ||
        /^\d{2}:\d{2}\s*-/.test(linha);

}

function ehData(linha){

    return /^\d{2}-\d{2}-\d{4}$/.test(linha);

}

function ehPlacar(linha){

    return /^\d+\s*-\s*\d+$/.test(linha);

}

function lerInicioJogo(linha){

    let match = linha.match(
        /^(\d{2}:\d{2})\s*-\s*(.+)$/
    );

    if(match){

        return{

            horario:match[1],
        
            competicao:match[2].trim(),
        
            mobile:true
        
        };

    }

    match = linha.match(/^(\d{2}:\d{2})$/);

    if(match){

        return{

            horario:match[1],
        
            competicao:null,
        
            mobile:false
        
        };

    }

    return null;

}

function salvarJogo(
    data,
    horario,
    competicao,
    mandante,
    placar,
    visitante,
    extras,
    nomeTime
){

    const tatica = descobrirTatica(extras);

    //--------------------------------------
    // Placar
    //--------------------------------------

    const partes = placar.split(/\s*-\s*/);

    const golsMandante = Number(partes[0]);
    const golsVisitante = Number(partes[1]);

    //--------------------------------------
    // Time analisado
    //--------------------------------------

    let golsPro;
    let golsContra;
    let emCasa;

    if(mandante === nomeTime){

        golsPro = golsMandante;
        golsContra = golsVisitante;
        emCasa = true;

    }
    else if(visitante === nomeTime){

        golsPro = golsVisitante;
        golsContra = golsMandante;
        emCasa = false;

    }
    else{

        return null;

    }

    //--------------------------------------
    // Resultado
    //--------------------------------------

    let resultado = "E";

    if(golsPro > golsContra)
        resultado = "V";

    else if(golsPro < golsContra)
        resultado = "D";

    //--------------------------------------
    // Objeto
    //--------------------------------------

    return{

        data,

        horario,

        competicao,

        tatica,

        mandante,

        visitante,

        emCasa,

        golsMandante,

        golsVisitante,

        golsPro,

        golsContra,

        resultado

    };

}