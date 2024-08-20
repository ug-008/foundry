/**
 * TFS/WorkItemTracking/Services 
 */
VSS.require(["TFS/WorkItemTracking/Services"], function (witService) {
    var __s__,
        serviceApi = () => witService.WorkItemFormService.getService(),
        associatedField =  VSS.getConfiguration().witInputs["associatedField"];

    function formatDate(dateStr) {
        try {
            const inputDate = new Date(dateStr);
            const year = inputDate.getFullYear();
            const day = String(inputDate.getDate());
            const month = String(inputDate.getMonth() + 1);
            
            const hours = String(inputDate.getHours() % 12 || 12);
            const minutes = String(inputDate.getMinutes()).padStart(2, '0');
            const am_pm = inputDate.getHours() < 12 ? 'AM' : 'PM';
        
            return `${month}/${day}/${year} ${hours}:${minutes} ${am_pm}`;
        }
        catch(ex) {
            return dateStr;
        }
    }

    /**
     * 
     * @param {Function} __fn__ - Callback fucntion
     */
    function handleLoadedEvent(o) {
        serviceApi().then(
            (s)=> {
                s.getFieldValue(associatedField, false)
                    .then((value)=> {
                            __s__ = s;
                            if(value) {
                                $('#read-only-container').show()
                                $('#read-only-content').text(formatDate(value))
                                VSS.resize(
                                    document.getElementsByTagName("body").item(0).offsetWidth + 2, 
                                    document.getElementsByTagName("body").item(0).offsetHeight + 2
                                ) 
                            }
                        }
                    )
            }
        )

    }
        
    /**
     * On-Change Function
     */
    function handleChangeEvent(o) {
        value = o['changedFields'][associatedField]
        if(value) {
            $('#read-only-container').show()
            $('#read-only-content').text(formatDate(value))
            VSS.resize(
                document.getElementsByTagName("body").item(0).offsetWidth + 2, 
                document.getElementsByTagName("body").item(0).offsetHeight + 2
            ) 
        }
    }

    /**
     * Register Event Triggers
     */
    VSS.register(
        VSS.getContribution().id, 
        function () {
            return {
                onReset: (o)=> {},
                onRefreshed: (o)=> {},
                onLoaded: (o)=> handleLoadedEvent(o),
                onFieldChanged: (o)=> handleChangeEvent(o),
            }
        }
    ) 

    VSS.notifyLoadSucceeded()

})
