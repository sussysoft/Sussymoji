
/** 
 * @typedef {object} Vector
 * @property {number} x
 * @property {number} y
 */

/**
 * @param {any} obj
 * @param {number} defaultVal */
export function getNumber(obj, defaultVal) {
	const num = Number(obj);
	return !isNaN(num) ? num : defaultVal;
}
