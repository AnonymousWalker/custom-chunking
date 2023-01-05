const toInt = (str) => {
    if (str == null || str == undefined) {
        return null
    }
    const n = Number(str)
    return isNaN(n) ? null : parseInt(n)
}

const formatPaddedInt = (number, digitCount = 2) => {
    return String(number).padStart(digitCount,'0')
}

exports.toInt = toInt;
exports.formatPaddedInt = formatPaddedInt;