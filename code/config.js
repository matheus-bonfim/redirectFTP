import { fileURLToPath } from 'url';
import path from 'path';



  ////////          NO VPN É 10.8.0.1     OKKKKKKKKKKKKKKKK

export const clientFTPConfig = {
            host: "189.4.2.61",
            port: 2120,
            user: "admin",
            password: "wni",
            secure: false // true se usar FTPS
        }

export const clientFTP_logEnable = {enable: false};

export const urlFTP = "ftp://0.0.0.0:2121";
export const pasvFTP = '10.8.0.41';
export const pasv_min = 44000;
export const pasv_max = 49000;

export const HTTP_PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const imgFTP_path = path.join(__dirname, '..', 'img_ftp');


