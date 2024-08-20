VSS.require(["TFS/WorkItemTracking/Services"], function (_WorkItemServices) {

    var __s__,
        args = VSS.getConfiguration().witInputs["Args"],
        expression = VSS.getConfiguration().witInputs["Formular"],
        associatedField = VSS.getConfiguration().witInputs["AssociatedField"],
        formService = ()=> _WorkItemServices.WorkItemFormService.getService(),
        colors = VSS.getConfiguration().witInputs["Colors"];
    
    /**
     * Collect Colors
     */
    colors = colors?.split(';').filter((o)=> o.trim()).map((o)=> o.split(':'))

    /**
     * 
     * @param {Callback} __fn__ 
     */
    function __calc__(__fn__) {
        let __args__ = args.split(';').filter((arg)=> arg.trim())
        if(__args__.length > 0)
            formService().then(
                (s)=> {
                    let fields = __args__.map((arg)=> `Custom.${arg}`)
                    //
                    s.getFieldValues(fields)
                        .then(
                            (values)=> {
                                let expr = expression
                                values = __args__.map((arg)=> {
                                            let rn = values[`Custom.${arg}`]
                                            return [arg, rn ? Number(rn) : 0]
                                        })
                                values.forEach(([f, v])=> expr = expr.replace(new RegExp(f, 'gi'), v))
                                __fn__(expr ? Math.round((eval(expr) + Number.EPSILON) * 100)/100: 0)
                            },
                            (error)=> console.log(error.message)
                        )

                }
            )
    }

    function renderValue(__v__) {
        var __o__ = document.getElementById('rate-eval'),
            __c__ = document.getElementById('rate-color')
        if(__v__ > 0) {
            __o__.innerHTML = __v__
            colors?.some(
                ([n, color])=> {
                    n = n.split(',').filter((e)=> e.trim()).map((r)=> r.replace('[', '').replace(']', '').trim())
                    if(n.length===1) {
                        n = Number(__v__) === Number(n)
                        if(n){
                            __c__.style.background = `${color}`
                            return true;
                        }
                    }
                    else if(n.length > 1 && n.length <= 2) {
                        n = Number(__v__) >= Number(n[0]) && Number(__v__) <= Number(n[1])
                        if(n){
                            __c__.style.background = `${color}`
                            return true;
                        }
                    }
                }
            )
            __o__.style.color = 'var(--text-primary-color, blue)'
            __o__.style.opacity = 1
            __o__.style.fontSize = '14px'
        }
        else {
            __o__.innerHTML = `Select associated controls - ${args.split(';').join(', ')}`
            __o__.style.color = 'red'
            __o__.style.opacity = 0.8
            __o__.style.fontSize = '12px'
        }
        VSS.resize(
            document.getElementsByTagName("body").item(0).offsetWidth, 
            document.getElementsByTagName("body").item(0).offsetHeight
        )
    }

    // Register a listener for the work item page contribution
    VSS.register(VSS.getContribution().id, ()=> {

        return {
            onFieldChanged: function(args) {
                __calc__(
                    (o)=> {
                        renderValue(o)
                        __s__?.setFieldValue(associatedField, o)
                    }
                )
            },
            onLoaded: function (args) {
                formService().then(
                    (s)=> {     
                        __s__ = s;     
                        s.getFieldValue(associatedField).then(
                            (value)=> {
                                if(value) 
                                    renderValue(value)
                                else __calc__(
                                        (o)=> {
                                            renderValue(o)
                                            s.setFieldValue(associatedField, o)
                                        }
                                    )
                            },
                            (error)=> console.log(error.message)
                        )
                    }
                )
            },
        }
    })

    VSS.notifyLoadSucceeded()

})
