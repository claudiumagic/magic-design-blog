<?php
require_once __DIR__ . '/alebea.php';

$post_id = $_GET['post_id'] ?? null;
if (!$post_id) {
    echo json_encode([]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT id, author, text, created_at 
    FROM comments 
    WHERE post_id = ?
    ORDER BY created_at DESC
");
$stmt->execute([$post_id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
