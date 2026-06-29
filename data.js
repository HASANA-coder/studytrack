// ===== CHAPTERS DATA =====
const CHAPTERS = {
  Physics: [
    { id:'ph1', name:'Moving Charges & Magnetism', hours:6, importance:'high', nda:true },
    { id:'ph2', name:'Magnetism and Matter', hours:4, importance:'medium', nda:true },
    { id:'ph3', name:'Electromagnetic Induction', hours:5, importance:'high', nda:true },
    { id:'ph4', name:'Alternating Current', hours:5, importance:'high', nda:true },
    { id:'ph5', name:'Electromagnetic Waves', hours:3, importance:'medium', nda:false },
    { id:'ph6', name:'Ray Optics', hours:7, importance:'high', nda:true },
    { id:'ph7', name:'Wave Optics', hours:5, importance:'high', nda:false },
    { id:'ph8', name:'Dual Nature of Matter', hours:4, importance:'high', nda:true },
    { id:'ph9', name:'Atoms', hours:3, importance:'medium', nda:true },
    { id:'ph10', name:'Nuclei', hours:4, importance:'high', nda:true },
    { id:'ph11', name:'Semiconductor Devices', hours:6, importance:'high', nda:false },
    { id:'ph12', name:'Communication Systems', hours:3, importance:'low', nda:true },
  ],
  Chemistry: [
    { id:'ch1', name:'Solutions', hours:5, importance:'high', nda:false },
    { id:'ch2', name:'Electrochemistry', hours:6, importance:'high', nda:false },
    { id:'ch3', name:'Chemical Kinetics', hours:5, importance:'high', nda:false },
    { id:'ch4', name:'Surface Chemistry', hours:3, importance:'medium', nda:false },
    { id:'ch5', name:'General Principles of Isolation', hours:3, importance:'medium', nda:false },
    { id:'ch6', name:'p-Block Elements', hours:7, importance:'high', nda:false },
    { id:'ch7', name:'d and f Block Elements', hours:5, importance:'high', nda:false },
    { id:'ch8', name:'Coordination Compounds', hours:6, importance:'high', nda:false },
    { id:'ch9', name:'Haloalkanes & Haloarenes', hours:5, importance:'high', nda:false },
    { id:'ch10', name:'Alcohols, Phenols & Ethers', hours:5, importance:'high', nda:false },
    { id:'ch11', name:'Aldehydes, Ketones & Acids', hours:7, importance:'high', nda:false },
    { id:'ch12', name:'Amines', hours:4, importance:'medium', nda:false },
    { id:'ch13', name:'Biomolecules', hours:3, importance:'medium', nda:false },
    { id:'ch14', name:'Polymers', hours:3, importance:'low', nda:false },
    { id:'ch15', name:'Chemistry in Everyday Life', hours:2, importance:'low', nda:false },
  ],
  Maths: [
    { id:'ma1', name:'Relations & Functions', hours:4, importance:'medium', nda:true },
    { id:'ma2', name:'Inverse Trigonometric Functions', hours:4, importance:'high', nda:true },
    { id:'ma3', name:'Matrices', hours:5, importance:'high', nda:true },
    { id:'ma4', name:'Determinants', hours:5, importance:'high', nda:true },
    { id:'ma5', name:'Continuity & Differentiability', hours:7, importance:'high', nda:false },
    { id:'ma6', name:'Application of Derivatives', hours:7, importance:'high', nda:true },
    { id:'ma7', name:'Integrals', hours:9, importance:'high', nda:true },
    { id:'ma8', name:'Application of Integrals', hours:5, importance:'medium', nda:true },
    { id:'ma9', name:'Differential Equations', hours:6, importance:'high', nda:true },
    { id:'ma10', name:'Vector Algebra', hours:5, importance:'high', nda:true },
    { id:'ma11', name:'Three Dimensional Geometry', hours:6, importance:'high', nda:true },
    { id:'ma12', name:'Linear Programming', hours:3, importance:'medium', nda:false },
    { id:'ma13', name:'Probability', hours:5, importance:'high', nda:true },
  ]
};

// ===== 4-MONTH TIMETABLE (Jun 28 - Oct 28) =====
// We pre-generate a chapter assignment per weekday
// Mon-Fri: Chem 5-7am, Math 6-7pm, Physics 7-8:30pm, NDA 8:30-9pm, Revision 9-10pm
// Saturday: Chemistry full day
// Sunday: Class 11 backlogs / free

// Month 1 (Jul): Lay foundation - Physics Ch1-4, Chemistry Ch1-4, Maths Ch1-4
// Month 2 (Aug): Deep dive - Physics Ch5-8, Chemistry Ch5-9, Maths Ch5-8
// Month 3 (Sep): Advanced - Physics Ch9-12, Chemistry Ch10-12, Maths Ch9-11
// Month 4 (Oct): Revision + Completion - Ch13-15 Chem, Ch12-13 Math + Full revision

