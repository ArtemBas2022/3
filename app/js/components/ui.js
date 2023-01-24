class UiInput extends HTMLElement {
    constructor() {
      super();
      const ui = document.createElement('div');
      ui.setAttribute('class', 'ui-input');
      ui.innerHTML = `
            <input type="text" placeholder="http://domain" id="input">
            <input type="submit" value="Сократить" id="submit">
            `;
       const style = document.createElement('link');
       style.setAttribute('rel', 'stylesheet');
       style.setAttribute('href', 'css/ui-input.css');
       const shadowRoot = this.attachShadow({mode: 'open'});
       shadowRoot.appendChild(ui);
       shadowRoot.appendChild(style);
    //    shadowRoot.innerHTML = '';
        // this.attachShadow({mode: 'closed'});
       shadowRoot.querySelector('#submit').addEventListener('click', ()=>{
       // if(document.querySelector('#input').value)
        const el = shadowRoot.querySelector('#input');
        if(el.value.toString().length > 0 && el.value.toString().indexOf(' ') === -1){
            Ajax.requestJson({
                method: 'POST',
                url: 'backend_files/addShort.php',
                data:{url: el.value.toString()},
                success: (server)=>{
                    el.value = '';
                    //console.log(server);
                    if(typeof server.error != 'undefined'){
                        alert('Error: '+ server.error);
                    }else{
                        document.querySelector('ui-desktop').remove();
                        const el = document.createElement('ui-desktop');
                        customElements.upgrade(el);
                        document.querySelector('.ui').append(el);
                        
                        
                    }
                },
            error: (server)=>{
                //console.log(server);
            }});
        }else{
            alert('Некорректно заполнено поле');
        }
       
    
        })
    }
  }

  

customElements.define('ui-input',
UiInput
);
    customElements.define('ui-desktop',
        class  extends HTMLElement{
        constructor() {
            super();  
            const style = document.createElement('link');
            style.setAttribute('rel', 'stylesheet');
            style.setAttribute('href', 'css/ui-desktop.css');
            const shadowRoot = this.attachShadow({mode: 'open'});
            
            Ajax.requestJson({
                method: 'GET',
                url: 'backend_files/getAll.php',
                data:{},
                success: (server)=>{
                    //console.log(server);
                    if(typeof server.respond != 'undefined'){
                        return false;
                    }
                    const ui = document.createElement('div');
                    ui.setAttribute('class', 'ui-desktop');
                    const arr = server;
                        for(let i = 0; i < arr.length; i++){
                            //console.log('c');
                            let x = document.createElement('div');
                            x.setAttribute('class', 'short-link');
                            x.innerHTML = `<div class="speaker">
                            <div class="speaker-text">Скопировано</div>
                            <input type="text" value="${arr[i].short}" >
                        </div>
                        <button onclick="copy(event)">Копировать</button> `;
                            ui.insertAdjacentElement('afterbegin', x);
                        }
                        shadowRoot.append(ui);
                        shadowRoot.append(style);
                },
                error: (server)=>{
                    alert(server.respond);
                }
            });
        }
    });
    function copy(event){
       const ev =  event.target;
       const par = ev.parentNode;
       const arr = par.children;
       arr[0].classList.add('active');
       setTimeout(()=>{arr[0].classList.remove('active')}, 1000);
       arr[0].children[1].select();
       document.execCommand('copy');
    }