/* =========================================
   1. LOGIN, DASHBOARD AND NAVIGATION
========================================= */

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const detailPage = document.getElementById("detailPage");

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");

const backButton = document.getElementById("backButton");
const logoutButton = document.getElementById("logoutButton");
const detailLogoutButton = document.getElementById("detailLogoutButton");

const serviceCards = document.querySelectorAll(".service-card");
const detailSections = document.querySelectorAll(".detail-panel");

// Login
loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (username === "rent" && password === "rent") {
        message.textContent = "";
        loginPage.classList.add("hidden");
        detailPage.classList.add("hidden");
        dashboardPage.classList.remove("hidden");
    } else {
        message.textContent = "Incorrect username or password.";
        message.className = "error";
    }
});

// Open a service
serviceCards.forEach(function (card) {
    card.addEventListener("click", function () {
        const sectionId = card.dataset.section;
        const section = document.getElementById(sectionId);

        if (!section) return;

        dashboardPage.classList.add("hidden");
        detailPage.classList.remove("hidden");

        detailSections.forEach(function (item) {
            item.classList.add("hidden");
        });

        section.classList.remove("hidden");
        window.scrollTo(0, 0);
    });
});

// Return to dashboard
backButton.addEventListener("click", function () {
    detailPage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");
    window.scrollTo(0, 0);
});

// Logout
function logout() {
    dashboardPage.classList.add("hidden");
    detailPage.classList.add("hidden");
    loginPage.classList.remove("hidden");

    loginForm.reset();
    message.textContent = "";
    message.className = "";

    window.scrollTo(0, 0);
}

logoutButton.addEventListener("click", logout);
detailLogoutButton.addEventListener("click", logout);


/* =========================================
   2. HOUSE RENT MANAGEMENT
========================================= */

const floorGrid = document.getElementById("floorGrid");
const rentFloorView = document.getElementById("rentFloorView");
const rentSideView = document.getElementById("rentSideView");
const rentUnitView = document.getElementById("rentUnitView");

const selectedFloorTitle =
    document.getElementById("selectedFloorTitle");

const selectedUnitTitle =
    document.getElementById("selectedUnitTitle");

let currentFloor = 1;
let currentSide = "A";
let currentRoomId = null;

const storageKey = "rentPortalRooms";


/* =========================================
   3. LOCAL STORAGE
========================================= */

