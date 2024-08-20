import * as fs from 'fs';

function versioning() {
    /**
     * 
     * @param {vss-versioning} file 
     * @returns Promise
     */
    function packVersioning() {
        return(
            new Promise(
                (resolve, reject)=> {
                    fs.readFile(
                        '.version', 
                        'utf8', 
                        (error, vn) => {
                            if(vn){
                                vn.split('.')
                                   .reverse()
                                    .some(
                                        function(n, i, arr) {
                                            n = Number(n)
                                            if(n < 9 && i==0)
                                                resolve(`${arr[2]}.0.${++n}`)
                                            else if(n < 9 && i==1)
                                                resolve(`${arr[2]}.${++n}.9`)
                                            else if(i==2)
                                                resolve(`${++n}.0.0`)
                                            else return false
                                            return true;
                                        }
                                    )
                            }
                        }
                    )                               
                }
            )
        )
    }

    return packVersioning()

}

export default versioning;