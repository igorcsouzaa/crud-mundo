CREATE DATABASE bd_mundo;
USE bd_mundo;

CREATE TABLE paises (
    id_pais INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    continente VARCHAR(50),
    populacao INT,
    idioma VARCHAR(50)
);

CREATE TABLE cidades (
    id_cidade INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    populacao INT,
    id_pais INT,
    FOREIGN KEY (id_pais) REFERENCES paises(id_pais)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);