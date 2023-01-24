<?php
include_once 'classes/link.php';
    $id = $_POST['id'];
    Link::addUse($id);
    
    die(json_encode(array("respond"=> 'ok')));
?>