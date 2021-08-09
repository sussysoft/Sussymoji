import "../plugins/jquery-ui-1.12.1.js";
import { importCSS } from "./css.js";
importCSS("styles/popup.css")


// POPUP OPTIONS:
// ------------------ CONTENT ------------------
// title
//      message that appears in title bar
// icon
//      material icon to apply to title bar
// body
//      html to append to body content
// labels
//      text that appears in footer buttons.
//      format = { ok: "ok label", cancel: "cancel label" }
// buttons
//      list of auxiliary buttons to apply to top-left of title bar in the format of [{ type: "type", onclick: function() {} }]. 
//      NOTE: the "type" must align with a css class to bring in icon, i.e. "btn-attach", "btn-refresh"
//      NOTE: onclick is called within context of popup, and passed the $btn that was clicked

// ------------------ STYLING ------------------
// classes
//      classes to append to the popup. this is useful for applying popup-specific css without effecting other popups
//      NOTE: 2 ways of applying classes
//      "string": this list of classes will be applied to the .popup-modal element (outer-most element of the popup)
//      "object": { modal: "", body: "", etc }  these classes will be applied to the specified section of the popup instead of simply being applied to the outer-most element
// flex
//      due to weird behavior on the message div with shrinking/scrolling, sometimes we don't want flex column or flex row on the message div
//      possible values: null = none, "column" = flex column, "row" = flex row
// align
//      "center" -> "align-items: center"   | "end" -> "align-items: flex-end"
// size
//      "large": 75% width and 100% height of modal container for desktop size screens 
//      anything else: different widths based on screen size, auto expanding height
// mobile
//      if truthy, this will limit the max-width of fullscreen popup to 500px. Useful for popups that look very stretched out on desktop
// fullscreen
//      null/false: nothing
//      true: starts popup automatically maximized

// ------------------ EVENTS ------------------
// ok / cancel
//      function to call when ok/cancel is pressed
//      NOTE: if onok or oncancel is not provided, that button will not appear in footer
// onclose
//      function to call when popup is closed
//      NOTE: takes a (destroyAfter) parameter. if true, it will completely remove the popup upon fadeout


// ------------------ CUSTOM BEHAVIOR ------------------
// reverseButtons
//      switches ok/cancel buttons (assuming they both exist)
// noclose
//      prevents close X button from appearing in top right
// nomaximize
//      prevents min/max button from appearing in top right
// cancelOnClose
//      determines whether to call oncancel funciton when closing

// ------------------ TODO ------------------
// if ever necessary, add param to prevent closing on dimmer (clicking outside of box)

