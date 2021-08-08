export default class EmojiPicker {
	/** @type {HTMLDivElement} #node */
	#node;
	/** @type {HTMLDivElement} #emojiContainer */
	#emojiContainer;
	/** @type {HTMLSpanElement} #currentEmoji */
	#currentEmoji;
	/** @type {HTMLButtonElement} #emojiDropDown */
	#emojiDropdown;

	value = "\u{1F600}";

	/**
	 *  @callback EmojiChangeCallback
	 *  @param {String} value
	 *  @returns {void}
	 *  @type {EmojiChangeCallback} onChange
	 */
	onChange;

	/** @param {String} id Id of DOM element to generate the picker in */
	constructor(id) {
		// Get DOM nodes
		// @ts-ignore
		this.#node = document.getElementById(id);
		this.#generateHTML();

		// Populate container
		this.#getEmojis();

		// Register event listeners
		this.#emojiDropdown.addEventListener("click", (e) => {
			e.stopPropagation();
			if (this.#emojiContainer.classList.contains("hidden"))
				this.#showEmojiContainer();
			else this.#hideEmojiContainer();
		});

		this.#emojiContainer.addEventListener("click", (e) =>
			e.stopPropagation()
		);

		document.addEventListener("click", (e) => {
			this.#hideEmojiContainer();
		});
	}

	#generateHTML() {
		this.#node.classList.add("emoji-picker");
		this.#emojiDropdown = document.createElement("button");
		this.#emojiDropdown.classList.add("select");
		this.#currentEmoji = document.createElement("span");
		this.#currentEmoji.appendChild(document.createTextNode(this.value));
		this.#emojiDropdown.appendChild(this.#currentEmoji);
		this.#emojiDropdown.appendChild(document.createTextNode("\u00a0"));
		const caret = document.createElement("span");
		caret.classList.add("caret");
		caret.appendChild(document.createTextNode("\u25BC"));
		this.#emojiDropdown.appendChild(caret);
		this.#node.appendChild(this.#emojiDropdown);
		this.#emojiContainer = document.createElement("div");
		this.#emojiContainer.classList.add("container");
		this.#emojiContainer.classList.add("hidden");
		this.#node.appendChild(this.#emojiContainer);
	}

	#getEmojis() {
		for (let i = 0x1f600; i <= 0x1f644; i++) {
			const container = document.createElement("div");
			container.classList.add("emoji");
			const symbol = String.fromCodePoint(i);
			container.dataset.value = symbol;
			// Add the onclick event to each emoji
			container.addEventListener("click", () =>
				this.#emojiClickHandler(container)
			);
			const emoji = document.createTextNode(`${symbol}`);
			container.appendChild(emoji);
			this.#emojiContainer.appendChild(container);
		}
	}

	#showEmojiContainer() {
		this.#emojiContainer.classList.remove("hidden");
		this.#emojiDropdown.querySelector(".caret").textContent = "\u25B2";
	}

	#hideEmojiContainer() {
		this.#emojiContainer.classList.add("hidden");
		this.#emojiDropdown.querySelector(".caret").textContent = "\u25BC";
	}

	/** @param {HTMLElement} htmlElement */
	#emojiClickHandler(htmlElement) {
		this.#currentEmoji.innerText = htmlElement.dataset.value;
		this.value = htmlElement.dataset.value;
		this.#hideEmojiContainer();
		if (typeof this.onChange !== "undefined") {
			this.onChange(this.value);
		}
	}
}
