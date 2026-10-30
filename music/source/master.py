import numpy as np, scipy.io.wavfile as wf, json, subprocess, sys
info=json.load(open('/tmp/mus/comp/info.json'))
PAD=0.5; SR=48000
def lufs(path):
    o=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',path,'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True).stderr
    I=float(o.split('Integrated loudness:')[1].split('I:')[1].split('LUFS')[0]); LRA=float(o.split('LRA:')[-1].split('LU')[0])
    TP=float(o.split('True peak:')[1].split('Peak:')[1].split('dBFS')[0]); return I,LRA,TP
def eq_circ(x):
    X=np.fft.rfft(x,axis=0); f=np.fft.rfftfreq(x.shape[0],1/SR)
    g=np.ones_like(f)
    g*= 1/np.sqrt(1+(38/np.maximum(f,1e-3))**4)                      # 2nd-order-ish high-pass 38 Hz
    g*= 10**(-1.5*np.exp(-0.5*(np.log2(np.maximum(f,1)/280)/0.7)**2)/20)   # de-mud
    g*= 10**(3.0/(1+(6000/np.maximum(f,1))**2)/20)                     # air shelf
    return np.fft.irfft(X*g[:,None],n=x.shape[0],axis=0)
def run(name, target):
    x=np.fromfile(f'/tmp/mus/{name}_raw.f32',dtype=np.float32).reshape(-1,2).astype(np.float64)
    i=info[name]; L=int(round(i['loop_s']*SR)); s0=int(round(i['lead_s']*SR))+L
    F=int(0.025*SR); seg=x[s0:s0+L].copy(); w=np.sin(np.linspace(0,np.pi/2,F))[:,None]
    seg[:F]=x[s0+L:s0+L+F]*np.cos(np.linspace(0,np.pi/2,F))[:,None]+seg[:F]*w
    loop=eq_circ(seg)
    wf.write('/tmp/mus/_t.wav',SR,np.tile(loop,(2,1)).astype(np.float32))
    I,LRA,TP=lufs('/tmp/mus/_t.wav'); g=10**((target-I)/20)
    pk=np.abs(loop).max()*g
    if pk>0.84: g*=0.84/pk
    loop*=g; P=int(PAD*SR)
    padded=np.concatenate([loop[-P:],loop,loop[:P]])
    wf.write(f'/tmp/mus/{name}_master.wav',SR,padded.astype(np.float32))
    wf.write(f'/tmp/mus/{name}_loop.wav',SR,loop.astype(np.float32))
    return dict(L=L, gain_db=20*np.log10(g), peak=float(np.abs(loop).max()))
if __name__=='__main__':
    out={nm:run(nm,t) for nm,t in (('day',-17.0),('night',-19.0))}; print(out)
