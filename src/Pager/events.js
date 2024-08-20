define(
    [], 
    ()=> {
        let active = true;
        return {
            addEvents: ({save, cancel, resize})=> {
                console.log("fine")

                $('#addText, #saveId, #cancelId').on(
                    'click',
                    function() {
                        let runOnce,
                            id = $(this).attr('id'),
                            init
                        $('#editorSpace, #addResource').toggle(
                            function() {
                                runOnce = !runOnce
                                if(runOnce) {
                                    resize()
                                    console.log(1)
                                    switch(id) {
                                        case 'saveId':
                                            console.log("active ", active)
                                            if(active) {
                                                let o = $('#rl1 :input').map(
                                                            function() {
                                                                return $(this).val()
                                                            }
                                                        ),
                                                    empty = o[0].trim().length > 0 || o[0].trim().length > 0
                                                data = empty ? `[${o[0]}](${o[1]})`: null
                                            }
                                            else data = $('#rl2 > textarea').val() ?? null
                                            data && save(data)
                                            data && clear()
                                        break;
                                        case 'cancelId':
                                            cancel?.()
                                            clear()
                                        break;
                                        case 'addText': 
                                            init = $('#quickRef, #inlineRef').data('__init__')
                                            if(!init) {
                                                $('#quickRef, #inlineRef').on(
                                                    'click', 
                                                    function() {
                                                        let runOnce,
                                                            id = $(this).attr('id')
                                                        $('#quickRef, #inlineRef').toggleClass('active')
                                                        $('#rl1, #rl2').toggle(
                                                            'fast', 
                                                            'linear', 
                                                            function() {
                                                                runOnce = !runOnce
                                                                active = $('#quickRef').hasClass('active')
                                                                if(runOnce) {
                                                                    resize()
                                                                }
                                                                
                                                            }
                                                        )
                                                    }
                                                )
                                                $('#quickRef, #inlineRef').data('__init__', 'alreadyInit')
                                            }
                                        break
                                    }
                                }
                            }
                        )
                    }
                )

                /**
                * Clear all fields
                */
                function clear() {
                    $('#rl2 > textarea').val('')
                    $('#rl1 :input').each(function(){$(this).val('')})
                }

            }
        }
    }
)