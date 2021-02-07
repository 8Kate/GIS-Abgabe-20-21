
initReservierungen();

document.getElementById("sendReservierung").addEventListener("click", async function (): Promise<void> {
    sendReservierung();
});

async function initReservierungen (): Promise<void> {
    let reservierungen: Reservierungen = JSON.parse(localStorage.getItem("reservierungen"));
    let reservierungsContainer: HTMLElement = document.getElementById("reservierungen");
    reservierungen.ids.forEach(async (element) => {
        let item: Item = await getItem(element.toString());
        reservierungsContainer.append(generateReservierungen(item));
        let preisText: HTMLElement = document.getElementById("preisText");
        preisText.innerHTML = (Number.parseFloat(preisText.innerText) + item.price).toString();
    });
}

function generateReservierungen (item: Item): HTMLParagraphElement {
    let reservierungsItem: HTMLParagraphElement = document.createElement("p");
    reservierungsItem.innerHTML = `<strong>${item.title}: </strong> ${item.price} €`;
    return reservierungsItem;
}

async function getItem(_id: string): Promise<Item> {
    let response: Response = await fetch("http://127.0.0.1:8100/item/id/" + _id);
    let item: Item = await response.json();
    console.log(item);
    return item;
}

async function sendReservierung(): Promise<void> {
    let inputField: HTMLInputElement = <HTMLInputElement>document.getElementById("name");
    let reservierung: Reservierungen = JSON.parse(localStorage.getItem("reservierungen"));
    reservierung.name = inputField.value.trim();
    await fetch("http://127.0.0.1:8100/reservierung", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain"
        },
        body: JSON.stringify(reservierung)
    });
    window.location.href = "http://127.0.0.1:5500/sites/verleih.html";
}
