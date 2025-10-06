import ftp from 'basic-ftp';
import { clientFTPConfig } from './config.js';
import { clientFTP_logEnable } from './config.js';
import path from 'path';
import fs from 'fs/promises';


function getPonto(fileName){
    try{
        const p = fileName.split('_');
        const ponto = p[0] + '_' + p[1];
	console.log(`O ponto é: ${ponto}`);
        return ponto;
    }
    catch{
        return null;
    }
}

export async function sendfileFTP(filePath) {
    const client = new ftp.Client();
    client.ftp.verbose = clientFTP_logEnable.enable; // Opcional: log detalhado no console

    try {
        const file_basename = path.basename(filePath);
        if(file_basename !== 'DVRWorkDirectory'){
            const ponto = getPonto(file_basename);
	    
        if(ponto){
            const newPathfile = path.join(ponto, file_basename);
                    await client.access(clientFTPConfig);
            await client.uploadFrom(filePath, newPathfile);
                    console.log("Arquivo enviado com sucesso!");
                    global.numberOfPassagens++;
            }
        }
        
    } catch (err) {
        console.error("Erro ao enviar:", err);
    }
     finally{
	    await excludeFile(filePath);
}
    client.close();
}


async function excludeFile(filePath){
    
    try{
        await fs.unlink(filePath);
        console.log(`Arquivo local '${filePath}' excluído com sucesso.`);
    }  
    catch (err) {
        console.error(`Erro ao tentar excluir o arquivo '${filePath}':`, err.message);
    }
    
}

    
