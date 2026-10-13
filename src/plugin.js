function init() {
    $ui.register(ctx => {
        /* VERIFY_LIBRARY */
        const view = ctx.newWebview({slot:'screen',sidebar:{label:'Seanime Verify',icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 3 7v6c0 5 9 8 9 8s9-3 9-8V7z"/><path d="m8 12 3 3 5-6"/></svg>'},fullWidth:true,autoHeight:true});
        const rows = {mkissa:'Not checked',nexus:'Not checked'};
        let busy = false;
        const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        view.setContent(() => `<!doctype html><html><body style="margin:0;background:#0b1220"><main style="font:16px system-ui;color:#e5e7eb;max-width:800px;padding:28px"><h1>Seanime Verify</h1><p>Verification diagnostics for MKissa and Anime Nexus.</p><p>This preview detects site challenges. It does not solve CAPTCHAs or transfer browser authorization.</p>${Object.keys(rows).map(id=>`<section style="padding:16px;margin:16px 0;border:1px solid #475569;border-radius:12px"><h2>${escape(SeanimeVerify.site(id).name)}</h2><p>${escape(rows[id])}</p><p>Official site: ${escape(SeanimeVerify.site(id).url)}</p></section>`).join('')}<button id="check" ${busy?'disabled':''} style="padding:12px">${busy?'Checking…':'Check site access'}</button><p>Site access does not confirm episode playback. If verification appears, complete it on the official site and retry in Seanime. Authorization may expire or remain limited to that browser.</p><script>document.getElementById('check').onclick=()=>webview.send('check',{});</script></main></body></html>`);
        view.channel.on('check', async () => {
            if (busy) return;
            busy = true; view.update();
            try {
                for (const id of ['mkissa','nexus']) {
                    try {
                        const url = id==='mkissa' ? 'https://mkissa.to/anime' : 'https://api.anime.nexus/api/anime/shows?search=Frieren&page=1&hasVideos=1';
                        const response = await ctx.fetch(url,{timeout:15});
                        const text = response.text();
                        let data; try {data=JSON.parse(text);} catch (_) {}
                        rows[id] = SeanimeVerify.isChallenge(text) || SeanimeVerify.needsVerification(data) ? 'Site verification required' : response.ok ? 'Request succeeded; episode authorization has not been checked' : 'Request failed (HTTP '+response.status+')';
                    } catch (error) { rows[id]=String(error).includes('network access denied') ? 'Plugin permission does not allow this diagnostic request' : 'Request failed; check network or provider availability'; }
                    view.update();
                }
            } finally {busy=false;view.update();}
        });
    });
}
