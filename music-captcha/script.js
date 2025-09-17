/* core logic: generates 3-4-нотную мелодию из Motzart K545, сравнивает ввод, играет звук, рисует ноты */

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioCtx();

/* частоты для 4 клавиш */
const NOTES = { C4:261.63, D4:293.66, E4:329.63, F4:349.23 };
const keysEl = document.querySelectorAll('#keys button');
let sequence = [];
let userInput = [];

/* simple oscillator */
function play(freq){
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = freq;
  o.type = 'sine';
  o.connect(g);
  g.connect(ctx.destination);
  g.gain.setValueAtTime(.2, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .6);
  o.start();
  o.stop(ctx.currentTime + .6);
}

function drawStaff(seq){
  const canvas = document.getElementById('staff');
  const c = canvas.getContext('2d');
  c.clearRect(0,0,canvas.width,canvas.height);
  c.strokeStyle='#adb5bd';
  c.lineWidth=1;
  /* five lines */
  for(let i=0;i<5;i++){
    c.beginPath();
    c.moveTo(0,20+i*12);
    c.lineTo(canvas.width,20+i*12);
    c.stroke();
  }
  /* notes */
  seq.forEach((note,i)=>{
    const x=20+i*60;
    const y = {C4:56,D4:50,E4:44,F4:38}[note];
    c.fillStyle='#212529';
    c.beginPath();
    c.arc(x,y,6,0,Math.PI*2);
    c.fill();
  });
}

/* random 3-4-note clip from Mozart sonata motif */
function generateSequence(){
  const motifs=[['C4','E4','G4','E4'],['C4','D4','E4'],['E4','D4','C4']];
  return motifs[Math.floor(Math.random()*motifs.length)].slice(0,4);
}

function init(){
  sequence = generateSequence();
  userInput.length=0;
  document.getElementById('verify').disabled=true;
  drawStaff(sequence);
}
init();

document.getElementById('play-seq').addEventListener('click',()=>{
  sequence.forEach((note,i)=>{
    setTimeout(()=>play(NOTES[note]),i*700);
  });
});

keysEl.forEach(btn=>{
  btn.addEventListener('click',()=>{
    const note=btn.dataset.note;
    play(NOTES[note]);
    userInput.push(note);
    if(userInput.length===sequence.length){
      document.getElementById('verify').disabled=false;
    }
  });
});

document.getElementById('verify').addEventListener('click',()=>{
  const ok = sequence.join('')===userInput.join('');
  const res = document.getElementById('result');
  res.textContent = ok ? 'Verified' : 'Try again';
  res.style.color = ok ? 'var(--accent)' : '#dc3545';
  if(!ok) init();
});
