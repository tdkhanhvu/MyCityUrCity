<?php
    include('mysql.php');

    $request = "GetAllComments";

    if (isset($_POST['request']))
        $request = $_POST['request'];

    $mysql = new MySQL();
    $result = array();
    $user_id = null;
    $start = 1;
    $limit = 10;

    switch($request) {
        case "GetAllComments":
            $result = $mysql->selectAllComments();
            break;
        default:
            break;
    }

    echo json_encode($result);

?>