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

		/** using this flag to avoid async issue where img src is set but not loaded in yet */
		let loaded = false;
		/** @type {HTMLImageElement} */
		let temp_img;

		super({
			title: "Select Image",
			body: (
				`<div class='center-align'>Upload file or enter URL...</div>
				<img/>
				<input type='file' accept='image/png, image/jpeg' class='marg-top-100' />
				<input type='text' placeholder='Image URL...' class='marg-top-100'>`
			),
			flex: "column",
			icon: "photo",
			cancel: true,
			init: function (popup) {
	
				img = popup.$body.find("img").get(0);

				/** 
				 * validates image before setting it
				 * @param {string} src 
				 * */
				async function setImage(src) {
					loaded = false;
					temp_img = await getImage(src);
					if(temp_img.width > face.maxFaceSize.x || temp_img.height > face.maxFaceSize.y) {
						return Popup.error(`Image exceeds max size of ${face.maxFaceSize.x}x${face.maxFaceSize.y}`);
					}
				
					img.src = src;
					return loaded = true;
				}

				fileInput = /** @type {HTMLInputElement} */ (
                    popup.$body.find("input[type='file']").on("change", async function () {
                        if (fileInput?.files && fileInput.files[0] && await setImage(URL.createObjectURL(fileInput.files[0]))) {
							// clear url input if file input is being used
                            urlInput.value = "";
                        } else {
							fileInput.value = null;
						}
                    }).get(0)
                );

				urlInput = /** @type {HTMLInputElement} */ (
                    popup.$body.find("input[type='text']").on("change", async function() {
                        if (urlInput?.value && await setImage(urlInput.value)) {
							// clear file input if url input is being used
							fileInput.value = null;
						} else {
							urlInput.value = "";
						}
                    }).get(0)
                );


			},
			ok: {
				click: async function () {	
					if (!temp_img) return Popup.error("No image selected");		
					face.setImage(temp_img);	
					return true;
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
