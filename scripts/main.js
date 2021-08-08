const pos = {
    x: 180,
    y: 220
};



/** @type {HTMLImageElement} */
let sussy;
/** @type {HTMLImageElement} */
let mask;

let emoji = String.fromCodePoint(0x1F602);


const container = document.getElementById("canvas");
const canvases = document.getElementsByTagName("canvas");
const canvas = {
    emoji: canvases[0],
    sussy: canvases[1]
};
const ctx = {
    emoji: canvas.emoji.getContext("2d"),
    sussy: canvas.sussy.getContext("2d")
}

ctx.emoji.textAlign = "center";
ctx.emoji.textBaseline = "middle";


/** @param {HTMLImageElement} */
function init(img1, img2) {
    sussy = img1;
    mask = img2;

    // scaling canvas
    sussy.width /= 4;
    sussy.height /= 4;
    canvas.emoji.width = canvas.sussy.width = sussy.width;
    canvas.emoji.height = canvas.sussy.height = sussy.height;
    container.style.width = sussy.width + "px";
    container.style.height = sussy.height + "px";

    $("#dpad button").on("click", function() {
        const dir = $(this).data("dir");
        if (dir == "up") pos.y--;
        else if (dir == "down")  pos.y++;
        else if (dir == "right")  pos.x++;
        else if (dir == "left")  pos.x--;
        go();
    });

    $("input").on("change", go);
    go();
}

function go() {
    const emoji = $("#txtEmoji").val().toString();
    ctx.emoji.font = $("#txtSize").val() + "px Arial";


    ctx.emoji.fillStyle = "white";
    ctx.emoji.fillRect(0, 0, canvas.emoji.width, canvas.emoji.height);

    ctx.sussy.fillStyle = $("#txtColor").val();
    ctx.emoji.fillText(emoji, pos.x, pos.y);

    ctx.sussy.clearRect(0, 0, canvas.emoji.width, canvas.emoji.height);


    // draw sussy
    ctx.sussy.filter = "none";
    ctx.sussy.globalCompositeOperation = "source-over";
    ctx.sussy.drawImage(sussy, 0, 0, canvas.emoji.width, canvas.emoji.height);

    // geting sussy overlay: "source-in" only fills rect where intersecting with sussy
    ctx.sussy.globalCompositeOperation = "source-in";
    ctx.sussy.filter = "blur(1px)";
    ctx.sussy.fillRect(0, 0, canvas.sussy.width, canvas.sussy.height);

    // now load sussy overlay into an image (can't apply globalCompositeOperation to imageData unfortunately)
    getImage(canvas.sussy.toDataURL()).then(overlay => {
        // draw sussy again
        ctx.sussy.filter = "none";
        ctx.sussy.clearRect(0, 0, canvas.sussy.width, canvas.sussy.height);
        ctx.sussy.globalCompositeOperation = "source-over";
        ctx.sussy.drawImage(sussy, 0, 0, canvas.sussy.width, canvas.sussy.height);
        
        // apply color mask
        ctx.sussy.globalCompositeOperation = "darken";
        ctx.sussy.drawImage(overlay, 0, 0, canvas.sussy.width, canvas.sussy.height);

        // draw mask
        ctx.sussy.globalCompositeOperation = "source-over";
        ctx.sussy.drawImage(mask, 0, 0, canvas.sussy.width, canvas.sussy.height);
    });

 
}


getImage("img/sussy.png").then(sussy => getImage("img/mask.png").then(mask => init(sussy, mask)));
    


function getImage(src) {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        }
        catch (ex) {
            reject(ex);
        }
    });
}
