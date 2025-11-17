<?php
// Database class for MySQL operations

class Database {
    private $conn;
    private static $instance = null;

    private function __construct() {
        try {
            $this->conn = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASSWORD,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }

    // User functions
    public function getUserByGoogleId($googleId) {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE google_id = ?");
        $stmt->execute([$googleId]);
        return $stmt->fetch();
    }

    public function getUserById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function createUser($googleId, $email, $name, $picture) {
        $stmt = $this->conn->prepare(
            "INSERT INTO users (google_id, email, name, picture, created_at)
             VALUES (?, ?, ?, ?, NOW())"
        );
        $stmt->execute([$googleId, $email, $name, $picture]);
        return $this->getUserByGoogleId($googleId);
    }

    // Entry functions
    public function getEntries($userId) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM entries WHERE user_id = ? ORDER BY date DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function getEntryByDate($userId, $date) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM entries WHERE user_id = ? AND date = ?"
        );
        $stmt->execute([$userId, $date]);
        $entry = $stmt->fetch();

        if (!$entry) {
            return [
                'date' => $date,
                'weight' => null,
                'lunch' => json_encode(['logged' => false]),
                'dinner' => json_encode(['logged' => false]),
                'drinks' => json_encode([]),
                'notes' => ''
            ];
        }

        return $entry;
    }

    public function saveEntry($userId, $date, $weight, $lunch, $dinner, $drinks, $notes) {
        $stmt = $this->conn->prepare(
            "INSERT INTO entries (user_id, date, weight, lunch, dinner, drinks, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                weight = COALESCE(VALUES(weight), weight),
                lunch = COALESCE(VALUES(lunch), lunch),
                dinner = COALESCE(VALUES(dinner), dinner),
                drinks = COALESCE(VALUES(drinks), drinks),
                notes = COALESCE(VALUES(notes), notes)"
        );

        $stmt->execute([
            $userId,
            $date,
            $weight,
            $lunch,
            $dinner,
            $drinks,
            $notes
        ]);

        return $this->getEntryByDate($userId, $date);
    }

    public function deleteEntry($userId, $date) {
        $stmt = $this->conn->prepare(
            "DELETE FROM entries WHERE user_id = ? AND date = ?"
        );
        return $stmt->execute([$userId, $date]);
    }

    // Settings functions
    public function getSettings($userId) {
        $stmt = $this->conn->prepare("SELECT settings FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();

        if ($result && $result['settings']) {
            return json_decode($result['settings'], true);
        }

        return [
            'weightUnit' => 'kg',
            'notificationsEnabled' => false
        ];
    }

    public function updateSettings($userId, $settings) {
        $stmt = $this->conn->prepare(
            "UPDATE users SET settings = ? WHERE id = ?"
        );
        $stmt->execute([json_encode($settings), $userId]);
        return $this->getSettings($userId);
    }
}
