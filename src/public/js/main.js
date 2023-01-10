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
