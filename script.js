
let contacts = JSON.parse(
    localStorage.getItem("safeherContacts") || "[]"
);

function renderContacts() {
    const list = document.getElementById("contactList");
    list.innerHTML = "";

    if (contacts.length === 0) {
        list.textContent = "No trusted contacts added yet.";
        return;
    }

    contacts.forEach((contact, index) => {
        const card = document.createElement("div");
        card.className = "contact-card";

        const title = document.createElement("h3");
        title.textContent = "💗 " + contact.name;

        const phone = document.createElement("p");
        phone.textContent = contact.phone;

        const call = document.createElement("a");
        call.href = "tel:" + contact.phone.replace(/[^\d+]/g, "");
        call.textContent = "Call contact";

        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.onclick = () => {
            contacts.splice(index, 1);
            saveContacts();
        };

        card.append(title, phone, call, document.createElement("br"), remove);
        list.appendChild(card);
    });
}

function saveContacts() {
    localStorage.setItem(
        "safeherContacts",
        JSON.stringify(contacts)
    );
    renderContacts();
}

function addContact() {
    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();

    if (!name || phone.replace(/\D/g, "").length < 7) {
        alert("Please enter a contact name and valid phone number.");
        return;
    }

    contacts.push({ name, phone });
    saveContacts();

    document.getElementById("contactName").value = "";
    document.getElementById("contactPhone").value = "";

    alert("Trusted contact added!");
}

function showSOS() {
    const message =
        "I may need help. Please contact me as soon as possible.";

    const shouldOpenSMS = confirm(
        "SOS ALERT\n\n" +
        message +
        "\n\nPress OK to prepare an SMS to your trusted contacts. " +
        "You must review and send the message yourself."
    );

    if (!shouldOpenSMS) return;

    const numbers = contacts
        .map(contact => contact.phone.replace(/[^\d+]/g, ""))
        .filter(Boolean);

    const recipient = numbers.join(",");
    const smsLink =
        "sms:" + recipient +
        "?body=" + encodeURIComponent(message);

    if (numbers.length === 0) {
        alert("No trusted contacts saved. Add a contact first, or call 112 in an emergency.");
        return;
    }

    window.location.href = smsLink;
}

function shareLocation() {
    if (!navigator.geolocation) {
        alert("Location is not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const mapLink =
                `https://maps.google.com/?q=${latitude},${longitude}`;

            const message =
                "My current location: " + mapLink;

            if (navigator.share) {
                navigator.share({
                    title: "My location",
                    text: message,
                    url: mapLink
                }).catch(() => {});
            } else if (navigator.clipboard) {
                navigator.clipboard.writeText(message)
                    .then(() => alert("Location link copied:\n" + mapLink))
                    .catch(() => prompt("Copy your location link:", mapLink));
            } else {
                prompt("Copy your location link:", mapLink);
            }
        },
        () => {
            alert("Could not get your location. Allow location permission and try again.");
        },
        { enableHighAccuracy: true, timeout: 12000 }
    );
}

function fakeCall() {
    const accepted = confirm(
        "INCOMING CALL\n\nMom is calling...\n\n" +
        "This is only a simulated call screen. No real call is made."
    );

    if (accepted) {
        alert("Fake call simulation ended.");
    }
}

let checkInInterval = null;

function startCheckIn() {
    if (checkInInterval) {
        clearInterval(checkInInterval);
        checkInInterval = null;
        document.getElementById("timerStatus").textContent =
            "Check-in cancelled.";
        return;
    }

    let seconds = 60;
    const status = document.getElementById("timerStatus");

    checkInInterval = setInterval(() => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        status.textContent =
            `Reminder in ${minutes}:${String(remainingSeconds).padStart(2, "0")}`;

        seconds--;

        if (seconds < 0) {
            clearInterval(checkInInterval);
            checkInInterval = null;
            status.textContent = "Time to check in with someone you trust!";
            alert("Safety check-in reminder: Contact someone you trust.");
        }
    }, 1000);
}

renderContacts();
