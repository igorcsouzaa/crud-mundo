<?php
header('Content-Type: application/json');
require_once 'config.php';

$response = ['success' => false, 'message' => 'Requisição inválida.'];

try {
    $mysqli = conectar_db();

    // corpo JSON via POST
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = [];
    }

    $action = $input['action'] ?? ($_POST['action'] ?? null);

    if ($action) {
        switch ($action) {
            case 'read':
                // lista todos os países
                $result = $mysqli->query("SELECT * FROM paises ORDER BY nome ASC");
                $paises = $result->fetch_all(MYSQLI_ASSOC);

                $response = ['success' => true, 'data' => $paises];
                break;

            case 'read_one':
                // pega um país específico
                $id_pais = isset($input['id_pais'])
                    ? (int)$input['id_pais']
                    : (isset($_POST['id_pais']) ? (int)$_POST['id_pais'] : null);

                if ($id_pais) {
                    $stmt = $mysqli->prepare("SELECT * FROM paises WHERE id_pais = ?");
                    $stmt->bind_param('i', $id_pais);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    $pais   = $result->fetch_assoc();

                    if ($pais) {
                        $response = ['success' => true, 'data' => $pais];
                    } else {
                        $response = ['success' => false, 'message' => 'País não encontrado.'];
                    }
                }
                break;

            case 'create':
                // cadastra novo país
                $data = $input;

                if ($data && isset($data['nome'], $data['continente'], $data['populacao'], $data['idioma'])) {
                    $sql = "
                        INSERT INTO paises (nome, continente, populacao, idioma)
                        VALUES (?, ?, ?, ?)
                    ";
                    $stmt = $mysqli->prepare($sql);

                    $nome       = $data['nome'];
                    $continente = $data['continente'];
                    $populacao  = (int)$data['populacao'];
                    $idioma     = $data['idioma'];

                    $stmt->bind_param('ssis', $nome, $continente, $populacao, $idioma);
                    $stmt->execute();

                    $response = [
                        'success' => true,
                        'message' => 'País cadastrado com sucesso!',
                        'id'      => $mysqli->insert_id
                    ];
                }
                break;

            case 'update':
                // atualiza dados de um país
                $data = $input;

                if (
                    $data &&
                    isset($data['id_pais'], $data['nome'], $data['continente'], $data['populacao'], $data['idioma'])
                ) {
                    $sql = "
                        UPDATE paises
                           SET nome = ?, continente = ?, populacao = ?, idioma = ?
                         WHERE id_pais = ?
                    ";
                    $stmt = $mysqli->prepare($sql);

                    $id_pais    = (int)$data['id_pais'];
                    $nome       = $data['nome'];
                    $continente = $data['continente'];
                    $populacao  = (int)$data['populacao'];
                    $idioma     = $data['idioma'];

                    $stmt->bind_param('ssisi', $nome, $continente, $populacao, $idioma, $id_pais);
                    $stmt->execute();

                    $response = ['success' => true, 'message' => 'País atualizado com sucesso!'];
                }
                break;

            case 'delete':
                // exclui um país (e cidades associadas se tiver FK com ON DELETE CASCADE)
                $id_pais = isset($input['id_pais'])
                    ? (int)$input['id_pais']
                    : (isset($_POST['id_pais']) ? (int)$_POST['id_pais'] : null);

                if ($id_pais) {
                    // checa quantas cidades tem ligadas a esse país (só pra mensagem)
                    $stmt_check = $mysqli->prepare("SELECT COUNT(*) AS total FROM cidades WHERE id_pais = ?");
                    $stmt_check->bind_param('i', $id_pais);
                    $stmt_check->execute();
                    $result_check = $stmt_check->get_result();
                    $row   = $result_check->fetch_assoc();
                    $count = (int)$row['total'];

                    $stmt = $mysqli->prepare("DELETE FROM paises WHERE id_pais = ?");
                    $stmt->bind_param('i', $id_pais);
                    $stmt->execute();

                    if ($stmt->affected_rows > 0) {
                        $msg = 'País excluído com sucesso!';
                        if ($count > 0) {
                            $msg = 'País e suas cidades associadas excluídos com sucesso!';
                        }
                        $response = ['success' => true, 'message' => $msg];
                    } else {
                        $response = ['success' => false, 'message' => 'País não encontrado para exclusão.'];
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
