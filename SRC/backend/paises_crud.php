<?php
// Arquivo: crud_mundo/backend/paises_crud.php
header('Content-Type: application/json');
require_once 'config.php';

$response = ['success' => false, 'message' => 'Requisição inválida.'];

if (isset($_GET['action'])) {
    $action = $_GET['action'];
    $pdo = conectar_db();

    try {
        switch ($action) {
            case 'read':
                // READ: Listar todos os países
                $stmt = $pdo->query("SELECT * FROM paises ORDER BY nome ASC");
                $paises = $stmt->fetchAll();
                $response = ['success' => true, 'data' => $paises];
                break;

            case 'read_one':
                // READ ONE: Obter detalhes de um país específico
                if (isset($_GET['id_pais'])) {
                    $id_pais = $_GET['id_pais'];
                    $stmt = $pdo->prepare("SELECT * FROM paises WHERE id_pais = ?");
                    $stmt->execute([$id_pais]);
                    $pais = $stmt->fetch();
                    if ($pais) {
                        $response = ['success' => true, 'data' => $pais];
                    } else {
                        $response = ['success' => false, 'message' => 'País não encontrado.'];
                    }
                }
                break;

            case 'create':
                // CREATE: Cadastrar novo país
                $data = json_decode(file_get_contents('php://input'), true);
                if ($data) {
                    $sql = "INSERT INTO paises (nome, continente, populacao, idioma) VALUES (?, ?, ?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$data['nome'], $data['continente'], $data['populacao'], $data['idioma']]);
                    $response = ['success' => true, 'message' => 'País cadastrado com sucesso!', 'id' => $pdo->lastInsertId()];
                }
                break;

            case 'update':
                // UPDATE: Atualizar dados de um país
                $data = json_decode(file_get_contents('php://input'), true);
                if ($data && isset($data['id_pais'])) {
                    $sql = "UPDATE paises SET nome = ?, continente = ?, populacao = ?, idioma = ? WHERE id_pais = ?";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$data['nome'], $data['continente'], $data['populacao'], $data['idioma'], $data['id_pais']]);
                    $response = ['success' => true, 'message' => 'País atualizado com sucesso!'];
                }
                break;

            case 'delete':
                // DELETE: Excluir um país
                if (isset($_GET['id_pais'])) {
                    $id_pais = $_GET['id_pais'];

                    // Verificar se há cidades associadas (Integridade Referencial)
                    // Como definimos ON DELETE CASCADE no SQL, a verificação não é estritamente necessária,
                    // mas é bom para dar um feedback mais claro ao usuário.
                    $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM cidades WHERE id_pais = ?");
                    $stmt_check->execute([$id_pais]);
                    $count = $stmt_check->fetchColumn();

                    if ($count > 0) {
                        // Se o usuário optar por ON DELETE CASCADE, esta verificação é apenas informativa.
                        // Se não fosse CASCADE, o DELETE falharia aqui.
                        // Para este projeto, o CASCADE está configurado no bd_mundo.sql.
                        // Vamos prosseguir com a exclusão, que também apagará as cidades.
                    }

                    $stmt = $pdo->prepare("DELETE FROM paises WHERE id_pais = ?");
                    $stmt->execute([$id_pais]);

                    if ($stmt->rowCount() > 0) {
                        $response = ['success' => true, 'message' => 'País e suas cidades associadas excluídos com sucesso!'];
                    } else {
                        $response = ['success' => false, 'message' => 'País não encontrado para exclusão.'];
                    }
                }
                break;

            default:
                $response['message'] = 'Ação não reconhecida.';
                break;
        }
    } catch (\PDOException $e) {
        // Captura erros de SQL, como violação de UNIQUE (nome do país)
        $response['message'] = 'Erro no banco de dados: ' . $e->getMessage();
        // Em um ambiente real, você logaria o erro e não o exporia ao usuário.
    }
}

echo json_encode($response);
?>
