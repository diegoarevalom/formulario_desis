<?php

    $host = 'localhost';
    $db = 'db_productos';
    $user = 'root';
    $password = '';
    
    $conection = new mysqli($host, $user, $password, $db);
    if ($conection->connect_error) {
        die("Error de conexión: " . $conection->connect_error);
    }

?>