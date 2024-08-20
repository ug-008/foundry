// Thanks to
// https://medium.com/swlh/dealing-with-multiple-promises-in-javascript-41d6c21f20ff

/**
 * Main function
 */
define(
    [], 
    ()=> {
        return {
            initQueryRequest: initQueryRequest
        }
    }
)
/**
 * 
 * @param {Array} Ids 
 * @param {Integer} perChunk 
 * @returns batchIds
 */
function reduceToBatchId(Ids, perChunk) {
    return Ids.reduce(
                (batchId, item, index) => { 
                    const chunkIndex = Math.floor(index/perChunk)
                    if(!batchId[chunkIndex]) {
                        batchId[chunkIndex] = [] // start a new chunk
                    }
                    batchId[chunkIndex].push(item)
                    return batchId
            }, [])
}
/**
 * 
 * @param {Integer} id 
 * @param {String} query 
 * @param {Array} queryFilter 
 * @param {Object} client 
 * @param {Object} wiql 
 */
function initQueryRequest({id, query, client, wiql, JOIN, keyField}, callback) {
    client.getTeams(id).then(
        (teams)=> {
            wiql.queryByWiql({ query }, id).then(
                function(data) {
                    var Ids = data.workItems.map((wi)=> wi['id']),
                        queryFilter = data.columns.map((col)=> col['referenceName']);
                    if(Ids.length > 0) {
                        var promises = []
                        reduceToBatchId(Ids, 100).forEach(
                            (chunkId) => {
                                promises.push(
                                    new Promise((resolve)=> {
                                        wiql.getWorkItems(chunkId, queryFilter).then(
                                            (workItems)=> {
                                                JOIN = (JOIN && (JOIN.includes(';')) ? null: JOIN)
                                                let list = workItems.map(
                                                    (workItem)=> {
                                                        let fields = workItem.fields,
                                                            url = workItem.url.replace('/_apis/wit/workItems', '/_workitems/edit'),
                                                            id = workItem.id;
                                                            text = queryFilter.map((qf)=> `${fields[qf]||''}`.replace(/;/g, ','))
                                                                              .filter((e)=> e)
                                                                              .join(JOIN||' | ')
                                                                              .trim(),
                                                            keyCol = `${fields[keyField]||""}`.trim();
                                                        return {id, keyCol, text, url}
                                                    }
                                                )
                                                resolve(list)
                                            })
                                    })
                                )
                            }
                        );
                        // # END For-Each
                        Promise.all(promises)
                                .then(
                                    (values)=> {
                                        var list = values.reduce((a, b)=> a.concat(b))
                                        callback(list)
                                    }
                                ).catch((err)=> {
                                    console.log('An api call error occured ', err)
                                })

                    }
                }
            )
        }
    )
}
