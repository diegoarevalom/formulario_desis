<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'bd_conexion.php';

if($conection->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Error de conexión a la base de datos: ' . $conection->connect_error]);
    exit();
}

$accion = $_GET['accion'] ?? $_POST['accion'] ?? '';

switch ($accion) {
    case 'obtener_monedas':
        obtenerMonedas($conection);
        break;
    case 'obtener_bodegas':
        obtenerBodegas($conection);
        break;
    case 'obtener_sucursales':
        obtenerSucursales($conection);
        break;
    case 'insertar_producto':
        cargarProducto($conection);
        break;
    case 'obtener_codigo':
        obtenerCodigo($conection);
        break; 
    default:
        echo json_encode(['status' => 'error', 'message' => 'Acción no válida']);
        exit(); 
}

function obtenerMonedas($conection) {
    $query = "SELECT id_moneda AS id, nombre_moneda AS nombre FROM Monedas";
    $result = $conection->query($query);
    if($result) {
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al obtener las monedas: ' . $conection->error]);
    }
    exit();
}

function obtenerBodegas($conection){
    $query = "SELECT id_bodega AS id, nombre_bodega AS nombre FROM Bodegas ";
    $result = $conection->query($query);
    if($result) {
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al obtener las bodegas: ' . $conection->error]);
    }
    exit();
}

function obtenerSucursales($conection){
    $id_bodega = intval($_GET['id_bodega'] ?? 0); 
    if ($id_bodega <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'ID de bodega inválido o no proporcionado.']);
        exit();
    }
    
    $stmt = $conection->prepare("SELECT id_sucursal AS id, nombre_sucursal AS nombre FROM Sucursales WHERE id_bodega = ? ORDER BY nombre_sucursal");
    if(!$stmt){
        echo json_encode(['status' => 'error', 'message' => 'Error al preparar la consulta de sucursales: ' . $conection->error]);
        exit();
    }
    $stmt->bind_param("i", $id_bodega);
    if (!$stmt->execute()) {
        echo json_encode(['status' => 'error', 'message' => 'Error al ejecutar la consulta de sucursales: ' . $stmt->error]);
        exit();
    }
    $result = $stmt->get_result();
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    $stmt->close();
    exit();
}

function obtenerCodigo($conection){
    $codigo = $_GET['codigo'] ?? '';
    $stmt = $conection->prepare("SELECT COUNT(*) FROM Productos  WHERE codigo = ?");
    if(!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Error al preparar la consulta: ' . $conection->error]);
        exit();
    }
    $stmt->bind_param("s", $codigo);
    if(!$stmt->execute()) {
        echo json_encode(['status' => 'error', 'message' => 'Error al ejecutar la consulta: ' . $stmt->error]);
        exit();
    }   
    $result = $stmt->get_result();
    $row = $result->fetch_row();
    $count = $row[0];
    $stmt->close();

    echo json_encode($count > 0 ? ['exists' => true] : []);
    exit();
}

function cargarProducto($conection){
    $codigo = trim($_POST['codigo'] ?? '');
    $nombre_producto = trim($_POST['nombre'] ?? '');
    $id_bodega  = intval($_POST['bodega'] ?? 0);
    $id_sucursal  = intval($_POST['sucursal'] ?? 0);
    $id_moneda  = intval($_POST['moneda'] ?? 0);
    $precio = floatval($_POST['precio'] ?? 0.0);
    $descripcion = trim($_POST['descripcion'] ?? '');
    $materiales = $_POST['materiales'] ?? [];

    // Validaciones con regex_code
    $regex_codigo = '/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{5,15}$/';
    if (!preg_match($regex_codigo, $codigo)) {
        echo json_encode(['status' => 'error', 'message' => 'El código debe contener entre 5 y 15 caracteres alfanuméricos y al menos una letra y un número.']);
        exit();
    }
    if(empty($nombre_producto) || strlen($nombre_producto) < 2 || strlen($nombre_producto) > 50) {
        echo json_encode(['status' => 'error', 'message' => 'El nombre debe tener entre 2 y 50 caracteres.']);
        exit();
    }
    if(!is_numeric($precio) || $precio <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'El precio debe ser un número positivo.']);
        exit();
    }
    if(empty($descripcion) || strlen($descripcion) < 10 || strlen($descripcion) > 1000) {
        echo json_encode(['status' => 'error', 'message' => 'La descripción debe tener entre 10 y 1000 caracteres.']);
        exit();
    }
    if($id_bodega <= 0 || $id_sucursal <= 0 || $id_moneda <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Bodega, sucursal y moneda deben ser válidos.']);
        exit();
    }
    if(!is_array($materiales) || count($materiales) < 2) {
        echo json_encode(['status' => 'error', 'message' => 'Debe seleccionar al menos 2 materiales.']);
        exit();
    }

    $conection->begin_transaction();
    try{
        $stmt = $conection->prepare("INSERT INTO Productos  (codigo, nombre_producto, id_bodega, id_sucursal, id_moneda, precio, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if(!$stmt) {
            throw new Exception('Error en la consulta: ' . $conection->error);  
        }
        $stmt->bind_param("ssiidss", $codigo, $nombre_producto, $id_bodega, $id_sucursal, $id_moneda, $precio, $descripcion);
        if(!$stmt->execute()){
            throw new Exception('Error al insertar el producto: ' . $stmt->error);
        }
        $producto_id = $stmt->insert_id;
        $stmt->close();

        // Insertando Materiales asociados al producto
        $stmt_material = $conection->prepare("INSERT INTO productomaterial  (id_producto, id_material) VALUES (?, ?)");
        if(!$stmt_material) {
            throw new Exception('Error al preparar la consulta de materiales: ' . $conection->error);
        }
        foreach($materiales as $material_id){
            $material_id_int = intval($material_id);
            $stmt_material ->bind_param("ii", $producto_id, $material_id_int);
            if(!$stmt_material->execute()) {
                throw new Exception('Error al asociar material (ID: ' . $material_id_int . '): ' . $stmt_material->error);
            }         
        }
        $stmt_material->close();
        $conection->commit();
        echo json_encode(['status' => 'success', 'message' => 'Producto guardado correctamente']);
        }catch(Exception $e) {
            $conection->rollback();
            error_log('Error al insertar producto: ' . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        exit();
}
?>