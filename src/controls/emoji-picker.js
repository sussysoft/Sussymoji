import { importCSS } from "../util/css.js";
importCSS("styles/emojipicker.css");

export default class EmojiPicker {
	/** @type {HTMLElement} #node */
	#node;
	/** @type {HTMLElement} #emojiContainer */
	#emojiContainer;
	/** @type {HTMLInputElement} #emojiSearch */
	#emojiSearch;
	/** @type {Number} #searchTask */
	#searchTask;

	/** @type {String} value */
	value;

	/**
	 *  @callback EmojiChangeCallback
	 *  @param {String} value
	 *  @returns {void}
	 *  @type {EmojiChangeCallback} onChange
	 */
	onChange;

	/**
	 * @param {String} id Id of DOM element to generate the picker in
	 * @param {String} initialValue Starting emoji, leave null for default
	 * */
	constructor(id, initialValue) {
		// Get DOM nodes
		this.#node = document.getElementById(id);
		this.value = initialValue ?? "\u{1F600}";
		this.#generateHTML();

		// Populate container
		this.#getEmojis();

		// focus / select contents of searchbox for quick searching
		this.#emojiSearch.select();
	}

	#generateHTML() {
		this.#node.classList.add("emoji-picker");
		this.#emojiContainer = document.createElement("div");
		this.#emojiContainer.classList.add("container");
		this.#emojiSearch = document.createElement("input");
		this.#emojiSearch.classList.add("search");
		this.#emojiSearch.placeholder = "Search...";
		this.#emojiSearch.addEventListener("keyup", () =>
			this.#searchInputHandler(this.#emojiSearch.value)
		);
		this.#node.appendChild(this.#emojiSearch);
		this.#node.appendChild(this.#emojiContainer);
	}

	/** @param {String} value */
	#searchInputHandler(value) {
		clearTimeout(this.#searchTask);
		this.#searchTask = setTimeout(() => {
			this.#searchEmojis(value);
		}, 250);
	}

	#cleanContainer() {
		const emojis = this.#emojiContainer.querySelectorAll(".emoji");
		emojis.forEach((emoji) => {
			this.#emojiContainer.removeChild(emoji);
		});
	}

	/** @param {Number} codePoint */
	#addEmojiToContainer(codePoint) {
		const symbol = String.fromCodePoint(codePoint);
		const container = document.createElement("div");
		container.classList.add("emoji");
		container.dataset.value = symbol;
		if (symbol === this.value) container.classList.add("selected");
		// Add the onclick event to each emoji
		container.addEventListener("click", () => {
			this.#emojiClickHandler(container);
		});
		const emoji = document.createTextNode(`${symbol}`);
		container.appendChild(emoji);
		this.#emojiContainer.appendChild(container);
	}

	/** @param {String} search */
	async #searchEmojis(search) {
		if (search == "") {
			this.#getEmojis();
			return;
		}

		/** @type {JSON[]} result */
		var result = await fetch(
			"https://emoji-api.com/emojis?" +
				new URLSearchParams({
					access_key: "775585e582c785f1a289ab6fe2f3e171127d07e7",
					search: search,
				})
		)
			.then((resp) => resp.json())
			.then((data) => data)
			.catch(() => null);

		if (result != null) result = result.slice(0, 84);
		this.#cleanContainer();

		(result ?? []).forEach((/** @type {any} */ res) => {
			const codePoint = Number.parseInt(`0x${res.codePoint}`);
			this.#addEmojiToContainer(codePoint);
		});
	}

	#getEmojis() {
		this.#cleanContainer();
		for (let i = 0x1f600; i <= 0x1f644; i++) {
			this.#addEmojiToContainer(i);
		}
	}

	/** @param {HTMLElement} htmlElement */
	#emojiClickHandler(htmlElement) {
		const emojis = this.#emojiContainer.querySelectorAll(".emoji");

		emojis.forEach((/**@type {HTMLElement}*/ emoji) => {
			if (emoji.dataset.value === this.value)
				emoji.classList.remove("selected");
		});
		this.value = htmlElement.dataset.value;
		htmlElement.classList.add("selected");
		if (typeof this.onChange !== "undefined") {
			this.onChange(this.value);
		}
	}
}
