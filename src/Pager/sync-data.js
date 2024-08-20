define(
    ['src/Pager/create-node'], 
    (__document__)=> {
        return {
            commit: function(assoc, s, nd) {
                if(nd)
                    s.getFieldValue(assoc)
                        .then(
                            (data)=> {
                                console.log("New ", nd)
                                var __d__,
                                    __i__=0,
                                    dataSet = {};
                                if(data) {
                                    __d__= JSON.parse(data.replace(/&quot;/g, '"'));
                                    if(Object.keys(__d__).length > 0) {   
                                        Object.entries(__d__).forEach(([key, value], index)=> {
                                            dataSet[`${index}`] = value
                                            __i__= index + 1
                                        })
                                    }
                                    dataSet[`${__i__}`] = nd
                                }
                                else{
                                    dataSet = { 0 : nd } 
                                }
                                console.log("dataSet ", dataSet)
                                s.setFieldValue(assoc, JSON.stringify(dataSet))
                            }
                        )
            },
            syncData: function(rawData, service, resize) {
                var formattedData = {};
                rawData = JSON.parse(rawData.replace(/&quot;/g, '"'))
                Object.entries(rawData)
                        .forEach(([pos, value], index)=> {
                            if(value.trim()) {
                                /**
                                 * ISSUE: RegEx does not pass text
                                 * 1. [SomeText]()
                                 * 2. [](Some Link)
                                 */
                                var __anchors__= value.match(/(\[[^\]]*\])(\([^)]*\))/ig)||[];
                                __anchors__.forEach((__a__, index)=> {
                                    var __anchorRef__,
                                        __anchorText__,
                                        __anchor__= __a__.split(/\]\(/)||[];
                                    if(__anchor__.length >= 2) {
                                        __anchorText__= __anchor__[0].trim().replace(/^\[/i, "")
                                        __anchorRef__= __anchor__[1].trim().replace(/\)$/i, "")
                                        if(__anchorText__){ 
                                            if(__anchorRef__){
                                                value = value.replace(__a__, `<a href='${__anchorRef__?.trim()}' rel='noopener noreferrer' target='_blank'>${__anchorText__?.trim()}</a>`)
                                            }
                                            else {
                                                value= value.replace(__a__, `<span id='text-highlight'>${__anchorText__?.trim()}</span>`)
                                            }
                                        }
                                        else {
                                            value = value.replace(__a__, `<a href='${__anchorRef__?.trim()}' rel='noopener noreferrer' target='_blank'>${__anchorRef__?.trim()}</a>`)
                                        }
                                    }
                                    else {
                                        console.log("Something went wrong")
                                    }
                                })
            
                                formattedData[pos] = value

                                __document__.addToDOM({
                                    pos, 
                                    data: formattedData, 
                                    clear: (index == 0), 
                                    resize,
                                    fn: function(card) {
                                        var af = VSS.getConfiguration().witInputs["AssociatedField"]
                                        $.when($(card).remove())
                                            .then(
                                                ()=> {
                                                    delete rawData[pos]
                                                    service.setFieldValue(af, JSON.stringify(rawData))
                                                    resize();
                                                }
                                            )
                                    }
                                })
                            }
                        }
                    )
                }
        }
    }
)