const noteButton = document.querySelector("#note-demo-button");
const note = document.querySelector("#editorial-note");
const noteTitle = document.querySelector("#note-title");
const noteStatus = document.querySelector("#note-status");
const noteLive = document.querySelector("#note-live");
const noteDialog = document.querySelector("#note-dialog");
const noteRequest = document.querySelector("#note-request");
const noteLoading = document.querySelector("#note-loading");
const noteStage = document.querySelector(".demo-stage");
let noteState = "request";

const spokenText = [...note.querySelectorAll(".spoken")]
	.map((paragraph) => {
		const copy = paragraph.cloneNode(true);
		copy.querySelectorAll(".demo-callout").forEach((label) => label.remove());
		return copy.textContent.trim();
	})
	.join(" ");
// Combining marks belong to their word: Кши́штофа is one word, not two.
const words = (
	spokenText.match(/[\p{L}\p{M}\p{N}]+(?:[-’][\p{L}\p{M}\p{N}]+)*/gu) || []
).length;
const readingRate = 130;
const seconds = Math.ceil((words / readingRate) * 60);
document.querySelector("#reading-time").textContent =
	`Расчетная длительность: ${seconds} секунд · ${words} слова · ${readingRate} слов/мин`;

function updateNoteStatus(text) {
	noteStatus.textContent = text;
	noteLive.textContent = text;
}

noteButton.disabled = false;
noteButton.addEventListener("click", () => {
	if (noteState !== "request") return;
	noteState = "loading";
	noteStage.style.minHeight = `${noteStage.getBoundingClientRect().height}px`;
	noteButton.disabled = true;
	noteRequest.hidden = true;
	noteLoading.hidden = false;
	noteDialog.dataset.state = "loading";
	updateNoteStatus("Готовим записку");
	// These three seconds illustrate the workflow; no model or search is called.
	window.setTimeout(() => updateNoteStatus("Проверяем факты"), 1000);
	window.setTimeout(() => updateNoteStatus("Расставляем ударения"), 2000);
	window.setTimeout(() => {
		noteState = "response";
		noteLoading.hidden = true;
		note.hidden = false;
		noteDialog.dataset.state = "response";
		noteButton.setAttribute("aria-expanded", "true");
		noteLive.textContent = "Ответ помощника готов";
		noteTitle.focus({ preventScroll: true });
	}, 3000);
});

for (const link of document.querySelectorAll('#note-sources a[href^="#"]')) {
	link.addEventListener("click", (event) => {
		event.preventDefault();
		const source = document.getElementById(link.getAttribute("aria-controls"));
		source.hidden = !source.hidden;
		link.setAttribute("aria-expanded", String(!source.hidden));
	});
}

const commandField = document.querySelector("#install-command");
const copyButton = document.querySelector("#copy-command");
const copyStatus = document.querySelector("#copy-status");
const selectButton = document.querySelector("#select-command");
const command = commandField.value;

function selectCommand() {
	commandField.focus();
	commandField.select();
	commandField.setSelectionRange(0, commandField.value.length);
}

copyButton.addEventListener("click", async () => {
	copyButton.disabled = true;
	copyStatus.textContent = "Копируем команду.";
	try {
		if (!navigator.clipboard?.writeText)
			throw new Error("Clipboard unavailable");
		await navigator.clipboard.writeText(command);
		copyStatus.textContent =
			"Команда скопирована. Вставьте её в терминал с Codex. Установка ещё не запускалась.";
		selectButton.hidden = true;
	} catch {
		selectButton.hidden = false;
		selectCommand();
		copyStatus.textContent =
			'Браузер не разрешил копирование. Команда выделена: нажмите Ctrl+C или ⌘C. На телефоне удерживайте текст и выберите "Скопировать".';
	} finally {
		copyButton.disabled = false;
	}
});
selectButton.addEventListener("click", selectCommand);
