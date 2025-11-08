-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS bd_mundo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bd_mundo;

-- Tabela de Países
CREATE TABLE IF NOT EXISTS paises (
    id_pais INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    continente VARCHAR(50) NOT NULL,
    populacao BIGINT NOT NULL,
    idioma VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Cidades
CREATE TABLE IF NOT EXISTS cidades (
    id_cidade INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    populacao BIGINT NOT NULL,
    id_pais INT NOT NULL,
    FOREIGN KEY (id_pais) REFERENCES paises(id_pais) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uk_cidade_pais (nome, id_pais)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserção de dados de exemplo
INSERT INTO paises (nome, continente, populacao, idioma) VALUES
('Brasil', 'América do Sul', 214000000, 'Português'),
('Estados Unidos', 'América do Norte', 332000000, 'Inglês'),
('Japão', 'Ásia', 125000000, 'Japonês'),
('França', 'Europa', 67000000, 'Francês');

INSERT INTO cidades (nome, populacao, id_pais) VALUES
('São Paulo', 12396000, 1),
('Rio de Janeiro', 6718000, 1),
('Nova York', 8419000, 2),
('Los Angeles', 3899000, 2),
('Tóquio', 13960000, 3),
('Osaka', 2752000, 3),
('Paris', 2141000, 4),
('Marselha', 861600, 4);
