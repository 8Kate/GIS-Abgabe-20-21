namespace verleih {
    let items: Item[];
    
    initialize();
    
    async function initialize(): Promise<void> {
        localStorage.clear();
        let response: Response = await fetch("http://astaverleih.herokuapp.com/items");
        items = await response.json();
        console.log(items);
        generateItems();

        let reservieren: HTMLCollectionOf<Element> = document.getElementsByClassName("reservieren");
        for (let button of reservieren) {
            button.addEventListener("click", onReservieren);
        }
    }

    function generateItems(): void  {
        items.forEach(element  => {
            let flexContainer: HTMLElement = document.getElementById("flex-container");
            let itemContainer: HTMLElement = document.createElement("div");
            itemContainer.className = "flex-item " + element.Status;
            itemContainer.innerHTML =   `<div class='item-heading'>
                                            <h2>${element.title}</h2>
                                        </div>
                                        <img src='../img/${element.img}' alt='${element.title}'>
                                        <p>${element.Beschreibung}</p>
                                        <p>Ausleihgebühr: ${element.price} €</p>
                                        <p>${element.Status}</p>
                                        <button ${isDisabled(element.Status)} class="reservieren"> reservieren +</button>`;
            flexContainer.append(itemContainer);
        });
    }

    function isDisabled(status: string): string {
        if (status === "ausgeliehen" || status === "reserviert") {
            return "disabled";
        }
        return "";
    }

    function onReservieren (this: HTMLElement): void {
        /* Button change depending on State*/
        let item: Item = items.find(item => item.title === this.parentElement.children[0].children[0].innerHTML);
        let reservierungsContainer: HTMLElement = document.getElementById("reservierungen");

        if (!this.parentElement.classList.contains("ausgewaehlt")) {
            this.innerHTML = "reservieren -";
            this.parentElement.className = this.parentElement.className  + " ausgewaehlt";
            
            /* Einfügen in Sidebar Liste */
            let reservierungsItem: HTMLParagraphElement = document.createElement("p");
            
            reservierungsItem.innerHTML = `<strong>${item.title}: </strong> ${item.price} €`;
            reservierungsContainer.append(reservierungsItem);


            /* Eintragen in LocalStorage */
            let reservierungen: Reservierungen = {ids: []};
            if (localStorage.getItem("reservierungen")) {
                reservierungen = JSON.parse(localStorage.getItem("reservierungen"));
                reservierungen.ids.push(item._id);
            } else {
                reservierungen.ids.push(item._id);
            }
            localStorage.setItem("reservierungen", JSON.stringify(reservierungen));

            /* Preis Updaten */
            let preisText: HTMLElement = document.getElementById("preisText");
            preisText.innerHTML = (Number.parseFloat(preisText.innerText) + item.price).toString();
        } else {
            this.innerHTML = "reservieren +";
            this.parentElement.classList.remove("ausgewaehlt");
            
            /* Löschen aus der Sidebar Liste */
            let reservierungenCollection: HTMLCollectionOf<Element> = reservierungsContainer.children;
            for (let reservierung of reservierungenCollection) {
                if (reservierung.textContent.match(`^${item.title}*`)) {
                    reservierung.remove();
                }
            }

            /* Löschen in LocalStorage */
            let reservierungen: Reservierungen = JSON.parse(localStorage.getItem("reservierungen"));
            reservierungen.ids.splice(reservierungen.ids.indexOf(item._id, 1));
            localStorage.setItem("reservierungen", JSON.stringify(reservierungen));

            /* Preis updaten */
            let preisText: HTMLElement = document.getElementById("preisText");
            preisText.innerHTML = (Number.parseFloat(preisText.innerText) - item.price).toString();
        }
        
    }
}
