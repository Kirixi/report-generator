import { useState, useMemo } from "react";

// ── SOAPIER SECTIONS ──────────────────────────────────────────────────────────
const SECS = [
  { id:'S', label:'Subjective',    col:'#4F46E5', bg:'#EEF2FF' },
  { id:'O', label:'Objective',     col:'#0891B2', bg:'#ECFEFF' },
  { id:'A', label:'Analysis',      col:'#7C3AED', bg:'#F5F0FF' },
  { id:'P', label:'Plan',          col:'#059669', bg:'#ECFDF5' },
  { id:'I', label:'Intervention',  col:'#D97706', bg:'#FFFBEB' },
  { id:'E', label:'Evaluation',    col:'#DC2626', bg:'#FEF2F2' },
  { id:'R', label:'Review',        col:'#475569', bg:'#F8FAFC' },
];

// ── MBI DEPENDENCY LEVELS ─────────────────────────────────────────────────────
const MBI_LVLS = [
  { label:'total dependency',    range:'0–20',   min:0,   max:20  },
  { label:'severe dependency',   range:'21–40',  min:21,  max:40  },
  { label:'moderate dependency', range:'41–60',  min:41,  max:60  },
  { label:'mild dependency',     range:'61–80',  min:61,  max:80  },
  { label:'minimal dependency',  range:'81–99',  min:81,  max:99  },
  { label:'full independence',   range:'100',    min:100, max:100 },
];

