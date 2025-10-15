<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "reserva_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["erro" => "Falha na conexão: " . $conn->connect_error]));
}
$conn->set_charset("utf8");
?>
