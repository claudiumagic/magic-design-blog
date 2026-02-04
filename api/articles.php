<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include "db.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET") {
    // GET all articles
    $stmt = $pdo->query("SELECT * FROM articles ORDER BY date DESC");
    $articles = $stmt->fetchAll();
    echo json_encode($articles);
}

if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['title'], $data['content'])) {
        http_response_code(400);
        echo json_encode(["error"=>"Missing title or content"]);
        exit;
    }
    $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($data['slug'] ?? $data['title']));
    $stmt = $pdo->prepare("INSERT INTO articles (title, subtitle, slug, content, cover, category) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['title'],
        $data['subtitle'] ?? '',
        $slug,
        $data['content'],
        $data['cover'] ?? '/default-image.jpg',
        $data['category'] ?? ''
    ]);
    echo json_encode(["success"=>true, "slug"=>$slug]);
}

if ($method === "DELETE") {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); exit; }
    $stmt = $pdo->prepare("DELETE FROM articles WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode(["success"=>true]);
}
?>
