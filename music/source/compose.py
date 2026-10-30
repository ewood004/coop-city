# Coup City original score. Composed note-by-note for this game (no borrowed melodies).
import mido, random, sys, json
TPQ=480; BAR=TPQ*4
NOTE={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}
def n(s):  # 'F#5' -> midi
    p=NOTE[s[0]]; i=1
    while s[i] in '#b': p+= 1 if s[i]=='#' else -1; i+=1
    return p+12*(int(s[i:])+1)
CH={  # name: (channel, bankMSB, program, volume, pan, reverb, chorus)
}
class Song:
    def __init__(s, bpm, swing, bars, seed):
        s.bpm=bpm; s.swing=swing; s.bars=bars; s.ev=[]; s.rng=random.Random(seed); s.ch={}
    def inst(s, name, ch, bank, prog, vol, pan, rev, cho=0):
        s.ch[name]=dict(ch=ch,bank=bank,prog=prog,vol=vol,pan=pan,rev=rev,cho=cho)
    def t(s, bar, e8):  # e8 = eighth-note index in bar; .5 = sixteenth. Off-beat eighths are swung.
        beat=int(e8//2); off=round((e8-2*beat)*2)/2
        sw=s.swing
        o={0:0,0.5:sw*TPQ/2,1:sw*TPQ,1.5:sw*TPQ+(1-sw)*TPQ/2,2:TPQ}[off]
        return int(bar*BAR+beat*TPQ+o)
    def note(s, name, bar, e8, dur8, pitch, vel, hum=6, leg=0.92):
        c=s.ch[name]['ch']; p=n(pitch) if isinstance(pitch,str) else pitch
        a=s.t(bar,e8); b=s.t(bar,e8+dur8)
        j=s.rng.randint(-hum,hum) if hum else 0
        a=max(0,a+j); b=max(a+30,a+int((b-a)*leg)+j//2)
        v=max(1,min(127,int(vel+s.rng.randint(-6,6))))
        s.ev.append((a,1,mido.Message('note_on',channel=c,note=p,velocity=v)))
        s.ev.append((b,0,mido.Message('note_off',channel=c,note=p,velocity=0)))
    def midi(s, path, passes=3, tail_s=5):
        mf=mido.MidiFile(ticks_per_beat=TPQ); tr=mido.MidiTrack(); mf.tracks.append(tr)
        ev=[(0,-2,mido.MetaMessage('set_tempo',tempo=mido.bpm2tempo(s.bpm)))]
        for nm,c in s.ch.items():
            ch=c['ch']
            ev+= [(0,-1,mido.Message('control_change',channel=ch,control=0,value=c['bank'])),
                  (0,-1,mido.Message('control_change',channel=ch,control=32,value=0)),
                  (0,-1,mido.Message('program_change',channel=ch,program=c['prog'])),
                  (0,-1,mido.Message('control_change',channel=ch,control=7,value=c['vol'])),
                  (0,-1,mido.Message('control_change',channel=ch,control=10,value=c['pan'])),
                  (0,-1,mido.Message('control_change',channel=ch,control=91,value=c['rev'])),
                  (0,-1,mido.Message('control_change',channel=ch,control=93,value=c['cho']))]
        L=s.bars*BAR
        for k in range(passes):
            ev+= [(a+k*L+120,o,m) for a,o,m in s.ev]   # 120-tick lead-in so setup settles
        end=passes*L+120+int(tail_s*s.bpm/60*TPQ)
        ev.append((end,2,mido.Message('control_change',channel=15,control=121,value=0)))
        ev.sort(key=lambda x:(x[0],x[1])); last=0
        for a,o,m in ev: tr.append(m.copy(time=a-last)); last=a
        mf.save(path)
        return dict(bpm=s.bpm,bars=s.bars,loop_s=s.bars*4*60/s.bpm,lead_s=120/TPQ*60/s.bpm)

# ---------------- chords ----------------
CHORD={ # bass root, chord tones (voicing for uke/keys)
 'G':('G2',['G4','B4','D5']), 'D/F#':('F#2',['F#4','A4','D5']), 'Em':('E2',['E4','G4','B4']),
 'C':('C3',['E4','G4','C5']), 'A7':('A2',['E4','G4','C#5']), 'D7':('D2',['F#4','A4','C5']),
 'D':('D2',['F#4','A4','D5']), 'Bm':('B2',['F#4','B4','D5']), 'Am7':('A2',['E4','G4','C5']),
 'B7':('B2',['D#4','F#4','A4']), 'Em7':('E2',['D4','G4','B4']), 'Cmaj7':('C3',['E4','G4','B4']),
 'Gmaj7':('G2',['F#4','B4','D5']), 'D7sus':('D2',['G4','A4','C5']), 'Am7/D':('D2',['E4','G4','C5']),
}
FIFTH={'G2':'D3','F#2':'D3','E2':'B2','C3':'G2','A2':'E2','D2':'A2','B2':'F#2'}
def half(c1,c2): return [(c1,0,4),(c2,4,4)]
SEC_A =[[('G',0,8)],[('D/F#',0,8)],[('Em',0,8)],[('C',0,8)],[('G',0,8)],[('Em',0,8)],[('A7',0,8)],[('D7',0,8)]]
SEC_A2=[[('G',0,8)],[('D/F#',0,8)],[('Em',0,8)],[('C',0,8)],[('G',0,8)],[('Em',0,8)],half('Am7','D7'),[('G',0,8)]]
SEC_B =[[('C',0,8)],[('D',0,8)],[('Bm',0,8)],[('Em',0,8)],[('Am7',0,8)],[('B7',0,8)],[('Em',0,8)],[('D7',0,8)]]
# ---------------- melody (bar-relative: pitch, start8, dur8) ----------------
HOOK1=[('B4',0,1),('D5',1,1),('G5',2,2),('G5',4,1),('A5',5,1),('B5',6,2)]
HOOK2=[('A5',0,3),('G5',3,1),('F#5',4,2),('D5',6,2)]
HOOK3=[('E5',0,1),('G5',1,1),('B5',2,2),('B5',4,1),('C6',5,1),('B5',6,1),('A5',7,1)]
HOOK4=[('G5',0,4),('E5',4,2)]
MEL_A=[HOOK1,HOOK2,HOOK3,HOOK4,HOOK1,
       [('D6',0,2),('B5',2,1),('G5',3,1),('E5',4,2),('G5',6,2)],
       [('A5',0,1),('B5',1,1),('C#6',2,2),('B5',4,1),('A5',5,1),('G5',6,2)],
       [('F#5',0,4),('A5',4,1),('G5',5,1),('F#5',6,1),('E5',7,1)]]
MEL_A2=MEL_A[:5]+[[('D6',0,2),('B5',2,1),('G5',3,1),('E5',4,2),('G5',6,2)],
       [('C6',0,2),('B5',2,1),('A5',3,1),('F#5',4,2),('A5',6,2)],
       [('G5',0,6)]]
MEL_B=[[('E5',0,2),('G5',2,2),('C6',4,3),('B5',7,1)],
       [('A5',0,2),('F#5',2,2),('D5',4,4)],
       [('D5',0,2),('F#5',2,2),('B5',4,3),('A5',7,1)],
       [('G5',0,2),('E5',2,2),('B4',4,4)],
       [('C5',0,1),('E5',1,1),('A5',2,2),('G5',4,1),('A5',5,1),('C6',6,2)],
       [('B5',0,2),('A5',2,1),('F#5',3,1),('D#5',4,4)],
       [('E5',0,1),('F#5',1,1),('G5',2,1),('A5',3,1),('B5',4,2),('E6',6,2)],
       [('D6',0,3),('C6',3,1),('A5',4,2),('F#5',6,1),('A5',7,1)]]

def strum(S, name, bar, e8, dur8, notes, vel, up=False, spread=14):
    seq=list(reversed(notes)) if up else notes
    for i,p in enumerate(seq):
        a=S.t(bar,e8)+i*spread; b=S.t(bar,e8+dur8)
        c=S.ch[name]['ch']; v=max(1,min(127,int(vel-(i*2 if up else 0)+S.rng.randint(-5,5))))
        S.ev.append((a,1,mido.Message('note_on',channel=c,note=n(p),velocity=v)))
        S.ev.append((max(a+40,b-20),0,mido.Message('note_off',channel=c,note=n(p),velocity=0)))

def place(S, name, bar0, mel, vel, shift=0, leg=0.9, accent=True):
    for i,barm in enumerate(mel):
        for p,a,d in barm:
            v=vel+(8 if accent and a in (0,4) else 0)
            S.note(name, bar0+i, a, d, n(p)+shift, v, leg=leg)

def chords_of(sec): return sec

def day():
    S=Song(bpm=108, swing=0.62, bars=32, seed=7)
    S.inst('flute',0,0,73,92,70,58,8); S.inst('uke',1,8,24,100,44,40,10); S.inst('bass',2,0,32,80,64,28)
    S.inst('glock',3,0,9,127,86,64); S.inst('pizz',4,0,45,127,38,50); S.inst('marimba',5,0,12,127,58,52)
    S.inst('banjo',6,0,105,110,92,42); S.inst('pad',7,0,49,84,64,72); S.inst('whistle',8,24,75,76,70,60)
    S.inst('drums',9,0,40,84,64,34)
    secs=[('A',SEC_A,MEL_A),('A2',SEC_A2,MEL_A2),('B',SEC_B,MEL_B),('A3',SEC_A,MEL_A)]
    for si,(nm,ch,mel) in enumerate(secs):
        b0=si*8
        # ---- lead
        if nm=='A': place(S,'flute',b0,mel,78)
        if nm=='A2':
            place(S,'flute',b0,mel,78)
            for k in (0,4): place(S,'glock',b0+k,[mel[k]],52,shift=12,leg=0.5)
        if nm=='B':
            place(S,'marimba',b0,mel,96,shift=0,leg=1.0)
            place(S,'flute',b0,mel,50,shift=-12)   # soft unison below in 2nd half
        if nm=='A3':
            place(S,'flute',b0,mel,80)
            place(S,'whistle',b0,mel,70,shift=12)
            for k in (0,2,4): place(S,'glock',b0+k,[mel[k]],46,shift=12,leg=0.5)
        # ---- call & response fills on the long notes (bars 4 and 8 of each 8)
        if nm in('A','A2','A3'):
            S.note('glock',b0+3,4,1,'C6',58); S.note('glock',b0+3,5,1,'E6',54); S.note('glock',b0+3,6,2,'G6',60)
            if nm!='A2':
                S.note('pizz',b0+7,4,1,'A5',70); S.note('pizz',b0+7,5,1,'B5',66); S.note('pizz',b0+7,6,1,'C6',70); S.note('pizz',b0+7,7,1,'D6',74)
        if nm=='B':
            for bb,fig in ((1,[('A5',6,1),('B5',7,1)]),(3,[('E5',6,1),('F#5',7,1)]),(5,[('B5',6,1),('C6',7,1)])):
                for p,a,d in fig: S.note('pizz',b0+bb,a,d,p,72)
        # ---- harmony / rhythm section
        for bi,barch in enumerate(ch):
            bar=b0+bi
            for cname,a0,ln in barch:
                root,tones=CHORD[cname]
                # ukulele island strum D . D U . U D U  (within this chord's span)
                if nm!='B' or True:
                    pat=[(0,0),(2,0),(3,1),(5,1),(6,0),(7,1)] if nm!='B' else [(0,0),(3,1),(4,0),(7,1)]
                    for e,up in pat:
                        if a0<=e<a0+ln:
                            strum(S,'uke',bar,e,1,tones,(66 if not up else 52)+(6 if e==0 else 0),up=bool(up))
                # bass
                r=n(root); f=n(FIFTH[root])
                if nm=='B':
                    walk=[r, r+7 if r+7<n('A3') else r-5, r+12 if r+12<=n('E3') else r, None]
                    for q in range(4):
                        if a0<=2*q<a0+ln:
                            p = walk[q] if walk[q] is not None else r+ (2 if q==3 else 0)
                            S.note('bass',bar,2*q,2,p,92 if q==0 else 80,leg=0.85)
                else:
                    if ln==8:
                        S.note('bass',bar,0,3,r,96,leg=0.8); S.note('bass',bar,4,2,f,84,leg=0.8)
                        if bi%2==1: S.note('bass',bar,7,1,f+2 if f+2<n('A3') else r-1,70,leg=0.7)
                    else:
                        S.note('bass',bar,a0,3,r,92,leg=0.8)
                # pizz off-beat 'pah' in A2/A3 (upper chord tones on beats 2 & 4)
                if nm in ('A2','A3'):
                    for e in (2,6):
                        if a0<=e<a0+ln and not (bi==7 and e==6):
                            for p in tones[1:]: S.note('pizz',bar,e,1,n(p)+12 if nm=='A3' else n(p),48,hum=3)
                # banjo rolls in B and A3
                if nm in ('B','A3'):
                    roll=[tones[0],tones[1],tones[2],tones[1]]
                    for e in range(8):
                        if a0<=e<a0+ln:
                            S.note('banjo',bar,e,1,n(roll[e%4])+12,46+(8 if e%2==0 else 0),hum=4,leg=1.4)
                if nm=='B':
                    for p in tones: S.note('pad',bar,a0,ln,p,36,hum=0,leg=1.0)
            # ---- brushes
            dv={'A':0.75,'A2':0.9,'B':0.95,'A3':1.0}[nm]
            S.note('drums',bar,0,1,36,int(70*dv),hum=3); S.note('drums',bar,4,1,36,int(60*dv),hum=3)
            for e in (2,6): S.note('drums',bar,e,1,38,int(64*dv),hum=4)
            if nm!='A' or bi>=4:
                for e in range(8): S.note('drums',bar,e,1,51,int((52 if e%2==0 else 38)*dv),hum=3)
            else:
                for e in range(8): S.note('drums',bar,e,1,42,int((44 if e%2==0 else 30)*dv),hum=3)
            if nm in ('A2','A3'):
                for e in (2,6): S.note('drums',bar,e,1,44,int(40*dv),hum=3)
            if nm=='B' and bi in (0,4): S.note('drums',bar,0,8,40,40,hum=0)
            if bi==7:  # turnaround fill
                for e in (6,6.5,7,7.5): S.note('drums',bar,e,0.5,38,int((40+e*4)*dv),hum=2)
    return S

def night():
    S=Song(bpm=78, swing=0.56, bars=24, seed=11)
    S.inst('celesta',0,0,8,110,72,70); S.inst('ep',1,0,4,78,52,64,30); S.inst('bass',2,0,32,76,64,40)
    S.inst('harp',3,0,46,66,84,70); S.inst('flute',4,0,73,72,56,80,10); S.inst('pad',5,0,49,54,64,80)
    S.inst('vib',6,0,11,92,40,72); S.inst('drums',9,0,40,96,64,50)
    NA=[[('Gmaj7',0,8)],[('D/F#',0,8)],[('Em7',0,8)],[('Cmaj7',0,8)],[('Gmaj7',0,8)],[('Em7',0,8)],[('Am7',0,8)],half('D7sus','D7')]
    NB=[[('Cmaj7',0,8)],[('D',0,8)],[('Bm',0,8)],[('Em7',0,8)],[('Am7',0,8)],[('B7',0,8)],[('Em7',0,8)],[('Am7/D',0,8)]]
    # night melody: the day hook, slowed and simplified (leitmotif), gentler endings
    MA=[HOOK1,HOOK2,HOOK3,[('G5',0,6)],HOOK1,
        [('D6',0,2),('B5',2,1),('G5',3,1),('E5',4,4)],
        [('C6',0,2),('B5',2,1),('A5',3,1),('E5',4,4)],
        [('F#5',0,6)]]
    MB=[[('E5',0,2),('G5',2,2),('B5',4,4)],[('A5',0,4),('F#5',4,4)],[('D5',0,2),('F#5',2,2),('B5',4,4)],[('G5',0,8)],
        [('C5',0,2),('E5',2,2),('A5',4,4)],[('B5',0,4),('D#5',4,4)],[('E5',0,2),('G5',2,2),('B5',4,2),('A5',6,2)],[('G5',0,4),('F#5',4,2),('A5',6,2)]]
    secs=[('A',NA,MA),('B',NB,MB),('A3',NA,MA)]
    for si,(nm,ch,mel) in enumerate(secs):
        b0=si*8
        if nm=='A': place(S,'celesta',b0,mel,70,shift=0,leg=1.0)
        if nm=='B': place(S,'flute',b0,mel,64,shift=-12,leg=0.95)
        if nm=='A3':
            place(S,'vib',b0,mel,62,leg=1.0); place(S,'celesta',b0,mel,46,shift=12,leg=1.0)
        for bi,barch in enumerate(ch):
            bar=b0+bi
            for cname,a0,ln in barch:
                root,tones=CHORD[cname]
                # EP: soft chord on 1, re-voiced on the 'and' of 3 (lilting)
                for p in tones: S.note('ep',bar,a0,min(ln,5),n(p),46,hum=8,leg=1.0)
                if ln==8:
                    for p in tones[1:]: S.note('ep',bar,5,3,n(p),34,hum=8,leg=1.0)
                S.note('bass',bar,a0,min(ln,6),root,78,leg=0.95)
                if ln==8: S.note('bass',bar,6,2,FIFTH[root],60,leg=0.9)
                # harp arpeggio (eighths) except under celesta lead's busiest bars in A
                arp=[n(root)+12,n(tones[0]),n(tones[1]),n(tones[2]),n(tones[2])+5 if False else n(tones[0])+12,n(tones[2]),n(tones[1]),n(tones[0])]
                if nm!='A' or bi%2==1:
                    for e in range(8):
                        if a0<=e<a0+ln: S.note('harp',bar,e,1,arp[e],50 if e%2==0 else 40,hum=5,leg=2.0)
                for p in tones: S.note('pad',bar,a0,ln,p,40 if nm!='A' else 32,hum=0,leg=1.0)
            if nm=='A3':
                for e in (2,6): S.note('drums',bar,e,1,38,44,hum=4)
                for e in range(0,8,2): S.note('drums',bar,e,1,51,36,hum=4)
    return S

if __name__=='__main__':
    info={}
    for nm,fn in (('day',day),('night',night)):
        S=fn(); info[nm]=S.midi(f'/tmp/mus/comp/{nm}.mid'); info[nm]['notes']=len(S.ev)//2
    json.dump(info,open('/tmp/mus/comp/info.json','w'),indent=1); print(info)
