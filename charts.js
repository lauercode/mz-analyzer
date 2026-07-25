let graficoResultados = null;
let graficoTaticas = null;
let graficoGols = null;
let graficoPizza = null;
let graficoEvolucao = null;

function destruirGraficos() {
    if (graficoResultados) {
        graficoResultados.destroy();
        graficoResultados = null;
    }

    if (graficoTaticas) {
        graficoTaticas.destroy();
        graficoTaticas = null;
    }

    if (graficoGols) {
        graficoGols.destroy();
        graficoGols = null;
    }

    if (graficoPizza) {
        graficoPizza.destroy();
        graficoPizza = null;
    }

    if (graficoEvolucao) {
        graficoEvolucao.destroy();
        graficoEvolucao = null;
    }
}

function desenharGraficos(est) {
    destruirGraficos();
    desenharGraficoResultados(est);
    desenharGraficoTaticas(est);
    desenharGraficoGols(est);
    desenharGraficoPizza(est);
    desenharGraficoEvolucao(partidasFiltradas);
}

function desenharGraficoResultados(est) {
    const ctx = document
        .getElementById("graficoResultados")
        .getContext("2d");

    graficoResultados = new Chart(ctx, {
        type:"bar",
        data:{
            labels:["Vitórias", "Empates", "Derrotas"],
            datasets:[{
                label:"Quantidade",
                data:[
                    est.vitorias,
                    est.empates,
                    est.derrotas
                ]
            }]
        },
        options:{
            indexAxis:"y",
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:"Resultados Gerais",
                    font:{
                        size:18
                    }
                },
                legend:{
                    display:false
                }

            },
            scales:{
                y:{
                    beginAtZero:true
                }
            },
            backgroundColor:[
                "#22c55e",
                "#eab308",
                "#ef4444"
            ]
        }
    });
}

function desenharGraficoTaticas(est) {
    const taticas = ordenarTaticas(est.taticas);
    const labels = taticas.map(c=>c[0]);
    const jogos = taticas.map(c=>c[1].jogos);
    const ctx = document
        .getElementById("graficoTaticas")
        .getContext("2d");

    graficoTaticas = new Chart(ctx, {
        type:"bar",
        data:{
            labels,
            datasets:[{
                label:"Jogos",
                data:jogos
            }]
        },
        options:{
            indexAxis:"y",
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:"Jogos por Tática",
                    font:{
                        size:18
                    }
                }
            },
            scales:{
                y:{
                    beginAtZero:true
                }
            }
        }
    });
}

function desenharGraficoGols(est) {
    const ctx = document
        .getElementById("graficoGols")
        .getContext("2d");

    graficoGols = new Chart(ctx, {
        type:"bar",
        data:{
            labels:["Gols Pró","Gols Contra"],
            datasets:[{
                label:"Gols",
                data:[
                    est.golsPro,
                    est.golsContra
                ]
            }]
        },
        options:{
            indexAxis:"y",
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:"Gols Marcados x Sofridos",
                    font:{
                        size:18
                    }
                }
            },
            scales:{
                y:{
                    beginAtZero:true
                }
            },
            backgroundColor:[
                "#2563eb",
                "#ef4444"
            ]
        }
    });
}

function desenharGraficoPizza(est) {
    const ctx = document
        .getElementById("graficoPizza")
        .getContext("2d");

    graficoPizza = new Chart(ctx, {
        type:"pie",
        data:{
            labels:[
                "Vitórias",
                "Empates",
                "Derrotas"
            ],
            datasets:[{
                data:[
                    est.vitorias,
                    est.empates,
                    est.derrotas
                ]
            }]
        },
        options:{
            indexAxis:"y",
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:"Distribuição dos Resultados",
                    font:{
                        size:18
                    }
                }
            },
            backgroundColor:[
                "#22c55e",
                "#eab308",
                "#ef4444"
            ]
        }
    });
}

function desenharGraficoEvolucao(jogos) {
    if (graficoEvolucao) {
        graficoEvolucao.destroy();
    }

    const tipo = document.getElementById("tipoEvolucao").value;
    const labels = [];
    const valores = [];

    let pontos = 0;
    let saldo = 0;
    let gp = 0;
    let gc = 0;

    jogos.forEach((jogo,indice) => {
        labels.push(formatarData(jogo.data));

        gp += jogo.golsPro;
        gc += jogo.golsContra;
        saldo += jogo.golsPro - jogo.golsContra;

        if (jogo.resultado === "V") {
            pontos += 3;
        } else if (jogo.resultado === "E") {
            pontos += 1;
        }

        switch(tipo) {
            case "aproveitamento":
                valores.push(
                    pontos*100/((indice+1)*3)
                );
                break;
            case "saldo":
                valores.push(saldo);
                break;
            case "golsPro":
                valores.push(gp);
                break;
            case "golsContra":
                valores.push(gc);
                break;
        }
    });

    const titulo = {
        aproveitamento:"Aproveitamento (%)",
        saldo:"Saldo de gols",
        golsPro:"Gols Pró",
        golsContra:"Gols Contra"
    }[tipo];

    graficoEvolucao = new Chart(
        document.getElementById("graficoEvolucao"),
        {
            type:"line",
            data:{
                labels,
                datasets:[{
                    label:titulo,
                    data:valores,
                    tension:.25,
                    fill:false
                }]
            },
            options:{
                responsive:true,
                maintainAspectRatio:false,
                plugins:{
                    title:{
                        display:true,
                        text:titulo
                    }
                },
                scales:{
                    y:{
                        beginAtZero:true
                    }
                }
            }
        }
    );
}