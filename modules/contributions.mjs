import * as fs from 'fs';

function contributions(manifest, callback) {
    /**
     * 
     * @param {vss-contribution} file 
     * @returns Promise
     */
    function packContribution(dir) {
        
        return(
            new Promise(
                (resolve, reject)=> {
                    fs.readFile(
                        `src/${dir}/.contribution`, 
                        'utf8', 
                        (err, data) => {
                            if(data) resolve(data)
                        }
                    )                               
                }
            )
        )
    }

    Promise.all(manifest?.lookups?.map(packContribution)??[])
            .then((contributions)=> {
                let s = contributions.filter(cs => cs.trim().length > 0)
                                        .map((cs)=> {
                                            return (cs.startsWith('[') ? cs.trim().slice(1, -1): cs.trim())
                                        })
                manifest.contributions = JSON.parse(`[${s.join(',')}]`, null, '\t')
                callback(manifest)
            })
            
}

export default contributions;