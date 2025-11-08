<?php
// Arquivo: crud_mundo/backend/estatisticas_backend.php
header('Content-Type: application/json');
require_once 'config.php';

$response = ['success' => false, 'message' => 'Requisição inválida.'];

if (isset($_GET['action'])) {
    $action = $_GET['action'];
    $pdo = conectar_db();

    try {
        switch ($action) {
            case 'cidade_mais_populosa_por_pais':
                // A cidade mais populosa de cada país
                $sql = "
                    SELECT
                        p.nome AS nome_pais,
                        c.nome AS nome_cidade,
                        c.populacao
                    FROM
                        paises p
                    JOIN
                        cidades c ON p.id_pais = c.id_pais
                    WHERE
                        (c.id_pais, c.populacao) IN (
                            SELECT
                                id_pais,
                                MAX(populacao)
                            FROM
                                cidades
                            GROUP BY
                                id_pais
                        )
                    ORDER BY
                        p.nome ASC;
                ";
                $stmt = $pdo->query($sql);
                $estatisticas = $stmt->fetchAll();
                $response = ['success' => true, 'data' => $estatisticas];
                break;

            case 'total_cidades_por_continente':
                // Total de cidades cadastradas por continente
                $sql = "
                    SELECT
                        p.continente,
                        COUNT(c.id_cidade) AS total_cidades
                    FROM
                        paises p
                    JOIN
                        cidades c ON p.id_pais = c.id_pais
                    GROUP BY
                        p.continente
                    ORDER BY
                        total_cidades DESC;
                ";
                $stmt = $pdo->query($sql);
                $estatisticas = $stmt->fetchAll();
                $response = ['success' => true, 'data' => $estatisticas];
                break;

            default:
                $response['message'] = 'Ação não reconhecida.';
                break;
        }
    } catch (\PDOException $e) {
        $response['message'] = 'Erro no banco de dados: ' . $e->getMessage();
    }
}

echo json_encode($response);
?>
