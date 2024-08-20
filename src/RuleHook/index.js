/**
 * TFS/WorkItemTracking/Services 
 */
VSS.require(["TFS/WorkItemTracking/Services"], function (witService) {
    var __s__,
        notMemberOf,
        rFlag,
        serviceApi = () => witService.WorkItemFormService.getService(),
        associatedField =  VSS.getConfiguration().witInputs["associatedField"],
        publicState =  VSS.getConfiguration().witInputs["publicState"],
        errorMsg =  VSS.getConfiguration().witInputs["errorMessage"];

    /**
     * 
     * @param {Function} __fn__ - Callback fucntion
     */
    function checkMembership(__fn__) {
        serviceApi().then(
            (s)=> 
                s.getFields()
                    .then(
                        function(fields){
                            __s__ = s;
                            let readOnly;
                            fields.some(
                                function(field){
                                    if(field["referenceName"] === associatedField) {
                                        readOnly = field["readOnly"]
                                        return true
                                    }
                                    return false
                                }
                            )
                            __fn__(readOnly)
                        }
                    )
        )
    }

    /**
     * On-Change Function
     */
    function handleChangeEvent(args) {
        if(notMemberOf)
            __s__?.getFieldValue("System.State", false)
                    .then(function(data) {
                        if(!rFlag) {
                            if(data !== publicState)
                                __s__.setError(errorMsg ?? "Void")
                            else __s__.clearError()
                        }
                    })
        else console.log("User is a memberOf GsrcFoundry")
    }

    /**
     * Register Event Triggers
     */
    VSS.register(
        VSS.getContribution().id, 
        function () {
            return {
                onReset: function(args){
                    setTimeout(()=> __s__.clearError(), 500)
                },
                onLoaded: function(args) {
                    checkMembership(
                        function(member) {
                            notMemberOf = member
                        }
                    )
                },
                onFieldChanged: (args)=> handleChangeEvent(args),
                onRefreshed: function(args){
                    rFlag = true
                    setTimeout(()=> rFlag = false, 2000)
                }
            }
        }
    ) 
    VSS.notifyLoadSucceeded()
})
