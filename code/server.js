import CreateServerFTP from "./serverftp.js";


let inicial_time;
let int_pcounter = 1000 * 60;
let serverFTP = null;
let serverFtpStatus = 'inativo';

let last_n = 0;
let last_platesPM = 0;
let last_platesPRF = 0;

let passagens1minuto = global.numberOfPassagens;
let platesToPM1minuto = global.platesSentToPM;
let platesToPRF1minuto = global.platesSentToPRF;


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

function startFTPServer(){
  if (serverFtpStatus === 'inativo'){
    serverFTP = new CreateServerFTP(1);
    serverFTP.start();
    serverFTP.listen();
    serverFtpStatus = 'ativo';
    let interval_pcounter = setInterval(countPlates, int_pcounter, true);
  }
  else{
    console.log('\n Servidor FTP já está ativo.');
  }
}

inicial_time = Date.now();
console.log("Iniciando redirecionadorFTP");
startFTPServer();
