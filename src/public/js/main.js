const setAppBtn = document.querySelector("div.setapp button")

if (setAppBtn) {
    setAppBtn.addEventListener('click', () => {
        window.electronAPI.selectFolder().then(() => {
            const lang = setAppBtn.dataset.lang
            const book = setAppBtn.dataset.book
            const res = setAppBtn.dataset.res

            openResource(lang, book, res)
        }).catch(err => {
            alert(err)
        })
    })
}

function openResource(lang, book, resourceId){
    const currentURL = `/${lang}/${book}/${resourceId}`
    const checkURL = `${currentURL}/check`

    document.querySelector('.resource-list').remove()
    document.querySelector('.busy-dialog').setAttribute('open', '')

    fetch(checkURL, {
        method: 'GET'
    })
    .then(response => {
        if (response.status == 204) {
            document.querySelector('.busy-dialog').removeAttribute('open')
            window.location.href = currentURL
        } else {
            window.location.href = `${currentURL}/select-app-dir`
        }
    })
}