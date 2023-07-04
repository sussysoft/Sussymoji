/** Retrieves image asynchronously
 * @param {string} src 
 * @returns {Promise<HTMLImageElement>}
 * */
export function getImage(src) {
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
