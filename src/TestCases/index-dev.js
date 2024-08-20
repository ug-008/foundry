var Props = {};

const style0 = {
    "PASS": {
        "color": "#66bb6a",
        "border": "1px solid #66bb6a"
    }, 
    
    "FAIL": {
        "color": "red",
        "border": "1px solid red"
    }, 
    
    "NEW": {
        "color": "blue",
        "border": "1px solid blue"
    },
    
    "NA": {
        "color": "black",
        "border": "1px solid #333"
    }
    
}

class UtilsClass {
    constructor(props) {
        this.props = props
        $(window).on(
            "resize", 
            function() {
                switch(props.layout) {
                    case 0:
                        break
                    case 1:
                        break;
                    default: ;
                }
            }
        )
        this.contextMenu()
        this.mutationCssBuilder()
        feather.replace()
    }
    
    contextMenu() {
        let menu = $('.parent-layout .context-menu')
        $('.parent-layout').on('contextmenu',
            function(e){
                e.preventDefault()
                menu.show(0, function(){
                    $(this).css({ top: e.pageY, left: e.pageX })
                })
            }
        )
    }

    selectAndDeselectAll(){
        $('input[type="checkbox"].select-all').on('click', 
            function() {
                let SA = $(`input[type="checkbox"].checkbox-${this.getAttribute('name')}`)
                this.checked ? $(SA).prop('checked', true).trigger('change') : $(SA).prop('checked', false).trigger('change')
            }
        )

        $('input[type="checkbox"].checkbox-SA-Rows').on('click', function() {
            let o = ($('input[type="checkbox"].checkbox-SA-Rows:checked').length == $('input[type="checkbox"].checkbox-SA-Rows').length)
            o ? $('input[name="SA-Rows"].select-all').prop('checked',true):$('input[name="SA-Rows"].select-all').prop('checked',false);
        })

        $('input[type="checkbox"].checkbox-SA-Ids').on('click', function() {
            let o = ($('input[type="checkbox"].checkbox-SA-Ids:checked').length == $('input[type="checkbox"].checkbox-SA-Ids').length)
            o ? $('input[name="SA-Ids"].select-all').prop('checked',true):$('input[name="SA-Ids"].select-all').prop('checked',false);
        })

        $('input[type="checkbox"].checkbox-SA-Status').on('click', function() {
            let o = ($('input[type="checkbox"].checkbox-SA-Status:checked').length == $('input[type="checkbox"].checkbox-SA-Status').length)
            o ? $('input[name="SA-Status"].select-all').prop('checked',true):$('input[name="SA-Status"].select-all').prop('checked',false);
        })
        
    }

    mutationCssBuilder() {
        let styleProperty = []
        let items = Object.entries(this.props.ts)
        items.forEach(([k, v])=> {
            if(k) {
                styleProperty.push(`.${k.replace(/\s/g, '-').toLowerCase()} {\n`)
                let cssStyle = Object.entries(v)
                cssStyle.forEach(([k, v])=> {
                    if(k && v)
                        styleProperty.push(`\t${k.toLowerCase()}: ${v.toLowerCase()};\n`)
                })
                styleProperty.push("}\n\n")
            }
        })

        $(`<style>${styleProperty.join('')}</style>`).appendTo('head')

    }
    
}

class CardLayout extends UtilsClass {

    constructor(props) {
        super(props)
        this.props = props
        $('#list-layout').hide(0, ()=>$('#cards').show())
    }

    static apply(props) {
        let cardLayout = new CardLayout(props)
        cardLayout.build().addListeners()
    }

    cardWindowResizeHandler() {
        $cards = $("#cards")
        let mode = Math.floor($cards.width() / 315)
            trunc = ($cards.width() - (315 * mode))/mode
        $("#cards .card").css("width", `${300 + trunc}px`)
    }

    build() {
        this.props.tc.forEach(prop => {
            card = buildCard(prop)
            $("#cards").append(card)
            this.mutationObserver(prop)
        })
        return this;
    }

    mutationObserver(prop) {
        
    }

    addListeners() {

    }