// ── OBJECTIVE SENTENCE BUILDER CATEGORIES ─────────────────────────────────────
const CATS = [
  {
    id:'orientation', name:'Orientation', icon:'🧭',
    verbs:['was','presented as','appeared','demonstrated'],
    obs:[
      'oriented to person, place, and time (x3)',
      'oriented to person and place only (x2)',
      'disoriented to time',
      'disoriented to place',
      'disoriented to person',
      'fully disoriented (x3)',
      'confused and disoriented throughout',
      'required repeated reorientation cues',
    ],
    ctx:[
      'on initial assessment',
      'at the start of the session',
      'throughout the session',
      'on bedside assessment',
      'following a period of rest',
    ],
  },
  {
    id:'attention', name:'Attention', icon:'🎯',
    verbs:['demonstrated','required','presented with','exhibited','showed'],
    obs:[
      'reduced sustained attention',
      'impaired selective attention',
      'difficulty dividing attention between dual tasks',
      'difficulty alternating attention between tasks',
      'reduced attention span (< ___ minutes)',
      'distractibility to environmental stimuli',
      'inability to maintain task engagement',
      'preserved attention throughout the session',
      'fluctuating attention throughout',
      'reduced processing speed',
    ],
    ctx:[
      'during ADL task',
      'during tabletop activity',
      'during cognitive assessment',
      'in a structured environment',
      'in a distracting ward environment',
      'throughout the session',
      'during functional task performance',
      'when prompted by therapist',
    ],
  },
  {
    id:'executive', name:'Executive Function', icon:'⚙️',
    verbs:['demonstrated','required','presented with','exhibited','displayed'],
    obs:[
      'impaired task initiation',
      'difficulty with task sequencing',
      'impaired planning and organisation',
      'poor safety awareness during task',
      'reduced inhibitory control',
      'perseverative behaviour',
      'difficulty problem-solving independently',
      'disorganised approach to task',
      'omission of critical task steps',
      'intact executive function on assessment',
    ],
    ctx:[
      'during ADL task',
      'during tabletop activity',
      'during functional task performance',
      'when provided with multi-step instructions',
      'during dressing task',
      'during meal preparation task',
      'throughout the session',
    ],
  },
  {
    id:'memory', name:'Memory', icon:'💾',
    verbs:['demonstrated','required','presented with','exhibited','showed'],
    obs:[
      'impaired short-term memory',
      'reduced working memory capacity',
      'difficulty retaining verbal instructions',
      'rapid forgetting observed',
      'intact long-term memory',
      'required repetition for retention (×___)',
      'confabulation noted',
      'post-traumatic amnesia noted',
      'difficulty recalling task steps',
      'intact immediate recall on assessment',
    ],
    ctx:[
      'during ADL task',
      'during task instruction',
      'following a 5-minute delay',
      'during functional activity',
      'throughout the session',
      'when given multi-step instructions',
      'during cognitive screening',
    ],
  },
  {
    id:'communication', name:'Communication', icon:'🗣️',
    verbs:['presented with','demonstrated','showed','required','exhibited'],
    obs:[
      'expressive aphasia (non-fluent)',
      'receptive aphasia',
      'global aphasia',
      'dysarthria (mild)',
      'dysarthria (moderate)',
      'dysarthria (severe)',
      'hypophonia (reduced vocal volume)',
      'monotone speech quality',
      'reduced speech intelligibility',
      'anomia (word-finding difficulty)',
      'intact verbal communication',
      'reliable yes / no response',
      'use of gesture to supplement communication',
      'AAC / communication board required',
    ],
    ctx:[
      'throughout the session',
      'during task instruction',
      'during formal assessment',
      'when communicating needs',
      'in structured conversation',
      'when given adequate time to respond',
    ],
  },
  {
    id:'motor', name:'Motor / Tone', icon:'💪',
    verbs:['demonstrated','presented with','exhibited','showed','required'],
    obs:[
      // Stroke / TBI
      'hemiparesis (R)',
      'hemiparesis (L)',
      'hemiplegia (R)',
      'hemiplegia (L)',
      'spasticity at the wrist (R)',
      'spasticity at the wrist (L)',
      'spasticity at the elbow (R)',
      'spasticity at the elbow (L)',
      'flaccidity of the (R) upper limb',
      'flaccidity of the (L) upper limb',
      'shoulder subluxation (R)',
      'shoulder subluxation (L)',
      // Parkinson's
      'cogwheel rigidity',
      'lead-pipe rigidity',
      'bradykinesia',
      'resting tremor',
      // GBS / SCI / General
      'ascending limb weakness (GBS)',
      'proximal upper limb weakness',
      'distal upper limb weakness',
      'reduced grip strength (R)',
      'reduced grip strength (L)',
      'MMT grade ___/5 at ___',
      'full active ROM of upper limb',
      'ROM restricted at ___ joint',
      'generalised deconditioning and weakness',
      'upper limb fatigue limiting endurance',
    ],
    ctx:[
      'during upper limb assessment',
      'during ADL task',
      'at rest',
      'on initial assessment',
      'during bilateral upper limb task',
      'during functional reach activity',
      'during transfer',
    ],
  },
  {
    id:'coordination', name:'Coordination', icon:'🖐️',
    verbs:['demonstrated','presented with','exhibited','showed','required'],
    obs:[
      'impaired fine motor coordination',
      'limb ataxia',
      'truncal ataxia',
      'dysmetria on finger-nose testing',
      'dysdiadochokinesia',
      'intention tremor',
      'micrographia',
      'chorea affecting upper limb function',
      'impaired pen / pencil grip',
      'difficulty manipulating small objects',
      'reduced bilateral hand coordination',
      'intact fine motor coordination on assessment',
    ],
    ctx:[
      'during fine motor task',
      'during handwriting / pen task',
      'during ADL task',
      'during tabletop activity',
      'on formal assessment',
      'during bilateral hand task',
    ],
  },
  {
    id:'balance', name:'Balance & Transfers', icon:'⚖️',
    verbs:['demonstrated','required','presented with','showed','performed'],
    obs:[
      'intact static sitting balance',
      'impaired static sitting balance',
      'intact dynamic sitting balance',
      'impaired dynamic sitting balance',
      'intact static standing balance',
      'impaired static standing balance',
      'impaired dynamic standing balance',
      'postural instability',
      'festinating gait pattern noted',
      'freezing of gait noted',
      'falls risk identified',
      'posterior trunk sway noted',
      'lateral trunk sway noted',
      'requires upper limb support for balance',
    ],
    ctx:[
      'during sitting balance assessment',
      'during standing assessment',
      'during sit-to-stand transfer',
      'during ambulation',
      'during dynamic reaching task',
      'on formal assessment',
    ],
  },
  {
    id:'adl', name:'ADL Performance', icon:'🏠',
    verbs:['demonstrated','required','performed','completed','was observed to'],
    obs:[
      'independence with upper body dressing',
      'independence with lower body dressing',
      'minimal assistance for upper body dressing',
      'minimal assistance for lower body dressing',
      'moderate assistance for bathing / showering',
      'maximum assistance for grooming',
      'total assistance for personal hygiene',
      'supervision for sit-to-stand transfer',
      'independence with oral feeding',
      'difficulty managing fasteners (buttons / zips)',
      'use of compensatory one-handed technique',
      'adaptive equipment use during ADL',
      'verbal cueing required for grooming sequence',
      'post-op precautions observed during dressing',
      'reduced safety awareness during ADL',
    ],
    ctx:[
      'at bedside',
      'in the bathroom',
      'during morning ADL routine',
      'with verbal cueing',
      'with physical guidance',
      'using compensatory one-handed technique',
      'with adaptive equipment in use',
      'with post-op precautions in place',
      'during occupational therapy session',
    ],
  },
  {
    id:'sensory', name:'Sensory / Visual', icon:'✋',
    verbs:['demonstrated','presented with','exhibited','showed'],
    obs:[
      'light touch impaired (R upper limb)',
      'light touch impaired (L upper limb)',
      'proprioception impaired (R)',
      'proprioception impaired (L)',
      'hemispatial neglect (R)',
      'hemispatial neglect (L)',
      'hemianopia (R)',
      'hemianopia (L)',
      'diplopia reported',
      'allodynia noted',
      'tactile hypersensitivity',
      'reduced sensation throughout (R / L)',
      'intact sensation on formal assessment',
    ],
    ctx:[
      'on formal sensory assessment',
      'during ADL task',
      'during visual scanning task',
      'during functional task',
      'on initial assessment',
    ],
  },
];