/**


    @typedef {Object} FooterButton
    @property [label] {string} optional label to apply to button (default is "Ok" for ok and "Cancel" for cancel)
    @property [click] {PopupCallback} funciton to call when clicked, return false will prevent popup from closing
    @property [class] {string} optional string to override class (useful for when cancel button shouldn't be red)

    @this {Popup} 
    @callback AuxiliaryButtonClick
    @param $btn {JQuery<HTMLElement>} button element that was clicked
    @returns {void}

    @this {Popup} 
    @callback PopupCallback
    @param popup {Popup}
    @param [args] {...*} optional additional args that can be sent for different popup types
    @returns {any} returning false prevents popup from closing automatically

    @this {Popup} 
    @callback PopupInit
    @param {Popup} popup
    @returns {void} function to call immediately for initiating popup


    @typedef {Object} AuxiliaryButton
    @property type {string} determines css class to apply for injecting material icon (i.e. "btn-attch", "btn-refresh") TODO: this should probably just be html instead of css... the issue is that certain icons need diff margin/padding to align
    @property onclick {AuxiliaryButtonClick} function to call on click ($btn gets passed to funciton and "this" will be within context of popup)
    @property [disabled] {boolean} is truthy, button is disabled by default

    @typedef {Object} ClassObject
    @property [body] {string} css class to apply to body
    @property [modal] {string} css class to apply to modal

    // TODO: organize args into categorized objects? i.e. "args.style.align" vs "args.align". this would be much cleaner because there's way too many options

    @typedef {Object} PopupOptions
    @property [title] {string} message that appears in title bar
    @property [icon] {string} material icon to apply to title bar
    @property [body] {string} html to append to body content
    @property [init] {PopupInit} function to call immediately for initiating popup
    @property [buttons] {Array<AuxiliaryButton>} auxiliary buttons to add to top-left corner
    @property [classes] {string|ClassObject} classes to apply to entire popup or specified element
    @property [modal] {boolean} determines whether to make popup modal
    @property [centerTitle] {boolean} determines whether to center title
    @property [error] {boolean} if truthy, applies red error theme to popup
    @property [separateFooter] {boolean} adds a border to separate footer? 
    @property [position] {string} "center" or "top" (default). applies position class to the modal element (ignored in fullscreen)
    @property [pad] {string} [none, horizontal, vertical, top, small] determines padding class to apply to popup body.
    @property [overflow] {boolean} determines whether to apply overflow class to modal. this allows dropdowns to escape popup body
    @property [flex] {string} possible values: null = none, "column" = flex column, "row" = flex row
    @property [align] {string} "center" = "align-items: center", "end" = "align-items: flex-end"
    @property [size] {string} "large" is currently the only size supported, everything else is default
    @property [mobile] {boolean} if truthy, this will limit the max-width of fullscreen popup to 500px. Useful for popups that look very stretched out on desktop
    @property [fullscreen] {boolean|string} truthy starts popup automatically maximized, "mobile" enforces fullscreen at mobile screen width
    @property [ok] {FooterButton|PopupCallback|boolean} 
    @property [cancel] {FooterButton|boolean}
    @property [onclose] {PopupCallback} funciton to call when popup is closed
    @property [reverseButtons] {boolean} switches ok/cancel buttons (assuming they both exist)
    @property [noclose] {boolean} prevents close X button from appearing in top right
    @property [nomaximize] {boolean} prevents min/max button from appearing in top right
    @property [nodrag] {boolean} prevents dragging popup
    @property [cancelOnClose] {boolean} determines whether to call oncancel when closing

**/

