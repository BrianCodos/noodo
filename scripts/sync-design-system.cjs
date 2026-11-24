// Rebuild published foundations and inventory from the catalogue's actual sources.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../dist');
const context={document:{createElement:()=>({}),head:{appendChild(){}},addEventListener(){}}};
vm.createContext(context);
for(const name of ['typography.js','player-rules.js','content.js','player-lab.js','component-status.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context);
const data=vm.runInContext('({components:componentRows.map(([name,family,scope,states,contract,section])=>({name,family,scope,states,contract,section,implementation:implementationFor(name)})),playerSystem,typography:typographySystem,css:typographyCSS()})',context);
const file=path.join(root,'noodo-design-system-v0.3.json');const model=JSON.parse(fs.readFileSync(file,'utf8'));
model.components=data.components;model.playerSystem=data.playerSystem;model.foundations.typography=data.typography;model.foundations.breakpoints={mobile:0,desktopShell:761,wide:1500};model.exportedAt='2026-11-24';model.status='draft-audited';
if(model.semanticTokens?.effects)model.semanticTokens.effects.cardGradient={type:'none'};
fs.writeFileSync(file,JSON.stringify(model,null,2)+'\n');
const tokenFile=path.join(root,'noodo-tokens-v0.3.css');const css=fs.readFileSync(tokenFile,'utf8');fs.writeFileSync(tokenFile,data.css+css.slice(css.indexOf(':root{\n  --workspace-inset')));
console.log(`Synchronized ${data.components.length} component families and typography.`);
