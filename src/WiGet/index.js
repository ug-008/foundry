
/**
 * 
 */
var dataLeak= [];
/**
 * 
 */
var selectedItem;
    
/**
 * 
 * @param {*} dt 
 */
function identifySelectedItems() {
    if(dataLeak&&(dataLeak.length > 0)) {
        var __hn__ = document.getElementById('__hiddenNote__');
            prevDt = __hn__.innerHTML
            prevDtlist = prevDt.split(';');
            selectedItem = dataLeak.filter((item)=> prevDtlist.includes(item.text.trim()))
            __syncDataToDomElement__()
    }
}

/**
 * 
 * @param {*} __associatedField__ 
 * @param {*} service 
 * @param {*} __fn__ 
 */
function getDataFromAssociatesField(__associatedField__, service, __fn__) {
    if(__associatedField__)
        service.getFieldValues([__associatedField__])
                .then(function(args) {
                    __fn__(args[__associatedField__])
                })        
}

/**
 * 
 * @param {*} itemList 
 */
function itemListPopup(itemList, __whenCheckBoxIsSelected__) {
    var __ul__= document.createElement('ul'),
        __sBoard__ = document.getElementById("__sBoard__"),
        __filtered__= [],
        __dropList__= document.getElementById("__dropList__"),
        __hiddenNote__ = document.getElementById('__hiddenNote__'),
        __selectedValue__ = __hiddenNote__.innerHTML;
    
    if(itemList.length > 0) {
        itemList.forEach(function(item, index) {
            if(!__filtered__.includes(item.text)) {
                var __li__= document.createElement('li'),
                    __input__= document.createElement('input'),
                    __label__= document.createElement('label');
                __li__.setAttribute('class', '__listItem__')
                __input__.setAttribute('type', 'checkbox')
                __input__.setAttribute('class', '__checkbox__')
                __input__.setAttribute('id', `__input__${index}`)
                __label__.setAttribute('class', '__text__')
                __label__.setAttribute('for', `__input__${index}`)
                __label__.appendChild(document.createTextNode(item.text))

                if(__selectedValue__) {
                    __input__.checked = __selectedValue__.includes(item.text)
                }

                __li__.appendChild(__input__)
                __li__.appendChild(__label__)
                __ul__.appendChild(__li__)

                $(__input__).on('change', function(){
                    __whenCheckBoxIsSelected__({checked: this.checked, value: item.text, url: item.url, id: item.id})
                })

                __filtered__.push(item.text)
            }
        })
        //
        __ul__.setAttribute('class', '__listItems__')
        // Clear Element DOM
        __dropList__.innerHTML = '';
        __dropList__.appendChild(__ul__);
        __sBoard__.style.display = 'flex'
    }
    else {
        __dropList__.innerHTML = `<span class="__notFound__">No work item found</span>`;
        __sBoard__.style.display = 'flex'
    }
    //
    VSS.resize(
        document.getElementsByTagName("body").item(0).offsetWidth + 2, 
        document.getElementsByTagName("body").item(0).offsetHeight + 2
    ) 
}

/**
 * Load data from workItems
 */
function loadSelectOptions({
    __coreClient__,
    __wiqlClient__,
    __projectId__,
    __teams__,
    __workItemType__,
    __typeFilter__},
    __whenCheckBoxIsSelected__) {
    let __query__= `SELECT [System.Id] FROM WorkItems WHERE [System.WorkItemType] = '${__workItemType__}' AND [System.TeamProject] = @project`;
            
    __coreClient__.getTeams(__projectId__)
                    .then(function(teams){
                        __teams__= teams;
                        __wiqlClient__.queryByWiql({query: __query__}, __projectId__)
                                        .then(function(data) {
                                            var __Ids__= [],
                                                spinner = document.getElementById('spinner-container'),
                                                loadComplete = document.getElementById('loadComplete');

                                            data.workItems?.forEach(function(workItem, index) {
                                                var __id__= workItem['id'];
                                                if(__id__) {
                                                    __Ids__.push(__id__);
                                                }
                                            })

                                            if(__Ids__.length > 0) {
                                                __typeFilter__= __typeFilter__?.split(";").filter((i)=> i).map((i)=> i.trim())
                                                __wiqlClient__.getWorkItems(__Ids__, __typeFilter__)
                                                                .then(function(workItems) {
                                                                    workItems?.forEach(function(workItem, index) {
                                                                        let __fields__= workItem.fields
                                                                        if(__fields__) {
                                                                            let __o1__= __fields__[__typeFilter__[0]],
                                                                                __o2__= __fields__[__typeFilter__[1]]
                                                                                text= __o2__? `${__o1__} [${__o2__.split(';').filter((i)=> i).map((i)=> i.trim()).join('|')}]`:__o1__
                                                                            if(text) {
                                                                                let url = workItem.url.replace('/_apis/wit/workItems', '/_workitems/edit')
                                                                                dataLeak.push({text, url, id: workItem.id})
                                                                            }
                                                                        }                                                                                 
                                                                    }
                                                                )
                                                            }
                                                        )
                                            }

                                            spinner.style.display = 'none';   
                                            loadComplete.style.display = 'inline';

                                            $("input#filter").on("click", function(){
                                                itemListPopup(dataLeak, __whenCheckBoxIsSelected__)
                                            })
                                            
                                            $("input#filter").on("input", function(){
                                                var __= this.value,
                                                    __nd__= dataLeak.filter((item)=> item.text.toLowerCase().startsWith(__.toLowerCase()))
                                                itemListPopup(__nd__, __whenCheckBoxIsSelected__)
                                            })

                                            identifySelectedItems();

                                        })
                    });
}

