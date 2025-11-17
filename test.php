<?php
// Quick debug test - DELETE AFTER TESTING

echo "<h1>Debug Info</h1>";
echo "<p>If you see this, PHP is working!</p>";

echo "<h2>Files in this directory:</h2>";
echo "<pre>";
print_r(scandir(__DIR__));
echo "</pre>";

echo "<h2>Server Info:</h2>";
echo "<pre>";
echo "DOCUMENT_ROOT: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "SCRIPT_FILENAME: " . $_SERVER['SCRIPT_FILENAME'] . "\n";
echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "PHP_SELF: " . $_SERVER['PHP_SELF'] . "\n";
echo "</pre>";

echo "<h2>File Check:</h2>";
echo "<pre>";
echo "login.html exists: " . (file_exists('login.html') ? 'YES' : 'NO') . "\n";
echo "login.html readable: " . (is_readable('login.html') ? 'YES' : 'NO') . "\n";
echo "</pre>";

echo "<h2>Try These:</h2>";
echo "<ul>";
echo "<li><a href='login.html'>Direct: login.html</a></li>";
echo "<li><a href='/tracker/login.html'>Full path: /tracker/login.html</a></li>";
echo "<li><a href='".dirname($_SERVER['PHP_SELF'])."/login.html'>PHP path: ".dirname($_SERVER['PHP_SELF'])."/login.html</a></li>";
echo "</ul>";
?>
