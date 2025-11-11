# Imagem base oficial do Node.js
FROM node:22.14

# Cria e define o diretório de trabalho dentro do container
WORKDIR /redirectFTP

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

EXPOSE 2121

CMD ["node", "./code/server.js"]

