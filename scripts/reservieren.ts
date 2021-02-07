
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
    let response: Response = await fetch("https://astaverleih.herokuapp.com//astaverleih.herokuapp.com/item/id/" + _id);
    let item: Item = await response.json();
    console.log(item);
    return item;
}

async function sendReservierung(): Promise<void> {
    let inputField: HTMLInputElement = <HTMLInputElement>document.getElementById("name");
    let reservierung: Reservierungen = JSON.parse(localStorage.getItem("reservierungen"));
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
