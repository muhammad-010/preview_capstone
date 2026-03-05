export function playSuccessSound() {
    if (import.meta.client) {
        new Audio('/success-sound.mp3').play()
    }
}

export function playErrorSound() {
    if (import.meta.client) {
        new Audio('/error-sound.mp3').play()
    }
}
