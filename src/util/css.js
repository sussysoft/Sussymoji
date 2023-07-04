/** adds CSS only if it already hasn't been added
 * @param {string} href */
export function importCSS(href) {
    if (!$("head>link[href='" + href + "']").length) {
        console.log("IMPORTING CSS... " + href)
        $("head").append('<link rel="stylesheet" type="text/css" href="' + href + '">');
    }
}

