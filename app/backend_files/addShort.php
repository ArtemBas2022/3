<?php 
include_once 'classes/link.php';
    try{
        $link = htmlspecialchars($_POST['url']);
        $x = new Link($link);
        $x->shortLink();
        die(json_encode(array('respond'=>'ok')));
    }catch(Exception $e){
        die(json_encode(array('error'=>$e->getMessage())));
    }
?>
