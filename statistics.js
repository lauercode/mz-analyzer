function calcularEstatisticas(jogos) {
    const estatisticas = {
        total: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        golsPro: 0,
        golsContra: 0,
        aproveitamento: 0,
        mediaGP: 0,
        mediaGC: 0,
        saldo: 0,
        taticas: {}
    };

    const casa = criarResumoLocal();
    const fora = criarResumoLocal();

    jogos.forEach(jogo => {
        const resumo = jogo.emCasa ? casa : fora;
        resumo.jogos++;
        resumo.golsPro += jogo.golsPro;
        resumo.golsContra += jogo.golsContra;

        if (jogo.resultado === "V") {
            resumo.vitorias++;
        } else if (jogo.resultado === "E") {
            resumo.empates++;
        } else {
            resumo.derrotas++;
        }

        estatisticas.total++;
        estatisticas.golsPro += jogo.golsPro;
        estatisticas.golsContra += jogo.golsContra;

        switch (jogo.resultado) {
            case "V":
                estatisticas.vitorias++;
                break;
            case "E":
                estatisticas.empates++;
                break;
            case "D":
                estatisticas.derrotas++;
                break;
        }

        //-----------------------------------------
        // Tática
        //-----------------------------------------

        if (!estatisticas.taticas[jogo.tatica]) {
            estatisticas.taticas[jogo.tatica] = {
                jogos:0,
                vitorias:0,
                empates:0,
                derrotas:0,
                golsPro:0,
                golsContra:0,
                aproveitamento:0
            };
        }

        const cat = estatisticas.taticas[jogo.tatica];
        cat.jogos++;
        cat.golsPro += jogo.golsPro;
        cat.golsContra += jogo.golsContra;

        if (jogo.resultado === "V") cat.vitorias++;
        if (jogo.resultado === "E") cat.empates++;
        if (jogo.resultado === "D") cat.derrotas++;
    });

    //-----------------------------------------
    // Estatísticas gerais
    //-----------------------------------------

    estatisticas.saldo =
        estatisticas.golsPro -
        estatisticas.golsContra;

    if (estatisticas.total > 0) {
        estatisticas.mediaGP = 
            (estatisticas.golsPro/estatisticas.total).toFixed(2);
        estatisticas.mediaGC = 
            (estatisticas.golsContra/estatisticas.total).toFixed(2);
        estatisticas.aproveitamento = 
            (
                estatisticas.vitorias*3+
                estatisticas.empates
            )/
            (estatisticas.total*3)*100;
    }

    //-----------------------------------------
    // Estatísticas Casa x Fora
    //-----------------------------------------

    [casa, fora].forEach(r => {
        r.saldo = r.golsPro - r.golsContra;
    
        r.aproveitamento =
            r.jogos===0
            ?0
            :(r.vitorias*3+r.empates)*100/(r.jogos*3);
    });

    estatisticas.casa = casa;
    estatisticas.fora = fora;
    
    //-----------------------------------------
    // Aproveitamento por tática
    //-----------------------------------------

    Object.values(estatisticas.taticas).forEach(cat => {
        cat.aproveitamento = 
            (
                cat.vitorias*3+
                cat.empates
            )/
            (cat.jogos*3)*100;
    });

    return estatisticas;
}

function ordenarTaticas(taticas) {
    return Object.entries(taticas).sort((a,b) => {
        if (b[1].jogos !== a[1].jogos) {
            return b[1].jogos-a[1].jogos;
        }

        return a[0].localeCompare(b[0]);
    });
}

function percentual(v, total) {
    if (total === 0) return "0.0";

    return ((v/total)*100).toFixed(1);
}

function gerarResumoResultados(est) {
    return {
        labels:["Vitórias", "Empates", "Derrotas"],
        valores:[
            est.vitorias,
            est.empates,
            est.derrotas
        ]
    };
}

function gerarResumoTaticas(est) {
    const taticas = ordenarTaticas(est.taticas);

    return {
        labels:taticas.map(c => c[0]),
        jogos:taticas.map(c => c[1].jogos),
        vitorias:taticas.map(c => c[1].vitorias),
        aproveitamento:taticas.map(c => 
            Number(c[1].aproveitamento.toFixed(1))
        )
    };
}

function gerarResumoGols(est) {
    return {
        labels:["Gols Pró", "Gols Contra"],
        valores:[
            est.golsPro,
            est.golsContra
        ]
    };
}

function criarResumoLocal() {
    return {
        jogos:0,
        vitorias:0,
        empates:0,
        derrotas:0,
        golsPro:0,
        golsContra:0,
        saldo:0,
        aproveitamento:0
    };
}