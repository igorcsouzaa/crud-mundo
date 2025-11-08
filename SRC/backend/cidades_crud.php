<?php
// Arquivo: crud_mundo/backend/cidades_crud.php
header('Content-Type: application/json');
require_once 'config.php';

$response = ['success' => false, 'message' => 'Requisição inválida.'];

if (isset($_GET['action'])) {
    $action = $_GET['action'];
    $pdo = conectar_db();

    try {
        switch ($action) {
            case 'read':
                // READ: Listar todas as cidades, incluindo o nome do país
                $sql = "SELECT c.*, p.nome AS nome_pais FROM cidades c JOIN paises p ON c.id_pais = p.id_pais ORDER BY c.nome ASC";
                $stmt = $pdo->query($sql);
                $cidades = $stmt->fetchAll();
                $response = ['success' => true, 'data' => $cidades];
                break;

            case 'read_by_country':
                // READ: Listar cidades de um país específico
                if (isset($_GET['id_pais'])) {
                    $id_pais = $_GET['id_pais'];
                    $sql = "SELECT * FROM cidades WHERE id_pais = ? ORDER BY nome ASC";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$id_pais]);
                    $cidades = $stmt->fetchAll();
                    $response = ['success' => true, 'data' => $cidades];
                }
                break;

            case 'create':
                // CREATE: Cadastrar nova cidade
                $data = json_decode(file_get_contents('php://input'), true);
                if ($data) {
                    $sql = "INSERT INTO cidades (nome, populacao, id_pais) VALUES (?, ?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$data['nome'], $data['populacao'], $data['id_pais']]);
                    $response = ['success' => true, 'message' => 'Cidade cadastrada com sucesso!', 'id' => $pdo->lastInsertId()];
                }
                break;

            case 'update':
                // UPDATE: Atualizar dados de uma cidade
                $data = json_decode(file_get_contents('php://input'), true);
                if ($data && isset($data['id_cidade'])) {
                    $sql = "UPDATE cidades SET nome = ?, populacao = ?, id_pais = ? WHERE id_cidade = ?";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$data['nome'], $data['populacao'], $data['id_pais'], $data['id_cidade']]);
                    $response = ['success' => true, 'message' => 'Cidade atualizada com sucesso!'];
                }
                break;

            case 'delete':
                // DELETE: Excluir uma cidade
                if (isset($_GET['id_cidade'])) {
                    $id_cidade = $_GET['id_cidade'];
                    $stmt = $pdo->prepare("DELETE FROM cidades WHERE id_cidade = ?");
                    $stmt->execute([$id_cidade]);

                    if ($stmt->rowCount() > 0) {
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
    } catch (\PDOException $e) {
        // Captura erros de SQL, como violação de UNIQUE (nome da cidade no país)
        $response['message'] = 'Erro no banco de dados: ' . $e->getMessage();
    }
}

echo json_encode($response);
?>
