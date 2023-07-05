import EmojiPicker from "../emoji-picker.js";
import { Sussymoji } from "../../sussymoji.js";
import { getImage } from "../../util/img.js";
import { Popup } from "./popup.js";



export class FaceTypePopup extends Popup {
    /** @param {Sussymoji} face */
	constructor(face) {
		super({
			classes: "face-type-popup",
			title: "Face Type",
			icon: "face",
			ok: {
				label: "Emoji",
				click: () => new EmojiPopup(face),
			},
			cancel: {
				label: "Image",
				click: () => new ImagePopup(face),
				class: "accent",
			},
		});
	}
}

class ImagePopup extends Popup {
    /** @param {Sussymoji} face */
	constructor(face) {
		/** @type {HTMLInputElement} */ let fileInput;
		/** @type {HTMLInputElement} */ let urlInput;
		/** @type {HTMLImageElement} */ let img;

		

		super({
			title: "Select Image",
			body: (
				`<div class='center-align'>Upload file or enter URL...</div>
				<img/>
				<input type='file' accept='image/png, image/jpeg' class='marg-top-100' />
				<input type='text' placeholder='Image URL...'>
				<div id='error' style='color:red'></div>`
			),
			flex: "column",
			overflow: true,
			icon: "photo",
			cancel: true,
			init: function (popup) {
				fileInput = /** @type {HTMLInputElement} */ (
                    popup.$body.find("input[type='file']").on("change", function () {
                        if (fileInput?.files && fileInput.files[0]) {
                            img.src = URL.createObjectURL(fileInput.files[0]);
                            urlInput.value = "";
                        }
                    }).get(0)
                );

				urlInput = /** @type {HTMLInputElement} */ (
                    popup.$body.find("input[type='text']").on("change", function() {
                        if (urlInput?.value) img.src = urlInput.value;
                    }).get(0)
                );

				img = popup.$body.find("img").get(0);

			},
			ok: {
				click: async function () {
					// file provided -> convert to base64					
					// url provided -> map directly to img src
					const url = fileInput?.files && fileInput.files[0] ? URL.createObjectURL(fileInput.files[0]) : urlInput?.value;
					if (url) {
						face.setImage(await getImage(img.src = url));
						if(face.img.width > face.maxFaceSize.w || face.img.height > face.maxFaceSize.h) {
							if($("#error").is(':empty')) {
								$("#error").append(`Please enter an image with a max size of ${face.maxFaceSize.w}x${face.maxFaceSize.h}`);
								return false;
							}

							// pulse the error message to draw attention to why popup won't close
							$("#error").css("opacity", "0");
							$("#error").fadeTo(1000, 1);

							return false;
						}
						return true;
					}
					// neither file nor url provided -> prevent close
					return false;
				},
			},
		});
	}
}

/** @type {String} emojiCarryover */
var emojiCarryover;
class EmojiPopup extends Popup {
    /** @param {Sussymoji} face */
	constructor(face) {
		/** @type {EmojiPicker} */
		let picker;
		super({
			title: "Pick Emoji",
			body: '<div id="emojiPicker"></div>',
			icon: "face",
			pad: "none",
			nomaximize: true,
			fullscreen: "mobile",
			init: () => picker = new EmojiPicker("emojiPicker", emojiCarryover),
			cancel: true,
			ok: async function () {
				if (!picker.value) return Popup.error("No Emoji Selected");

				emojiCarryover = picker.value;
				// #region converting emoji to image
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");

				canvas.width = 512;
				canvas.height = 512;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillStyle = "black";
				ctx.font = "256px Arial";

				// measure text to get bounding box
				const metrics = ctx.measureText(picker.value);
				let height =
					metrics.actualBoundingBoxAscent +
					metrics.actualBoundingBoxDescent;

				// fill text then extract data within bounding box
				ctx.fillText(picker.value, canvas.width / 2, canvas.height / 2);
				const data = ctx.getImageData(
					canvas.width / 2 - metrics.width / 2,
					canvas.height / 2 - metrics.actualBoundingBoxAscent,
					metrics.width,
					height
				);

				// now rescale canvas and put image data back
				canvas.width = metrics.width;
				canvas.height = height;
				ctx.putImageData(data, 0, 0);

                face.setImage(await getImage(canvas.toDataURL()));
                return true;
				// #endregion
			},
		});
	}
}
