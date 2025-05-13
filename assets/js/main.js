// Store ideas data globally to manipulate
let ideasData = [];

// DOM Elements
const contentEl = document.getElementById("content");
const modalEl = document.getElementById("editModal");
const addModalEl = document.getElementById("addIdeaModal");
const closeModalBtn = document.getElementById("closeModal");
const closeAddModalBtn = document.getElementById("closeAddModal");
const editForm = document.getElementById("editForm");
const addIdeaForm = document.getElementById("addIdeaForm");
const ideaIdInput = document.getElementById("ideaId");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const imageUrlInput = document.getElementById("imageUrl");
const buttonLabelInput = document.getElementById("buttonLabel");
const buttonLinkInput = document.getElementById("buttonLink");
const resetBtn = document.querySelector(".reset-btn");
const addIdeaBtn = document.querySelector(".add-idea-btn");
const sortBtns = document.querySelectorAll(".sort-btn");
// SVG Icons
const thumbsUpIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon upvote-icon"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>`;
const thumbsDownIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon downvote-icon"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>`;
const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon edit-icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;

// Show error message
function showError(message) {
  contentEl.innerHTML = `
          <div class="error">
            <p>${message}</p>
          </div>
        `;
}

// Fetch ideas from API
function fetchIdeas() {
  const storedIdeas = localStorage.getItem("beastscanIdeas");
  const storedOriginalIdeas = localStorage.getItem("originalBeastscanIdeas");

  if (storedIdeas && storedOriginalIdeas) {
    ideasData = JSON.parse(storedIdeas);
    originalIdeasData = JSON.parse(storedOriginalIdeas);
    renderIdeas();
    return;
  }

  fetch("https://my.beastscan.com/test-kit")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const items = Array.isArray(data) ? data : [data];
      ideasData = items.map((item, index) => ({
        id: Date.now() + index,
        ...item,
        votes: item.votes || { up: 0, down: 0 },
      }));

      originalIdeasData = JSON.parse(JSON.stringify(ideasData));
      localStorage.setItem("beastscanIdeas", JSON.stringify(ideasData));
      localStorage.setItem(
        "originalBeastscanIdeas",
        JSON.stringify(originalIdeasData)
      );
      renderIdeas();
    })
    .catch((error) => {
      showError("Failed to load ideas. Please try again later.");
      console.error("Error fetching ideas:", error);
    });
}

// Render ideas to the DOM with drag and drop
function renderIdeas() {
  const cardGrid = document.createElement("div");
  cardGrid.className = "card-grid";
  cardGrid.setAttribute("id", "cardGrid");
  ideasData.forEach((idea) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("draggable", "true");
    card.setAttribute("data-id", idea.id);
    card.innerHTML = `
            <img src="${idea.image || idea.imageUrl}" alt="${
      idea.title
    }" class="card-image">
            <div class="card-content">
              <h2 class="card-title">${idea.title}</h2>
              <p class="card-description">${idea.description}</p>
              <a href="${
                idea.button?.url || idea.buttonLink
              }" class="link-btn" target="_blank">
                ${idea.button?.label || idea.buttonLabel}
              </a>
            </div>
            <div class="card-actions">
              <div class="vote-actions">
                <button class="vote-btn upvote" data-id="${idea.id}">
                  ${thumbsUpIcon}
                  <span class="vote-count">${idea.votes.up}</span>
                </button>
                <button class="vote-btn downvote" data-id="${idea.id}">
                  ${thumbsDownIcon}
                  <span class="vote-count">${idea.votes.down}</span>
                </button>
              </div>
              <button class="edit-btn" data-id="${idea.id}">
                ${editIcon}
              </button>
            </div>
          `;

    cardGrid.appendChild(card);
  });
  contentEl.innerHTML = "";
  contentEl.appendChild(cardGrid);
  addDragAndDropListeners();
  addEventListeners();
}

// Drag and Drop Functionality
function addDragAndDropListeners() {
  const cards = document.querySelectorAll(".card");
  const cardGrid = document.getElementById("cardGrid");

  cards.forEach((card) => {
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);
    card.addEventListener("dragover", dragOver);
    card.addEventListener("dragleave", dragLeave);
    card.addEventListener("drop", drop);
  });

  function dragStart(e) {
    this.classList.add("dragging");
    e.dataTransfer.setData("text/plain", this.getAttribute("data-id"));
  }

  function dragEnd() {
    this.classList.remove("dragging");
  }

  function dragOver(e) {
    e.preventDefault();
    this.classList.add("drag-over");
  }

  function dragLeave() {
    this.classList.remove("drag-over");
  }

  function drop(e) {
    e.preventDefault();
    this.classList.remove("drag-over");

    const draggedCardId = e.dataTransfer.getData("text/plain");
    const draggedCard = document.querySelector(`[data-id="${draggedCardId}"]`);
    const targetCard = this;
    const tempNext = targetCard.nextSibling;
    const targetParent = targetCard.parentNode;

    if (tempNext) {
      targetParent.insertBefore(draggedCard, tempNext);
    } else {
      targetParent.appendChild(draggedCard);
    }
    updateIdeasOrder();
  }
}
// Sort ideas based on upvotes or downvotes
function sortIdeas(sortType) {
  switch (sortType) {
    case "upvotes":
      ideasData.sort((a, b) => (b.votes.up || 0) - (a.votes.up || 0));
      break;
    case "downvotes":
      ideasData.sort((a, b) => (b.votes.down || 0) - (a.votes.down || 0));
      break;
  }
  renderIdeas();
  localStorage.setItem("beastscanIdeas", JSON.stringify(ideasData));
}
// Add a new idea
function addNewIdea(event) {
  event.preventDefault();
  const newIdea = {
    id: Date.now(),
    title: document.getElementById("newTitle").value,
    description: document.getElementById("newDescription").value,
    image: document.getElementById("newImageUrl").value,
    button: {
      label: document.getElementById("newButtonLabel").value,
      url: document.getElementById("newButtonLink").value,
    },
    votes: { up: 0, down: 0 },
  };

  ideasData.push(newIdea);
  localStorage.setItem("beastscanIdeas", JSON.stringify(ideasData));
  addModalEl.classList.remove("active");
  renderIdeas();
  event.target.reset();
}

