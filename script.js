// --------------------
// FORM DATA
// --------------------
const formData = {
    name: "",
    nationality: "",
    oshi: "",
    favoriteAnime: "",
    member: "",
    songs: ""
};

const images = [null, null];

const formSection = document.getElementById("formSection");
const resultSection = document.getElementById("resultSection");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// --------------------
// INPUT HANDLERS
// --------------------
document.getElementById("name").addEventListener("input", e => formData.name = e.target.value);
document.getElementById("country").addEventListener("input", e => formData.nationality = e.target.value);
document.getElementById("oshi").addEventListener("input", e => formData.oshi = e.target.value);
document.getElementById("favoriteAnime").addEventListener("input", e => formData.favoriteAnime = e.target.value);
document.getElementById("member").addEventListener("input", e => formData.member = e.target.value);
document.getElementById("songs").addEventListener("input", e => formData.songs = e.target.value);

// --------------------
// IMAGE UPLOAD HANDLER
// --------------------
function setupImageUpload(index) {
    const upload = document.getElementById(`upload${index + 1}`);
    const fileInput = document.getElementById(`file${index + 1}`);
    const preview = upload.querySelector(".preview-image");
    const placeholder = upload.querySelector(".upload-placeholder");
    const removeBtn = upload.querySelector(".remove-btn");

    upload.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-btn") || e.target.closest(".remove-btn")) {
            e.stopPropagation();
            return;
        }
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            images[index] = ev.target.result;
            preview.src = ev.target.result;
            preview.style.display = "block";
            placeholder.style.display = "none";
            removeBtn.style.display = "flex";
        };
        reader.readAsDataURL(file);
    });

    removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        images[index] = null;
        preview.style.display = "none";
        placeholder.style.display = "flex";
        removeBtn.style.display = "none";
        fileInput.value = "";
    });
}

setupImageUpload(0);
setupImageUpload(1);

// --------------------
// TEXT WRAP CENTER (รองรับญี่ปุ่น/อังกฤษ)
// --------------------
function wrapTextCenter(ctx, text, x, y, maxWidth, lineHeight, maxHeight) {
    if (!text) return;
    
    let lines = [];
    let currentLine = "";

    // แบ่งข้อความทีละตัวอักษร (รองรับ JP และ EN)
    for (let i = 0; i < text.length; i++) {
        currentLine += text[i];
        if (ctx.measureText(currentLine).width > maxWidth) {
            if (currentLine.length > 1) {
                lines.push(currentLine.slice(0, -1));
                currentLine = currentLine.slice(-1);
            } else {
                lines.push(currentLine);
                currentLine = "";
            }
        }
    }
    if (currentLine) lines.push(currentLine);

    // ตัดจำนวนบรรทัดให้ไม่เกิน maxHeight
    if (maxHeight) {
        const maxLines = Math.floor(maxHeight / lineHeight);
        if (lines.length > maxLines) {
            lines = lines.slice(0, maxLines);
            // ใส่ ... บรรทัดสุดท้าย
            let lastLine = lines[lines.length - 1];
            while (ctx.measureText(lastLine + "...").width > maxWidth && lastLine.length > 0) {
                lastLine = lastLine.slice(0, -1);
            }
            lines[lines.length - 1] = lastLine + "...";
        }
    }

    const totalHeight = lines.length * lineHeight;
    let startY = y;
    if (maxHeight) startY = y + (maxHeight - totalHeight) / 2;

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x + maxWidth / 2, startY + i * lineHeight);
    }
}

// --------------------
// CENTER-CROP IMAGE
// --------------------
function drawCroppedImage(img, x, y, w, h) {
    const iw = img.width;
    const ih = img.height;
    const scale = Math.max(w / iw, h / ih);
    const newW = iw * scale;
    const newH = ih * scale;
    const offsetX = (newW - w) / 2;
    const offsetY = (newH - h) / 2;
    ctx.drawImage(img, x - offsetX, y - offsetY, newW, newH);
}

// --------------------
// GENERATE IMAGE
// --------------------
async function generateImage() {
    try {
        canvas.width = 1200;
        canvas.height = 1713;

        const bg = new Image();
        bg.crossOrigin = "anonymous";
        bg.src = "Pic/buddies-anime-profile.png";

        await new Promise((resolve, reject) => {
            bg.onload = resolve;
            bg.onerror = reject;
        });

        ctx.drawImage(bg, 0, 0, 1200, 1713);
        ctx.fillStyle = "#000000";

        // --------------------
        // DRAW TEXT
        // --------------------
        ctx.font = "bold 36px Noto Sans JP, Arial, sans-serif";
        wrapTextCenter(ctx, formData.name, 89, 331, 424, 42, 100);
        wrapTextCenter(ctx, formData.nationality, 672, 331, 424, 42, 100);
        wrapTextCenter(ctx, formData.oshi, 89, 580, 1000, 42, 100);
        wrapTextCenter(ctx, formData.favoriteAnime, 89, 828, 1000, 42, 100);

        ctx.font = "bold 24px Noto Sans JP, Arial, sans-serif";
        wrapTextCenter(ctx, formData.member, 743, 1103, 353, 30, 240);

        ctx.font = "bold 36px Noto Sans JP, Arial, sans-serif";
        wrapTextCenter(ctx, formData.songs, 89, 1516, 1000, 42, 100);

        // --------------------
        // DRAW UPLOADED IMAGES
        // --------------------
        const positions = [
            { x: 74, y: 1087, w: 273, h: 285 },
            { x: 425, y: 1087, w: 273, h: 285 }
        ];

        for (let i = 0; i < images.length; i++) {
            if (!images[i]) continue;
            const img = new Image();
            img.src = images[i];
            await new Promise(resolve => img.onload = resolve);

            ctx.save();
            ctx.beginPath();
            ctx.rect(positions[i].x, positions[i].y, positions[i].w, positions[i].h);
            ctx.clip();
            drawCroppedImage(img, positions[i].x, positions[i].y, positions[i].w, positions[i].h);
            ctx.restore();
        }

        document.getElementById("generatedImage").src = canvas.toDataURL("image/png");
        formSection.style.display = "none";
        resultSection.style.display = "block";

    } catch (error) {
        console.error("Error generating image:", error);
        alert("An error occurred while generating the image. Please try again.");
    }
}

// --------------------
// DOWNLOAD IMAGE
// --------------------
function downloadImage() {
    const a = document.createElement("a");
    a.href = document.getElementById("generatedImage").src;
    a.download = "buddies_anime_card.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

}

document.getElementById("generateBtn").addEventListener("click", generateImage);
document.getElementById("downloadBtn").addEventListener("click", downloadImage);

document.getElementById("newBtn").addEventListener("click", () => {
    resultSection.style.display = "none";
    formSection.style.display = "block";
});

// --------------------
// SHARE TO TWITTER
// --------------------
document.getElementById("ShareBtn").addEventListener("click", () => {
    const pageUrl = encodeURIComponent(window.location.href);
    const tweetText = encodeURIComponent(
        "Make your own Buddies Anime Profile!\n#BloomSakurazaka #Sakurazaka46_AFASG25"
    );
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${pageUrl}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
});