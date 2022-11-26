// 
$(function() {

    let $loginTemplate = $('#loginForm')     
    $loginTemplate.removeClass('hidden');
    $loginTemplate.css({display: 'block'});
    $('#userName').focus();
    let dialogData = {
        title: 'Welcome To RBAC System',
        width: 400,
        height: 320,
        modal: true,
        resizable: false,
        draggable: false
    }
    let buttons = [{ 
        text: 'Login',
        click: () => {
            if ($('#userName').val() == '') {
                $('#userName').focus();
                return false     
            }    
            if ($('#password').val() == '') {
                $('#password').focus();
                return false     
            }   
            activeLogin().then((res) => {

                if (! res) {
                    
                    if (doLogin()) {

                        redirectPage();
                        //$dialog.dialog('destroy');

                    } else {
                        alert('Login Failed!')
                    }
                } 
            })
            
        }
    }]
    createDialog(dialogData, buttons, $loginTemplate)

    let doLogin = async () => {
    
        let result = await ajaxCaller(
            {username: $('#userName').val(),  password: $('#password').val(),}, 
            'POST', '/authenticate'
            )
            .then((r) => {

                window.localStorage.setItem('activeSession', r.token)

                alert('Done Login')
                return true;
            }).catch(() => {
                return false
            })

        return result;
    }

    let redirectPage = (page) => {

        let landingUrl = (page == null) ? window.localStorage.getItem('lastPage') : page;
        console.log(landingUrl);
        if (landingUrl == null) {
            landingUrl = window.location.host + '/home/index'

        } 
        console.log(landingUrl );
        window.localStorage.setItem('lastPage', landingUrl)
        
        window.location.replace(landingUrl);
    }      

    let decodeToken = function(data) {

        $.ajax({
                url: '/authenticator/ajax_decode_token',
                method: 'get',
                data: { token: data},
                success: (response) => {
                    console.log(response)
                    console.log(response.payload)
                }
            })
    }

    let activeLogin = async () => {
        let activeSession = window.localStorage.getItem('activeSession');
        console.log(activeSession)
        if (activeSession) {
            let response = await ajaxCaller(
                {token: activeSession}, 
                'GET', '/authenticator/ajax_decode_token'
            )
            
            if (response.expireAt !== undefined) {
                console.log(response.expireAt)
                const dateNow = new Date()
                const expireAt = new Date(response.expireAt)

                if (expireAt > dateNow) {
                    console.log('Session is current')
                    return true
                } else {
                    console.log('Session is stale')
                    window.localStorage.removeItem('activeSession')    
                    return false
                }
            }
            
            
        } else {
            return false;
        }
    }
    
});

async function ajaxCaller(data, method, url) {
    let result = await $.ajax(
        {
            url: url,
            method: method,
            data: data
        }
    );

    return result
}

function createDialog(data, buttons, $template) {
    $dialog = $('<div id="generic-dialog"/>');
    let btns = buttons

    btns.push({ 
                text: 'Close',
                click: () => {
                    $dialog.dialog('destroy')
                }
            })            
    $dialog.dialog({
        title: data.title != undefined ? data.title : 'Generic Dialog',
        width: data.width != undefined ? data.width : 400,
        height: data.height != undefined ? data.height :300,
        modal: data.modal != undefined ? data.modal : true,
        resizable: data.resizable != undefined ? data.resizable :false,
        draggable: data.draggable != undefined ? data.draggable :false,
        buttons: btns
    }).html($template);
}
