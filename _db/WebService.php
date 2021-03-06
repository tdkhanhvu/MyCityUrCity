<?php
    include('mysql.php');

    $request = "GetAllComments";

    if (isset($_POST['request']))
        $request = $_POST['request'];

    $mysql = new MySQL();
    $result = array();
    $user_id = null;
    $limit = 3;

    switch($request) {
        case "GetUserDetail":
            $result = $mysql->getUserDetail($_POST['userId']);
            break;
        case "GetAllCountries":
            $result = $mysql->getAllCountry();
            break;
        case "GetAllCitiesForACountry":
            $result = $mysql->getAllCitiesForACountry($_POST['countryId']);
            break;
        case "GetAllComments":
            $result = $mysql->selectAllComments($_POST['filter'], $_POST['start'], $limit);
            break;
        case "InsertNewComment":
            $result = $mysql->insertNewComment($_POST['userId'],$_POST['userName'],
                $_POST['cityId'], $_POST['content'],$_POST['images']);
            break;
        default:
            break;
    }
    echo json_encode($result);

?>