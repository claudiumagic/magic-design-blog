<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/db.php";

$method = $_SERVER["REQUEST_METHOD"];

/* =========================
   GET COMMENTS
========================= */
if ($method === "GET") {
    $slug = $_GET["slug"] ?? null;
    if (!$slug) {
        echo json_encode([]);
        exit;
    }

    // articol
    $stmt = $pdo->prepare("SELECT id FROM articles WHERE slug = ?");
    $stmt->execute([$slug]);
    $article = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$article) {
        echo json_encode([]);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT id, name, comment, website, date 
        FROM comments 
        WHERE article_id = ? 
        ORDER BY date ASC
    ");
    $stmt->execute([$article["id"]]);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

/* =========================
   POST COMMENT
========================= */
if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        empty($data["slug"]) ||
        empty($data["name"]) ||
        empty($data["email"]) ||
        empty($data["comment"])
    ) {
        http_response_code(400);
        echo json_encode(["error" => "Missing fields"]);
        exit;
    }

    // honeypot
    if (!empty($data["company"])) {
        http_response_code(400);
        echo json_encode(["error" => "Spam detected"]);
        exit;
    }

    // articol
    $stmt = $pdo->prepare("SELECT id FROM articles WHERE slug = ?");
    $stmt->execute([$data["slug"]]);
    $article = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$article) {
        http_response_code(404);
        echo json_encode(["error" => "Article not found"]);
        exit;
    }

    /* 🔒 1 website / articol / email */
    $stmt = $pdo->prepare("
        SELECT id FROM comments
        WHERE article_id = ?
        AND email = ?
        AND website IS NOT NULL
        AND website != ''
        LIMIT 1
    ");
    $stmt->execute([
        $article["id"],
        $data["email"]
    ]);

    $alreadyHasWebsite = $stmt->fetch() ? true : false;
    $finalWebsite = "";

    if (!$alreadyHasWebsite && !empty($data["website"])) {
        $finalWebsite = $data["website"];
    }

    // INSERT
    $stmt = $pdo->prepare("
        INSERT INTO comments (article_id, name, email, website, comment)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $article["id"],
        $data["name"],
        $data["email"],
        $finalWebsite,
        $data["comment"]
    ]);

    $id = $pdo->lastInsertId();

    $stmt = $pdo->prepare("
        SELECT id, name, comment, website, date
        FROM comments WHERE id = ?
    ");
    $stmt->execute([$id]);

    echo json_encode([
        "comment" => $stmt->fetch(PDO::FETCH_ASSOC),
        "websiteIgnored" => $alreadyHasWebsite
    ]);
    exit;
}

/* =========================
   DELETE
========================= */
if ($method === "DELETE") {
    $id = $_GET["id"] ?? null;
    if (!$id) {
        http_response_code(400);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true]);
    exit;
}


