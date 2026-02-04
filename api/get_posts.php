<?php
require_once __DIR__ . '/alebea.php';

$stmt = $pdo->query("
    SELECT id, title, content, created_at 
    FROM posts 
    ORDER BY created_at DESC
");

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
