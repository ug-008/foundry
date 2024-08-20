var Props = {};

function windowResizeHandler() {
    $cards = $("#cards")
    let mode = Math.floor($cards.width() / 315)
        trunc = ($cards.width() - (315 * mode))/mode
    $("#cards .card").css("width", `${300 + trunc}px`)
}

/**
 * 
 * @param {OWASP Checklist in Json} rec 
 */
function successHandler(rec) {
    rec.forEach(props => {
        card = buildCard(props)
        $("#cards").append(card)
        statusMutationObserver(props)
        console.log('pool')
    })
    windowResizeHandler()
    $(".search-container input").on("input", function() {
        searching = $(this).val()
        if(searching){
            searching = searching.toUpperCase()
            $cards = $(`#cards .card[class*="${searching}"]`)
            if($cards.length){
                $(`#cards .card[class*="${searching}"]`).show()
                $(`#cards .card:not([class*="${searching}"])`).hide()
            }
            else $("#cards > .card").show()
        }
        else $("#cards > .card").show()
    })
}

/**
 * 
 * @param {Card Propertys} props 
 * @returns html string
 */
function buildCard(props) {
    const {id, category, name, objectives, status, reference, groupName} = props
    const card = `
        <div class="${id} ${category} card">
            <span class="headerTitle">${id}</span>
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

/**
 * 
 * @param {Card Properties or Checklist Items} props 
 */
function statusMutationObserver(props) {
    const {id, groupId} = props
    $status = $(`.statuses.${id}`)

    $status.on('click', function (e) {
        e.stopPropagation();
        $card = $(`.card.${id}`)
        $testCases = $(`.test-cases.${id}`)
        $testCases.css({"top": `${$card.height() + 2}px`})
        $(`.test-cases`).hide()
        $testCases.slideToggle(0, function () {})
    })

    $(`.test-cases.${id} li`).on('click', function() {
        $(`.test-cases.${id}`).slideToggle(0, function () {})
        // Todo: Open Model
        $(`.statuses.${id}`).text($(this).text())
    })

    $(`#cards`).on('click', function(){
        $(`.test-cases`).hide()
    })

    var observer = new MutationObserver(
        function(e) {
            $this = $(e[0].target)
            $this.removeClass(Props.ts.map(v=> v.replace(/\s/g, '-').toLowerCase()))
            $this.addClass($this.text().toLowerCase())
            if(Props.fs) {
                let gid = `Custom.STS_${id.replace(/-/g, '_')}`
                Props.fs.getFieldValue(gid).then((c)=> {
                    let value;
                    if(c)
                        value = c.split('|').filter(v=> v.trim()).map((v, i)=> i==0?$this.text(): v.trim()).join('|')
                    else value = `${$this.text()}`
                    Props.fs.setFieldValue(gid, value)
                })
            }
        }
    )

    observer.observe($status[0], {characterData: true, childList: true});
}

/**
 * 
 * @param {Test Status Object - Scheme} obj 
 */
function cssBuilder(obj) {
    styleProperty = []
    items = Object.entries(obj)
    items.forEach(([k, v])=> {
        if(k) {
            styleProperty.push(`.${k.replace(/\s/g, '-').toLowerCase()} {\n`)
            cssStyle = Object.entries(v)
            cssStyle.forEach(([k, v])=> {
                if(k && v)
                    styleProperty.push(`\t${k.toLowerCase()}: ${v.toLowerCase()};\n`)
            })
            styleProperty.push("}\n\n")
        }
    })
    return styleProperty.join('')
}

/**
 * TFS/WorkItemTracking/Services 
 */
VSS.require(["TFS/WorkItemTracking/Services"], (ws)=> {
    let fs = () => ws.WorkItemFormService.getService();
    let ts = JSON.parse(VSS.getConfiguration().witInputs["TestStatus"]||'{}')
    let url =  VSS.getConfiguration().witInputs["ChecklistUrl"]||'./owasp-checklist.json';
    
    $(window).on(
        "resize", 
        function() {
            windowResizeHandler()
        }
    )

    // Append status styles
    $(`<style>${cssBuilder(ts)}</style>`).appendTo('head') 

    function fetchRecords() {
        Promise.all([fs(), fetch(url)]).then(async([service, ls])=> {
            Props.fs = service
            Props.ts = Object.keys(ts)
            Props.ls = await ls.json()
            allTestCases = Props.ls.allTestCases.map(v=> `Custom.STS_${v.replace(/-/g, '_')}`)
            Props.cardProperties = []
            service.getFieldValues(allTestCases).then((values)=> {
                // 1. Card Properties
                Object.entries(Props.ls.categories)
                        .map(([k, v])=> {
                            v["tests"].map((obj)=> {
                                let c = values[`Custom.STS_${obj.id.replace(/-/g, '_')}`]
                                let o = {
                                    id: obj.id,
                                    name: obj.name,
                                    objectives: obj.objectives,
                                    status: c ? c.split('|').filter(v=> v.trim()).map(v=> v.trim())[0]:'NEW',
                                    reference: obj.reference,
                                    groupName: k,
                                    groupId: v.id, 
                                }
                                Props.cardProperties.push(o)
                            })
                        })
                // 2. Build UI
                successHandler(Props.cardProperties)
                // 3. Resize
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
