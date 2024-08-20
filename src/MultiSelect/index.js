define(
    ['src/MultiSelect/functions'],
    (e)=> {
        return {
            init: function(service) {
                var list =  VSS.getConfiguration().witInputs["List"],
                    cssProps = VSS.getConfiguration().witInputs["CssProps"],
                    associatedField =  VSS.getConfiguration().witInputs["AssociatedField"],
                    __formService__ = () => service.WorkItemFormService.getService();
                    
                function reset() {
                    __formService__().then(function(s) {
                        s.getFieldValue(associatedField, true).then(function(value) {
                            e.reset({
                                selectedItem: value
                            })
                        })        
                    })
                }

                VSS.register(
                    VSS.getContribution().id, 
                    function () {
                        return {
                            onReset: (args)=> reset(),
                            onLoaded: (args)=> {
                                __formService__().then(function(s) {
                                    s.getFieldValue(associatedField).then(
                                        (value)=> {
                                            e.onLoad({
                                                selectedItem: value, 
                                                list, 
                                                saveSelectedItem: (selected)=> s.setFieldValue(associatedField, selected.map((e)=> e.text).join(';')),
                                                cssProps: JSON.parse(cssProps)
                                            })
                                        }
                                    )        
                                })
                            },
                            onRefreshed: (args)=> reset(),
                            onFieldChanged: (args)=> {/** Todo */}
                        }
                    }
                )             
            }
        }
    }
)