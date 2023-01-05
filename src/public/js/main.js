function test(chunk) {
    alert(chunk)
}

async function saveChunks() {
    const chunks = {
        "01": `chunk 1 content`
    }

    return fetch(window.location.href, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({chunks: chunks})
    }).then(res => {
        if (res.status == 200) alert("Success")
    })
}