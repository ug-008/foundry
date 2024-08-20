define(
    [], 
    ()=> {
        return {    
            addToDOM: ({pos, data, clear, resize, fn})=> {
                var __htmlText__= data[pos],
                    deleteBtn = document.createElement("span"),
                    hyperText = document.createElement("span"),
                    itemCard = document.createElement("div"),
                    mainContainer = document.getElementById("links");

                if(clear) {
                    mainContainer.textContent = '';
                }

                hyperText.innerHTML = __htmlText__
                deleteBtn.appendChild(document.createTextNode("x"))
                deleteBtn.setAttribute("id", "deleteBtn")
                itemCard.appendChild(deleteBtn)
                itemCard.appendChild(hyperText)
                mainContainer.appendChild(itemCard)

                resize()

                /**
                 */
                $(deleteBtn).on("click", ()=> fn(itemCard))

            }
        }
    }
)