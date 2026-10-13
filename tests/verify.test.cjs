const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const V=vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../src/verify.js'),'utf8')+';SeanimeVerify');
test('distinguishes actual challenge HTML from ordinary forbidden responses',async()=>{
 await assert.rejects(V.assertResponse({ok:false,status:403,text:()=>'<script src="/cdn-cgi/challenge-platform/x"></script>'},'nexus'),e=>e.code==='VERIFICATION_REQUIRED');
 await assert.rejects(V.assertResponse({ok:false,status:403,text:()=> 'Access denied'},'nexus'),e=>e.code==='UPSTREAM_HTTP_ERROR');
});
test('detects GraphQL verification codes in messages and extensions',()=>{
 for(const data of [{errors:[{message:'NEED_CAPTCHA'}]},{errors:[{extensions:{code:'NEED_CAPTCHA'}}]},{code:'FALLBACK_REQUIRED'}])assert.equal(V.needsVerification(data),true);
 assert.equal(V.needsVerification({errors:[{message:'episode unavailable'}]}),false);
});
test('successful JSON and HTML challenges are handled with synchronous and async responses',async()=>{
 assert.equal((await V.json({ok:true,text:()=>'{"data":[]}'},'nexus')).data.length,0);
 assert.equal((await V.json({ok:true,json:async()=>({data:{ok:true}})},'mkissa')).data.ok,true);
 await assert.rejects(V.json({ok:true,text:async()=>'<title>Just a moment</title>'},'nexus'),e=>e.code==='VERIFICATION_REQUIRED');
});
test('unknown API failures do not echo response secrets and stale signing stays retryable',()=>{
 assert.equal(V.apiError({errors:[{message:'wireSecret=secret'}]},'mkissa').message.includes('secret'),false);
 assert.equal(V.apiError({errors:[{message:'AA_CRYPTO_EXPIRED'}]},'mkissa').code,'SIGNING_STALE');
 assert.throws(()=>V.required('constructor'),/Unsupported/);
});