    buildCard(prop) {
        const {id, name, objectives, status, reference, groupName} = prop
        const card = `
            <div class="${id} ${groupName} card">
                <div class="header">
                    <span class="headerTitle">${id}</span>
                    <div class="container">
                        <div class="round">
                            <input type="checkbox" id="checkbox-${id}" />
                            <label for="checkbox-${id}"></label>
                        </div>
                    </div>
                </div>
                
                <div class="center">
                    <a target="_blank" rel="noopener noreferrer" href="${reference}">${name}</a>
                </div>
                <div class="bottom">
                    <div class="statuses ${id} ${status.toLowerCase()}">
                        <span>${status.toUpperCase()}</span>
                    </div>
                    <span class="group-name">${groupName}</span>
                </div>
                <ul class="${id} test-cases">
                    ${Props.ts.filter(v=> v.trim()).map(v=> "<li style='margin-bottom: 5px'>" + v.trim() + "</li>").join("")}
                </ul>
            </div>`
        return card;
    }    
}

class TableLayout extends UtilsClass {

    constructor(props) {
        super(props)
        this.props = props
        this.filterByStatus = new Set()
        this.filterByIds = new Set()
        $('#cards').hide(0, ()=>$('#list-layout').show())
        $('th.-id .-menu').css({
            left: '-15px',
            top: `${$('th.-status > div').height()+2.5}px`,
        })
        $('th.-status .-menu').css({
            top: `${$('th.-status > div').height()+2.5}px`,
        })
    }

    static apply(props) {
        let tabLayout = new TableLayout(props)
        tabLayout.build().addListeners()
    }

    build() {
        let idFilter = new Set()
        this.props.tc.forEach(prop => {
            idFilter.add(prop.groupId)
            let listRow = this.buildTableRow(prop)
            $("tbody").append(listRow)
            this.mutationObserver(prop)
        });

        idFilter.forEach((v, i)=> {
            let item = `
                <li>
                    <span>${v}</span>
                    <div class="round-checkbox" style="display: inline-block;">
                        <input type="checkbox" id="-id-checkbox${i+1}" class="checkbox-SA-Ids" value="${v.toLowerCase()}"/>
                        <label for="-id-checkbox${i+1}"></label>
                    </div>
                </li>
            `
            $("th.-id .-menu ul").append(item)
        });

        ['NA', 'Pass', 'Fail', 'New'].forEach((v, i)=> { // Todo: Replace array
            let item = `
                <li>
                    <span>Filter by ${v}</span>
                    <div class="round-checkbox" style="display: inline-block;">
                        <input type="checkbox" id="-status-checkbox${i+1}" class="checkbox-SA-Status" value="${v.toLowerCase()}"/>
                        <label for="-status-checkbox${i+1}"></label>
                    </div>
                </li>
            `
            $("th.-status .-menu ul").append(item)
        });

        return this
    }

    static markNewAsNotApplicable(e) {
        $('table tbody tr td:last-child').text((i, txt)=> txt.toUpperCase()=='NEW' ?'Not Applicable':txt)
    }

    static markTestResult(e) {
        $('table tbody tr td:first-child input[type=checkbox]:checked').closest('td').each(function(el){
            $(this).siblings(':last').text(e.textContent)
        })
    }

    contextMenuOverload() {
        let thContext = $('table th.-id > div, table th.-status > div')
        let allContext = $('.parent-layout .context-menu, table th .-menu')
        thContext.on('click', (e)=> {
            e.stopPropagation()
            let o = $(e.currentTarget).find('.-menu')
            allContext.hide(0, ()=> o.show(0, ()=> {}))
        });
        $('.parent-layout').on('click', ()=> allContext.hide(0, ()=> {}))
    }

    mutationObserver(prop) {
        const {
            id, 
            name, 
            objectives, 
            status, 
            reference, 
            groupName} = prop
        
        $(`#checkbox-${id}`).on('change',
            function(){
                let o = this.checked
                if(o){
                    $(`#row-${id}`).addClass('active')
                }else {
                    $(`#row-${id}`).removeClass('active')
                }
            }
        )
        $(`#checkbox-cell${id}, #checkbox-${id}`).on('click', 
            function(e) {
                e.stopPropagation()
                let cb = $(`#checkbox-${id}`)
                cb.prop('checked') ? cb.prop('checked', false).trigger('change')
                                   : cb.prop('checked', true).trigger('change')
                $('.parent-layout .context-menu').css({display: 'none'})
            }
        )
    }

