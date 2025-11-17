<?php
// Simple test file to verify callback route is working

echo "<h1>Callback Route Test</h1>";
echo "<p>If you see this, the .htaccess routing is working!</p>";
echo "<pre>";
echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "\n";
echo "PHP_SELF: " . $_SERVER['PHP_SELF'] . "\n";
echo "\nGET Parameters:\n";
print_r($_GET);
echo "</pre>";
?>
