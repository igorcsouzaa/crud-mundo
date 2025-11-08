<?php
// Arquivo: crud_mundo/backend/config.php

// Configurações do Banco de Dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'bd_mundo');
define('DB_USER', 'root'); // Altere para o usuário do seu banco de dados
define('DB_PASS', ''); // Altere para a senha do seu banco de dados

/**
 * Função para estabelecer a conexão com o banco de dados usando PDO.
 * @return PDO Objeto de conexão PDO.
 */
function conectar_db() {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (\PDOException $e) {
        // Em um ambiente de produção, você deve logar o erro e mostrar uma mensagem genérica.
        // Para fins de desenvolvimento, exibimos o erro.
        die("Erro de Conexão com o Banco de Dados: " . $e->getMessage());
    }
}

// Opcional: Função para criar o banco de dados se ele não existir (útil para setup)
function setup_db() {
    // Esta função é mais complexa e geralmente é feita manualmente ou por um script de migração.
    // Para o escopo deste projeto, assumimos que o banco de dados 'bd_mundo' será criado
    // e o script 'bd_mundo.sql' será executado manualmente pelo usuário.
    // A função conectar_db() já tenta conectar ao banco de dados existente.
}
?>
