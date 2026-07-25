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

        const horario = inicio.horario;
        i++;

        //---------------------------------------
        // COMPETIÇÃO
        //---------------------------------------

        const linhasCompeticao = [];

        while (i < linhas.length - 2) {

            // encontrou início do próximo jogo
            if (ehData(linhas[i]))
                break;

            if (lerInicioJogo(linhas[i]))
                break;

            // padrão:
            // Time
            // 0 - 0
            // Outro Time

            if (
                i + 2 < linhas.length &&
                ehPlacar(linhas[i + 1])
            ) {
                break;
            }

            linhasCompeticao.push(linhas[i]);
            i++;
        }

        const competicao =
            normalizarCompeticao(linhasCompeticao);

        //---------------------------------------
        // TIMES
        //---------------------------------------

        if (i + 2 >= linhas.length)
            break;

        const mandante = linhas[i++];
        const placar = linhas[i++];
        const visitante = linhas[i++];

        const leituraExtras=
            lerInformacoesExtras(linhas,i);

        i=leituraExtras.indice;

        const extras=leituraExtras.extras;

        const tatica=
            descobrirTatica(extras);

        const categoria=
            descobrirCategoria(extras);

        if (!ehPlacar(placar))
            continue;
    
        //---------------------------------------
        // TÁTICA (OPCIONAL)
        //---------------------------------------
    

        while (i < linhas.length) {

            if (ehData(linhas[i]))
                break;

            if (lerInicioJogo(linhas[i]))
                break;

            if (ehCompeticaoLinha(linhas[i]))
                break;

            tatica = linhas[i];
            i++;
            break;
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
    
        if (gp > gc) {
            resultado = "V";
        } else if (gp < gc) {
            resultado = "D";
        }
    
        const emCasa = mandante === nomeTime;

        //---------------------------------------
        // SALVA O JOGO
        //---------------------------------------
    
        jogos.push({

            data:dataAtual,
        
            horario,
        
            competicao,
        
            categoria,
        
            tatica,
        
            mandante,
        
            visitante,
        
            emCasa,
        
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

function normalizarTexto(texto) {

    return texto
        .replace(/\u00A0/g, " ")  // espaços especiais
        .replace(/\r/g, "")       // quebras Windows
        .replace(/\t/g, " ")      // tabs
        .replace(/[ ]+/g, " ")    // remove espaços repetidos
        .replace(/\n{2,}/g, "\n") // remove linhas vazias repetidas
        .trim();
}

function ehPlacar(linha) {
    return /^\d+\s*-\s*\d+$/.test(linha);
}

function ehHorario(linha) {
    return /^\d{2}:\d{2}$/.test(linha);
}

function ehData(linha) {
    return /^\d{2}-\d{2}-\d{4}$/.test(linha);
}

function ehCategoria(linha) {
    return /^(PC|U18|U21|U23|A JPL)$/i.test(linha);
}

function ehCompeticao(linha) {
    const texto = linha.toUpperCase();

    return [
        "LIGA",
        "COPA",
        "AMISTOSO",
        "OLHEIRO",
        "CONFRONTO",
        "MUNDIAL",
        "PREMIADAS"
    ].some(palavra => texto.includes(palavra));
}

function lerCompeticao(linhas, indice) {

    const partes = [];

    while (indice < linhas.length) {

        const linha = linhas[indice];

        // Encontrou o início do jogo (nome do mandante)
        if (
            !ehData(linha) &&
            !lerInicioJogo(linha) &&
            indice + 1 < linhas.length &&
            /^\d+\s*-\s*\d+$/.test(linhas[indice + 1])
        ) {
            break;
        }

        partes.push(linha);
        indice++;
    }

    return {
        competicao: partes.join(" "),
        indice
    };
}

function lerInicioJogo(linha) {
    // Formato mobile
    let match = linha.match(/^(\d{2}:\d{2})\s*-\s*(.+)$/);

    if (match) {
        return {
            horario:match[1],
            competicao:match[2],
            mobile:true
        };
    }

    // Formato desktop
    match = linha.match(/^(\d{2}:\d{2})$/);

    if (match) {
        return {
            horario:match[1],
            competicao:null,
            mobile:false
        };
    }

    return null;
}

function normalizarCompeticao(linhas) {

    return linhas
        .join(" ")
        .replace(/\s+/g," ")
        .trim();

}

function lerInformacoesExtras(linhas, indice){

    const extras=[];

    while(indice<linhas.length){

        const linha=linhas[indice];

        if(ehData(linha))
            break;

        if(ehHorario(linha))
            break;

        if(
            indice+1<linhas.length &&
            ehPlacar(linhas[indice+1])
        )
            break;

        extras.push(linha);

        indice++;
    }

    return{
        extras,
        indice
    };

}

function descobrirTatica(extras){

    if(extras.length===0)
        return "Sem tática";

    return extras[0];

}

function descobrirCategoria(extras){

    const categorias=[
        "PC",
        "U18",
        "U21",
        "U23",
        "A",
        "A JPL"
    ];

    return extras.find(e=>categorias.includes(e))
        || "";

}