class Ajax {
    static version(){ // Версия класса Ajax
     return 'v1.0.0';
    }
    static requestJson(parameters){ //Запрос в json формате
         if(Array.from(arguments).length != 1){ 
             throw new Error('(Ajax) missing parameters or undefinde parameters');
         }
         //Проверяем параметры
         const arr = ['method', 'url', 'data', 'success', 'error'];
         for(let prop in parameters){ // проходим параметры и проверяем, что все на месте
             let triger = false;
             arr.forEach((item, index)=>{
                 if(prop === item){
                     if(index === 3 || index === 4){
                         if(typeof parameters[prop] != 'function'){
                             throw new Error(prop+' is not funtion');
                         }
                     }
                     triger = true;
                 }
             });
             if(!triger){
                 throw new Error('(Ajax) undefinde parameter: '+prop);
             }
             triger = false;
         }
         //Создаем запрос
         let xhr = new XMLHttpRequest();
         xhr.overrideMimeType('application/json');
         xhr.responseType = 'json';
         xhr.onreadystatechange = ()=>{
             if(xhr.readyState === 4 ){
                 if(xhr.status === 200){
                     if(xhr.response === null){
                         throw new Error('(Ajax) server return null');
                     }
                     parameters.success(xhr.response);
                 }
                 if(xhr.status != 200){
                     parameters.error(xhr.response);
                 }
                // xhr.status != 200 ? errGen('AJAX ошибка, код: '+xhr.status) : success(xhr.response);
             }
         };
         xhr.open(parameters.method, parameters.url, true);
         xhr.setRequestHeader("Cache-Control", "no-cache");
         xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
         xhr.setRequestHeader("Accept", "application/json");
         let data;
        // console.log(parameters.data);
         if(parameters.data instanceof FormData){
             data = parameters.data;
         }else{
             data = new FormData();
             if(Object.keys(parameters.data).length > 0){
                 for(let prop in parameters.data){
                     data.append(prop, parameters.data[prop]);
                 }
             }else{
                 data = null;
             }
         }
         //console.log(data);
         xhr.send(data);
     } 
 } 