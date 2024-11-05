const API_URL = "http://localhost:7070/tickets";
let selectedTicketId = null;

document.getElementById("addTicketButton").addEventListener("click", () => {
  openTicketModal("Добавить тикет");
});

document
  .getElementById("cancelButton")
  .addEventListener("click", closeTicketModal);
document
  .getElementById("ticketForm")
  .addEventListener("submit", handleFormSubmit);
document
  .getElementById("cancelDeleteButton")
  .addEventListener("click", closeDeleteModal);
document
  .getElementById("confirmDeleteButton")
  .addEventListener("click", confirmDeleteTicket);

async function fetchTickets() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch tickets");
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

function renderTicketsList(tickets) {
  const container = document.getElementById("ticketsList");
  container.innerHTML = "";
  tickets.forEach((ticket) => {
    const ticketElement = document.createElement("div");
    ticketElement.className = "ticket";
    ticketElement.innerHTML = `
      <div class="ticket-content">
        <div class="ticket-content-checkbox-ticket">
            <input type="checkbox" class="ticket-status" ${ticket.status ? "checked" : ""}>
            <span class="ticket-name">${ticket.name}</span>
        </div>  
        <div class="ticket-content-button-date">
            <span class="ticket-date">${new Date(ticket.created).toLocaleString()}</span>
            <button class="edit-button">✎</button>
            <button class="delete-button">❌</button>
         </div>
      </div>
      <div class="ticket-details" style="display: none;" id="details-${ticket.id}"></div>
    `;

    // Добавление обработчика клика для отображения деталей тикета
    ticketElement
      .querySelector(".ticket-content")
      .addEventListener("click", (event) => {
        if (
          event.target.classList.contains("ticket-status") ||
          event.target.classList.contains("edit-button") ||
          event.target.classList.contains("delete-button")
        ) {
          return;
        }
        showTicketDetails(ticket.id);
      });

    // Добавление обработчика для отметки выполнения тикета
    ticketElement
      .querySelector(".ticket-status")
      .addEventListener("change", (event) => {
        toggleStatus(event, ticket.id);
      });

    // Добавление обработчика для кнопки редактирования тикета
    ticketElement
      .querySelector(".edit-button")
      .addEventListener("click", (event) => {
        event.stopPropagation();
        editTicket(ticket.id);
      });

    // Добавление обработчика для кнопки удаления тикета
    ticketElement
      .querySelector(".delete-button")
      .addEventListener("click", (event) => {
        event.stopPropagation();
        openDeleteModal(ticket.id);
      });

    container.appendChild(ticketElement);
  });
}

function openTicketModal(title) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("ticketModal").style.display = "flex";
}

function closeTicketModal() {
  document.getElementById("ticketModal").style.display = "none";
  document.getElementById("ticketForm").reset();
  selectedTicketId = null;
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("ticketName").value;
  const description = document.getElementById("ticketDescription").value;
  const ticket = { name, description };

  if (selectedTicketId) {
    await updateTicket(selectedTicketId, ticket);
  } else {
    await createTicket(ticket);
  }

  closeTicketModal();
  const tickets = await fetchTickets();
  renderTicketsList(tickets);
}

function openDeleteModal(id) {
  selectedTicketId = id;
  document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
  selectedTicketId = null;
}

async function confirmDeleteTicket() {
  if (selectedTicketId) {
    await deleteTicket(selectedTicketId);
    const tickets = await fetchTickets();
    renderTicketsList(tickets);
  }
  closeDeleteModal();
}

async function createTicket(ticket) {
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
  });
}

async function updateTicket(id, ticket) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
  });
}

async function deleteTicket(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
}

// Функция для переключения статуса тикета
async function toggleStatus(event, id) {
  event.stopPropagation();
  const isChecked = event.target.checked;
  await updateTicket(id, { status: isChecked });
  const tickets = await fetchTickets();
  renderTicketsList(tickets);
}

// Функция для отображения деталей тикета
async function showTicketDetails(id) {
  const detailsContainer = document.getElementById(`details-${id}`);
  if (detailsContainer.style.display === "none") {
    const ticket = await fetchTicketById(id);
    detailsContainer.innerHTML = `
      <p>${ticket.description}</p>
    `;
    detailsContainer.style.display = "block";
  } else {
    detailsContainer.style.display = "none";
  }
}

// Функция для редактирования тикета
async function editTicket(id) {
  selectedTicketId = id;
  const ticket = await fetchTicketById(id);
  document.getElementById("ticketName").value = ticket.name;
  document.getElementById("ticketDescription").value = ticket.description;
  openTicketModal("Изменить тикет");
}

// Функция для получения данных одного тикета
async function fetchTicketById(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch ticket by ID");
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

// Инициализация списка тикетов при загрузке страницы
document.addEventListener("DOMContentLoaded", async () => {
  const tickets = await fetchTickets();
  renderTicketsList(tickets);
});
