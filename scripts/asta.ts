initAsta();

let items: Item[];

async function initAsta(): Promise<void> {
    let response: Response = await fetch("http://astaverleih.herokuapp.com/items");
    items = await response.json();

    generateAstaProducts();
}

function generateAstaProducts(): void {
    let container: HTMLElement = document.getElementById("flex-container"); 
    for (let i: number = 0; i < items.length; i++) {
        let div: HTMLDivElement = document.createElement("div");
        div.className = "flex-item";
        div.innerHTML = `<div class="item-heading">
                            <h2>${items[i].title}</h2>
                        </div>
                        <img src="../img/${items[i].img}" alt="Carcassonne">
                        <p>Status: <span class="status">${items[i].Status}</span></p>
                        <p>Ausgeliehen an: <span class="ausgeliehenAn">${items[i].ausgeliehenAn}</span></p>`;

        let button: HTMLButtonElement = document.createElement("button");
        button.className = "statusAendern";
        button.innerHTML = "Status ändern";
        if (items[i].Status === "frei") {
            button.disabled = true; 
        }
        button.addEventListener("click", statusAendern);
        div.append(button);
        container.append(div);
    }
}

function statusAendern(this: HTMLButtonElement): void {
    let item: Item = items.find(item => item.title === this.parentElement.children[0].children[0].innerHTML);
    let url: string = `http://astaverleih.herokuapp.com/statusAendern/${item._id}`;
    console.log(url);
    fetch(url);
    window.location.href = "https://8kate.github.io/GIS-Abgabe-20-21/sites/asta.html";
}