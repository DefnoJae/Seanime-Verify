const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const payload=fs.readFileSync(path.join(__dirname,'../plugin.js'),'utf8');
function registerInSeparateVM(ctx) {
 return {$ui:{register(fn){vm.runInNewContext('('+fn.toString()+')(ctx)',{ctx});}}};
}
test('diagnostic button performs bounded checks without launching a browser or claiming playback',async()=>{
 let content,check;const urls=[];const view={setContent(fn){content=fn;},channel:{on(event,fn){assert.equal(event,'check');check=fn;}},update(){}};
 vm.runInNewContext(payload+';init();',registerInSeparateVM({newWebview(){return view;},async fetch(url,opts){urls.push(url);assert.equal(opts.timeout,15);return {ok:false,status:403,text:()=>'<title>Just a moment</title>'};}}));
 assert.equal(urls.length,0);
 assert.match(content(),/webview\.send\('check'/);
 await check();assert.equal(urls.length,2);assert.match(content(),/Site verification required/);assert.doesNotMatch(content(),/disabled/);
 const allow=JSON.parse(fs.readFileSync(path.join(__dirname,'../Manifest.json'),'utf8')).plugin.permissions.allow.networkAccess.allowedDomains;
 // Permissions must cover the actual endpoints, including the catalogue's query parameters.
 assert.deepEqual(urls.map(url=>{const u=new URL(url);return u.origin+u.pathname;}),allow);
 assert.match(content(),/does not solve CAPTCHAs/);
});
test('network failures are sanitized and restore button usability',async()=>{
 let content,check;const view={setContent(fn){content=fn;},channel:{on(_,fn){check=fn;}},update(){}};
 vm.runInNewContext(payload+';init();',registerInSeparateVM({newWebview(){return view;},async fetch(){throw new Error('Cookie=private');}}));
 await check();assert.match(content(),/Request failed/);assert.doesNotMatch(content(),/private|disabled/);
});
