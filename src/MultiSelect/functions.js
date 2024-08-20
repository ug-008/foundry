/**
 * 
 */
var __selectedItem__;

/**
 * 
 */
var __list__;

/**
 * 
 */
var __isFixed__;

/**
 * 
 */
var __saveSelectedItem__;

/**
 * 
 */
var __cssProps__;

/**
 * Main function
 */
define(
    [], 
    ()=> {
        return {
            reset: reset,
            onLoad: onLoad
        }
    }
);

/**
 * @function resize 
 */
function resize(){
    VSS.resize(
        document.getElementsByTagName("body").item(0).offsetWidth, 
        document.getElementsByTagName("body").item(0).offsetHeight
    )
}

/**
 * 
 * @function addEventListeners
 */
function addEventListeners() {

    var sBoard = document.getElementById('__sBoard__')

    __selectedItem__.length && $('#__space__').css('display', 'none')

    $('#__selectOptions__').on(
        'mouseenter', 
        ()=> {
            if(__selectedItem__.length) {
                $('#__space__').css('display', 'block')
                resize();
            }
        }
    ).on(
        'mouseleave', 
        ()=> {
            hidden = $(sBoard).is(":hidden")
            if(__selectedItem__.length && hidden){
                $('#__space__').css('display', 'none')
                resize();
            }
        }
    )

    $('#dropArrow').on(
        'click', 
        (event)=> {
            hidden = $(sBoard).is(':hidden')
            if(hidden){
                $('#filter').trigger('click')
                setTimeout(()=> $('#__dropList__ input')[0].focus(), 100)
            }
            else {
                sBoard.style.display = 'none'
                modifySelectedItem()
            }
            resize()
        }
    )

    $('#filter').on(
        'click', 
        ()=> {
            sBoard.style.display = 'flex'
            resize()
        }
    )

    $(document).on(
        'click', 
        (event)=> {
            isContextItem = $(event.target).hasClass('__dd__')
            if(!isContextItem) {
                sBoard.style.display = 'none'
                modifySelectedItem()
            }
        }
    )

    $(document).on(
        'focusout', 
        (event)=> {
            setTimeout(()=>{
                focus = document.hasFocus()
                if(!focus) {
                    if(__selectedItem__.length)
                        $('#__sBoard__, #__space__').css('display', 'none')
                    else $('#__sBoard__').css('display', 'none')
                    modifySelectedItem()
                }
            }, 50);
        }
    )

    resize()

}

/**
 * 
 */
function turnStyle() {
    $('#dropArrow').css('display', 'none')
    $('#placeholder').css('border', 'none')
    $('#filter').attr('placeholder', 'None')
    $('#filter').attr('readonly', 'readonly')
}

/**
 * 
 * @param {Props} param 
 */
function onLoad({selectedItem, list, cssProps, saveSelectedItem}) {
    __list__ = list
    __selectedItem__ = selectedItem
    __saveSelectedItem__ = saveSelectedItem
    __cssProps__ = cssProps
    __selectedItem__ = __selectedItem__ ? __selectedItem__.split(';').filter((o) => o):[]
    __list__ = __list__ ? __list__.split(';').map((o) => o.trim()).filter((o) => o):[]
    makeContextMenu(__list__)
    addEventListeners( )
}

/**
 * 
 * @param {Array} param 
 */
function reset({selectedItem}) {
    __selectedItem__ = selectedItem
    __selectedItem__ = __selectedItem__ ? __selectedItem__.split(';').filter((o) => o):[]
    makeContextMenu(__list__)
}

/**
 * 
* @function modifySelectedItem 
*/
function modifySelectedItem() {

    var selectedItemUi = document.getElementById("selectedItemUi");
    
    selectedItemUi.innerHTML = ''

    __selectedItem__.forEach(
        function(item, index) {
            let div = document.createElement('div'),
                spanText = document.createElement('span'),
                spanBullet = document.createElement('span'),
                spanCancel = document.createElement('span');
                
            spanText.appendChild(document.createTextNode(item.text));
            spanCancel.appendChild(document.createTextNode('\u2715'));
            spanBullet.appendChild(document.createTextNode('\u2724'));
            spanText.setAttribute('class', 'spanText')
            spanBullet.setAttribute('class', 'spanBullet')
            spanCancel.setAttribute('class', 'spanCancel')
            
            if(__cssProps__){
                $('#__selectOptions__').css('max-width', __cssProps__['window-width'])
                $(div).css(__cssProps__)
                spanBullet.innerHTML = __cssProps__['bullet-type'] || '\u2724'
                spanBullet.style.color = __cssProps__['bullet-color'] || ''
                spanBullet.style.fontSize = __cssProps__['bullet-size'] || ''
                spanCancel.style.color = __cssProps__['cancel-color'] || ''
                spanCancel.style.fontSize = __cssProps__['cancel-size'] || ''
            }

            $(spanCancel).on(
                'click', 
                function(){
                    __selectedItem__ = __selectedItem__.map(
                        (e)=> {
                            e.checkbox.checked = e.text!=item.text
                            return e
                        }
                    ).filter((e)=> e.text!= item.text)
                    modifySelectedItem()
                }
            )

            div.appendChild(spanBullet)
            div.appendChild(spanText)
            div.appendChild(spanCancel)
            selectedItemUi.appendChild(div)

        }
    )

    resize()

    __saveSelectedItem__(__selectedItem__.filter((e)=> e))
}

/**
* 
* @param {*} __selectedItem__ 
* @param {*} __list__ 
* @param {*} callback 
*/
function makeContextMenu(__list__) {
    var hasItem = (__list__.length > 0),
        sBoard = document.getElementById("__sBoard__"),
        dropList = document.getElementById("__dropList__"),
        ul = document.createElement('ul');
                
    if(hasItem) {
        __list__.forEach(function(item, index) {
            var li = document.createElement('li'),
                input = document.createElement('input'),
                label = document.createElement('label');

            li.setAttribute('class', '__listItem__ __dd__')
            label.appendChild(document.createTextNode(item))
            label.setAttribute('for', `__input__${index}`)
            label.setAttribute('class', '__text__ __dd__')
            input.checked = __selectedItem__.includes(item)
            input.setAttribute('id', `__input__${index}`)
            input.setAttribute('class', '__checkbox__ __dd__')
            input.setAttribute('type', 'checkbox')

            if(input.checked){
                __selectedItem__ = __selectedItem__.map(
                    (e)=> {
                        return e.text===item||e===item ? {text: e.text||e, checkbox: e.checkbox||input}: e
                    }
                )
                modifySelectedItem()
            }
                    
            $(input).on(
                'change', 
                function() {
                    isSelected = this.checked
                    __selectedItem__ = isSelected ? __selectedItem__.concat({text: item, checkbox: this}):__selectedItem__.filter((e)=> e.text!== item)
                }
            );

            li.appendChild(input)
            li.appendChild(label)
            ul.appendChild(li)

        })
        //
        ul.setAttribute('class', '__listItems__ __dd__')
        // Clear Element DOM
        dropList.innerHTML = '';
        dropList.appendChild(ul);
        sBoard.style.display = 'none'
    }
    else {
        dropList.innerHTML = `<span class="__notFound__">No work item found</span>`;
        sBoard.style.display = 'none'
    }

}