export class Popup {
    /**
    @param args {PopupOptions}
    **/
    constructor(args) {
        // each popup has a generic object for storing extended properties
        // previously, these properties would get stored directly on the popup itself, this is not only less organized, but ts-check doesn't like it
        // beacuse these properties don't exist on the popup type
        this.ext = {};
        
        
        // generating buttons given args labels and reverseButtons property


        var ok = getFooterButton(args.ok, "OK");
        var cancel = getFooterButton(args.cancel, "Cancel");

        // TODO: apply left/right margin ONLY if both buttons exist
        let okButton = args.ok ? ("<button type='button' class='ok " + ok.class + (args.cancel ? (args.reverseButtons ? "marg-left-25" : "marg-right-25") : "") + "'>" + ok.label + "</button>") : "";
        let cancelButton = args.cancel ? ("<button type='button' class='cancel " + cancel.class + (args.ok ? (args.reverseButtons ? "marg-right-25" : "marg-left-25") : "") + "'>" + cancel.label + "</button>") : "";
        let buttonHtml = args.reverseButtons ? cancelButton + okButton : okButton + cancelButton;

        // #region applying classes from args
        // position applies a different class to the .modal
        // however, this positon does NOT apply when full screen
        // potential positions are currently: "center", "top"
        let position = args.position ? (args.position + " ") : "top ";
        let size = args.size == "large" ? " large " : " ";
        let overflow = args.overflow ? "overflow " : " ";
        let pad = args.pad == "none" ? "pad-none " :
            args.pad == "horizontal" ? "pad-horiz " :
                args.pad == "vertical" ? "pad-vert " :
                    args.pad == "top" ? "pad-top " :
                        args.pad == "small" ? "pad-small " : "";
        let mobile = args.fullscreen == "mobile" ? "mobile " : ""; // this will only allow full-screen in mobile
        let isModal = (typeof args.modal == "boolean" ? args.modal : true);
        let modal =  isModal ? "modal " : "";

        let modalClasses = "", bodyClasses = "";
        if (args.classes) {
            // classes = string? apply to .popup-modal
            if (typeof args.classes === "string") {
                modalClasses = args.classes;
            }
            // otherwise, apply to specified section
            else if (typeof args.classes === "object") {
                if (typeof args.classes.modal === "string" && args.classes.modal) {
                    modalClasses = args.classes.modal;
                }
                if (typeof args.classes.body === "string" && args.classes.body) {
                    bodyClasses = args.classes.body;
                }
            }
        }
        // #endregion applying classes from args

        /** @type {JQuery<HTMLDivElement>} */
        this.$container = $("<div class='popup-modal " + modal + position + mobile + size + overflow + pad + (args.error ? "error " : "") + (args.fullscreen ? "full-screen " : "") + modalClasses + "'>\
            <div class='dimmer'></div>\
            <div class='popup flex column'>\
                <div class='header flex center no-shrink'>\
                    <div class='flex fill center title" + (args.centerTitle ? " justify-center" : "") + "'>" +
            (args.icon ? "<i class='material-icons marg-right-25'>" + args.icon + "</i>" : "") +
            (args.title ? args.title : "Popup Title") +
            "</div>" +
            (args.nomaximize ? "" : "<button type='button' class='btn-icon no-shrink " + (args.fullscreen ? "btn-minimize" : "btn-maximize") + "'></button>") +
            (args.noclose ? "" : "<button type='button' class='btn-icon btn-close no-shrink'></button>") +
            "</div>\
                <div class='body flex fill scroll " +
            (args.flex == "column" ? "column " : args.flex == "row" ? "row " : "") +
            (args.align == "center" ? "center center-align " : args.align == "end" ? "justify-end " : "") +
            bodyClasses +
            "'>" + (args.body ? args.body : "") + "</div>\
                <div class='footer no-shrink" + (args.separateFooter ? " separated" : "") + "'>" + buttonHtml + "</div>\
            </div>\
        </div>");


        let popup = this;

        if (args.buttons && args.buttons.length) {
            let $title = this.$container.find(".title");
            args.buttons.forEach(btn => {
                $("<button type='button' class='btn-icon btn-aux no-shrink btn-" + btn.type + "'" + (btn.disabled ? " disabled='disabled'" : "") + "></button>")
                    .on("click", function() {
                        btn.onclick.call(popup, $(this))
                    })
                    .insertBefore($title);
            });
        }

        this.$popup = this.$container.children(".popup");
        this.$header = this.$popup.children(".header");
        this.$body = this.$popup.children(".body");
        this.$footer = this.$body.next();

        // events
        // note: for all the following events, we check if result is != false to allow closing. This allows falsey values to continue closing (i.e. null). 
        // not every ok is going to return a value, we only want to prevent closing when value is "false" specifically
        const close = () => {
            return new Promise((resolve, _) => {
                if (this.resizeHandler) {
                    window.removeEventListener("resize", this.resizeHandler);
                }
                this.$container.fadeOut(Popup.FadeSpeed.OUT, () => {
                    this.$container.remove();
                    resolve();
                });
            })
        }

        /**
         * async onclose event, returns promise. resolves when popup has successfully faded out
         @param {boolean} silent allows force closing a popup, bypassing close event
         */
        this.onclose = typeof args.onclose === "function" ? /** @param {boolean?} [silent] */ silent => {
            // 02-08-21 new "silent" parameter: allows force closing a popup, bypassing onclose event. (useful for certain situations such as sales portal contact validation)
            if (silent) {   
                console.log("silently closing");
                return close();
            }
        
            return new Promise((resolve, reject) => {
                invokeAsync(args.onclose.call(popup, popup), /** @param {any} result */ result => {

                    // prevent closing if onclose returns false (onclose may return promise instead, in which case we check for false promise value)
                    // NOTE: ignoring "falsey" values, it has to specifically be false in order to reject, because oftentimes this result is undefined or null which are falsey
                    if (result == false) {
                        reject("Popup rejected close event.");
                    } else {
                        close().then(() => resolve());
                    }

                });
            });
            
        } : close;


        
        this.onok = ok.click ? () => {
            let $buttons = popup.$footer.find("button").prop("disabled", "disabled");

            // prevent closing if onok returns false (onok may return promise instead, in which case we check for false promise value)
            invokeAsync(ok.click.call(popup, popup), /** @param {any} result */ result => {
                if (result != false) {
                    popup.close();
                }
                else {
                    // 03-29-21: auto-reenabling buttons when onok returns false
                    // onok failed validation -> wait a few milliseconds before re-enabling buttons to prevent accidental double clicks
                    setTimeout(() => $buttons.prop("disabled", false), 400);
                }
            });
        } : function () { popup.close() };



        this.oncancel = cancel.click ? () => {
            // prevent closing if oncancel returns false (oncancel may pass return promise instead, in which case we check for false promise value)
            invokeAsync(cancel.click.call(popup, popup), /** @param {any} result */ result => {
                if (result != false) {
                    popup.close();
                }
            });
        } : function () { popup.close() };

        this.init = typeof args.init === "function" ? () => args.init.call(popup, popup) : function () { };


        let $appendTo = $("#menuContentPadder");
        if (!$appendTo.length) {
            $appendTo = $("body");
        }
        popup.$container.appendTo($appendTo);
        popup.show();

        // if forced to fullscreen, don't allow dragging. otherwise, dragging is toggled whenever maximize is toggled
        if (!args.nodrag && !(args.fullscreen == true && args.nomaximize)) {
            let disabled = args.fullscreen == true ? true : (args.fullscreen == "mobile" && window.innerWidth <= 500 ? true : false);
            popup.$popup.draggable({
                scroll: false,
                containment: popup.$container,
                handle: popup.$header,
                //cursor: "grabbing",
                disabled: disabled // default dragging to disabled when full screen mode
            });

            // if popup bottom escapes container, move to top
            if (popup.$popup.offset().top + popup.$popup.height() >= popup.$container.height()) {
                popup.$popup.css("top", "0");
            }

            if (args.fullscreen == "mobile") {
                this.resizeHandler = function () {
                    // only time dragging is disable for mobile popups is when screen is mobile-sized and popup is fullscreen
                    if (window.innerWidth < 500 && popup.$container.hasClass("full-screen")) {
                        // @ts-ignore
                        popup.$popup.css({ top: 0, left: 0 }).draggable("disable");
                    } else {
                        // @ts-ignore
                        popup.$popup.draggable("enable");
                    }
                };
                window.addEventListener("resize", popup.resizeHandler);
            }
        }

        // calling onok/oncancel from context of $popup
        // i.e. inside of those methods, $(this) will refer to $popup
        // 09-09-20: popup buttons now disable themselves upon click to prevent multiple calls on fast double clicks. this might cause some issues with certain popups that allow user to fix issues and click ok a second time,  in which case they need to manually re-enable ok button on failure
        if (args.ok) {
            this.$container.find("button.ok").on("click", function () {
                // 03-29-20: moving this to inside onok func because its async and not passing back promise chain. also want to auto-reenable button after timeout when result is false
                //$(this).prop("disabled", "disabled");
                popup.onok.call(popup, popup);
            });
        }

        // if no oncancel is provided, make close button simply call close/destroy
        this.$container.find("button.cancel").on("click", function () {
            $(this).prop("disabled", "disabled");
            popup.oncancel.call(popup, popup);
        });

        this.$container.find(".header")
            .on("click", ".btn-close", function() {
                $(this).prop("disabled", "disabled");
                if (args.cancelOnClose) {
                    popup.oncancel.call(popup, popup)
                } else {
                    popup.close();
                }
            }) 
            .on("click", ".btn-maximize", function () {
                // weird scenario: sometimes in chrome mobile emulator, minimize/maximize click is firing immediately after switching minimize/maximize classes (i.e. 1 click = 2 events)
                // and because these are "live" events, you can't stop propagation. easiest solution is to wait 1 milliseocnd
                setTimeout(() => {
                    // note: min/maximizing removes position class and replaces it will "full-screen" and vice-versa
                    $(this).removeClass("btn-maximize").addClass("btn-minimize");
                    popup.$container.removeClass(position).addClass("full-screen");
                    if (!args.nodrag) {
                        // @ts-ignore
                        popup.$popup.css({ top: 0, left: 0 }).draggable("option", "disabled", true);
                    }
                }, 1);
            })
            .on("click", ".btn-minimize", function () {
                // weird scenario: sometimes in chrome mobile emulator, minimize/maximize click is firing immediately after switching minimize/maximize classes (i.e. 1 click = 2 events)
                // and because these are "live" events, you can't stop propagation. easiest solution is to wait 1 milliseocnd
                setTimeout(() => {
                    $(this).removeClass("btn-minimize").addClass("btn-maximize");
                    popup.$container.removeClass("full-screen").addClass(position);
                    if (!args.nodrag) {
                        // @ts-ignore
                        popup.$popup.draggable("option", "disabled", false);
                    }
                }, 1);

              
            });


        if (isModal) {
            popup.$container.find(".dimmer").on("click", function () {

                // result might be promise that we have to wait for
                invokeAsync(args.cancelOnClose ? popup.oncancel.call(popup, popup) : popup.onclose(), /** @param {any} value */ value => {
                    // need to turn off click event to prevent calling multiplle times on fast double click
                    if (value) {
                        $(this).off("click");
                    }
                });
             
            });
        }


        popup.init();
        
    }

