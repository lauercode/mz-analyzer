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

    jogos.forEach(jogo => {
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

function ordenarTaticas(tatica) {
    const ordem = [
        "PC",
        "U18",
        "U18e19",
        "U21",
        "U23"
    ];

    return Object.entries(tatica)
        .sort((a,b) => {
            const ia = ordem.indexOf(a[0]);
            const ib = ordem.indexOf(b[0]);

            if (ia === -1 && ib === -1) {
                return a[0].localeCompare(b[0]);
            }

            if (ia === -1) return 1;

            if (ib === -1) return -1;

            return ia-ib;
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