import readline from 'readline';
import CreateServerFTP from "./serverftp.js";
import { clientFTP_logEnable } from './config.js';

let inicial_time, final_time;
let sendToPRF = false;
let sendToPM = false;

let interval_pns, interval_cif, interval_pcounter;
let int_pcounter = 1000 * 60;
let int_pns =   1000 * 60 * 5;
let int_cif = 1000 * 60 * 1 ;
let int_dod; // intervalo de x min para excluir imagens

let serverFTP = null;

let serverFtpStatus = 'inativo';

let last_n = 0;
let last_platesPM = 0;
let last_platesPRF = 0;

let passagens1minuto = global.numberOfPassagens;
let platesToPM1minuto = global.platesSentToPM;
let platesToPRF1minuto = global.platesSentToPRF;


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

// Lista de comandos disponíveis
const comandosDisponiveis = {
  'help': 'Lista os comandos disponíveis',
  'quit': 'Encerra o programa',
  'log-ftp [true or false]': 'Liga ou desliga os logs do servidor FTP', 
  'log-ftp-client [true or false]': 'Liga ou desliga os logs do cliente FTP',
  'start': 'Inicia todo o programa',
  'start-ftp': 'Inicia o servidor FTP',
  'status-ftp': 'Mostra o status atual do servidor FTP',
  'stop-ftp': 'Encerra servidor FTP',
};

function waitForPendingTasks() {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000); 
  });
}


function countPlates(minute=false){

    passagens1minuto = global.numberOfPassagens - last_n;
    platesToPM1minuto = global.platesSentToPM - last_platesPM;
    platesToPRF1minuto = global.platesSentToPRF - last_platesPRF;
    console.log("\n No último minuto:");
    console.log(`\n  Passagens recebidas: ${passagens1minuto}\n  Passagens enviadas a PM: ${platesToPM1minuto}\n  Passagens enviadas a PRF: ${platesToPRF1minuto}`);
    if(minute){
      last_n = global.numberOfPassagens;
      last_platesPM = global.platesSentToPM;
      last_platesPRF = global.platesSentToPRF;
    }
    
}



const showHelp = () => {
  console.log('\nComandos disponíveis:');
  for (const [cmd, desc] of Object.entries(comandosDisponiveis)) {
    console.log(`- ${cmd}: ${desc}`);
  }
  console.log('');
};



function startFTPServer(){
  if (serverFtpStatus === 'inativo'){
    serverFTP = new CreateServerFTP(sendToPRF, sendToPM, 1);
    serverFTP.start();
    serverFTP.listen();
    serverFtpStatus = 'ativo';
    interval_pcounter = setInterval(countPlates, int_pcounter, true);
  }
  else{
    console.log('\n Servidor FTP já está ativo.');
  }
}

async function stopFTPServer(clog=true){
  if (serverFtpStatus === 'ativo' && serverFTP){
    await serverFTP.close();
    console.log('\n Server FTP encerrado.');
    serverFtpStatus = 'inativo';
    serverFTP = null;
  }
  else if(clog){
    console.log('\n Server FTP já está inativo.')
  }
}


async function quit() {
  console.log('\n Encerrando o programa...');
  await stopFTPServer(false);
  final_time = Date.now();
  await waitForPendingTasks();
  const ex_time = (final_time - inicial_time) / 1000;
  if(!Number.isNaN(ex_time)){
    console.log(`\n Tempo de execução: ${ex_time} segundos`);
    console.log(`\n Número de passagens: ${global.numberOfPassagens} em ${ex_time} segundos`);
    console.log(`\n Passagens por segundo: ${global.numberOfPassagens/ex_time}`);
  }

  rl.close();
  process.exit(0);
}

console.log('\n Bem-vindo, digite "start" para iniciar o servidor.');
console.log('\n Digite "help" para ver os comandos disponíveis.');
rl.prompt();


rl.on('line', (input) => {
  
  const [comando, ...args] = input.trim().split(' ');

  switch (comando) {

    case 'status-ftp':
      console.log("\n----------------------------------------------------");
      console.log(`\n Status atual: ${serverFtpStatus}`);
      if(serverFtpStatus === 'ativo'){
        console.log(`\n Conexão com a PM: ${sendToPM ? 'ativada' : 'desativada'}`);
        console.log(`\n Conexão com a PRF: ${sendToPRF ? 'ativada' : 'desativada'}`);
        countPlates();
      }
      console.log("\n----------------------------------------------------");
      break;

    case 'help':
      showHelp();
      break;
    
    case 'start':
      inicial_time = Date.now();
      startFTPServer();
      break;

    case 'start-ftp':
      startFTPServer();
      break;
    
    case 'stop-ftp':
      stopFTPServer();
      break;

    case 'quit':
      quit();
      break;
    
    case 'log-ftp':
      if(serverFtpStatus === 'ativo'){
        if(args[0] === '0' || args[0] === '1' || args[0] === '2'){
          serverFTP.enableLog(parseInt(args[0]));
        }
        else{
          console.log("\n Argumento inválido. Argumentos aceitos: 'true' ou 'false'.");
        }  
      }
      else console.log("\n Server FTP inativo!");
  
      break;
    
    case 'log-ftp-client':
      if(serverFtpStatus === 'ativo'){
        if(args[0] === 'true'){
          clientFTP_logEnable.enable = true
        }
        else if(args[0] === 'false'){
          clientFTP_logEnable.enable = false
        }
        else{
          console.log("\n Argumento inválido. Argumentos aceitos: 'true' ou 'false'.");
        }  
      }
      else console.log("\n Server FTP inativo!");
  
      break;

    default:
      console.log('\n Comando não reconhecido. Digite "help" para ver os comandos disponíveis.');
      break;
  }

  rl.prompt();
});


rl.on('SIGINT', () => {
  console.log('\n Use o comando "quit" para encerrar o programa com segurança.');
  rl.prompt();
});