const MONTHLY_PLAN = [
  {
    month: "July",
    theme: "Foundation",
    weeks: [
      { title:"Week 1 (Jun 28–Jul 4)", items:["Physics: Moving Charges & Magnetism","Chemistry: Solutions","Maths: Relations & Functions"] },
      { title:"Week 2 (Jul 7–11)", items:["Physics: Magnetism & Matter","Chemistry: Electrochemistry","Maths: Inverse Trig Functions"] },
      { title:"Week 3 (Jul 14–18)", items:["Physics: EM Induction","Chemistry: Chemical Kinetics","Maths: Matrices"] },
      { title:"Week 4 (Jul 21–25)", items:["Physics: Alternating Current","Chemistry: Surface Chemistry","Maths: Determinants"] },
    ]
  },
  {
    month: "August",
    theme: "Deep Dive",
    weeks: [
      { title:"Week 5 (Jul 28–Aug 1)", items:["Physics: EM Waves","Chemistry: Isolation Principles","Maths: Continuity & Differentiability"] },
      { title:"Week 6 (Aug 4–8)", items:["Physics: Ray Optics (Part 1)","Chemistry: p-Block Elements (Part 1)","Maths: Continuity & Differentiability (cont.)"] },
      { title:"Week 7 (Aug 11–15)", items:["Physics: Ray Optics (Part 2)","Chemistry: p-Block Elements (Part 2)","Maths: Application of Derivatives (Part 1)"] },
      { title:"Week 8 (Aug 18–22)", items:["Physics: Wave Optics","Chemistry: d & f Block Elements","Maths: Application of Derivatives (Part 2)"] },
    ]
  },
  {
    month: "September",
    theme: "Advanced Topics",
    weeks: [
      { title:"Week 9 (Aug 25–Sep 5)", items:["Physics: Dual Nature of Matter","Chemistry: Coordination Compounds (Part 1)","Maths: Integrals (Part 1)"] },
      { title:"Week 10 (Sep 8–12)", items:["Physics: Atoms","Chemistry: Coordination Compounds (Part 2)","Maths: Integrals (Part 2)"] },
      { title:"Week 11 (Sep 15–19)", items:["Physics: Nuclei","Chemistry: Haloalkanes & Haloarenes","Maths: Application of Integrals"] },
      { title:"Week 12 (Sep 22–26)", items:["Physics: Semiconductor Devices","Chemistry: Alcohols, Phenols & Ethers","Maths: Differential Equations"] },
    ]
  },
  {
    month: "October",
    theme: "Revision & Final Push",
    weeks: [
      { title:"Week 13 (Sep 29–Oct 3)", items:["Physics: Communication Systems","Chemistry: Aldehydes & Ketones (Part 1)","Maths: Vector Algebra"] },
      { title:"Week 14 (Oct 6–10)", items:["Full Physics Revision (Ch 1-6)","Chemistry: Aldehydes & Ketones (Part 2)","Maths: 3D Geometry"] },
      { title:"Week 15 (Oct 13–17)", items:["Full Physics Revision (Ch 7-12)","Chemistry: Amines + Biomolecules","Maths: Linear Programming + Probability"] },
      { title:"Week 16 (Oct 20–28)", items:["FULL REVISION ALL SUBJECTS","Mock Tests Daily","NDA Focus: Maths + Physics"] },
    ]
  }
];

// Weekday chapter assignments (cycling for daily schedule)
const WEEKDAY_SCHEDULE = [
  // [day name, chem chapter, math chapter, phys chapter]
  ["Mon", "Solutions", "Relations & Functions", "Moving Charges & Magnetism"],
  ["Tue", "Solutions (cont.)", "Inverse Trig Functions", "Moving Charges & Magnetism (cont.)"],
  ["Wed", "Electrochemistry", "Matrices", "Magnetism and Matter"],
  ["Thu", "Electrochemistry (cont.)", "Determinants", "Electromagnetic Induction"],
  ["Fri", "Chemical Kinetics", "Continuity & Differentiability", "Alternating Current"],
  ["Mon", "Chemical Kinetics (cont.)", "Application of Derivatives", "EM Waves"],
  ["Tue", "Surface Chemistry", "Integrals (Part 1)", "Ray Optics"],
  ["Wed", "Isolation Principles", "Integrals (Part 2)", "Ray Optics (cont.)"],
  ["Thu", "p-Block Elements", "Application of Integrals", "Wave Optics"],
  ["Fri", "p-Block (cont.)", "Differential Equations", "Wave Optics (cont.)"],
  ["Mon", "d&f Block Elements", "Vector Algebra", "Dual Nature of Matter"],
  ["Tue", "Coordination Compounds", "3D Geometry", "Atoms"],
  ["Wed", "Coordination (cont.)", "Linear Programming", "Nuclei"],
  ["Thu", "Haloalkanes", "Probability", "Semiconductor Devices"],
  ["Fri", "Alcohols & Phenols", "Revision: Ch1-4", "Communication Systems"],
  ["Mon", "Aldehydes & Ketones", "Revision: Ch5-8", "Full Revision Ch1-4"],
  ["Tue", "Amines", "Revision: Ch9-13", "Full Revision Ch5-8"],
  ["Wed", "Biomolecules", "Mock Test Practice", "Full Revision Ch9-12"],
  ["Thu", "Polymers", "NDA Practice", "NDA Level Problems"],
  ["Fri", "Everyday Life", "Full Revision", "Full Revision + Mock"],
];

