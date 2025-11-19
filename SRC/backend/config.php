<?php
// Configurações do banco de dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'bd_mundo');
define('DB_USER', 'root');
define('DB_PASS', '');

// conexão usando mysqli
function conectar_db() {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($mysqli->connect_errno) {
        die("Erro de conexão com o banco: " . $mysqli->connect_error);
    }

    $mysqli->set_charset('utf8mb4');

    return $mysqli;
}
