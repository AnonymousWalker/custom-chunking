const setAppBtn = document.querySelector("div.setapp button")

if (setAppBtn) {
    const redirectUrl = setAppBtn.dataset.url
    setAppBtn.addEventListener('click', () => {
        window.electronAPI.selectFolder().then(() => {
            window.electronAPI.redirect(redirectUrl)
        }).catch(err => {
            alert(err)
        })
    })
}

function openResource(resourceId){
    const currentURL = window.location.href
    const checkURL = window.location.href + '/' + resourceId + '/check'

    fetch(checkURL, {
        method: 'GET'
    })
    .then(response => {
        if (response.status == 204) {
            window.location.href = currentURL + `/${resourceId}`
        } else {
            window.location.href = currentURL + '/select-app-dir'
        }
    })
}