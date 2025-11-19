<?php
header('Content-Type: application/json');
require_once 'config.php';

$response = ['success' => false, 'message' => 'Requisição inválida.'];

try {
    $mysqli = conectar_db();

    // pega o corpo JSON enviado via POST
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = [];
    }

    // action vem no JSON (principal) ou no POST normal
    $action = $input['action'] ?? ($_POST['action'] ?? null);

    if ($action) {
        switch ($action) {
            case 'read':
                // lista todas as cidades com o nome do país
                $sql = "
                    SELECT
                        c.*,
                        p.nome AS nome_pais
                    FROM
                        cidades c
                    JOIN
                        paises p ON c.id_pais = p.id_pais
                    ORDER BY
                        c.nome ASC
                ";
                $result  = $mysqli->query($sql);
                $cidades = $result->fetch_all(MYSQLI_ASSOC);

                $response = ['success' => true, 'data' => $cidades];
                break;

            case 'read_by_country':
                // lista cidades de um país específico
                $id_pais = isset($input['id_pais'])
                    ? (int)$input['id_pais']
                    : (isset($_POST['id_pais']) ? (int)$_POST['id_pais'] : null);

                if ($id_pais) {
                    $stmt = $mysqli->prepare(
                        "SELECT * FROM cidades WHERE id_pais = ? ORDER BY nome ASC"
                    );
                    $stmt->bind_param('i', $id_pais);
                    $stmt->execute();
                    $result  = $stmt->get_result();
                    $cidades = $result->fetch_all(MYSQLI_ASSOC);

                    $response = ['success' => true, 'data' => $cidades];
                }
                break;

            case 'create':
                // cadastra nova cidade
                $data = $input;

                if ($data && isset($data['nome'], $data['populacao'], $data['id_pais'])) {
                    $sql  = "INSERT INTO cidades (nome, populacao, id_pais) VALUES (?, ?, ?)";
                    $stmt = $mysqli->prepare($sql);

                    $nome      = $data['nome'];
                    $populacao = (int)$data['populacao'];
                    $id_pais   = (int)$data['id_pais'];

                    $stmt->bind_param('sii', $nome, $populacao, $id_pais);
                    $stmt->execute();

                    $response = [
                        'success' => true,
                        'message' => 'Cidade cadastrada com sucesso!',
                        'id'      => $mysqli->insert_id
                    ];
                }
                break;

            case 'update':
                // atualiza uma cidade existente
                $data = $input;

                if (
                    $data &&
                    isset($data['id_cidade'], $data['nome'], $data['populacao'], $data['id_pais'])
                ) {
                    $sql = "
                        UPDATE cidades
                           SET nome = ?, populacao = ?, id_pais = ?
                         WHERE id_cidade = ?
                    ";
                    $stmt = $mysqli->prepare($sql);

                    $nome      = $data['nome'];
                    $populacao = (int)$data['populacao'];
                    $id_pais   = (int)$data['id_pais'];
                    $id_cidade = (int)$data['id_cidade'];

                    $stmt->bind_param('siii', $nome, $populacao, $id_pais, $id_cidade);
                    $stmt->execute();

                    $response = ['success' => true, 'message' => 'Cidade atualizada com sucesso!'];
                }
                break;

            case 'delete':
                // exclui uma cidade
                $id_cidade = isset($input['id_cidade'])
                    ? (int)$input['id_cidade']
                    : (isset($_POST['id_cidade']) ? (int)$_POST['id_cidade'] : null);

                if ($id_cidade) {
                    $stmt = $mysqli->prepare("DELETE FROM cidades WHERE id_cidade = ?");
                    $stmt->bind_param('i', $id_cidade);
                    $stmt->execute();

                    if ($stmt->affected_rows > 0) {
                        $response = ['success' => true, 'message' => 'Cidade excluída com sucesso!'];
                    } else {
                        $response = ['success' => false, 'message' => 'Cidade não encontrada para exclusão.'];
                    }
                }
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
