<?php
    class Link{
        public $correct_url = null;
        private $url = 'http://artitech-blog.ru/';
        const SRC = ''; //Путь до папки где будут html файлы ссылок
        const DIRSRC= 'cases/test2/'; // Путь до js Ajax 
        private function checkingLink(string $link)
        { // проверяем ссылку на реальность
           $str = htmlspecialchars($link);
           $site = curl_init();
           curl_setopt($site, CURLOPT_URL, $str);
           curl_setopt($site, CURLOPT_HEADER, 0);
           curl_setopt($site, CURLOPT_RETURNTRANSFER, true);
           curl_exec($site);
           $answer = curl_getinfo($site, CURLINFO_HTTP_CODE);
           curl_close($site);
           if($answer != '404' and $answer != '0'){
            return true;
           }else{
            return false;
           }
        }
        private function randomURl(int $max)
        {
            $chars="qazxswedcvfrtgbnhyujmkiolpQAZXSWEDCVFRTGBNHYUJMKIOLP0987654321";
            $size=StrLen($chars)-1;
            $randName=null;
            // Создаём пароль.
            while($max--)
            $randName.=$chars[rand(0,$size)];

            return $randName;
        }
        private function createRedirectFile(string $filename)
        {
            // создаем файл в корне
            $html = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>short</title> </head> <body> <script src="'.self::DIRSRC.'js/ajax.min.js" ></script> <script>  Ajax.requestJson({method:"POST", url:"'.self::DIRSRC.'backend_files/metrica.php", data:{id:"'.$filename.'"}, success:function(msg){window.location.href="'.$this->correctUrl.'";}, error:function(msg){}}) </script> </body> </html>';
            $file = fopen($_SERVER['DOCUMENT_ROOT'].self::SRC."/$filename", 'x+');
            fwrite($file, $html);
            fclose($file);
        }
        public static function addUse(string $id)
        { //Функция добавляет переход страницы
            $data = file_get_contents('data/links.txt'); 
            $data =  json_decode($data, true);
            for ($i=0; $i < count($data); $i++) { 
                if($data[$i]['id'] === $id){
                    $data[$i]['use'] += 1;
                }
            }
            return file_put_contents('data/links.txt', json_encode($data));
        }
        public static function getAllLinks()
        { // Получаем все линки
            if(!file_exists('data/links.txt')){
                die(json_encode(array('respond'=> 'empty')));
            }
            $data = file_get_contents('data/links.txt'); 
            die($data);
        }
        public function shortLink(){
            if($this->correctUrl === null){
                throw new Exception('URL dosnt exist');
            }
            if(!file_exists('data/links.txt')){
                $file = fopen('data/links.txt', 'x+');
                $short = $this->randomURl(6).'.html';
                $data = json_encode(array(array('id'=> $short, 'url'=>$this->correctUrl, 'short'=>$this->url.$short, 'use'=>'0')));
                fwrite($file, $data);
                fclose($file);
                // создаем файл в корне
                $this->createRedirectFile($short);
            }else{
                //echo 'x';
                $data = file_get_contents('data/links.txt'); 
                $data =  json_decode($data, true);
                for ($i=0; $i < count($data); $i++) { 
                    if($data[$i]['url'] === $this->correctUrl){
                        throw new Exception('Reference already exists');
                    }
                }
                $short = $this->randomURl(6).'.html';
                while(file_exists($_SERVER['DOCUMENT_ROOT'].self::SRC."/$short")){ // короткая ссылка
                    $short = $this->url.$this->randomURl(6).'.html';
                }
                array_push($data, array('url'=>$this->correctUrl, 'short'=>$this->url.$short, 'use'=>'0'));
                file_put_contents('data/links.txt', json_encode($data));
                $this->createRedirectFile($short);
            }
        }
        function __construct($link){
           $check = $this->checkingLink($link);
           // echo $check;
            if(!$check){
                //Проверим сылку на реальность
                throw new Exception('Not a correct url');
            }else{
                $this->correctUrl = $link;
            }

        }
    }

?>