function Generic () {
    me = this
    init = () => {
        console.log('Init Me');
    }
    initSelectors = () => {

    }

    me.redirectPage = (page) => {

        let landingUrl = (page == null) ? window.localStorage.getItem('lastPage') : page;
        console.log(landingUrl);
        if (landingUrl == null) {
            landingUrl = '/home/index'

        } 
        console.log(landingUrl );
        window.localStorage.setItem('lastPage', landingUrl)
        
        window.location.replace(landingUrl);
    }
    
    return me
}

 