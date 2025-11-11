import FtpSrv from 'ftp-srv';
import bunyan from 'bunyan';
import { imgFTP_path, urlFTP, pasvFTP, pasv_min, pasv_max } from './config.js';
import { sendfileFTP } from './sendFTP.js';

global.numberOfPassagens = 0;

const logger1 = bunyan.createLogger({
    name: 'ftp-srv',
    level: 100,  // Nível extremamente alto que não será atingido
    streams: [{ 
      level: 100,
      stream: { write: () => {} }  // Stream que não faz nada
    }]
  });

const logger2 = bunyan.createLogger({
    name: 'ftp-srv',
    streams: [{ 
      level: 'trace',
      stream: process.stdout  
    }]
  });

export class CreateServerFTP{

    constructor(log){
        this.isFTPlogOn = false;
        this.logger = logger1;
        if(log === 0) {
            this.logger = logger1;
            this.isFTPlogOn = false;
        }
        else if(log === 1){
            this.logger = logger1;
            this.isFTPlogOn = false;
        }
        else if(log === 2){
            this.logger = logger2;
            this.isFTPlogOn = true;
        }

        this.ftpServer = new FtpSrv({
            url: urlFTP, // Escutando em todas as interfaces
            pasv_url: pasvFTP,   // IP para modo passivo (se necessário)
            anonymous: false,          // Conexões anônimas desativadas
            log: this.logger,
            pasv_min: pasv_min,
            pasv_max: pasv_max
        });
        
        this.log = log;
        this.img_ftp = imgFTP_path;
        
    }
    
    enableLog(level){
        this.log = level;
        let resplevel;
        if(level === 0 || level === 1) {
            if(level === 0) resplevel = 'desativado';
            else resplevel = 'ativado nível 1';

            console.log(`\n Log FTP ${resplevel}.`);
            if (this.isFTPlogOn){
                this.logger = logger1;
                this.isFTPlogOn = false;
                this.restart();
            }   
        }
        else{
            resplevel = 'ativado nível 2';
            console.log(`\n Log FTP ${resplevel}.`);
            if(!this.isFTPlogOn){
                this.isFTPlogOn = true;
                this.logger = logger2;
                this.restart();   
            }
        }
    }

    start(){
        this.ftpServer.on('login', ({ connection, username, password }, resolve, reject) => {
            // Autenticação simples (aceita admin/password)
            if (username === 'admin' && password === 'wni') {
                // Defina o diretório raiz para upload/download
                resolve({ root: this.img_ftp });
            } else {
                reject(new Error('Credenciais inválidas'));
            }
            connection.on('error', (error) => {
                console.error('Erro no servidor FTP:', error);
              });
            connection.on('STOR', (error, fileName) =>{
                if(error){
                    console.log(error);
                }
                if(this.log === 1 || this.log === 2){
                    console.log("\n Novo arquivo recebido:" ,fileName);    
                }
                if (typeof fileName !== 'string' || !fileName){
                    console.error("Caminho invalido recebido");
                    return; 
                }
                sendfileFTP(fileName)
            })
        });
    }

    restart(){
        this.close();
        setTimeout(()=>{
            this.ftpServer = new FtpSrv({
            url: urlFTP, // Escutando em todas as interfaces
            pasv_url: pasvFTP,   // IP para modo passivo (se necessário)
            anonymous: false,          // Conexões anônimas desativadas
            log: this.logger,
            pasv_min: pasv_min,
            pasv_max: pasv_max
        });
            this.start();
            this.listen();
        }, 3000)

    };
  
    listen(){
        this.ftpServer.listen().then(() => {
            console.log(`\n Servidor FTP rodando`);
        })
        .catch(err => {
            console.error('\n Erro ao iniciar o servidor FTP:', err);
        });
    }
    close(){
        this.ftpServer.close()
    }
}

export default CreateServerFTP;

