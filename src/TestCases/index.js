var Props = {};

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
    }
    
    contextMenu() {
        let menu = $('.parent-layout .context-menu')
        $('.parent-layout').on('contextmenu',
            function(e){
                e.preventDefault()
                menu.show(0, function() {
                    let cWidth = $(this).width()
                    let cHeight = $(this).height()
                    function styleUpdate() {
                        let maxX = e.pageX + cWidth + 20
                        let maxY = e.pageY + cHeight + 20
                        let tabWidth = $('#list-layout').width()
                        let tabHeight = $('#list-layout').height()
                        let __style__= {top: (maxY < tabHeight)? e.pageY : e.pageY - cHeight}
                        let subListWidth = $('.menu-sub-list').width()
                        if(maxX < tabWidth){
                            __style__.left = e.pageX
                            $('.menu-sub-list').css({left: (maxX + subListWidth) < tabWidth? '100%':'-100%', right: 0})
                        }else {
                            __style__.left = e.pageX - cWidth
                            $('.menu-sub-list').css({left: (maxX + subListWidth) < tabWidth? '-100%':'100%', right: 0})
                        }
                        return __style__;
                    }
                    $(this).css(styleUpdate())
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
        this.props.statusStyle.forEach(([statu, style], i)=> {
            let cssStyle = Object.entries(style)
            styleProperty.push(`.${statu.replace(/\s/g, '-').toLowerCase()} {\n`)
            cssStyle.forEach(([k, v], i)=> {
                if(k) {
                    if(k && v)
                        styleProperty.push(`\t${k.toLowerCase()}: ${v.toLowerCase()};\n`)
                }
            })
            styleProperty.push("}\n\n")
        })
        $(`<style>${styleProperty.join('')}</style>`).appendTo('head')
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
        feather.replace() // apply all icon
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
                        <input type="checkbox" checked id="-id-checkbox${i+1}" class="checkbox-SA-Ids" value="${v.toLowerCase()}"/>
                        <label for="-id-checkbox${i+1}"></label>
                    </div>
                </li>
            `
            $("th.-id .-menu ul").append(item)
        });

        Props.statusIcon.forEach(([v, icon], i)=> { 
            let item = `
                <li>
                    <span>Filter by ${v}</span>
                    <div class="round-checkbox" style="display: inline-block;">
                        <input type="checkbox" checked id="-status-checkbox${i+1}" class="checkbox-SA-Status" value="${v.toLowerCase()}"/>
                        <label for="-status-checkbox${i+1}"></label>
                    </div>
                </li>
            `
            $("th.-status .-menu ul").append(item)
            // Sub ContextMenu
            let contextTestStatus = `
                <li class="menu-item">
                    <button class="menu-button menu-button--green" onclick="TableLayout.markTestResult(this)">
                        <i data-feather="${icon}"></i>
                        ${v}
                    </button>
                </li>
            `
            $(".menu-sub-list.test-status").append(contextTestStatus);
        });

        return this
    }

    static markNewAsNotApplicable(e) {
        $('table tbody tr td:last-child:visible').text((i, txt)=> txt.toUpperCase()=='New' ? 'NA':txt)
    }

    static markTestResult(e) {
        $('table tbody tr td:first-child input[type=checkbox]:checked').closest('td').each(function(el) {
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
        
        new MutationObserver(
            function(e) {
                let el = $(e[0].target), text = el.text()?.trim()
                console.log(text)
                console.log($(`table tbody tr#row-${id}`).prop('class'))
                $(`table tbody tr#row-${id}`).removeClass(Props.statusStyle.map(([s, v])=> s.replace(/\s/g, '-').toLowerCase()))
                $(`table tbody tr#row-${id}`).addClass(text.replace(/\s/g, '-').toLowerCase())
                console.log($(`table tbody tr#row-${id}`).prop('class'))
                if(Props.fs) {
                    let gid = `Custom.STS_${id.replace(/-/g, '_')}`
                    Props.fs.getFieldValue(gid).then((c)=> {
                        let value;
                        if(c)
                            value = c.split('|').filter(v=> v.trim()).map((v, i)=> i==0 ? text: v.trim()).join('|')
                        else value = `${text}`
                        Props.fs.setFieldValue(gid, value)
                    })
                }
            }
        ).observe($(`table tbody tr#row-${id} td.test-result`)[0], {characterData: true, childList: true})
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
                        <ul style="">
                            ${objectives.filter(v=> v.trim()).map(v=> `<li>${v}</li>`).join('')}
                        </ul>
                    </div>
                </td>
                <td class="test-result" title="Test Result">${status}</td>
            </tr>`
        return tableRow;
    }

}

/**
 * TFS/WorkItemTracking/Services 
 */
VSS.require(["TFS/WorkItemTracking/Services"], (ws)=> {
    let layout = 1
    let fs = () => ws.WorkItemFormService.getService();
    let ts = JSON.parse(VSS.getConfiguration().witInputs["TestStatus"]||'{}')
    let url =  VSS.getConfiguration().witInputs["ChecklistUrl"]||'./owasp-checklist.json';
    
    function fetchRecords() {
        Promise.all([fs(), fetch(url)]).then(async([service, ls])=> {
            Props.fs = service
            Props.statusStyle = Object.keys(ts).map(v=> [v, ts[v].style||{}])
            Props.statusIcon = Object.keys(ts).map(v=> [v, ts[v].featherIcon||''])
            Props.ls = await ls.json()
            allTestCases = Props.ls.allTestCases.map(v=> `Custom.STS_${v.replace(/-/g, '_')}`)
            Props.layout = layout
            Props.tc = []
            service.getFieldValues([...allTestCases, 'Custom.STS_TestType']).then((values)=> {
                let testType = values['Custom.STS_TestType']?.split('/').map(v=> v.trim()).join("")||"",
                    runItemsConstants = function(k, v) {
                        v["tests"].forEach((obj)=> {
                            let c = values[`Custom.STS_${obj.id.replace(/-/g, '_')}`]
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
                    }
                // 1. Test Item Properties
                Object.entries(Props.ls.categories).forEach(([k, v])=> {
                    switch(testType) {
                        case 'APIs/Web App':
                            if(v.id.startsWith('WSTG')) runItemsConstants(k, v)
                        break;
                        case 'Client/Desktop App':
                            if(v.id.startsWith('CSTG')) runItemsConstants(k, v)
                        break;
                        default: runItemsConstants(k, v);
                    }
                })
                // 2. Build UI
                if(window.width < 420)
                    ;// CardLayout.apply(Props)
                else layout ? TableLayout.apply(Props):null//CardLayout.apply(Props)
                
                // 3. Show table
                $('.parent-layout').css({visibility: 'visible'})

                // 4. Resize
                VSS.resize(
                    document.getElementsByTagName("body").item(0).offsetWidth, 
                    document.getElementsByTagName("body").item(0).offsetHeight
                )
            })
        })
    }
        
    VSS.register(
        VSS.getContribution().id, 
        function () {
            return {
                onLoaded: function(args) {
                    fetchRecords()
                },
                onFieldChanged: (args)=> {
                    // serviceAPI_v1()
                }
            }
        }
    ) 
    
    VSS.notifyLoadSucceeded()

})
