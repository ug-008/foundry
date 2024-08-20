/**
 * TFS/WorkItemTracking/Services 
 */
VSS.require(["TFS/WorkItemTracking/Services"], function (witService) {
    var __s__,
        isReady = false,
        serviceApi = () => witService.WorkItemFormService.getService(),
        associatedField =  VSS.getConfiguration().witInputs["associatedField"],
        milliSeconds =  VSS.getConfiguration().witInputs["milliSeconds"],
        mainContainer = document.getElementById("main-container"),
        reminderStamp = document.getElementById("dateTime"),
        fromDate;

    const handleAfterLoad = ( ) => {
        var xDate
        isReady = true
        if(fromDate){
            let time,
                unit,
                time_and_unit = milliSeconds.split('-').map((e)=> e.trim()).filter((e)=> e.trim());
            if(time_and_unit.length == 2) {
                time = time_and_unit[0]
                unit = time_and_unit[1]
                switch(unit){
                    case 'day':
                        xDate = new Date(fromDate.getTime())
                        xDate.setDate(fromDate.getDate() + Number(time))
                    break;
                    case 'month':
                        xDate = new Date(fromDate.getTime())
                        xDate.setMonth(fromDate.getMonth() + parseInt(time))
                    break;
                    default:
                        xDate = new Date(Number(fromDate.getTime()) + Number(time))
                }
                reminderStamp.innerHTML = `${xDate.getMonth()+1}/${xDate.getDate() - 1}/${xDate.getFullYear()} 12:00 AM`
                mainContainer.style.display = 'flex'
            }
        }
        else mainContainer.style.display = 'none'
    }

    /**
     * Register Event Triggers
     */
    VSS.register(
        VSS.getContribution().id, 
        function () {
            return {
                onReset: function(args){
                    if(isReady){
                        console.log('onReset')
                        handleAfterLoad()
                    }
                },
                onLoaded: function(args) {
                    serviceApi().then(
                        (s)=> {
                            __s__= s
                            s.getFieldValue(associatedField).then((__date__)=> {
                                if(__date__) {
                                    fromDate = new Date(__date__)
                                    handleAfterLoad()
                                }
                                isReady = true
                            })
                        }
                    )
                },
                onFieldChanged: (args)=> {
                    if(isReady){
                        let __date__ = args["changedFields"][associatedField]
                        console.log(__date__)
                        if(__date__){
                            fromDate = new Date(__date__)
                            handleAfterLoad()
                        }
                    }
                },
                onRefreshed: (args)=> {
                    if(isReady){
                        console.log('onRefreshed')
                        handleAfterLoad()
                    }
                }
            }
        }
    ) 
    VSS.notifyLoadSucceeded()
})
