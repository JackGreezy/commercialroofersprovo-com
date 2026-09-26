import fs from 'node:fs';import path from 'node:path';import {normalizePublicDocument} from './normalize-public-document.mjs';
const config=JSON.parse(fs.readFileSync('data/audited-metadata-repairs.json','utf8'));
function fix(s,route=''){
 if(typeof s!=='string'||!s.includes('<'))return s;
 if(config.headings)s=normalizePublicDocument(s,'/404');
 s=s.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi,tag=>{const href=tag.match(/\bhref=["']([^"']+)/i)?.[1];if(!href)return tag;let key=href.replace(/\/$/,'');const target=config.canonicals[key];return target?`<link rel="canonical" href="${target}">`:tag});
 const target=config.missing[route];if(target&&!/\brel=["']canonical["']/i.test(s)){
  const tag=`<link rel="canonical" href="${target}">`;
  if(/<\/head>/i.test(s))s=s.replace(/<\/head>/i,tag+'</head>');else s=tag+s;
 }
 return s;
}
function walk(d){return fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[]}
let count=0;
for(const f of ['public','rendered','data/rendered-pages','data/audit-recovered-pages'].flatMap(walk).filter(f=>f.endsWith('.html'))){const before=fs.readFileSync(f,'utf8');const route='/'+f.replace(/^(?:public\/(?:__static-pages\/|site-pages\/|rendered-pages\/|audit-recovered-pages\/)?|rendered\/pages\/|data\/rendered-pages\/|data\/audit-recovered-pages\/)/,'').replace(/\.html$/,'').replace(/__/g,'/');const after=fix(before,route);if(after!==before){fs.writeFileSync(f,after);count++}}
for(const f of ['data','pages','service-areas'].flatMap(walk).filter(f=>f.endsWith('.json')&&!/project-pages|audited-metadata-repairs/.test(f))){const raw=JSON.parse(fs.readFileSync(f,'utf8'));let touched=false;function visit(o,route=''){if(!o||typeof o!=='object')return;for(const[k,v]of Object.entries(o)){const r=o.route||o.path||(k.startsWith('/')?k:route);if(typeof v==='string'&&v.includes('<')){const n=fix(v,r);if(n!==v){o[k]=n;touched=true}}else if(v&&typeof v==='object')visit(v,r)}}visit(raw);if(touched){fs.writeFileSync(f,JSON.stringify(raw,null,2)+'\n');count++}}
console.log('Repaired audited metadata in',count,'files');
