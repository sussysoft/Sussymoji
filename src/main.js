// main.js is the UI layer
import { getCookies, leaveCookie } from "./util/cookie.js";
import { FaceTypePopup } from "./controls/popups/face-type-popup.js";
import { Sussymoji } from "./sussymoji.js";
import { getNumber } from "./util/math.js";

const cookie = getCookies();
leaveCookie(() => ({
	x: sussy.pos.x.toString(),
	y: sussy.pos.y.toString(),
	scale_x: sussy.scale.x.toString(),	
	scale_y: sussy.scale.y.toString(),
}));


// load sussy, then initialize UI events
const sussy = new Sussymoji({
	pos: {
		x: getNumber(cookie.x, 60),
		y: getNumber(cookie.y, 60),
	},
	scale: {
		x: getNumber(cookie.scale_x, 1),
		y: getNumber(cookie.scale_y, 1),
	}
});

sussy.load().then(() => {

	// hiding everything until images load
	document.body.style.display = "block";

	$("#horiz").val(sussy.pos.x).on("input", function () {
		sussy.pos.x = Number($(this).val());
		sussy.render();
	});

	$("#vert").val(sussy.pos.y).on("input", function () {
		sussy.pos.y = Number($(this).val());
		sussy.render();
	});

	
	$("#scale_horiz").val(sussy.scale.x).on("input", function () {
		sussy.scale.x = Number($(this).val());
		sussy.render();
	});

	$("#scale_vert").val(sussy.scale.y).on("input", function () {
		sussy.scale.y = Number($(this).val());
		sussy.render();
	});

	// change color -> generate new colored sussy
	$("#color").on("change", function () {
		sussy.setColor($(this).val()?.toString());		
	}).trigger("change");

	// download -> create link to data url then click it
	$("#btnDownload").on("click", function () {
		const link = document.createElement("a");
		link.download = "sussymoji.png";
		link.href = sussy.ctx.canvas.toDataURL();
		link.click();
	});

	$("#face").on("click", () => new FaceTypePopup(sussy));
		
})