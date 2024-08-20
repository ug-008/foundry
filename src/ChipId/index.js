/**
 * TFS/WorkItemTracking/Services 
 */
VSS.require([
    "VSS/Service",
    "TFS/WorkItemTracking/Services",
    "TFS/WorkItemTracking/RestClient"], 
    function (vssService, witService, restClient) {

    var __s__,
        id,
        projectId = VSS.getWebContext().project.id,
        serviceApi = () => witService.WorkItemFormService.getService(),
        associatedField =  VSS.getConfiguration().witInputs["associatedField"],
        workItemType = VSS.getConfiguration().witInputs["workItemType"],
        prefix = VSS.getConfiguration().witInputs["prefix"],
        wiqlClient = vssService.getCollectionClient(restClient.WorkItemTrackingHttpClient);

    /**
     * 
     * @param {Function} __fn__ - Callback fucntion
     */
    function autoGenerateId(__fn__) {
        wiqlClient.queryByWiql({
                        query: `
                            SELECT 
                                [System.Id] FROM WorkItems 
                            WHERE 
                                [System.WorkItemType] = '${workItemType}' 
                            AND 
                                [System.TeamProject] = @project`}, 
                        projectId
                    ).then(function(data) {
                        let size = data.workItems?.length;
                        __fn__((size + 1))
                    })
    }

    /**
     * 
     * @param {DomElement Value} value 
     */
    function updateDomElement(value) {
        let e = document.getElementById('autoId')
        value = String(value).split('-')
        if(value.length > 1)
            id = prefix ? prefix + '-' + value[1]: value[1]
        else if(value.length===1)
            id = prefix ? prefix + '-' + value[0]: value[0]
        e.textContent = id
        __s__.setFieldValue(associatedField, id)
    }

    /**
     * 
     * @param {Callback} __fn__ 
     */
    function getValue(__fn__) {
        serviceApi().then(
            (s)=> s.getFieldValue(associatedField).then((data)=> __fn__(data, s))
        )
    }

    /**
     * Register Event Triggers
     */
    VSS.register(
        VSS.getContribution().id, 
        function () {
            return {
                onLoaded: function(args) {
                    getValue((value, s)=> {
                        __s__ = s;
                        if(value)
                            updateDomElement(value)
                        else autoGenerateId((id)=> {
                                updateDomElement(id)
                             })
                        VSS.resize(
                            document.getElementsByTagName("body").item(0).offsetWidth, 
                            document.getElementsByTagName("body").item(0).offsetHeight
                        )
                    })
                },
                onFieldChanged: (args)=> {
                    __s__.setFieldValue(associatedField, id)
                }
            }
        }
    ) 
    
    VSS.notifyLoadSucceeded()

})
