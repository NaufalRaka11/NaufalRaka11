// File type detection and conditional loading logic for avatars
function loadAvatar(avatarURL) {
    const img = new Image();
    img.onload = function() {
        document.getElementById('avatar').src = avatarURL;
    };

    // Check for HTML/SVG
    if (avatarURL.endsWith('.svg') || avatarURL.endsWith('.html')) {
        fetch(avatarURL)
            .then(response => response.text())
            .then(data => {
                document.getElementById('avatar').innerHTML = data;
            })
            .catch(error => console.error('Error loading SVG:', error));
    } else {
        // Load as image
        img.src = avatarURL;
    }
}

// Example usage
loadAvatar('path_to_your_avatar');