    /** @param {boolean} [silent] */
    close(silent = false) {
        return this.onclose(silent)
    }

    show () {
        this.$container.hide().fadeIn(Popup.FadeSpeed.IN);
    }
    hide() {
        this.$container.fadeOut(Popup.FadeSpeed.OUT);
    }

    maximize() {
        this.$container.find(".header").find(".btn-maximize").click();
    }
    minimize() {
        this.$container.find(".header").find(".btn-minimize").click();
    }


    // #region notifications
    // notify is the base notification function used by error and success
    // message: the html to be injected inside notification body. if null/"", notification will not be created
    // timeout: time (in ms) before notification is auto-closed. timeout=0 requires manual click to close. DEFAULT = 2 seconds
    // position: TODO: top-center, top-left, etc
    // color: possible colors are "success", "error", "accent", "text", "menu" (theme colors)
    // UNFINISHED: have notifications stack on top of eachother
    // UNFINISHED: allow growing to max-width (max-width is screen width on small screens?)
    /**
     * @param {string} message 
     * @param {string} color 
     * @param {number?} timeout 
     * @returns 
     */
    static notify(message, color, timeout) {
        if (message == null || message == "") {
            console.log("Popup.notify: notification not created because message was empty.");
            return;
        }


        let $container = $(".popup-notifications");
        if (!$container.length) {
            $container = $("<div class='popup-notifications'></div>").appendTo($("body"));
        }
       
        let $this = $("<div class='" + (color??"accent") + "'>" + message + "</div>").appendTo($container).hide().fadeIn(Popup.FadeSpeed.IN);

        function close() {
            $this.fadeOut(Popup.FadeSpeed.OUT, function () {
                $this.remove();
            });
        }

        $this.on("click", close);


        // if timeout, auto-close after time reached, otherwise require manual click to close
        // (timeout defaults to 2000, but can be set to <0 to disable)
        if ((isNaN(timeout) ? 2000 : timeout) > 0) {
            setTimeout(close, timeout);
        }
    }

