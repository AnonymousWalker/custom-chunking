function toInt(str) {
    if (str == null || str == undefined) {
        return null
    }
    const n = Number(str)
    return isNaN(n) ? null : parseInt(n)
}