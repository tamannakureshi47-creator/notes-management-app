const NOTES_KEY = "notesAppNotes";
const FOLDERS_KEY = "notesAppFolders";

let notes = JSON.parse(localStorage.getItem(NOTES_KEY)) || [];

let folders = JSON.parse(localStorage.getItem(FOLDERS_KEY)) || [
    { name: "Movie Devices", color: "soft-blue" },
    { name: "Class Notes", color: "soft-pink" },
    { name: "Book List", color: "soft-yellow" }
];

// Save default folders
localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));

// SELECT ELEMENTS
const notesList = document.getElementById("notesList");
const folderList = document.getElementById("folderList");
const emptyState = document.getElementById("emptyState");
const noteCount = document.getElementById("noteCount");
const searchInput = document.getElementById("searchInput");
const noteForm = document.getElementById("noteForm");
const folderForm = document.getElementById("folderForm");
const noteTitle = document.getElementById("noteTitle");
const noteText = document.getElementById("noteText");
const noteDate = document.getElementById("noteDate");
const noteTime = document.getElementById("noteTime");
const noteFolder = document.getElementById("noteFolder");
const noteFile = document.getElementById("noteFile");
const editIndex = document.getElementById("editIndex");
const currentFile = document.getElementById("currentFile");
const modalTitle = document.getElementById("modalTitle");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const notesHeading = document.getElementById("notesHeading");

// Bootstrap Modals
const noteModal = new bootstrap.Modal(document.getElementById("noteModal"));
const folderModal = new bootstrap.Modal(document.getElementById("folderModal"));

// Current page
let currentView = "notes";