// Reset ideas to original state
function resetIdeas() {
  ideasData = JSON.parse(JSON.stringify(originalIdeasData));
  localStorage.setItem("beastscanIdeas", JSON.stringify(ideasData));
  renderIdeas();
}
// Update ideas order based on current DOM
function updateIdeasOrder() {
  const cards = document.querySelectorAll(".card");
  const newOrder = Array.from(cards).map((card) =>
    parseInt(card.getAttribute("data-id"))
  );

  ideasData.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));

  localStorage.setItem("beastscanIdeas", JSON.stringify(ideasData));
}

// Add event listeners to buttons
function addEventListeners() {
  document.querySelectorAll(".upvote").forEach((button) => {
    button.addEventListener("click", function () {
      const ideaId = parseInt(this.getAttribute("data-id"));
      updateVote(ideaId, "upvote");
    });
  });

  document.querySelectorAll(".downvote").forEach((button) => {
    button.addEventListener("click", function () {
      const ideaId = parseInt(this.getAttribute("data-id"));
      updateVote(ideaId, "downvote");
    });
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const ideaId = parseInt(this.getAttribute("data-id"));
      openEditModal(ideaId);
    });
  });

  sortBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const sortType = this.getAttribute("data-sort");
      sortIdeas(sortType);
    });
  });

  resetBtn.addEventListener("click", resetIdeas);

  addIdeaBtn.addEventListener("click", () => {
    addModalEl.classList.add("active");
  });

  closeAddModalBtn.addEventListener("click", () => {
    addModalEl.classList.remove("active");
  });

  addIdeaForm.addEventListener("submit", addNewIdea);

  addModalEl.addEventListener("click", function (event) {
    if (event.target === addModalEl) {
      addModalEl.classList.remove("active");
    }
  });
}

// Update vote count
function updateVote(ideaId, voteType) {
  const ideaIndex = ideasData.findIndex((idea) => idea.id === ideaId);

  if (ideaIndex !== -1) {
    if (!ideasData[ideaIndex].votes) {
      ideasData[ideaIndex].votes = { up: 0, down: 0 };
    }
    if (voteType === "upvote") {
      ideasData[ideaIndex].votes.up++;
    } else if (voteType === "downvote") {
      ideasData[ideaIndex].votes.down++;
    }
    localStorage.setItem("beastscanIdeas", JSON.stringify(ideasData));
    const voteCountEl = document.querySelector(
      `.${voteType}[data-id="${ideaId}"] .vote-count`
    );
    if (voteCountEl) {
      voteCountEl.textContent =
        voteType === "upvote"
          ? ideasData[ideaIndex].votes.up
          : ideasData[ideaIndex].votes.down;
    }
  }
}

// Open edit modal
function openEditModal(ideaId) {
  const idea = ideasData.find((idea) => idea.id === ideaId);

  if (idea) {
    ideaIdInput.value = idea.id;
    titleInput.value = idea.title;
    descriptionInput.value = idea.description;
    imageUrlInput.value = idea.image || idea.imageUrl;
    buttonLabelInput.value = idea.button?.label || idea.buttonLabel;
    buttonLinkInput.value = idea.button?.url || idea.buttonLink;
    modalEl.classList.add("active");
  }
}

// Close edit modal
function closeEditModal() {
  modalEl.classList.remove("active");
}

// Save edited idea
function saveEditedIdea(event) {
  event.preventDefault();

  const ideaId = parseInt(ideaIdInput.value);
  const ideaIndex = ideasData.findIndex((idea) => idea.id === ideaId);

  if (ideaIndex !== -1) {
    ideasData[ideaIndex] = {
      ...ideasData[ideaIndex],
      title: titleInput.value,
      description: descriptionInput.value,
      image: imageUrlInput.value,
      button: {
        label: buttonLabelInput.value,
        url: buttonLinkInput.value,
      },
    };

    localStorage.setItem("beastscanIdeas", JSON.stringify(ideasData));
    closeEditModal();
    renderIdeas();
  }
}

// Event listeners for modal
closeModalBtn.addEventListener("click", closeEditModal);
editForm.addEventListener("submit", saveEditedIdea);

// Close modal when clicking outside
modalEl.addEventListener("click", function (event) {
  if (event.target === modalEl) {
    closeEditModal();
  }
});

// Initialize the app
function init() {
  fetchIdeas();
}

// Start the application
init();

// Create a global function to initialize the widget
window.initBeastScanVotingWidget = function (containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id ${containerId} not found`);
    return;
  }

  const widget = document.body.querySelector(".container").cloneNode(true);
  container.innerHTML = "";
  container.appendChild(widget);

  // Apply any custom options
  if (options.apiUrl) {
    console.log("Custom API URL not implemented in this version");
  }
};
