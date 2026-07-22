const NOME_TIME = "LauerArmy";

function parseManagerZone(texto){

    const linhas = texto
        .split(/\r?\n/)
        .map(l=>l.trim())
        .filter(l=>l!="");

    const jogos=[];

    let dataAtual="";

    for(let i=0;i<linhas.length;i++){

        const linha=linhas[i];

        // -----------------------
        // DATA
        // -----------------------

        if(/^\d{2}-\d{2}-\d{4}$/.test(linha)){
            dataAtual=linha;
            continue;
        }

        // -----------------------
        // HORÁRIO
        // -----------------------

        if(!/^\d{2}:\d{2}$/.test(linha))
            continue;

        const horario=linha;

        if(i+6>=linhas.length)
            continue;

        const campeonato=linhas[i+1];

        const time1=linhas[i+2];

        const placar=linhas[i+3];

        const time2=linhas[i+4];

        const categoria=linhas[i+5];

        //--------------------------------------------------

        if(!placar.match(/^\d+\s*-\s*\d+$/))
            continue;

        //--------------------------------------------------

        const gols=placar.split("-");

        const golsCasa=parseInt(gols[0]);

        const golsFora=parseInt(gols[1]);

        //--------------------------------------------------

        let resultado="";

        let gp=0;

        let gc=0;

        if(time1===NOME_TIME){

            gp=golsCasa;
            gc=golsFora;

        }else if(time2===NOME_TIME){

            gp=golsFora;
            gc=golsCasa;

        }else{

            continue;

        }

        if(gp>gc)
            resultado="V";
        else if(gp<gc)
            resultado="D";
        else
            resultado="E";

        //--------------------------------------------------

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