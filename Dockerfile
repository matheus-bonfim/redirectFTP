# Imagem base oficial do Node.js
FROM node:22.14

# Cria e define o diretório de trabalho dentro do container
WORKDIR /redirectftp

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Expõe as portas que seu app vai usar
EXPOSE 5000
EXPOSE 2121