// ── PHRASE BANKS (S, A, P, I, E, R) ──────────────────────────────────────────
const PHRASES = {
  S:[
    { g:'Presentation', p:[
      'Patient arrived to OT department via wheelchair',
      'Patient arrived to OT department ambulatory with walking aid',
      'Patient was assessed at bedside',
      'Patient was brought by family / caregiver',
      'Patient was alert and cooperative on arrival',
      'Patient was drowsy on initial contact',
    ]},
    { g:'Patient Report', p:[
      'Patient reported feeling fatigued',
      'Patient reported pain at ___/10',
      'Patient reported difficulty with ___',
      'Patient reported improvement in ___',
      'Patient denied pain at this time',
      'Patient was unable to provide verbal history (refer to family / notes)',
      'Patient expressed concern regarding ___',
    ]},
    { g:'Goals & Expectations', p:[
      "Patient's goal is to return home",
      "Patient's goal is to improve independence in ADL",
      "Patient's goal is to return to work / prior roles",
      "Family's expectation is that patient will ___",
      "Patient was unable to express goals verbally",
      "Patient and family goals are aligned with OT plan",
      "Goals are comfort-focused at this stage",
    ]},
    { g:'Assistive Devices & Lines Noted', p:[
      'Wheelchair noted at bedside',
      'Walking frame (FWW) noted in use',
      'AFO noted in use',
      'Communication board / AAC device seen',
      'Resting hand splint noted in use',
      'No assistive device observed',
      'IV line in situ — precautions observed',
      'Urinary catheter in situ — precautions observed',
      'NGT in situ — feeding precautions noted',
      'Oxygen supplementation in use',
    ]},
  ],
  A:[
    { g:'Functional Presentation', p:[
      'Patient presents with impaired occupational performance secondary to ___',
      'Patient presents with deficits in cognitive function affecting ADL independence',
      'Patient presents with reduced upper limb function limiting participation in ADL',
      'Patient has reduced capacity for safe independent living at this stage',
      'Patient presents with generalised deconditioning affecting functional performance',
      'Patient presents with fatigue as a primary limiting factor in ADL performance',
      'Palliative goals are guiding the approach to intervention at this stage',
    ]},
    { g:'Deficit Analysis', p:[
      'Functional limitations are attributed to ___',
      'Deficits in ___ are impacting on ADL performance',
      'Safety is a concern due to ___',
      'Patient has reduced insight into current functional limitations',
      'Patient demonstrates poor safety awareness during ADL tasks',
      'Caregiver burden is evident; family requires education and support',
      'Cognitive-communication deficits are impacting on participation in therapy',
    ]},
    { g:'Rehabilitation Potential', p:[
      'Patient demonstrates good rehabilitation potential',
      'Patient demonstrates limited rehabilitation potential at this stage',
      'Prognosis for functional recovery is guarded given ___',
      'Functional gains are expected with continued OT intervention',
      'Patient is motivated and engaged — positive prognostic indicator',
      'Rehabilitation goals are comfort-focused and palliative in nature',
      'Functional plateau may have been reached — discharge planning to be initiated',
    ]},
  ],
  P:[
    { g:'ADL Goals', p:[
      'To promote independence in ADL',
      'To improve upper body dressing independence',
      'To achieve modified independence with bathing / showering',
      'To optimise safety during transfers and functional mobility',
      'To improve self-care performance to discharge level',
      'To maximise comfort and dignity in ADL (palliative goal)',
    ]},
    { g:'Cognitive & Communication Goals', p:[
      'To improve attention and concentration during functional tasks',
      'To implement memory strategies for daily routine',
      'To improve executive function for safe and independent task completion',
      'To improve orientation and reduce confusion during ADL',
      'To improve communication strategies for daily participation',
    ]},
    { g:'Motor & Physical Goals', p:[
      'To improve upper limb strength and functional range',
      'To reduce spasticity and improve active / passive ROM',
      'To improve fine motor coordination and dexterity',
      'To improve dynamic sitting and standing balance',
      'To improve endurance for functional ADL tasks',
      'To maintain ROM and prevent contracture formation',
      'To improve postural stability and reduce falls risk',
    ]},
    { g:'Other Plans', p:[
      'To provide adaptive equipment for ADL',
      'To conduct home visit / home environment assessment',
      'To educate patient and family on safe technique and precautions',
      'To refer to physiotherapy for mobility and strength',
      'To refer to SLT for swallowing / communication assessment',
      'To refer to dietitian re: nutritional status',
      'To liaise with MDT re: discharge planning',
      'To issue pressure care education and positioning programme',
      'To review in ___ days / sessions',
    ]},
  ],
  I:[
    { g:'Upper Limb Training', p:[
      'Bilateral upper limb strengthening exercises performed',
      'Active-assisted ROM exercises to (R/L) upper limb conducted',
      'Fine motor dexterity exercises performed (peg board, therapy putty)',
      'Reaching and grasping activities practised',
      'Grip strengthening exercises performed',
      'Anti-spasticity positioning practised and reinforced',
      'Weight-bearing through affected UL for tone normalisation',
    ]},
    { g:'ADL Retraining', p:[
      'ADL retraining — upper body dressing practised',
      'ADL retraining — lower body dressing practised',
      'ADL retraining — grooming and hygiene',
      'ADL retraining — oral feeding and utensil use',
      'Compensatory one-handed dressing technique practised',
      'Transfer training — sit-to-stand performed',
      'Bathing retraining with adaptive equipment',
      'Post-op precaution education during ADL (THR / TKR / other)',
    ]},
    { g:'Cognitive & Perceptual Training', p:[
      'Attention training activities conducted (tabletop tasks)',
      'Memory strategy training provided (written cues, routine)',
      'Executive function training — sequencing and planning tasks',
      'Orientation cues provided and reinforced throughout session',
      'Errorless learning technique applied during ADL training',
      'Visual scanning activities for hemispatial neglect',
      'Communication strategy training provided',
    ]},
    { g:'Equipment, Splinting & Education', p:[
      'Resting hand splint fabricated / reviewed and adjusted',
      'Adaptive equipment trialled and issued',
      'Home programme issued and explained to patient / carer',
      'Patient and carer education provided re: ___',
      'Pressure care education and repositioning schedule discussed',
      'Environmental modification recommendations discussed and documented',
      'Splint-wearing schedule educated to patient / carer',
      'Wheelchair positioning and pressure care assessment conducted',
    ]},
  ],
  E:[
    { g:'Engagement', p:[
      'Patient was cooperative throughout the session',
      'Patient cooperated for less than half of the session',
      'Patient required frequent encouragement to engage with therapy',
      'Patient demonstrated good effort and motivation throughout',
      'Patient refused to participate in ___',
      'Patient was minimally responsive during the session',
      'Patient engaged well but required rest breaks due to fatigue',
    ]},
    { g:'Tolerance & Fatigue', p:[
      'Patient tolerated the full session well',
      'Patient demonstrated reduced endurance — rest breaks required',
      'Session was terminated early due to patient fatigue',
      'Session was terminated due to medical instability',
      'Session duration limited to ___ minutes due to reduced tolerance',
      'Patient reported increased pain / discomfort — session modified accordingly',
    ]},
    { g:'Response to Cueing', p:[
      'Patient was responsive to verbal cueing throughout',
      'Patient was non-responsive to verbal stimuli',
      'Patient required physical guidance throughout the session',
      'Patient responded to tactile cueing only',
      'Patient self-corrected errors with minimal cueing',
      'Patient required maximum verbal and physical assistance throughout',
      'Patient demonstrated carryover of strategies from previous session',
    ]},
  ],
  R:[
    { g:'Next Session', p:[
      'To review progress on next session',
      'To reassess functional status on next visit',
      'To review adaptive equipment / splint on next session',
      'To review home programme compliance at next visit',
      'To monitor progress and adjust plan accordingly',
      'To progress ADL retraining as tolerated',
    ]},
    { g:'Discharge Planning', p:[
      'Discharge to be considered when goals are achieved',
      'To liaise with MDT regarding discharge date',
      'Home visit to be arranged prior to discharge',
      'Carer training to be completed prior to discharge',
      'Discharge with home OT follow-up recommended',
      'Family / carer education to continue prior to discharge',
    ]},
    { g:'Continuation / Referral', p:[
      'Continue current OT plan',
      'Refer to community OT on discharge',
      'No further OT review indicated at this time',
      'Continue to monitor and progress as tolerated',
      'Palliative care OT goals to continue — comfort and dignity focus',
    ]},
  ],
};

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function copyText(t) {
  if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(t).catch(()=>fb(t)); } else { fb(t); }
}
function fb(t) {
  const el = Object.assign(document.createElement('textarea'),{value:t});
  Object.assign(el.style,{position:'fixed',opacity:'0'});
  document.body.appendChild(el); el.select();
  try{document.execCommand('copy');}catch(_){}
  document.body.removeChild(el);
}
function autoDetectLevel(score) {
  const n = parseInt(score);
  if (isNaN(n) || n < 0 || n > 100) return null;
  return MBI_LVLS.find(l => n >= l.min && n <= l.max)?.label ?? null;
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SOAPIERBuilder() {
  const [sec,     setSec]     = useState('O');
  const [catId,   setCatId]   = useState('mbi');
  const [sel,     setSel]     = useState({verb:null, obs:null, ctx:null});
  const [mbi,     setMbi]     = useState({score:'', level:null});
  const [notes,   setNotes]   = useState({S:[],O:[],A:[],P:[],I:[],E:[],R:[]});
  const [fl,      setFl]      = useState({});
  const [patRef,  setPatRef]  = useState('Patient');

  const secObj = SECS.find(s => s.id === sec);
  const cat    = CATS.find(c => c.id === catId);

  // Live sentence preview
  const preview = useMemo(() => {
    if (sec !== 'O' || catId === 'mbi') return '';
    const { verb, obs, ctx } = sel;
    if (!verb && !obs && !ctx) return '';
    return `${patRef} ${verb||'___'} ${obs||'___'} ${ctx||'___'}.`;
  }, [sel, patRef, sec, catId]);

  // MBI sentence preview
  const mbiPreview = useMemo(() => {
    if (!mbi.score && !mbi.level) return '';
    const score = mbi.score ? `${mbi.score}/100` : '___/100';
    const lvl   = mbi.level  ? mbi.level          : '___';
    return `MBI total score: ${score}, indicating ${lvl} in basic ADL.`;
  }, [mbi]);

  const canAdd    = !!(sel.verb && sel.obs && sel.ctx);
  const canAddMbi = !!(mbi.score && mbi.level);

  // Flash feedback helper
  const doFl = (key, msg = '✓ Copied!') => {
    setFl(f => ({...f, [key]: msg}));
    setTimeout(() => setFl(f => { const n={...f}; delete n[key]; return n; }), 1400);
  };

  // Add built sentence to O notes
  const addSentence = () => {
    if (!canAdd) return;
    setNotes(n => ({...n, O: [...n.O, preview]}));
    setSel({verb:null, obs:null, ctx:null});
  };

  // Add MBI line to O notes
  const addMbi = () => {
    if (!canAddMbi) return;
    setNotes(n => ({...n, O: [...n.O, mbiPreview]}));
    setMbi({score:'', level:null});
  };

  // Toggle phrase in non-O sections
  const togglePhrase = (phrase) => {
    setNotes(n => {
      const arr = n[sec];
      return {...n, [sec]: arr.includes(phrase) ? arr.filter(x=>x!==phrase) : [...arr, phrase]};
    });
  };

  const deleteLine = (s, i) => setNotes(n => ({...n, [s]: n[s].filter((_,j) => j !== i)}));
  const togBlock   = (type, val) => setSel(s => ({...s, [type]: s[type] === val ? null : val}));
  const copyAll    = (s) => { copyText(notes[s].join('\n')); doFl(s+'_a', '✓ Copied!'); };

  const copyFull = () => {
    const txt = SECS
      .map(s => notes[s.id].length > 0 ? `${s.id} — ${s.label}:\n${notes[s.id].join('\n')}` : null)
      .filter(Boolean).join('\n\n');
    copyText(txt);
    doFl('full', '✓ Full note copied!');
  };

  const totalLines = Object.values(notes).reduce((a, b) => a + b.length, 0);

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,-apple-system,Inter,sans-serif',fontSize:13.5,background:'#F1F5F9',overflow:'hidden'}}>

      {/* ── LEFT: SOAPIER NAV ─────────────────────────────────────────────── */}
      <div style={{width:72,background:'#0F172A',display:'flex',flexDirection:'column',alignItems:'center',padding:'10px 0 8px',gap:4,flexShrink:0}}>
        <div style={{color:'#334155',fontSize:8.5,fontWeight:800,letterSpacing:1,marginBottom:6,textTransform:'uppercase'}}>SOAP</div>
        {SECS.map(s => {
          const active = sec === s.id;
          const cnt = notes[s.id].length;
          return (
            <button key={s.id} onClick={() => setSec(s.id)} title={s.label}
              style={{width:52,height:52,borderRadius:12,border:'none',cursor:'pointer',
                background: active ? s.col : 'rgba(255,255,255,0.05)',
                color: active ? '#fff' : '#64748B',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                gap:1,position:'relative',transition:'all 0.15s'}}>
              <span style={{fontWeight:900,fontSize:22,lineHeight:1}}>{s.id}</span>
              <span style={{fontSize:7.5,opacity:0.75,letterSpacing:0.3,lineHeight:1}}>{s.label.slice(0,6).toUpperCase()}</span>
              {cnt > 0 && (
                <span style={{position:'absolute',top:-4,right:-4,
                  background: active ? '#fff' : s.col,
                  color: active ? s.col : '#fff',
                  borderRadius:10,fontSize:9,fontWeight:800,minWidth:17,height:17,
                  display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
        <div style={{flex:1}} />
        <div style={{color:'#1E3A5F',fontSize:8,textAlign:'center',fontWeight:700,lineHeight:1.6,paddingBottom:4}}>OT<br/>TOOL</div>
      </div>

      {/* ── MIDDLE: BLOCK / PHRASE SELECTOR ──────────────────────────────── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>

        {/* Section header */}
        <div style={{background:secObj.col,color:'#fff',padding:'9px 14px',flexShrink:0}}>
          <div style={{fontWeight:800,fontSize:14,letterSpacing:-0.3}}>{secObj.id} — {secObj.label}</div>
          <div style={{fontSize:11,opacity:0.85,marginTop:1}}>
            {sec === 'O'
              ? 'Start with MBI → then build sentences: select VERB · OBSERVATION · CONTEXT'
              : 'Click a phrase to add it to your note. Click again to remove.'}
          </div>
        </div>

        {/* Objective category tabs */}
        {sec === 'O' && (
          <div style={{display:'flex',gap:4,padding:'6px 10px',background:'#fff',borderBottom:'1px solid #E2E8F0',overflowX:'auto',flexShrink:0}}>
            <button onClick={() => setCatId('mbi')}
              style={{padding:'5px 11px',borderRadius:20,border:`1.5px solid ${catId==='mbi'?secObj.col:'#E2E8F0'}`,
                background:catId==='mbi'?secObj.col:'#fff',color:catId==='mbi'?'#fff':'#64748B',
                fontWeight:catId==='mbi'?700:400,fontSize:12,cursor:'pointer',whiteSpace:'nowrap',
                transition:'all 0.12s',display:'flex',alignItems:'center',gap:4}}>
              📊 MBI Score
            </button>
            {CATS.map(c => {
              const isA = catId === c.id;
              return (
                <button key={c.id} onClick={() => { setCatId(c.id); setSel({verb:null,obs:null,ctx:null}); }}
                  style={{padding:'5px 11px',borderRadius:20,
                    border:`1.5px solid ${isA?secObj.col:'#E2E8F0'}`,
                    background:isA?secObj.col:'#fff',color:isA?'#fff':'#64748B',
                    fontWeight:isA?700:400,fontSize:12,cursor:'pointer',whiteSpace:'nowrap',
                    transition:'all 0.12s',display:'flex',alignItems:'center',gap:4}}>
                  {c.icon} {c.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div style={{flex:1,overflowY:'auto',padding:'10px 12px'}}>

          {/* ── MBI QUICK-INPUT ── */}
          {sec === 'O' && catId === 'mbi' && (
            <div style={{background:'#fff',borderRadius:10,padding:'14px 16px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:800,fontSize:14,color:'#0891B2',marginBottom:12}}>📊 Modified Barthel Index</div>

              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <span style={{fontSize:12.5,fontWeight:600,color:'#374151',whiteSpace:'nowrap'}}>Total Score:</span>
                <input type="number" min="0" max="100" value={mbi.score}
                  onChange={e => {
                    const v = e.target.value;
                    const auto = autoDetectLevel(v);
                    setMbi({ score:v, level: auto || mbi.level });
                  }}
                  placeholder="0–100"
                  style={{width:80,border:'1.5px solid #E2E8F0',borderRadius:7,padding:'6px 8px',
                    fontSize:14,fontWeight:700,outline:'none',textAlign:'center',color:'#0891B2'}}
                />
                <span style={{fontSize:12.5,color:'#64748B',fontWeight:600}}> / 100</span>
                {mbi.score && <span style={{fontSize:11,color:'#0891B2',fontStyle:'italic',marginLeft:4}}>↓ level auto-detected</span>}
              </div>

              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:0.5,marginBottom:7}}>
                  Dependency Level
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {MBI_LVLS.map(l => {
                    const isSel = mbi.level === l.label;
                    return (
                      <button key={l.label}
                        onClick={() => setMbi(m => ({...m, level: isSel ? null : l.label}))}
                        style={{padding:'6px 12px',borderRadius:20,
                          border:`1.5px solid ${isSel?'#0891B2':'#D1D5DB'}`,
                          background:isSel?'#0891B2':'#fff',
                          color:isSel?'#fff':'#374151',
                          fontSize:12.5,cursor:'pointer',transition:'all 0.12s',fontWeight:isSel?700:400}}>
                        {l.label} <span style={{opacity:0.55,fontSize:10}}>({l.range})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {mbiPreview && (
                <div style={{padding:'9px 12px',borderRadius:8,background:'#ECFEFF',
                  border:'1.5px solid #67E8F9',fontSize:13,color:'#0E4F5E',lineHeight:1.55,marginBottom:10}}>
                  {mbiPreview}
                </div>
              )}

              <div style={{display:'flex',gap:6}}>
                <button onClick={addMbi} disabled={!canAddMbi}
                  style={{flex:1,padding:'8px 0',borderRadius:7,border:'none',
                    cursor:canAddMbi?'pointer':'not-allowed',
                    background:canAddMbi?'#0891B2':'#E2E8F0',
                    color:canAddMbi?'#fff':'#94A3B8',fontWeight:700,fontSize:12.5}}>
                  + Add to Note
                </button>
                <button onClick={() => { if (mbiPreview) { copyText(mbiPreview); doFl('mbi'); }}}
                  style={{padding:'8px 14px',borderRadius:7,border:'1.5px solid #0891B2',
                    cursor:'pointer',background:'#fff',color:'#0891B2',fontWeight:600,fontSize:12.5}}>
                  {fl['mbi'] || 'Copy'}
                </button>
                <button onClick={() => setMbi({score:'',level:null})}
                  style={{padding:'8px 10px',borderRadius:7,border:'1.5px solid #E2E8F0',
                    cursor:'pointer',background:'#fff',color:'#94A3B8',fontSize:12.5}}>
                  ↺
                </button>
              </div>
            </div>
          )}

          {/* ── SENTENCE BUILDER BLOCKS (O, non-MBI) ── */}
          {sec === 'O' && catId !== 'mbi' && cat && (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                {type:'verb', label:'VERB',        sub:'Choose an action word',        col:'#1D4ED8', items:cat.verbs},
                {type:'obs',  label:'OBSERVATION', sub:'What was clinically observed', col:'#0891B2', items:cat.obs},
                {type:'ctx',  label:'CONTEXT',     sub:'When / where it occurred',    col:'#D97706', items:cat.ctx},
              ].map(({type,label,sub,col,items}) => (
                <div key={type} style={{background:'#fff',borderRadius:10,padding:'10px 13px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8,flexWrap:'wrap'}}>
                    <span style={{background:col,color:'#fff',borderRadius:5,padding:'2px 9px',fontSize:11,fontWeight:800}}>{label}</span>
                    <span style={{fontSize:11,color:'#94A3B8'}}>{sub}</span>
                    {sel[type] && (
                      <span style={{marginLeft:'auto',fontSize:11,color:'#059669',fontWeight:600,
                        fontStyle:'italic',maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        ✓ {sel[type]}
                      </span>
                    )}
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                    {items.map(v => {
                      const isSel = sel[type] === v;
                      return (
                        <button key={v} onClick={() => togBlock(type, v)}
                          style={{padding:'5px 11px',borderRadius:20,cursor:'pointer',fontSize:12.5,
                            lineHeight:1.4,transition:'all 0.12s',
                            border:`1.5px solid ${isSel?col:'#D1D5DB'}`,
                            background:isSel?col:'#fff',
                            color:isSel?'#fff':'#374151',
                            fontWeight:isSel?600:400}}>
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PHRASE BANKS (S, A, P, I, E, R) ── */}
          {sec !== 'O' && PHRASES[sec] && PHRASES[sec].map(grp => (
            <div key={grp.g} style={{background:'#fff',borderRadius:10,padding:'10px 13px',marginBottom:8,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:700,fontSize:11,color:'#94A3B8',textTransform:'uppercase',letterSpacing:0.6,marginBottom:7}}>
                {grp.g}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                {grp.p.map(phrase => {
                  const inNote = notes[sec].includes(phrase);
                  return (
                    <button key={phrase} onClick={() => togglePhrase(phrase)}
                      style={{textAlign:'left',padding:'7px 11px',borderRadius:7,
                        border:`1.5px solid ${inNote?secObj.col:'#E2E8F0'}`,
                        background:inNote?secObj.bg:'#fff',
                        color:inNote?secObj.col:'#374151',
                        cursor:'pointer',fontSize:12.5,fontWeight:inNote?600:400,
                        transition:'all 0.12s',lineHeight:1.45}}>
                      {inNote && <span style={{marginRight:6}}>✓</span>}{phrase}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: LIVE PREVIEW + NOTE ACCUMULATOR ────────────────────────── */}
      <div style={{width:315,background:'#fff',borderLeft:'1px solid #E2E8F0',display:'flex',flexDirection:'column',overflow:'hidden',flexShrink:0}}>

        {/* Objective: sentence builder controls */}
        {sec === 'O' && (
          <div style={{padding:'10px 12px',borderBottom:'1px solid #EEF2F7',flexShrink:0}}>
            {/* Patient reference */}
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
              <span style={{fontSize:10,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:0.5,whiteSpace:'nowrap'}}>
                Pt. Ref
              </span>
              <input value={patRef} onChange={e => setPatRef(e.target.value)}
                style={{flex:1,border:'1px solid #E2E8F0',borderRadius:6,padding:'5px 8px',
                  fontSize:12.5,color:'#1E293B',outline:'none'}} />
            </div>

            {/* Block summary (non-MBI only) */}
            {catId !== 'mbi' && (
              <div style={{display:'flex',flexDirection:'column',gap:3,marginBottom:8}}>
                {[
                  {type:'verb', label:'VERB', col:'#1D4ED8', val:sel.verb},
                  {type:'obs',  label:'OBS',  col:'#0891B2', val:sel.obs},
                  {type:'ctx',  label:'CTX',  col:'#D97706', val:sel.ctx},
                ].map(({type,label,col,val}) => (
                  <div key={type} style={{display:'flex',alignItems:'center',gap:5,padding:'4px 8px',
                    borderRadius:6,background:val?`${col}12`:'#F8FAFC',
                    border:`1px solid ${val?col:'#E2E8F0'}`}}>
                    <span style={{fontSize:9,fontWeight:800,color:val?col:'#CBD5E1',letterSpacing:0.5,minWidth:28}}>
                      {label}
                    </span>
                    <span style={{fontSize:11.5,color:val?'#1E293B':'#CBD5E1',fontStyle:val?'normal':'italic',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>
                      {val || 'not selected'}
                    </span>
                    {val && (
                      <button onClick={() => togBlock(type, null)}
                        style={{border:'none',background:'none',cursor:'pointer',color:'#CBD5E1',
                          fontSize:16,padding:0,lineHeight:1,flexShrink:0}}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Live preview + action buttons (non-MBI) */}
            {catId !== 'mbi' && (
              <>
                <div style={{minHeight:52,padding:'8px 10px',borderRadius:8,
                  background:preview?'#F0FDF4':'#F8FAFC',
                  border:`1.5px solid ${preview?'#86EFAC':'#E2E8F0'}`,
                  fontSize:12.5,color:preview?'#166534':'#94A3B8',
                  fontStyle:preview?'normal':'italic',lineHeight:1.55,marginBottom:8}}>
                  {preview || `${patRef} ___ ___ ___ .`}
                </div>
                <div style={{display:'flex',gap:5}}>
                  <button onClick={addSentence} disabled={!canAdd}
                    style={{flex:1,padding:'7px 0',borderRadius:7,border:'none',
                      cursor:canAdd?'pointer':'not-allowed',
                      background:canAdd?secObj.col:'#E2E8F0',
                      color:canAdd?'#fff':'#94A3B8',fontWeight:700,fontSize:12.5,
                      transition:'all 0.15s'}}>
                    + Add Line
                  </button>
                  <button onClick={() => { if (preview) { copyText(preview); doFl('prv'); }}}
                    style={{padding:'7px 10px',borderRadius:7,border:`1.5px solid ${secObj.col}`,
                      cursor:'pointer',background:'#fff',color:secObj.col,fontWeight:600,fontSize:12,minWidth:52}}>
                    {fl['prv'] || 'Copy'}
                  </button>
                  <button onClick={() => setSel({verb:null,obs:null,ctx:null})}
                    style={{padding:'7px 9px',borderRadius:7,border:'1.5px solid #E2E8F0',
                      cursor:'pointer',background:'#fff',color:'#94A3B8',fontSize:14}}>
                    ↺
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Non-O header */}
        {sec !== 'O' && (
          <div style={{padding:'10px 12px',borderBottom:'1px solid #EEF2F7',flexShrink:0}}>
            <div style={{fontWeight:700,fontSize:12,color:'#64748B',textTransform:'uppercase',letterSpacing:0.4}}>
              {secObj.label} — Note Preview
            </div>
            <div style={{fontSize:11,color:'#CBD5E1',marginTop:2}}>Click phrases on the left to add or remove</div>
          </div>
        )}

        {/* Accumulated note lines */}
        <div style={{flex:1,overflowY:'auto',padding:'8px 12px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <span style={{fontSize:11,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:0.4}}>
              {sec} · {notes[sec].length} line{notes[sec].length !== 1 ? 's' : ''}
            </span>
            {notes[sec].length > 0 && (
              <button onClick={() => copyAll(sec)}
                style={{fontSize:11,fontWeight:700,color:secObj.col,border:'none',background:'none',cursor:'pointer',padding:0}}>
                {fl[sec+'_a'] || 'Copy All'}
              </button>
            )}
          </div>

          {notes[sec].length === 0 ? (
            <div style={{color:'#CBD5E1',fontSize:12,fontStyle:'italic',textAlign:'center',padding:'30px 8px',lineHeight:1.8}}>
              {sec === 'O' ? 'Build sentences above and\nadd them here ↑' : 'Click phrases on the left ←'}
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {notes[sec].map((line, i) => (
                <div key={i} style={{display:'flex',alignItems:'flex-start',gap:5,padding:'7px 9px',
                  background:secObj.bg,borderRadius:7,border:`1px solid ${secObj.col}22`}}>
                  <span style={{flex:1,fontSize:12,color:'#1E293B',lineHeight:1.6}}>{line}</span>
                  <div style={{display:'flex',gap:2,flexShrink:0,marginTop:2}}>
                    <button onClick={() => { copyText(line); doFl(`l${i}`); }}
                      style={{border:'none',background:'none',cursor:'pointer',color:'#94A3B8',fontSize:13,padding:'1px 3px'}}>
                      {fl[`l${i}`] ? <span style={{color:'#059669',fontSize:11}}>✓</span> : '⎘'}
                    </button>
                    <button onClick={() => deleteLine(sec, i)}
                      style={{border:'none',background:'none',cursor:'pointer',color:'#CBD5E1',fontSize:17,padding:'0 2px',lineHeight:1}}>
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Copy full SOAPIER note */}
        {totalLines > 0 && (
          <div style={{padding:'8px 12px',borderTop:'1px solid #EEF2F7',flexShrink:0}}>
            <button onClick={copyFull}
              style={{width:'100%',padding:'9px 0',borderRadius:8,border:'none',
                background:'#0F172A',color:'#fff',fontWeight:700,fontSize:12.5,
                cursor:'pointer',letterSpacing:0.2}}>
              {fl['full'] || '📋 Copy Full SOAPIER Note'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}