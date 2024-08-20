define(
    ['src/Pager/events', 'src/Pager/sync-data'],
    (e, syc)=> {
        var af,
            formService,
            __s__;
        
        function resize() {
            VSS.resize(
                document.getElementsByTagName("body").item(0).offsetWidth, 
                document.getElementsByTagName("body").item(0).offsetHeight +15
            )
        }

        return {
            init: function(service) {
                formService = ()=> service.WorkItemFormService.getService()
                af =  VSS.getConfiguration().witInputs["AssociatedField"]
                
                e.addEvents({
                    cancel: ()=> {},
                    save:(data)=> syc.commit(af, __s__, data),
                    resize: ()=> resize()
                });
                
                VSS.register(
                    VSS.getContribution().id, 
                    function() {
                        return {
                            onFieldChanged: (args)=> {
                                let o = args["changedFields"][af]
                                if(o) {
                                    __s__.getFieldValue(af)
                                            .then((data)=> {
                                                if(data) {
                                                    syc.syncData(data, __s__, resize)
                                                    let __t__ = document.getElementById('__t__')
                                                    __t__.textContent = $("#links > *").length > 0 ? 'More':'Click to add resource'
                                                } 
                                            })
                                }
                            },
                            onLoaded: function (args) {
                                formService().then(
                                    (s)=> {
                                        __s__ = s;
                                        s.getFieldValue(af)
                                            .then(
                                                (data)=> {
                                                    if(data) {
                                                        syc.syncData(data, s, resize)
                                                        let __t__ = document.getElementById('__t__')
                                                        __t__.textContent = $("#links > *").length > 0 ? 'More':'Click to add resource'
                                                    } 
                                                    else resize();
                                                }
                                            )
                                    }
                                )
                            }
                        }
                        
                    }
                )
            }
        }
    }
)
  