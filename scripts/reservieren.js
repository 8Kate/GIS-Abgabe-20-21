"use strict";
initReservierungen();
document.getElementById("sendReservierung").addEventListener("click", async function () {
    sendReservierung();
});
async function initReservierungen() {
    let reservierungen = JSON.parse(localStorage.getItem("reservierungen"));
    let reservierungsContainer = document.getElementById("reservierungen");
    reservierungen.ids.forEach(async (element) => {
        let item = await getItem(element.toString());
        reservierungsContainer.append(generateReservierungen(item));
        let preisText = document.getElementById("preisText");
        preisText.innerHTML = (Number.parseFloat(preisText.innerText) + item.price).toString();
    });
}
function generateReservierungen(item) {
    let reservierungsItem = document.createElement("p");
    reservierungsItem.innerHTML = `<strong>${item.title}: </strong> ${item.price} €`;
    return reservierungsItem;
}
async function getItem(_id) {
    let response = await fetch("https://astaverleih.herokuapp.com//astaverleih.herokuapp.com/item/id/" + _id);
    let item = await response.json();
    console.log(item);
    return item;
}
async function sendReservierung() {
    let inputField = document.getElementById("name");
    let reservierung = JSON.parse(localStorage.getItem("reservierungen"));
    reservierung.name = inputField.value.trim();
    await fetch("https://astaverleih.herokuapp.com//astaverleih.herokuapp.com/reservierung", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain"
        },
        body: JSON.stringify(reservierung)
    });
    window.location.href = "https://astaverleih.herokuapp.com//8kate.github.io/GIS-Abgabe-20-21/sites/verleih.html";
}
//# sourceMappingURL=reservieren.js.map