    addListeners() {
        this.selectAndDeselectAll()
        this.contextMenuOverload()
        // ID & Test Status filters
        $(`input[type="checkbox"].checkbox-SA-Status, input[type="checkbox"].checkbox-SA-Ids`).on('change',
            (e)=> {
                let sf;
                e = $(e.currentTarget)
                let isId = e.hasClass('checkbox-SA-Ids')
                const add = ()=> isId ? this.filterByIds.add(e.val()):this.filterByStatus.add(e.val())
                const remove = ()=> isId ? this.filterByIds.delete(e.val()):this.filterByStatus.delete(e.val())
                const getStatus = ()=> Array.from(this.filterByStatus)
                const getIds = ()=> Array.from(this.filterByIds)
                e.prop('checked') ? add():remove()
                if(getIds().length) {
                    sf = getIds().map(v=> getStatus().map(u=> `.${v}.${u}`).join(', ').trim()||`.${v}`)
                }else {
                    sf = getStatus().map(v=> `.${v}`) || null
                }
                if(sf) {
                    $(`table tbody tr`).css({display: 'table-row'})
                    $(`table tbody tr:not(${sf.join(', ').trim()})`).css({display: 'none'})
                    if(!$(`table tbody tr:visible`).length) {
                        // Todo: No filter found
                    }
                }
            }
        )
    }

    buildTableRow(prop) {
        const {id, name, objectives, status, reference, groupName, groupId} = prop
        const tableRow = `
            <tr id="row-${id}" class="${groupId.toLowerCase()} ${status.toLowerCase()}">
                <td id="checkbox-cell${id}">
                    <div class="round-checkbox">
                        <input type="checkbox" id="checkbox-${id}" class="checkbox-SA-Rows"/>
                        <label for="checkbox-${id}"></label>
                    </div>
                </td>
                <td class="" title="ID"><a target="_blank" rel="noopener noreferrer" href="${reference}">${id}</a></td>
                <td class="" title="Name: ${name}">${name}</td>
                <td class="" title="Category: ${groupName}">${groupName}</td>
                <td class="" title="Objectives">
                    <div style="padding: 10px 20px;">
                        <ul>
                            ${objectives.filter(v=> v.trim()).map(v=> `<li>${v}</li>`).join('')}
                        </ul>
                    </div>
                </td>
                <td class="" title="Status">${status}</td>
            </tr>`
        return tableRow;
    }

}

/**
 * TFS/WorkItemTracking/Services 
 */
(function() {
    let layout = 1
    let ts = style0
    let url =  './owasp-checklist.json';
    
    (function() {
        Promise.all([fetch(url)]).then(async([ls])=> {

            Props.tc = []
            ls = await ls.json()
            Props.ts = Object.keys(ts)
            Props.layout = layout
            
            // 1. Card Properties
            Object.entries(ls.categories)
                    .map(([k, v])=> {
                        v["tests"].map((obj)=> {
                            let c
                            let o = {
                                id: obj.id,
                                name: obj.name,
                                objectives: obj.objectives,
                                status: c ? c.split('|').filter(v=> v.trim()).map(v=> v.trim())[0]:'New',
                                reference: obj.reference,
                                groupName: k,
                                groupId: v.id, 
                            }
                            Props.tc.push(o)
                        })
                    })
            // 2. Build UI
            if(window.width < 720)
                CardLayout.apply(Props)
            else layout ? TableLayout.apply(Props):CardLayout.apply(Props)

        })
    })()
    
})()

// /**
//  * 
//  */
// function windowResizeHandler() {
//     $cards = $("#cards")
//     let mode = Math.floor($cards.width() / 315)
//         trunc = ($cards.width() - (315 * mode))/mode
//     $("#cards .card").css("width", `${300 + trunc}px`)

//     // $(".table-header .cell").each(function(i){
//     //     console.log($(this).width())
//     //     $(`.table-body .b-${i}`).css('width', `${$(this).width()}px`)
//     // })
// }

// /**
//  * 
//  * @param {OWASP Checklist in Json} rec 
//  */
// function successHandler(rec) {
//     rec.forEach(props => {
//         card = buildCard(props)
//         $("#cards").append(card)

//         listRow = buildTableRow(props)
//         $("tbody").append(listRow)

//         listRowMutationObserver(props)
//         // statusMutationObserver(props)
//     })
//     windowResizeHandler()
//     $(".search-container input").on("input", function() {
//         searching = $(this).val()
//         if(searching){
//             searching = searching.toUpperCase()
//             $cards = $(`#cards .card[class*="${searching}"]`)
//             if($cards.length){
//                 $(`#cards .card[class*="${searching}"]`).show()
//                 $(`#cards .card:not([class*="${searching}"])`).hide()
//             }
//             else $("#cards > .card").show()
//         }
//         else $("#cards > .card").show()
//     })
// }

