<?php
require_once __DIR__ . '/alebea.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data['post_id']) ||
    empty($data['author']) ||
    empty($data['text'])
) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid data"]);
    exit;
}

$stmt = $pdo->prepare("
    INSERT INTO comments (post_id, author, text)
    VALUES (?, ?, ?)
");

$stmt->execute([
    $data['post_id'],
    $data['author'],
    $data['text']
]);

echo json_encode(["success" => true]);