function getAllRooms() {
    try {
        return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch (error) {
        return {};
    }
}

function saveAllRooms(rooms) {
    localStorage.setItem(storageKey, JSON.stringify(rooms));
}

function getRoomKey() {
    return `floor-${currentFloor}-side-${currentSide}`;
}


/* =========================================
   4. MONTHS: OCTOBER 2026 - DECEMBER 2027
========================================= */

function getMonths() {
    const months = [];

    for (let year = 2026; year <= 2027; year++) {
        const startMonth = year === 2026 ? 9 : 0;
        const endMonth = 11;

        for (let month = startMonth; month <= endMonth; month++) {
            months.push({
                key: `${year}-${String(month + 1).padStart(2, "0")}`,
                name: new Date(year, month).toLocaleString("en-US", {
                    month: "long",
                    year: "numeric"
                })
            });
        }
    }

    return months;
}


/* =========================================
   5. DEFAULT ROOM DETAILS
========================================= */

function createDefaultDetails(details = {}) {
    const payments = details.payments || {};

    getMonths().forEach(function (month) {
        if (!payments[month.key]) {
            payments[month.key] = "Unpaid";
        }
    });

    return {
        tenantName: details.tenantName || "",
        monthlyRent: details.monthlyRent || "",
        payments: payments
    };
}


/* =========================================
   6. CREATE SEVEN FLOORS
========================================= */

for (let floor = 1; floor <= 7; floor++) {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "floor-card";

    card.innerHTML = `
        <span class="floor-icon">⌂</span>
        <h3>Floor ${floor}</h3>
        <p>Side A and Side B</p>
    `;

    card.addEventListener("click", function () {
        currentFloor = floor;

        selectedFloorTitle.textContent = `Floor ${floor}`;

        rentFloorView.classList.add("hidden");
        rentUnitView.classList.add("hidden");
        rentSideView.classList.remove("hidden");
    });

    floorGrid.appendChild(card);
}


/* =========================================
   7. OPEN SIDE A OR SIDE B
========================================= */

document.querySelectorAll(".side-card").forEach(function (card) {
    card.addEventListener("click", function () {
        currentSide = card.dataset.side;

        selectedUnitTitle.textContent =
            `Floor ${currentFloor} - Side ${currentSide}`;

        rentFloorView.classList.add("hidden");
        rentSideView.classList.add("hidden");
        rentUnitView.classList.remove("hidden");

        roomList.classList.remove("hidden");
        addRoomButton.classList.remove("hidden");
        roomDetailsPanel.classList.add("hidden");

        currentRoomId = null;

        renderRooms();
    });
});


/* =========================================
   8. ROOM MANAGEMENT INTERFACE
========================================= */

const roomManager = document.createElement("div");
roomManager.className = "room-manager";

roomManager.innerHTML = `
    <h3>Rooms</h3>
    <p>Add rooms and manage their rent details.</p>

    <div id="roomList"></div>

    <button type="button" id="addRoomButton" class="back-button">
        + Add Room
    </button>

    <div id="roomDetailsPanel" class="hidden">
        <button type="button" id="backToRoomList" class="back-button">
            ← Back to Rooms
        </button>

        <h3 id="roomDetailsTitle">Room Details</h3>

        <label for="tenantName">Tenant Name</label>
        <input
            id="tenantName"
            type="text"
            placeholder="Enter tenant name"
        >

        <label for="monthlyRent">Monthly Rent</label>
        <input
            id="monthlyRent"
            type="number"
            min="0"
            placeholder="Enter monthly rent"
        >

        <button type="button" id="saveRoomDetails" class="back-button">
            Save Details
        </button>

        <p id="detailsMessage" role="status"></p>

        <h3>Monthly Payment Status</h3>
        <p>
            Payment status starts as Unpaid.
            Mark each month as Paid after receiving rent.
        </p>

        <div id="monthlyPaymentList"></div>
    </div>
`;

const infoBox = rentUnitView.querySelector(".info-box");

if (infoBox) {
    rentUnitView.insertBefore(roomManager, infoBox);
} else {
    rentUnitView.appendChild(roomManager);
}

const roomList = document.getElementById("roomList");
const addRoomButton = document.getElementById("addRoomButton");
const roomDetailsPanel = document.getElementById("roomDetailsPanel");
const backToRoomList = document.getElementById("backToRoomList");

const tenantNameInput = document.getElementById("tenantName");
const monthlyRentInput = document.getElementById("monthlyRent");

const saveRoomDetailsButton =
    document.getElementById("saveRoomDetails");

const monthlyPaymentList =
    document.getElementById("monthlyPaymentList");

const detailsMessage = document.getElementById("detailsMessage");
const roomDetailsTitle = document.getElementById("roomDetailsTitle");


/* =========================================
   9. UPDATE A ROOM
========================================= */

function updateRoom(roomId, callback) {
    const allRooms = getAllRooms();
    const rooms = allRooms[getRoomKey()] || [];

    const room = rooms.find(function (item) {
        return item.id === roomId;
    });

    if (!room) return false;

    room.details = createDefaultDetails(room.details);

    callback(room);

    allRooms[getRoomKey()] = rooms;

    try {
        saveAllRooms(allRooms);
        return true;
    } catch (error) {
        alert("Could not save data. Browser storage may be full.");
        return false;
    }
}


/* =========================================
   10. DISPLAY ROOMS
========================================= */

function renderRooms() {
    const allRooms = getAllRooms();
    const rooms = allRooms[getRoomKey()] || [];

    roomList.replaceChildren();

    if (rooms.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No rooms added yet.";
        roomList.appendChild(emptyMessage);
    }

    rooms.forEach(function (room) {
        const roomCard = document.createElement("div");
        roomCard.className = "room-card";

        const roomName = document.createElement("span");
        roomName.textContent = room.name;

        const actions = document.createElement("div");
        actions.className = "room-actions";

        const detailsButton = document.createElement("button");
        detailsButton.type = "button";
        detailsButton.textContent = "Details";
        detailsButton.className = "room-details-button";

        detailsButton.addEventListener("click", function () {
            openRoomDetails(room.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-room-button";

        deleteButton.addEventListener("click", function () {
            const confirmed = confirm(
                `Delete "${room.name}" and its saved details?`
            );

            if (!confirmed) return;

            const latestRooms = getAllRooms();

            latestRooms[getRoomKey()] =
                (latestRooms[getRoomKey()] || []).filter(
                    function (item) {
                        return item.id !== room.id;
                    }
                );

            try {
                saveAllRooms(latestRooms);
                renderRooms();
            } catch (error) {
                alert("Could not delete the room.");
            }
        });

        actions.append(detailsButton, deleteButton);
        roomCard.append(roomName, actions);

        roomList.appendChild(roomCard);
    });
}


/* =========================================
   11. OPEN ROOM DETAILS
========================================= */

function openRoomDetails(roomId) {
    const rooms = getAllRooms()[getRoomKey()] || [];

    const room = rooms.find(function (item) {
        return item.id === roomId;
    });

    if (!room) return;

    currentRoomId = roomId;

    const success = updateRoom(roomId, function (item) {
        item.details = createDefaultDetails(item.details);
    });

    if (!success) return;

    const updatedRoom = (getAllRooms()[getRoomKey()] || [])
        .find(function (item) {
            return item.id === roomId;
        });

    if (!updatedRoom) return;

    const details = createDefaultDetails(updatedRoom.details);

    tenantNameInput.value = details.tenantName;
    monthlyRentInput.value = details.monthlyRent;

    roomDetailsTitle.textContent = `${updatedRoom.name} - Details`;
    detailsMessage.textContent = "";

    roomList.classList.add("hidden");
    addRoomButton.classList.add("hidden");
    roomDetailsPanel.classList.remove("hidden");

    renderMonthlyPayments();
}


/* =========================================
   12. SAVE TENANT AND RENT DETAILS
========================================= */

function saveCurrentRoomDetails() {
    if (!currentRoomId) return false;

    return updateRoom(currentRoomId, function (room) {
        room.details.tenantName = tenantNameInput.value.trim();
        room.details.monthlyRent = monthlyRentInput.value;
    });
}

saveRoomDetailsButton.addEventListener("click", function () {
    if (saveCurrentRoomDetails()) {
        detailsMessage.textContent = "Details saved successfully.";
    }
});


/* =========================================
   13. MONTHLY PAYMENT LIST
========================================= */

function renderMonthlyPayments() {
    if (!currentRoomId) return;

    const rooms = getAllRooms()[getRoomKey()] || [];

    const room = rooms.find(function (item) {
        return item.id === currentRoomId;
    });

    if (!room) return;

    const details = createDefaultDetails(room.details);

    monthlyPaymentList.replaceChildren();

    getMonths().forEach(function (month) {
        const status = details.payments[month.key];

        const row = document.createElement("div");
        row.className = "payment-row";

        const monthName = document.createElement("span");
        monthName.textContent = month.name;

        const statusLabel = document.createElement("span");
        statusLabel.textContent = status;
        statusLabel.className =
            status === "Paid" ? "payment-paid" : "payment-unpaid";

        const statusButton = document.createElement("button");
        statusButton.type = "button";

        statusButton.textContent =
            status === "Paid" ? "Mark Unpaid" : "Mark Paid";

        statusButton.className = "payment-status-button";

        statusButton.addEventListener("click", function () {
            if (!saveCurrentRoomDetails()) return;

            const success = updateRoom(currentRoomId, function (item) {
                const currentStatus =
                    item.details.payments[month.key] || "Unpaid";

                item.details.payments[month.key] =
                    currentStatus === "Paid" ? "Unpaid" : "Paid";
            });

            if (success) {
                detailsMessage.textContent = "";
                renderMonthlyPayments();
            }
        });

        row.append(monthName, statusLabel, statusButton);
        monthlyPaymentList.appendChild(row);
    });
}


/* =========================================
   14. BACK TO ROOM LIST
========================================= */

backToRoomList.addEventListener("click", function () {
    roomDetailsPanel.classList.add("hidden");
    roomList.classList.remove("hidden");
    addRoomButton.classList.remove("hidden");

    currentRoomId = null;

    renderRooms();
});


/* =========================================
   15. ADD A ROOM
========================================= */

addRoomButton.addEventListener("click", function () {
    const roomName = prompt("Enter the room name:");

    if (roomName === null || roomName.trim() === "") {
        return;
    }

    const allRooms = getAllRooms();
    const key = getRoomKey();

    if (!allRooms[key]) {
        allRooms[key] = [];
    }

    allRooms[key].push({
        id: Date.now().toString() +
            Math.random().toString(36).slice(2),

        name: roomName.trim(),

        details: createDefaultDetails()
    });

    try {
        saveAllRooms(allRooms);
        renderRooms();
    } catch (error) {
        alert("Could not save the room. Browser storage may be full.");
    }
});


/* =========================================
   16. BACK TO FLOORS
========================================= */

document.getElementById("backToFloors")
    .addEventListener("click", function () {
        rentSideView.classList.add("hidden");
        rentUnitView.classList.add("hidden");
        rentFloorView.classList.remove("hidden");
    });


/* =========================================
   17. BACK TO SIDES
========================================= */

document.getElementById("backToSides")
    .addEventListener("click", function () {
        rentUnitView.classList.add("hidden");
        rentSideView.classList.remove("hidden");
    });



/* =========================================
   ELECTRICITY BILL NOTES
   Styled entries with date, time and delete
========================================= */

const electricitySection =
    document.getElementById("electricitySection");

if (electricitySection) {
    const electricityStorageKey = "rentPortalElectricityEntries";

    const electricityManager = document.createElement("div");
    electricityManager.className = "electricity-manager";

    // Main layout
    electricityManager.style.cssText = `
        margin-top: 28px;
        padding: 24px;
        border-radius: 18px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #1e293b;
    `;

    electricityManager.innerHTML = `
        <div style="margin-bottom:24px;">
            <p style="
                margin:0 0 8px;
                color:#64748b;
                font-size:12px;
                font-weight:700;
                letter-spacing:2px;
            ">BILL RECORDS</p>

            <h2 style="
                margin:0 0 8px;
                font-size:25px;
                color:#0f172a;
            ">Electricity Records</h2>

            <p style="
                margin:0;
                color:#64748b;
                line-height:1.6;
            ">Add, save and manage your electricity bill notes.</p>
        </div>

        <div style="
            background:white;
            padding:20px;
            border:1px solid #e2e8f0;
            border-radius:14px;
            margin-bottom:28px;
        ">
            <h3 style="margin:0 0 16px;color:#0f172a;">
                + Add New Entry
            </h3>

            <label for="electricityEntryText" style="
                display:block;
                margin-bottom:8px;
                font-weight:600;
                font-size:14px;
            ">Entry Details</label>

            <textarea
                id="electricityEntryText"
                rows="5"
                placeholder="Write bill amount, meter reading, payment details..."
                style="
                    box-sizing:border-box;
                    display:block;
                    width:100%;
                    padding:13px;
                    border:1px solid #cbd5e1;
                    border-radius:10px;
                    font:inherit;
                    line-height:1.6;
                    resize:vertical;
                    background:#fff;
                    color:#1e293b;
                    margin-bottom:14px;
                "
            ></textarea>

            <button
                type="button"
                id="saveElectricityEntry"
                style="
                    border:none;
                    border-radius:9px;
                    padding:12px 20px;
                    background:#2563eb;
                    color:white;
                    font-size:14px;
                    font-weight:700;
                    cursor:pointer;
                "
            >Save Entry</button>

            <p id="electricitySaveMessage"
               role="status"
               style="margin:12px 0 0;font-size:14px;">
            </p>
        </div>

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:12px;
            flex-wrap:wrap;
            margin-bottom:16px;
        ">
            <h3 style="margin:0;color:#0f172a;">
                Saved Entries
            </h3>

            <span id="electricityEntryCount" style="
                background:#dbeafe;
                color:#1d4ed8;
                padding:6px 12px;
                border-radius:20px;
                font-size:12px;
                font-weight:700;
            ">0 ENTRIES</span>
        </div>

        <div id="electricityEntryList"></div>
    `;

    const oldInfoBox =
        electricitySection.querySelector(".info-box");

    if (oldInfoBox) {
        electricitySection.insertBefore(
            electricityManager,
            oldInfoBox
        );
        oldInfoBox.classList.add("hidden");
    } else {
        electricitySection.appendChild(electricityManager);
    }

    const entryText =
        electricityManager.querySelector("#electricityEntryText");

    const saveButton =
        electricityManager.querySelector("#saveElectricityEntry");

    const entryList =
        electricityManager.querySelector("#electricityEntryList");

    const saveMessage =
        electricityManager.querySelector("#electricitySaveMessage");

    const entryCount =
        electricityManager.querySelector("#electricityEntryCount");

    function getElectricityEntries() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(electricityStorageKey)
            );

            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    }

    function renderElectricityEntries() {
        const entries = getElectricityEntries();

        entryList.replaceChildren();
        entryCount.textContent =
            `${entries.length} ${entries.length === 1 ? "ENTRY" : "ENTRIES"}`;

        if (entries.length === 0) {
            const emptyCard = document.createElement("div");

            emptyCard.style.cssText = `
                padding:28px 16px;
                text-align:center;
                border:1px dashed #cbd5e1;
                border-radius:14px;
                color:#64748b;
                background:white;
            `;

            const emptyTitle = document.createElement("h4");
            emptyTitle.textContent = "No entries yet";
            emptyTitle.style.cssText =
                "margin:0 0 8px;color:#334155;font-size:17px;";

            const emptyText = document.createElement("p");
            emptyText.textContent =
                "Your saved electricity bill records will appear here.";
            emptyText.style.cssText = "margin:0;line-height:1.6;";

            emptyCard.append(emptyTitle, emptyText);
            entryList.appendChild(emptyCard);
            return;
        }

        entries.forEach(function (entry) {
            const card = document.createElement("div");

            card.style.cssText = `
                background:white;
                border:1px solid #e2e8f0;
                border-radius:14px;
                padding:18px;
                margin-bottom:14px;
                overflow-wrap:anywhere;
                box-shadow:0 3px 10px rgba(15,23,42,0.04);
            `;

            const topRow = document.createElement("div");

            topRow.style.cssText = `
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:12px;
                flex-wrap:wrap;
                margin-bottom:14px;
            `;

            const date = document.createElement("p");
            date.textContent = "🕒 " + entry.date;
            date.style.cssText = `
                margin:0;
                color:#64748b;
                font-size:13px;
                font-weight:600;
            `;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";

            deleteButton.style.cssText = `
                border:1px solid #fecaca;
                border-radius:8px;
                padding:8px 13px;
                background:#fef2f2;
                color:#b91c1c;
                font-size:13px;
                font-weight:700;
                cursor:pointer;
            `;

            deleteButton.addEventListener("click", function () {
                const confirmed = confirm(
                    "Are you sure you want to delete this entry?"
                );

                if (!confirmed) return;

                const latestEntries = getElectricityEntries();

                const updatedEntries = latestEntries.filter(
                    function (item) {
                        return item.id !== entry.id;
                    }
                );

                try {
                    localStorage.setItem(
                        electricityStorageKey,
                        JSON.stringify(updatedEntries)
                    );

                    saveMessage.textContent = "Entry deleted.";
                    saveMessage.style.color = "#15803d";

                    renderElectricityEntries();
                } catch (error) {
                    saveMessage.textContent =
                        "Could not delete this entry.";
                    saveMessage.style.color = "#b91c1c";
                }
            });

            const content = document.createElement("p");
            content.textContent = entry.text;
            content.style.cssText = `
                margin:0;
                color:#334155;
                line-height:1.8;
                white-space:pre-wrap;
                font-size:15px;
            `;

            topRow.append(date, deleteButton);
            card.append(topRow, content);
            entryList.appendChild(card);
        });
    }

    saveButton.addEventListener("click", function () {
        const text = entryText.value.trim();

        if (!text) {
            saveMessage.textContent =
                "Please write your entry before saving.";
            saveMessage.style.color = "#b91c1c";
            entryText.focus();
            return;
        }

        const entries = getElectricityEntries();

        const newEntry = {
            id: Date.now().toString() +
                Math.random().toString(36).slice(2),

            text: text,

            date: new Date().toLocaleString("en-BD", {
                dateStyle: "medium",
                timeStyle: "short",
                hour12: true
            })
        };

        try {
            entries.unshift(newEntry);

            localStorage.setItem(
                electricityStorageKey,
                JSON.stringify(entries)
            );

            entryText.value = "";

            saveMessage.textContent =
                "Entry saved successfully!";
            saveMessage.style.color = "#15803d";

            renderElectricityEntries();
        } catch (error) {
            saveMessage.textContent =
                "Could not save. Browser storage may be unavailable.";
            saveMessage.style.color = "#b91c1c";
        }
    });

    renderElectricityEntries();
}
