function init() {
    $ui.register(ctx => {
        // Shared provider code, bundled at build time. No remote code execution or service.
class SeanimeVerify {
    static site(id) {
        const sites = {
            mkissa: { name: 'MKissa', url: 'https://mkissa.to/anime' },
            nexus: { name: 'Anime Nexus', url: 'https://anime.nexus/' }
        };
        if (!Object.prototype.hasOwnProperty.call(sites, id)) throw new Error('Unsupported verification provider');
        return sites[id];
    }
    static required(id) {
        const site = this.site(id);
        const error = new Error(site.name + ': site verification is required. Open ' + site.url +
            ' and complete any verification the site presents, then retry in Seanime. Browser verification may not authorize Seanime requests.');
        error.code = 'VERIFICATION_REQUIRED';
        error.provider = id;
        return error;
    }
    static isChallenge(text) {
        return typeof text === 'string' && /__CF\$cv\$params|\/cdn-cgi\/challenge-platform\/|cf-chl-|<title>\s*Just a moment/i.test(text);
    }
    static needsVerification(data) {
        const codes = ['NEED_CAPTCHA', 'TURNSTILE_REQUIRED', 'TURNSTILE_FAILED', 'FALLBACK_REQUIRED', 'ALTCHA_REQUIRED', 'VERIFICATION_REQUIRED'];
        if (!data || typeof data !== 'object') return false;
        if (codes.includes(data.code)) return true;
        return Array.isArray(data.errors) && data.errors.some(error => error &&
            (codes.includes(error.code) || codes.includes(error.extensions && error.extensions.code) ||
             (typeof error.message === 'string' && /\b(?:NEED_CAPTCHA|TURNSTILE_REQUIRED|VERIFICATION_REQUIRED)\b/.test(error.message))));
    }
    static apiError(data, id) {
        if (this.needsVerification(data)) return this.required(id);
        const site = this.site(id);
        const stale = data && Array.isArray(data.errors) && data.errors.some(error =>
            error && typeof error.message === 'string' && /\bAA_CRYPTO_(?:STALE|EXPIRED|BUILD_MISMATCH)\b/.test(error.message));
        const error = new Error(site.name + ': ' + (stale ? 'AA_CRYPTO_STALE; signing must be refreshed.' : 'upstream API rejected the request.'));
        error.code = stale ? 'SIGNING_STALE' : 'UPSTREAM_API_ERROR';
        return error;
    }
    static async assertResponse(response, id) {
        if (response.ok) return;
        let text = '';
        try { if (typeof response.text === 'function') text = await response.text(); } catch (_) {}
        let data;
        try { data = JSON.parse(text); } catch (_) {}
        if (this.isChallenge(text) || this.needsVerification(data)) throw this.required(id);
        const error = new Error(this.site(id).name + ': request failed (HTTP ' + response.status + ').');
        error.code = 'UPSTREAM_HTTP_ERROR';
        throw error;
    }
    static async json(response, id) {
        await this.assertResponse(response, id);
        let data;
        if (typeof response.text === 'function') {
            const text = await response.text();
            if (this.isChallenge(text)) throw this.required(id);
            try { data = JSON.parse(text); } catch (_) { throw new Error(this.site(id).name + ': upstream returned invalid JSON.'); }
        } else {
            try { data = await response.json(); } catch (_) { throw new Error(this.site(id).name + ': upstream returned invalid JSON.'); }
        }
        if (this.needsVerification(data)) throw this.required(id);
        return data;
    }
}

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