/**
 * 
 * @param {*} data 
 * @param {*} service 
 * 
 * Sync data to DOM element
 */
function __syncDataToDomElement__(hiddenData) {
    var __el__= '',
        __values__= hiddenData ? hiddenData.split(";"): selectedItem||[],
        __itemList__= document.getElementById("__itemList__");
    __values__?.forEach(function(item, index) {
                    if(item)
                        __el__ += `
                                    <span style="padding:5px; font-size: 14px;">
                                        &#128073;
                                        ${item.url ? `<a href="${item.url}" rel='noopener noreferrer' target='_blank'>${item.text}</a>`:item}
                                    </span>
                                `
                })
    __itemList__.innerHTML = __el__;
    // Auto resize window
    VSS.resize(
        document.getElementsByTagName("body").item(0).offsetWidth + 2, 
        document.getElementsByTagName("body").item(0).offsetHeight + 2
    )
}

/**
 * TFS/WorkItemTracking/Services 
 */
VSS.require([
    "VSS/Service",
    "TFS/WorkItemTracking/Services", 
    "TFS/WorkItemTracking/RestClient", 
    "TFS/Core/RestClient"], 
    function (vssService, witService, restClient, coreRestClient) {
        var __workItemType__= VSS.getConfiguration().witInputs["WorkItem_Type"],
            __associatedField__ =  VSS.getConfiguration().witInputs["Associated_Field"],
            __typeFilter__= VSS.getConfiguration().witInputs["Type_Filter"],
            __wiqlClient__= vssService.getCollectionClient(restClient.WorkItemTrackingHttpClient),
            __projectId__= VSS.getWebContext().project.id,
            __coreClient__= coreRestClient.getClient(),
            __teams__= [],
            __formService__ = () => witService.WorkItemFormService.getService(),
            __filter__ = document.getElementById('filter'),
            __hiddenNote__ = document.getElementById('__hiddenNote__')
            delay = -1;

        __filter__.placeholder  = "Select " + __workItemType__

        $(document).on('focusout', function(){
            if((delay + 1) == 0)
                setTimeout(()=> {
                    var $iframe = $(this),
                        childIsFocused = $iframe.find(':focus').length > 0
                    if(!childIsFocused) {
                        var __sBoard__= document.getElementById("__sBoard__");
                        __sBoard__.style.display = 'none';
                        __filter__.value = ''
                        VSS.resize(
                            document.getElementsByTagName("body").item(0).offsetWidth +2, 
                            document.getElementsByTagName("body").item(0).offsetHeight +2
                        )  
                    }

                    delay = -1

                }, 200)
        });  

    // Register a listener for the work item page contribution
    VSS.register(
        VSS.getContribution().id, 
        function () {
            return {
                // Called when the active work item is modified
                onFieldChanged: function(args) {
                    var af = args.changedFields[__associatedField__]
                    if(af!==undefined && af!==null) {
                        __hiddenNote__.innerHTML = af;
                        identifySelectedItems()
                    }
                },
                
                // Called when a new work item is being loaded in the UI
                onLoaded: function (args) {
                    // Form Service
                    __formService__().then(function(service) {
                        getDataFromAssociatesField(
                            __associatedField__, 
                            service, 
                            function(dataAsText) {
                                __syncDataToDomElement__(dataAsText)
                                __hiddenNote__.innerHTML = dataAsText;
                                // Load work items on list
                                loadSelectOptions({
                                    __coreClient__,
                                    __wiqlClient__,
                                    __projectId__,
                                    __teams__,
                                    __workItemType__,
                                    __typeFilter__,
                                }, function({checked, value, url, id}) {
                                    var __= '',
                                        dataText = __hiddenNote__.innerHTML||'',
                                        dataText = dataText.split(';').map((e)=> e.trim()).filter((e)=> e.trim())
                                    if(checked){
                                        o = dataText.includes(value)
                                        if(!o)
                                            __=  dataText.push(value).join(';');
                                        else 
                                            __=  dataText.join(';');
                                    }
                                    else {
                                        __=  dataText.filter((val)=> (val !== value.trim())).join(';')
                                    }
                                    service.setFieldValue(__associatedField__, __)
                                })                                
                            }
                        )
                    })
                },
            }
        }
    ) 

    VSS.notifyLoadSucceeded()

})