// ===== REVISION INTERVALS (days) =====
const REVISION_INTERVALS = [1, 3, 7, 15, 30, 60];

// ===== MOTIVATIONAL QUOTES =====
const QUOTES = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Study hard, for the well is deep and our brains are shallow.", author: "Richard Baxter" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "" },
  { text: "Great things never come from comfort zones.", author: "" },
  { text: "Dream it. Wish it. Do it.", author: "" },
  { text: "Work hard in silence, let success be your noise.", author: "Frank Ocean" },
  { text: "Consistency is what transforms average into excellence.", author: "" },
  { text: "One chapter at a time. One day at a time. You've got this.", author: "" },
];

// ===== FORMULAS =====
const FORMULAS = [
  // Physics
  { subject:'Physics', chapter:'Moving Charges', name:'Biot-Savart Law', expr:'dB = μ₀/(4π) · (I dl × r̂)/r²' },
  { subject:'Physics', chapter:'Moving Charges', name:'Ampere\'s Law', expr:'∮B·dl = μ₀I' },
  { subject:'Physics', chapter:'EM Induction', name:'Faraday\'s Law', expr:'ε = -dΦ/dt' },
  { subject:'Physics', chapter:'Alternating Current', name:'Impedance', expr:'Z = √(R² + (X_L - X_C)²)' },
  { subject:'Physics', chapter:'Alternating Current', name:'Resonant Frequency', expr:'f = 1/(2π√LC)' },
  { subject:'Physics', chapter:'Ray Optics', name:'Mirror Formula', expr:'1/f = 1/v + 1/u' },
  { subject:'Physics', chapter:'Ray Optics', name:'Snell\'s Law', expr:'n₁ sin θ₁ = n₂ sin θ₂' },
  { subject:'Physics', chapter:'Wave Optics', name:'Fringe Width', expr:'β = λD/d' },
  { subject:'Physics', chapter:'Dual Nature', name:'de Broglie', expr:'λ = h/mv = h/p' },
  { subject:'Physics', chapter:'Nuclei', name:'Radioactive Decay', expr:'N = N₀ e^(-λt)' },
  // Chemistry
  { subject:'Chemistry', chapter:'Electrochemistry', name:'Nernst Equation', expr:"E = E° - (RT/nF)lnQ" },
  { subject:'Chemistry', chapter:'Electrochemistry', name:'Faraday\'s Law', expr:'m = ZIt = (M/nF)·It' },
  { subject:'Chemistry', chapter:'Chemical Kinetics', name:'Arrhenius Equation', expr:'k = A·e^(-Ea/RT)' },
  { subject:'Chemistry', chapter:'Solutions', name:'Raoult\'s Law', expr:'P = x₁P₁° + x₂P₂°' },
  { subject:'Chemistry', chapter:'Solutions', name:'van\'t Hoff Factor', expr:'π = iMRT' },
  // Maths
  { subject:'Maths', chapter:'Integrals', name:'Integration by Parts', expr:'∫u dv = uv - ∫v du' },
  { subject:'Maths', chapter:'Determinants', name:'Cramer\'s Rule', expr:'x = Dₓ/D, y = Dᵧ/D' },
  { subject:'Maths', chapter:'Probability', name:'Bayes\' Theorem', expr:'P(A|B) = P(B|A)·P(A)/P(B)' },
  { subject:'Maths', chapter:'3D Geometry', name:'Distance Formula', expr:'d = √[(x₂-x₁)²+(y₂-y₁)²+(z₂-z₁)²]' },
  { subject:'Maths', chapter:'Vector Algebra', name:'Cross Product', expr:'|A×B| = |A||B|sinθ' },
  { subject:'Maths', chapter:'Differential Equations', name:'Separable Form', expr:'dy/dx = f(x)g(y) → ∫dy/g = ∫f dx' },
];

// NDA exam date (approximate - next NDA)
const NDA_EXAM_DATE = new Date('2025-09-14');

// ===== RUNTIME OVERRIDES (set by Admin Panel via localStorage) =====
// These will be merged in by script.js after loadState()
// NDA_EXAM_DATE and start date are also overridable
