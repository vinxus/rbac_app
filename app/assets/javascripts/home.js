$(function() {
let generic = Generic()

generic.init()


// check if there we need to login

// 1. Check for active session
//    a. Check if it is valid
//    b. if it is direct to the last page (if that exists)
//    c. do nothing if a previous page does not exist
// 2. If no active session or invalid session (delete the invalid session)
//    a. doLogin - redirect to login page
let activeSession = localStorage.getItem('activeSession')
if (activeSession != null) {
    $('#login-status').text('Logged In')
    let lastPage = localStorage.getItem('lastPage')

    let currentPage = window.location.href
    if (lastPage != currentPage) {
        generic.redirectPage(lastPage)
    } 
}
})