// /**
//  * 
//  * @param {Card Propertys} props 
//  * @returns html string
//  */
// function buildCard(props) {
//     const {id, name, objectives, status, reference, groupName} = props
//     const card = `
//         <div class="${id} ${groupName} card">
//             <div class="header">
//                 <span class="headerTitle">${id}</span>
//                 <div class="container">
//                     <div class="round">
//                         <input type="checkbox" id="checkbox-${id}" />
//                         <label for="checkbox-${id}"></label>
//                     </div>
//                 </div>
//             </div>
            
//             <div class="center">
//                 <a target="_blank" rel="noopener noreferrer" href="${reference}">${name}</a>
//             </div>
//             <div class="bottom">
//                 <div class="statuses ${id} ${status.toLowerCase()}">
//                     <span>${status.toUpperCase()}</span>
//                 </div>
//                 <span class="group-name">${groupName}</span>
//             </div>
//             <ul class="${id} test-cases">
//                 ${Props.ts.filter(v=> v.trim()).map(v=> "<li style='margin-bottom: 5px'>" + v.trim() + "</li>").join("")}
//             </ul>
//         </div>`
//     return card;
// }

// /**
//  * 
//  * @param {*} props 
//  */
// function buildTableRow(props) {
//     const {id, name, objectives, status, reference, groupName} = props
//     const tableRow = `
//         <tr class="">
//             <td class="">
//                 <div class="round">
//                     <input type="checkbox" id="checkbox-${id}" />
//                     <label for="checkbox-${id}"></label>
//                 </div>
//              </td>
//             <td class="" title="ID"><a href="${reference}">${id}</a></td>
//             <td class="" title="Category: ${groupName}">${groupName}</td>
//             <td class="" title="Name: ${name}">${name}</td>
//             <td class="" title="Objectives">
//                 <div style="padding: 10px 20px;">
//                     <ul>
//                         ${objectives.filter(v=> v.trim()).map(v=> `<li>${v}</li>`).join('')}
//                     </ul>
//                 </div>
//             </td>
//             <td class="" title="Status">${status}</td>
//         </tr>`
//     return tableRow;
// }

// /**
//  * 
//  * @param {Card Properties or Checklist Items} props 
//  */
// function statusMutationObserver(props) {
//     const {id, groupId} = props
//     $status = $(`.statuses.${id}`)

//     $status.on('click', function (e) {
//         e.stopPropagation();
//         $card = $(`.card.${id}`)
//         $testCases = $(`.test-cases.${id}`)
//         $testCases.css({"top": `${$card.height() + 2}px`})
//         $(`.test-cases`).hide()
//         $testCases.slideToggle(0, function () {})
//     })

//     $(`.test-cases.${id} li`).on('click', function() {
//         $(`.test-cases.${id}`).slideToggle(0, function () {})
//         // Todo: Open Model
//         $(`.statuses.${id}`).text($(this).text())
//     })

//     $(`#cards`).on('click', function(){
//         $(`.test-cases`).hide()
//     })

//     var observer = new MutationObserver(
//         function(e) {
//             $this = $(e[0].target)
//             $this.removeClass(Props.ts.map(v=> v.replace(/\s/g, '-').toLowerCase()))
//             $this.addClass($this.text().toLowerCase())
//             if(Props.fs) {
//                 let gid = `Custom.STS_${id.replace(/-/g, '_')}`
//                 Props.fs.getFieldValue(gid).then((c)=> {
//                     let value;
//                     if(c)
//                         value = c.split('|').filter(v=> v.trim()).map((v, i)=> i==0?$this.text(): v.trim()).join('|')
//                     else value = `${$this.text()}`
//                     Props.fs.setFieldValue(gid, value)
//                 })
//             }
//         }
//     )

//     observer.observe($status[0], {characterData: true, childList: true});
// }

// /**
//  * 
//  * @param {Test Status Object - Scheme} obj 
//  */
// function cssBuilder(obj) {
//     styleProperty = []
//     items = Object.entries(obj)
//     items.forEach(([k, v])=> {
//         if(k) {
//             styleProperty.push(`.${k.replace(/\s/g, '-').toLowerCase()} {\n`)
//             cssStyle = Object.entries(v)
//             cssStyle.forEach(([k, v])=> {
//                 if(k && v)
//                     styleProperty.push(`\t${k.toLowerCase()}: ${v.toLowerCase()};\n`)
//             })
//             styleProperty.push("}\n\n")
//         }
//     })
//     return styleProperty.join('')
// }

