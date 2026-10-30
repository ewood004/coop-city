import fs from 'node:fs';import {audioToWav,BasicMIDI,SoundBankLoader,SpessaSynthProcessor,SpessaSynthSequencer} from 'spessasynth_core';
const [,,mid,out]=process.argv;
const sf=fs.readFileSync('/tmp/mus/GeneralUser-GS-main/GeneralUser-GS.sf2');
const midi=BasicMIDI.fromArrayBuffer((b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))(fs.readFileSync(mid)));
const sr=48000;const synth=new SpessaSynthProcessor(sr,{eventsEnabled:false});
synth.soundBankManager.addSoundBank(SoundBankLoader.fromArrayBuffer(sf.buffer),'main');await synth.ready;
synth.setSystemParameter?.('autoAllocateVoices',true);
const seq=new SpessaSynthSequencer(synth);seq.skipToFirstNoteOn=false;seq.loadNewSongList([midi]);seq.play();
const N=Math.ceil(sr*(midi.duration+1));const L=new Float32Array(N),R=new Float32Array(N);let f=0;
while(f<N){seq.processTick();const b=Math.min(32,N-f);synth.process(L,R,f,b);f+=b;}
const I=new Float32Array(2*N);for(let i=0;i<N;i++){I[2*i]=L[i];I[2*i+1]=R[i];}fs.writeFileSync(out,Buffer.from(I.buffer));let pk=0;for(const v of I)pk=Math.max(pk,Math.abs(v));console.log('peak',pk.toFixed(3));console.log('dur',midi.duration.toFixed(2),'samples',N);
