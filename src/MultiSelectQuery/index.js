define(
    ['src/MultiSelectQuery/functions', 'src/MultiSelectQuery/queryRequest'], 
    (fns, qr)=> {
        return {
            init: function(vs, wts, wtr, crc) {
                var id = VSS.getWebContext().project.id,
                    query =  VSS.getConfiguration().witInputs["Query"],
                    cssProps = VSS.getConfiguration().witInputs["CssProps"],
                    associatedField =  VSS.getConfiguration().witInputs["AssociatedField"],
                    keyField = VSS.getConfiguration().witInputs["KeyField"],
                    JOIN = VSS.getConfiguration().witInputs["Join"],
                    client = crc.getClient(),
                    wiql = vs.getCollectionClient(wtr.WorkItemTrackingHttpClient),
                    formService = () => wts.WorkItemFormService.getService();
                    
                fns.resize()
                
                function reset() {
                    formService().then(function(s) {
                        s.getFieldValue(associatedField, true).then(function(value) {
                            fns.reset({
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
                                formService().then(function(s) {
                                    s.getFieldValue(associatedField).then(
                                        (value)=> {
                                            qr.initQueryRequest({
                                                id, 
                                                query, 
                                                client, 
                                                wiql,
                                                JOIN,
                                                keyField }, 
                                                (list)=> {
                                                    fns.onLoad({
                                                        selectedItem: value, 
                                                        list, 
                                                        saveSelectedItem: (selected)=> s.setFieldValue(associatedField, selected.map((fns)=> fns.text).join(';')),
                                                        cssProps: JSON.parse(cssProps || '{}')
                                                    })
                                                }
                                            )
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