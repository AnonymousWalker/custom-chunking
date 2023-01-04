function test(chunk) {
    alert(chunk)
}

async function saveChunks() {
    const chunks = []
    document.querySelectorAll(".chunk").forEach(item => {
        chunks.push(item.textContent)
    })

    const response = await fetch("/save_chunks", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({chunks: chunks})
    })
    response.json().then(data => {
        console.log(data)
    })
}