    static closeAllNotifications() {
        $(".popup-notifications").children().fadeOut(Popup.FadeSpeed.OUT, function () { $(this).remove() });
    }

    /**
     * @param {string} message 
     * @param {number?} [timeout]
     * @returns 
     */
    static success(message, timeout) {
        return this.notify(message, "success", timeout);
    }

    
    /**
     * @param {string} message 
     * @param {number?} [timeout ]
     * @returns 
     */
    static error(message, timeout) {
        return this.notify(message, "error", timeout);
    }
    // #endregion notifications

    /** @param {PopupOptions & PromptOptions} options */
    static prompt = (options) => new PromptPopup(options); 
}

// apparently classes can only have static methods and not properties...
Popup.FadeSpeed = {
    IN: 250,
    OUT: 125
}

/** 
    @callback PromptPopupCallback
    @param popup {PromptPopup}
    @param value {any}
    @returns {any} false will cancel onclose (not for onchange)

    @typedef {Object} PromptOptions
    @property [message] {string} message to put above input
    @property [label] {string} label to put in input wrapper
    @property [value] {any} value to default into input
    @property [type] {string} type to apply to input. if "number", constrains input to numeric values
    @property [placeholder] {string} placheolder for input
    @property [onchange] {PromptPopupCallback}  called when input value changes. called within context of popup
    @property [buttonless] {boolean} determines whether ok/cancel buttons are generated. NOTE: if no buttons, an onchange is required for the prompt to do anything
 */
