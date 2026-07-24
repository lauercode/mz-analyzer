let graficoResultados = null;
let graficoTaticas = null;
let graficoGols = null;
let graficoPizza = null;

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
}

function desenharGraficos(est) {
    destruirGraficos();
    desenharGraficoResultados(est);
    desenharGraficoTaticas(est);
    desenharGraficoGols(est);
    desenharGraficoPizza(est);
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
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:"Resultados Gerais"
                },
                legend:{
                    display:false
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
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:"Jogos por Tática"
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
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:"Gols Marcados x Sofridos"
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
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:"Distribuição dos Resultados"
                }
            }
        }
    });
}