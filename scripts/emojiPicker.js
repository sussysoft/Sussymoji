export const currentEmoji = document.getElementById("currentEmoji");
const emojiContainer = document.getElementById("emojiContainer");
const emojiDropdown = document.getElementById("emojiDropdown");

function showEmojiContainer() {
	emojiContainer.classList.remove("hidden");
	emojiDropdown.querySelector(".caret").textContent = "\u25B2";
}

function hideEmojiContainer() {
	emojiContainer.classList.add("hidden");
	emojiDropdown.querySelector(".caret").textContent = "\u25BC";
}

/**
 * @param {HTMLElement} node
 */
function emojiClickHandler(node) {
	currentEmoji.innerText = node.dataset.value;
	currentEmoji.dataset.value = node.dataset.value;
	currentEmoji.dispatchEvent(new CustomEvent("change"));
	hideEmojiContainer();
}

// Populate the emoji container with the basic emojis
function getEmojis() {
	const emojiPicker = document.getElementById("emojiContainer");
	for (let i = 0x1f600; i <= 0x1f644; i++) {
		const container = document.createElement("div");
		container.classList.add("emoji");
		const symbol = String.fromCodePoint(i);
		container.dataset.value = symbol;
		// Add the onclick event to each emoji
		container.addEventListener("click", (e) =>
			emojiClickHandler(container)
		);
		const emoji = document.createTextNode(`${symbol}`);
		container.appendChild(emoji);
		emojiPicker.appendChild(container);
	}
}

export function init() {
	getEmojis();

	emojiDropdown.addEventListener("click", (e) => {
		e.stopPropagation();
		if (emojiContainer.classList.contains("hidden")) showEmojiContainer();
		else hideEmojiContainer();
	});

	emojiContainer.addEventListener("click", (e) => e.stopPropagation());

	document.addEventListener("click", (e) => {
		hideEmojiContainer();
	});
}