class PromptPopup extends Popup {
    /** @param {PopupOptions & PromptOptions} args */
    constructor(args) {
        if (!args) {
            args = {}
        }

        // #region overriding some options

        args.classes = "popup-prompt";
        args.flex = "column";
        args.body = "<div class='prompt-message'>" + (typeof args.message === "string" ? args.message : "") + "</div>\
            <div class='input-wrapper marg-top-25'>\
                <label>" + (typeof args.label === "string" ? args.label : "") + "</label>\
            <input " +
            (args.type === "number" ? "type='number' pattern='[0-9]*' " : "") +
            (typeof args.value !== "undefined" && args.value !== null ? "value='" + args.value + "'" : "") + " " +
            (typeof args.placeholder !== "undefined" && args.placeholder !== null ? "placeholder='" + args.placeholder + "'" : "") +
            " />\
            </div>";

        const ok = getFooterButton(args.ok, "OK");
        const cancel = getFooterButton(args.cancel, "Cancel");

        // NOTE: only doing ok/cancel if not buttonless. otherwise the logic needs to be done in onchange for anything to happen
        // TODO: do we want to return popup or promise?
        if (ok.click) {     
            args.ok = {
                label: ok.label,
                class: ok.class,
                /** @this PromptPopup */
                click: function () {
                    return ok.click.call(this, this, this.$body.find("input").val());
                }
            }
        }
        if (cancel.click) {
            args.cancel = {
                label: cancel.label,
                class: cancel.class,
                /** @this PromptPopup */
                click: function () {
                    return oncancel.call(this, this, this.$body.find("input").val());
                }
            }
        }
        // #endregion

        super(args);

        this.$message = this.$body.find(".prompt-message");
        this.$input = this.$body.find("input").focus().select();

        /** update message with provided string. if error is truthy, the text will be error color
         *  @param {string} message
         *  @param {boolean} isError */
        this.updateMessage = function (message, isError) {
            this.$message.html(message).toggleClass("error", isError);
        }
        /** update label with provided string. if error is truthy, the input will be error color
        *  @param {string} label
        *  @param {boolean} isError */
        this.updateInput = function (label, isError) {
            this.$input.prev().html(label).parent().toggleClass("error", isError);
        }

        if (args.onchange) {
            this.$input.on("change", () => args.onchange.call(this, this, this.$input.val()))
        }

        this.$input.on("keydown", e => {
            let key = e.which || e.keyCode;
            if (key == 13) {
                if (ok.click) {
                    ok.click(this);
                } else {
                    this.$input.trigger("change");
                }
            }
        });

    }
}


/** Takes an expression to to execute on a value. if value is a promise, it waits for the promise to return a value, otherwise it executes with the value immediately
 * @param {any} object
 * @param {Function} func
 */
function invokeAsync(object, func) {
    if (object instanceof Promise) {
        object.then(result => func(result))
    } else {
        func(object);
    }
}



/** for ease of programming, footer buttons can be passed in 3 different ways, an object, a function, or a boolean. Need to convert these into a consistent type to make things more straight forward down the line
 * @param {FooterButton|PopupCallback|boolean} footerButton
 * @param {string} defaultLabel
 */
    function getFooterButton(footerButton, defaultLabel) {
    // null || bool || function gets no custom class, default label, and only has click function if passed as a function
    if (!footerButton || typeof footerButton === "boolean" || typeof footerButton === "function") {
        return {
            class: "",
            label: defaultLabel,
            click: typeof footerButton == "function" ? footerButton : null
        };
    }
    return {
        class: (footerButton.class + " " ) ?? "",
        label: footerButton.label ?? defaultLabel,
        click: footerButton.click
    }
};