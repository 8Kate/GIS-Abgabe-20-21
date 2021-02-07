"use strict";
initAsta();
let items;
async function initAsta() {
    let response = await fetch("https://astaverleih.herokuapp.com//astaverleih.herokuapp.com/items");
    items = await response.json();
    generateAstaProducts();
}
function generateAstaProducts() {
    let container = document.getElementById("flex-container");
    for (let i = 0; i < items.length; i++) {
        let div = document.createElement("div");
        div.className = "flex-item";
        div.innerHTML = `<div class="item-heading">
                            <h2>${items[i].title}</h2>
                        </div>
                        <img src="../img/${items[i].img}" alt="Carcassonne">
                        <p>Status: <span class="status">${items[i].Status}</span></p>
                        <p>Ausgeliehen an: <span class="ausgeliehenAn">${items[i].ausgeliehenAn}</span></p>`;
        let button = document.createElement("button");
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
function statusAendern() {
    let item = items.find(item => item.title === this.parentElement.children[0].children[0].innerHTML);
    let url = `https://astaverleih.herokuapp.com//astaverleih.herokuapp.com/statusAendern/${item._id}`;
    console.log(url);
    fetch(url);
    window.location.href = "https://8kate.github.io/GIS-Abgabe-20-21/sites/asta.html";
}
//# sourceMappingURL=asta.js.map