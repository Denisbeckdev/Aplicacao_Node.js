const readline = require('readline');
const fs = require('fs').promises;
const EventEmitter = require('events');

const eventEmitter = new EventEmitter();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function processarArquivo(caminhoArquivo) {
    console.time('tempoExecucao');

    try {
        const conteudo = await fs.readFile(caminhoArquivo, 'utf-8');
        const linhas = conteudo.split('\n');

        let contagemLinhasNumeros = 0;
        let somaNumerosLinhasNumeros = 0;
        let contagemLinhasTexto = 0;

        linhas.forEach((linha) => {
            linha = linha.trim();

            if (/^-?\d+(\.\d+)?$/.test(linha)) {
                contagemLinhasNumeros++;
                somaNumerosLinhasNumeros += parseFloat(linha);
            } else if (linha.length > 0) {
                contagemLinhasTexto++;
            }
        });

        eventEmitter.emit('resumo', somaNumerosLinhasNumeros, contagemLinhasTexto, contagemLinhasNumeros);

    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error('Erro: O caminho do arquivo não existe. Verifique o caminho e tente novamente.');
        } else {
            console.error('Erro ao ler arquivo: ', err);
        }
        console.timeEnd('tempoExecucao');
        rl.question('Digite o caminho do arquivo .txt: ', (novoCaminhoArquivo) => {
            processarArquivo(novoCaminhoArquivo);
        });
        return;
    }

    console.timeEnd('tempoExecucao');
    perguntaFinal();
}

eventEmitter.on('resumo', (somaNumerosLinhasNumeros, contagemLinhasTexto, contagemLinhasNumeros) => {
    console.log('--- Resumo ---');
    const resumo = [
        { 'Descrição': 'Soma dos números dentro deste arquivo', 'Valor': somaNumerosLinhasNumeros },
        { 'Descrição': 'Quantas linhas possuem somente números', 'Valor': contagemLinhasNumeros },
        { 'Descrição': 'Quantas linhas possuem texto', 'Valor': contagemLinhasTexto }
    ];
    console.table(resumo);
});

function perguntaFinal() {
    rl.question('Deseja executar novamente? (s/n): ', (resposta) => {
        if (resposta.toLowerCase() === 's') {
            rl.question('Digite o caminho do arquivo .txt: ', (caminhoArquivo) => {
                processarArquivo(caminhoArquivo);
            });
        } else {
            console.log('Programa finalizado');
            rl.close();
        }
    });
}

// Inicializar o prompt para o caminho do arquivo
rl.question('Digite o caminho do arquivo .txt: ', (caminhoArquivo) => {
    processarArquivo(caminhoArquivo);
});
