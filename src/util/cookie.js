// document.cookie is a string containing all cookie keys and values with no built in way to get a specific cookie value by name
// this method uses regex to split the string and get the value after "name="
/** returns value for specified cookie name (if found)
 * @param {string} key
 * @returns {string}
 */
export function getCookie(key) {
    if (document.cookie) {
        var match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
        if (match) return match[2];
    }
    return null;
}

/** returns object represenation of entire document cookie 
 * @returns {Object<string,string>} */
export function getCookies() {
    /** @type {Object<string,string>} */
    const obj = {};

    if (document.cookie) {
        let cookies = document.cookie.split("; ");
        cookies.forEach(cookie => {
            let split = cookie.split("=");
            if (split.length) {
                let key = split[0];
                obj[key] = split.length > 1 ? split[1] : null;
            }
        })
    }

    return obj;
}


/** saves all key/value pairs to document cookie
 * @param {Object<string,string>} obj object containing key/value pairs to add to cookie
 * @param {boolean} [global] if true, will be set for entire domain (root url)  */
export function setCookie(obj, global = false) {
    let date = new Date();
    date.setFullYear(3000);
    let suffix = "; path=" + (global ? "/" : location.pathname) + "; expires=" + date.toUTCString();
    for (var key in obj) {
        document.cookie = key + "=" + obj[key] + suffix;
    }
}



/** deletes specified key from cookie (if found)
 * @param {string} key */
export function deleteCookie(key) {
    let date = new Date();
    date.setFullYear(1900);
    document.cookie = key + "=null; expires=" + date;
}


/** @callback LeaveCookieCallback
 * @returns {Object<string,string>} */

/** @param {LeaveCookieCallback} callback 
 *  @param {boolean} [global] */
export function leaveCookie(callback, global = false) {
    $(window).on("pagehide", function () {
        console.log("PAGEHIDE");
        let args = callback();
        setCookie(args, global);
    });
}