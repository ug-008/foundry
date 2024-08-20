/**
 * 
 * https://marketplace.visualstudio.com/manage/publishers/${manifest.publisher}`
 * 
 */

import * as fs from 'fs';
import contributions from './modules/contributions.mjs';
import versioning from './modules/versions.mjs';
import { exec } from 'child_process';

var manifest = {
    id: "OWASP", // ODILI PETER
    publisher: "owasp-cheta",
    manifestVersion: 1,
    version: "0.0.0",
    name: "Foundry add-ons", // OWASP
    description: "Foundry tool pack",
    public: false,
    categories: [
        "Azure Boards"
    ],
    targets: [
        {
            id: "Microsoft.VisualStudio.Services"
        }
    ],
    lookups: [
        "ChipId",
        "MultiSelect",
        "MultiSelectQuery",
        "TestCases",
        "FxCalc",
        "Pager",
        "RuleHook",
        "ReadOnlyText",
        "WiGet",
        "Reminder"
    ],
    icons: {
        default: "logo.png"
    },
    scopes: [
        "vso.work",
        "vso.code_write",
        "vso.build_execute",
        "vso.code",
        "vso.build" 
    ],
    content: {
        details: {
            path: "overview.md"
        }
    },
    files: [
        {
            path: "src",
            addressable: true
        },
        {
            path: "node_modules/vss-web-extension-sdk/lib",
            addressable: true,
            packagePath: "lib"
        }
    ]
}

versioning().then(function(version) {
    manifest.version = version;
    contributions(
        manifest,
        function(manifest) {
            let vss = 'vss-extension.json'
            fs.writeFile(
                vss, 
                JSON.stringify(manifest, null, '\t'), 
                function(err) {
                    let script = 'npx tfx-cli extension create --output-path dist/' // Publish extension here
                    if(!err) {
                        let processes = exec(script, (e, o)=> {e ? console.log(e):console.log(o)})
                        processes.on(
                            'exit', 
                            (code)=> {
                                if(code === 0)
                                    fs.unlink(vss,()=> fs.writeFileSync('.version', version))
                                else fs.unlinkSync(vss)
                            }
                        )
                    }
                    else console.error(err)
                }
            )
        }
    )

})