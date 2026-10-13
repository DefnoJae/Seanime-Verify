const fs=require('node:fs'),path=require('node:path');
const root=__dirname,base='https://raw.githubusercontent.com/DefnoJae/Seanime-Verify/main/';
const payload=['src/verify.js','src/plugin.js'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n\n');
fs.writeFileSync(path.join(root,'plugin.js'),payload);
fs.writeFileSync(path.join(root,'Manifest.json'),JSON.stringify({id:'seanimeverify',name:'Seanime Verify',version:'0.1.0',author:'DefnoJae',type:'plugin',language:'javascript',lang:'en',description:'Preview: detects verification challenges for MKissa and Anime Nexus; does not solve CAPTCHAs.',manifestURI:base+'Manifest.json',readme:base+'README.md',website:'https://github.com/DefnoJae/Seanime-Verify',payload,plugin:{version:'1',permissions:{allow:{networkAccess:{allowedDomains:['https://mkissa.to/*','https://api.anime.nexus/*']}}}}},null,2)+'\n');
