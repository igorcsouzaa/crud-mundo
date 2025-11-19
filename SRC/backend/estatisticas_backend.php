<?php
header('Content-Type: application/json');
require_once 'config.php';

$response = ['success' => false, 'message' => 'Requisição inválida.'];

try {
    $mysqli = conectar_db();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = [];
    }

    $action = $input['action'] ?? ($_POST['action'] ?? null);

    if ($action) {
        switch ($action) {
            case 'cidade_mais_populosa_por_pais':
                // pega a cidade mais populosa de cada país
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
                $result      = $mysqli->query($sql);
                $estatisticas = $result->fetch_all(MYSQLI_ASSOC);

                $response = ['success' => true, 'data' => $estatisticas];
                break;

            case 'total_cidades_por_continente':
                // total de cidades por continente
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
                $result      = $mysqli->query($sql);
                $estatisticas = $result->fetch_all(MYSQLI_ASSOC);

                $response = ['success' => true, 'data' => $estatisticas];
                break;

            default:
                $response['message'] = 'Ação não reconhecida.';
                break;
        }
    }
} catch (\mysqli_sql_exception $e) {
    $response['message'] = 'Erro no banco de dados: ' . $e->getMessage();
}

echo json_encode($response);