// SAVE NOTES
function saveNotes() {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// SAVE FOLDERS
function saveFolders() {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

// ESCAPE HTML
function escapeHTML(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// RANDOM COLOR
function randomColor() {
    const colors = [
        "bg-yellow",
        "bg-blue",
        "bg-red",
        "bg-green",
        "bg-purple"
    ];

    return colors[Math.floor(Math.random() * colors.length)];
}

// TODAY
function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// CURRENT TIME
function getTime() {
    const today = new Date();
    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}

// DISPLAY FOLDERS
function displayFolders() {
    folderList.innerHTML = "";

    folders.forEach((folder) => {
        const count = notes.filter(
            note =>
                note.folder === folder.name &&
                !note.deleted &&
                !note.archived
        ).length;

        folderList.innerHTML += `
            <div
                class="folder-card ${folder.color}"
                onclick="selectFolder('${escapeHTML(folder.name)}')"
            >
                <div class="folder-icon">
                    <i class="bi bi-folder-fill"></i>
                </div>

                <h3>${escapeHTML(folder.name)}</h3>

                <p>${count} ${count === 1 ? "note" : "notes"}</p>
            </div>
        `;
    });

    // New folder card
    folderList.innerHTML += `
        <div class="folder-card add-folder" id="newFolderCard">
            <i class="bi bi-folder-plus"></i>
            <p>New Folder</p>
        </div>
    `;

    document
        .getElementById("newFolderCard")
        .addEventListener("click", openFolderModal);

    displayFolderOptions();
}

// FOLDER OPTIONS
function displayFolderOptions() {
    noteFolder.innerHTML = `
        <option value="">No Folder</option>
    `;

    folders.forEach(folder => {
        noteFolder.innerHTML += `
            <option value="${escapeHTML(folder.name)}">
                ${escapeHTML(folder.name)}
            </option>
        `;
    });
}

// NEW FOLDER
function openFolderModal() {
    document.getElementById("folderName").value = "";
    folderModal.show();
}

// CREATE FOLDER
folderForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const input = document.getElementById("folderName");
    const name = input.value.trim();

    if (!name) {
        alert("Please enter folder name.");
        return;
    }

    const alreadyExists = folders.some(
        folder => folder.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
        alert("Folder already exists.");
        return;
    }

    const colors = [
        "soft-blue",
        "soft-pink",
        "soft-yellow",
        "soft-green"
    ];

    folders.push({
        name: name,
        color: colors[folders.length % colors.length]
    });

    saveFolders();
    displayFolders();
    folderModal.hide();
});

// DISPLAY NOTES
function displayNotes() {
    let filteredNotes = [...notes];

    // VIEW FILTER
    if (currentView === "notes") {
        filteredNotes = filteredNotes.filter(
            note => !note.deleted && !note.archived
        );
    }

    if (currentView === "archive") {
        filteredNotes = filteredNotes.filter(
            note => note.archived && !note.deleted
        );
    }

    if (currentView === "trash") {
        filteredNotes = filteredNotes.filter(
            note => note.deleted
        );
    }

    if (currentView === "calendar") {
        filteredNotes = filteredNotes.filter(
            note =>
                note.date === getToday() &&
                !note.deleted &&
                !note.archived
        );
    }

    // SEARCH
    const search = searchInput.value.trim().toLowerCase();

    if (search) {
        filteredNotes = filteredNotes.filter(
            note =>
                note.title.toLowerCase().includes(search) ||
                note.text.toLowerCase().includes(search) ||
                (note.folder || "").toLowerCase().includes(search)
        );
    }

    // COUNT
    noteCount.innerText = `${filteredNotes.length} ${filteredNotes.length === 1 ? "note" : "notes"
        }`;

    // EMPTY
    if (filteredNotes.length === 0) {
        notesList.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";
    notesList.innerHTML = "";

    // DISPLAY
    filteredNotes.forEach(note => {
        const realIndex = notes.indexOf(note);
        let meta = "";

        if (note.date) {
            meta += `
                <span>
                    <i class="bi bi-calendar3"></i>
                    ${formatDate(note.date)}
                </span>
            `;
        }

        if (note.time) {
            meta += `
                <span>
                    <i class="bi bi-clock"></i>
                    ${note.time}
                </span>
            `;
        }

        if (note.folder) {
            meta += `
                <span>
                    <i class="bi bi-folder"></i>
                    ${escapeHTML(note.folder)}
                </span>
            `;
        }

        // Actions
        let actions = "";

        if (currentView === "trash") {
            actions = `
                <button
                    title="Restore"
                    onclick="restoreNote(${realIndex})"
                >
                    <i class="bi bi-arrow-counterclockwise"></i>
                </button>

                <button
                    title="Delete Permanently"
                    onclick="deleteForever(${realIndex})"
                >
                    <i class="bi bi-trash"></i>
                </button>
            `;
        } else if (currentView === "archive") {
            actions = `
                <button
                    title="Edit"
                    onclick="editNote(${realIndex})"
                >
                    <i class="bi bi-pencil"></i>
                </button>

                <button
                    title="Unarchive"
                    onclick="unarchiveNote(${realIndex})"
                >
                    <i class="bi bi-box-arrow-up"></i>
                </button>

                <button
                    title="Delete"
                    onclick="deleteNote(${realIndex})"
                >
                    <i class="bi bi-trash"></i>
                </button>
            `;
        } else {
            actions = `
                <button
                    title="Edit"
                    onclick="editNote(${realIndex})"
                >
                    <i class="bi bi-pencil"></i>
                </button>

                <button
                    title="Archive"
                    onclick="archiveNote(${realIndex})"
                >
                    <i class="bi bi-archive"></i>
                </button>

                <button
                    title="Delete"
                    onclick="deleteNote(${realIndex})"
                >
                    <i class="bi bi-trash"></i>
                </button>
            `;
        }

        // File
        let fileHTML = "";

        if (note.fileName) {
            fileHTML = `
                <a
                    href="${note.fileData}"
                    download="${escapeHTML(note.fileName)}"
                    class="attachment"
                >
                    <i class="bi bi-paperclip"></i>
                    ${escapeHTML(note.fileName)}
                </a>
            `;
        }

        notesList.innerHTML += `
            <div class="note-card ${note.color || "bg-yellow"}">
                <div class="note-actions">
                    ${actions}
                </div>

                <h3>${escapeHTML(note.title)}</h3>

                <p>${escapeHTML(note.text)}</p>

                <div class="note-meta">
                    ${meta}
                </div>

                ${fileHTML}
            </div>
        `;
    });
}

// FORMAT DATE
function formatDate(date) {
    if (!date) return "";

    const d = new Date(date + "T00:00:00");

    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

// ADD NOTE
document
    .getElementById("addNoteBtn")
    .addEventListener("click", function () {
        resetForm();
    });

// RESET FORM
function resetForm() {
    noteForm.reset();
    editIndex.value = "";
    currentFile.innerHTML = "";
    modalTitle.innerText = "Add Note";
    noteDate.value = getToday();
    noteTime.value = getTime();
}

// SAVE NOTE
noteForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = noteTitle.value.trim();
    const text = noteText.value.trim();

    if (!title || !text) {
        alert("Please fill all required fields.");
        return;
    }

    const file = noteFile.files[0];

    // 1 MB limit
    if (file && file.size > 1024 * 1024) {
        alert("File size must be less than 1 MB.");
        return;
    }

    let fileName = "";
    let fileData = "";

    // EDIT
    if (editIndex.value !== "") {
        const oldNote = notes[Number(editIndex.value)];

        fileName = oldNote.fileName || "";
        fileData = oldNote.fileData || "";
    }

    // NEW FILE
    if (file) {
        fileName = file.name;
        fileData = await readFile(file);
    }

    const note = {
        title: title,
        text: text,
        date: noteDate.value,
        time: noteTime.value,
        folder: noteFolder.value,
        fileName: fileName,
        fileData: fileData,
        color:
            editIndex.value === ""
                ? randomColor()
                : notes[Number(editIndex.value)].color,
        archived: false,
        deleted: false
    };

    // ADD
    if (editIndex.value === "") {
        notes.unshift(note);
    } else {
        // EDIT
        notes[Number(editIndex.value)] = note;
    }

    saveNotes();
    resetForm();
    noteModal.hide();
    displayFolders();
    displayNotes();
});

// READ FILE
function readFile(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        reader.onload = function () {
            resolve(reader.result);
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// EDIT NOTE
function editNote(index) {
    const note = notes[index];

    if (!note) return;

    noteTitle.value = note.title;
    noteText.value = note.text;
    noteDate.value = note.date || "";
    noteTime.value = note.time || "";
    noteFolder.value = note.folder || "";
    editIndex.value = index;
    modalTitle.innerText = "Edit Note";

    if (note.fileName) {
        currentFile.innerHTML = `
            <i class="bi bi-paperclip"></i>
            Current File: ${escapeHTML(note.fileName)}
        `;
    }

    noteModal.show();
}

// DELETE NOTE
function deleteNote(index) {
    notes[index].deleted = true;
    notes[index].archived = false;

    saveNotes();
    displayFolders();
    displayNotes();
}

// RESTORE
function restoreNote(index) {
    notes[index].deleted = false;

    saveNotes();
    displayFolders();
    displayNotes();
}

// DELETE FOREVER
function deleteForever(index) {
    const confirmDelete = confirm(
        "Delete this note permanently?"
    );

    if (!confirmDelete) return;

    notes.splice(index, 1);

    saveNotes();
    displayFolders();
    displayNotes();
}

// ARCHIVE
function archiveNote(index) {
    notes[index].archived = true;

    saveNotes();
    displayFolders();
    displayNotes();
}

// UNARCHIVE
function unarchiveNote(index) {
    notes[index].archived = false;

    saveNotes();
    displayFolders();
    displayNotes();
}

// SEARCH
searchInput.addEventListener("input", function () {
    displayNotes();
});

// SIDEBAR NAVIGATION
document
    .querySelectorAll(".side-link")
    .forEach(function (link) {
        link.addEventListener("click", function () {
            currentView = link.dataset.view;
            searchInput.value = "";

            document
                .querySelectorAll(".side-link")
                .forEach(item => {
                    item.classList.remove("active");
                });

            link.classList.add("active");

            updatePage();
            displayNotes();
        });
    });

// UPDATE PAGE
function updatePage() {
    if (currentView === "calendar") {
        pageTitle.innerText = "CALENDAR";
        pageSubtitle.innerText = "Notes scheduled for today.";
        notesHeading.innerText = "Today's Notes";
        return;
    }

    if (currentView === "archive") {
        pageTitle.innerText = "ARCHIVE";
        pageSubtitle.innerText = "Your archived notes.";
        notesHeading.innerText = "Archived Notes";
        return;
    }

    if (currentView === "trash") {
        pageTitle.innerText = "TRASH";
        pageSubtitle.innerText = "Deleted notes can be restored.";
        notesHeading.innerText = "Trash";
        return;
    }

    pageTitle.innerText = "MY NOTES";
    pageSubtitle.innerText =
        "Keep your ideas organized in one place.";
    notesHeading.innerText = "My Notes";
}

// SELECT FOLDER
function selectFolder(folderName) {
    searchInput.value = folderName;
    currentView = "notes";

    updatePage();
    displayNotes();
}

// NEW FOLDER BUTTON
document
    .getElementById("newFolderBtn")
    .addEventListener("click", openFolderModal);

// INITIAL LOAD
displayFolders();
displayNotes();
updatePage();