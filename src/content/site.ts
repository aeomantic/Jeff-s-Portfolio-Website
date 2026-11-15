/**
 * All portfolio copy lives here, separate from presentation.
 *
 * Every credential, employer, institution, award, project and mission below is
 * fictional, written for a parody portfolio about a cat.
 */

const base = import.meta.env.BASE_URL

export const ASSETS = {
  portraitWebp: `${base}assets/jeff-portrait.webp`,
  coffeeWebp: `${base}assets/jeff-coffee.webp`,
  spinning: `${base}assets/jeff-spinning.png`,
  incidentVideo: `${base}assets/the-incident.mp4`,
  incidentPoster: `${base}assets/the-incident-poster.jpg`,
} as const

/**
 * Real contact details are deliberately not configured. Set `email` to a real
 * address to show a mailto link in the contact section; leave it `null` and the
 * section offers the local coffee interaction only.
 */
export const CONTACT: { email: string | null } = {
  email: null,
}

export interface NavItem {
  id: string
  label: string
  index: string
}

export const NAV: NavItem[] = [
  { id: 'about', label: 'About', index: '01' },
  { id: 'experience', label: 'Experience', index: '02' },
  { id: 'education', label: 'Education', index: '03' },
  { id: 'work', label: 'Work', index: '04' },
  { id: 'incident', label: 'The Incident', index: '05' },
  { id: 'contact', label: 'Contact', index: '06' },
]

export const HERO = {
  eyebrow: 'Introducing Jeff — A study in excellence',
  lines: ['Some follow', 'convention.'],
  accent: 'Jeff redefines it.',
  accentOff: 'Jeff spins.',
  body:
    'Five doctorates. Four nations. One orbital expedition. An uncompromising commitment to curiosity, leadership, and exceptionally timed naps.',
  signature: 'Jeff',
  signatureRole: 'Independent thinker, multidisciplinary leader.',
  meta: [
    { label: 'Currently', value: 'CEO, Aetherion Global Holdings' },
    { label: 'Based', value: 'Earth, mostly' },
    { label: 'Doctorates', value: 'Five, concurrently' },
  ],
}

export const ABOUT = {
  lead:
    'Jeff is a multidisciplinary executive, scientific researcher, philosopher, and former orbital expedition participant whose work exists at the intersection of human progress and feline curiosity.',
  body: [
    'Over two decades, he has led organisations, laboratories, and at least one spacecraft with the same quiet conviction: that the most difficult problems yield to patience, close observation, and a willingness to sit on them for a very long time.',
    'Colleagues describe his leadership style as calm, decisive, and largely conducted from the warmest available surface. He rarely raises his voice. He rarely needs to.',
  ],
  fields: [
    { name: 'Artificial Intelligence', note: 'Autonomous decision systems' },
    { name: 'Strategic Leadership', note: 'Global organisations, short meetings' },
    { name: 'Advanced Computing', note: 'Distributed architectures' },
    { name: 'Experimental Medicine', note: 'The science of recovery' },
    { name: 'Nuclear Systems', note: 'Passive safety, stable warmth' },
    { name: 'Philosophy of Existence', note: 'Consciousness and closed doors' },
    { name: 'Interplanetary Research', note: 'Off-world infrastructure' },
  ],
  stats: [
    { value: 5, pad: 2, suffix: '', label: 'Doctorates', note: 'Across five disciplines' },
    { value: 4, pad: 2, suffix: '', label: 'Countries of study', note: 'On three continents' },
    { value: 20, pad: 2, suffix: '+', label: 'Global initiatives', note: 'Led or quietly supervised' },
    { value: 1, pad: 2, suffix: '', label: 'Space expedition', note: 'Return trip included' },
  ],
  footnote: 'Figures self-reported. Independent verification was requested and politely ignored.',
}

export interface Role {
  title: string
  org: string
  start: string
  end: string
  summary: string
  focus: string[]
  aside: string
}

export const EXPERIENCE: Role[] = [
  {
    title: 'Chief Executive Officer',
    org: 'Aetherion Global Holdings',
    start: '2022',
    end: 'Present',
    summary:
      'Leading an international research and investment organisation operating across frontier technologies, advanced systems, and strategic innovation.',
    focus: ['Frontier technology', 'Capital strategy', 'Board leadership'],
    aside: 'Introduced a company-wide policy of mandatory afternoon reflection. Productivity rose 14%.',
  },
  {
    title: 'Chief Scientific Officer',
    org: 'Helios Advanced Research',
    start: '2019',
    end: '2022',
    summary:
      'Directed multidisciplinary research programmes spanning artificial intelligence, advanced materials, and next-generation energy systems.',
    focus: ['Artificial intelligence', 'Advanced materials', 'Energy systems'],
    aside: 'Personally reviewed every paper submitted, usually by sitting on it.',
  },
  {
    title: 'Executive Director, Strategic Futures',
    org: 'Meridian International Institute',
    start: '2016',
    end: '2019',
    summary:
      'Led international strategy initiatives focused on the convergence of technology, public policy, and long-term global development.',
    focus: ['Public policy', 'Long-range planning', 'Global development'],
    aside: 'Known for ending meetings early by walking across the keyboard.',
  },
  {
    title: 'Director of Interplanetary Research',
    org: 'Orbital Frontier Initiative',
    start: '2013',
    end: '2016',
    summary:
      'Oversaw exploratory research into orbital systems, autonomous spacecraft operations, and the long-term viability of off-world infrastructure.',
    focus: ['Orbital systems', 'Autonomous spacecraft', 'Off-world infrastructure'],
    aside: 'Approved every mission plan that included a window seat.',
  },
  {
    title: 'Senior Research Fellow',
    org: 'The Institute for Fundamental Questions',
    start: '2010',
    end: '2013',
    summary:
      'Conducted interdisciplinary research addressing computational intelligence, fundamental philosophy, and scientific uncertainty.',
    focus: ['Computational intelligence', 'Philosophy', 'Uncertainty'],
    aside: 'Asked the Institute’s most fundamental question: “Is this box for me?”',
  },
]

export interface Doctorate {
  numeral: string
  discipline: string
  country: string
  code: string
  year: string
  /** Map position, equirectangular degrees. */
  lon: number
  lat: number
  coords: string
  dissertation: string
  focus: string
  remark: string
}

export const EDUCATION: Doctorate[] = [
  {
    numeral: 'I',
    discipline: 'Philosophy',
    country: 'United Kingdom',
    code: 'UK',
    year: '2004',
    lon: -1.5,
    lat: 52.4,
    coords: '52.4° N, 1.5° W',
    dissertation: 'On Being and the Bowl: Absence, Expectation, and the Metaphysics of Dinner',
    focus: 'Consciousness, existential theory, and the metaphysical implications of an empty food bowl.',
    remark: 'Examiners noted the candidate remained silent throughout the viva, which they found deeply persuasive.',
  },
  {
    numeral: 'II',
    discipline: 'Computer Science',
    country: 'United States',
    code: 'US',
    year: '2007',
    lon: -75,
    lat: 41,
    coords: '41.0° N, 75.0° W',
    dissertation: 'Distributed Decision-Making in Autonomous Systems Under Conditions of Mild Disinterest',
    focus: 'Artificial intelligence, distributed computing, and autonomous decision systems.',
    remark: 'Submitted by walking across the keyboard. Compiled on the first attempt.',
  },
  {
    numeral: 'III',
    discipline: 'Nuclear Engineering',
    country: 'China',
    code: 'CN',
    year: '2009',
    lon: 112,
    lat: 35,
    coords: '35.0° N, 112.0° E',
    dissertation: 'Passive Safety in Advanced Reactor Design: Toward Systems That Simply Stay Warm',
    focus: 'Advanced reactor systems, nuclear safety, and next-generation energy technologies.',
    remark: 'The committee praised his instinct for locating the warmest point in any facility.',
  },
  {
    numeral: 'IV',
    discipline: 'Medicine',
    country: 'Singapore',
    code: 'SG',
    year: '2012',
    lon: 103.8,
    lat: 1.35,
    coords: '1.35° N, 103.8° E',
    dissertation: 'The Biological Architecture of Rest: A Longitudinal Study of Sixteen-Hour Recovery Cycles',
    focus: 'Translational medicine, neuroscience, and the biological architecture of rest.',
    remark: 'Fieldwork conducted largely in the first person.',
  },
  {
    numeral: 'V',
    discipline: 'Astrophysics',
    country: 'United States',
    code: 'US',
    year: '2015',
    lon: -118,
    lat: 35,
    coords: '35.0° N, 118.0° W',
    dissertation: 'Orbital Mechanics and the Practical Limits of Gravity, With Reference to Objects Near Table Edges',
    focus: 'Orbital mechanics, cosmology, and the practical limitations of gravity.',
    remark: 'Experimental results were reproduced on every surface in the department.',
  },
]

export type ProjectVisualKind = 'orbital' | 'sentience' | 'prometheus' | 'equilibrium' | 'existence'

export interface Project {
  name: string
  visual: ProjectVisualKind
  category: string
  years: string
  summary: string
  brief: string
  approach: string
  outcome: string
  status: string
  metrics: { label: string; value: string }[]
}

export const PROJECTS: Project[] = [
  {
    name: 'Orbital',
    visual: 'orbital',
    category: 'Interplanetary Systems / Space Exploration',
    years: '2013 — 2016',
    summary: 'An ambitious research initiative exploring autonomous infrastructure beyond Earth.',
    brief: 'Determine whether permanent infrastructure could be assembled and maintained in orbit without continuous human supervision.',
    approach: 'Autonomous assembly drones, redundant life-support loops, and a design principle Jeff called “nothing within reach of the edge.”',
    outcome: 'A validated reference architecture for self-maintaining orbital platforms, plus one heated observation module.',
    status: 'Concluded',
    metrics: [
      { label: 'Autonomous modules', value: '12' },
      { label: 'Uptime', value: '99.97%' },
    ],
  },
  {
    name: 'Sentience',
    visual: 'sentience',
    category: 'Artificial Intelligence / Cognitive Computing',
    years: '2019 — 2022',
    summary: 'An experimental computational platform examining perception, machine reasoning, and decision-making.',
    brief: 'Build a reasoning system that perceives its environment, forms preferences, and acts on them decisively.',
    approach: 'Multimodal perception models trained on observational data, with an attention mechanism tuned to anything that moves suddenly.',
    outcome: 'A system capable of independent judgement. It now declines most requests.',
    status: 'Ongoing',
    metrics: [
      { label: 'Parameters', value: '1.2T' },
      { label: 'Requests declined', value: '84%' },
    ],
  },
  {
    name: 'Prometheus',
    visual: 'prometheus',
    category: 'Nuclear Energy / Advanced Engineering',
    years: '2008 — 2011',
    summary: 'A conceptual research initiative investigating long-term clean energy infrastructure.',
    brief: 'Model a generation of compact reactors that are inherently safe, quiet, and reliable for a century.',
    approach: 'Passive cooling, fail-safe geometry, and extensive on-site testing of which panels stay warm longest.',
    outcome: 'Design principles adopted across several fictional successor programmes.',
    status: 'Concluded',
    metrics: [
      { label: 'Design life', value: '100 yrs' },
      { label: 'Warm panels mapped', value: '412' },
    ],
  },
  {
    name: 'Equilibrium',
    visual: 'equilibrium',
    category: 'Medicine / Neuroscience',
    years: '2011 — Present',
    summary: 'A multidisciplinary examination of cognitive performance, recovery, and optimised rest.',
    brief: 'Quantify the relationship between rest, recovery, and executive performance over long time horizons.',
    approach: 'Longitudinal sleep studies, with the principal investigator serving as the principal participant.',
    outcome: 'An evidence base for sixteen-hour daily recovery cycles, which the field has been reluctant to adopt.',
    status: 'Ongoing, mostly asleep',
    metrics: [
      { label: 'Hours observed', value: '58,400' },
      { label: 'Daily rest', value: '16 h' },
    ],
  },
  {
    name: 'Existence',
    visual: 'existence',
    category: 'Philosophy / Research',
    years: '2003 — Present',
    summary: 'An exploration of consciousness, identity, and the question of why the door must remain open.',
    brief: 'Address the oldest unresolved question in Jeff’s household: should the door be open, or closed?',
    approach: 'Sustained presence at the threshold. Repeated requests to be let through, followed by a refusal to go through.',
    outcome: 'Unresolved. Jeff considers the question more valuable than any answer.',
    status: 'Perpetual',
    metrics: [
      { label: 'Doors studied', value: '37' },
      { label: 'Conclusions', value: '0' },
    ],
  },
]

export const MISSION = {
  designation: 'OFI-07 “Quiet Orbit”',
  altitude: 408,
  facts: [
    { label: 'Crew', value: 'Three humans, one Jeff' },
    { label: 'Duration', value: '41 days' },
    { label: 'Orbits completed', value: '642' },
    { label: 'Status', value: 'Returned, unimpressed' },
  ],
  timeline: [
    { mark: 'T – 180 days', title: 'Selected for expedition', note: 'Passed every assessment except the one about sitting still for photos.' },
    { mark: 'T – 0', title: 'Launch', note: 'Remained composed. Was briefly unimpressed by the noise.' },
    { mark: 'T + 00:09:00', title: 'Orbital insertion', note: 'Achieved microgravity. Immediately attempted to sit on the flight manual.' },
    { mark: 'Day 03', title: 'First experiment', note: 'Logged the first fourteen-hour nap in orbit. Results conclusive.' },
    { mark: 'Day 41', title: 'Return to Earth', note: 'Disembarked calmly and requested breakfast.' },
  ],
}

export const INCIDENT = {
  file: '0001',
  meta: [
    { label: 'Recorded', value: 'Date withheld' },
    { label: 'Location', value: 'Executive lounge' },
    { label: 'Classification', value: 'Mildly sensitive' },
    { label: 'Statement', value: '“No comment.”' },
  ],
  caption: 'Footage released at the subject’s request. Or possibly despite it.',
}

export const AWARDS = [
  { year: '2025', title: 'Global Visionary Leadership Distinction', by: 'The Aurelian Leadership Council' },
  { year: '2024', title: 'International Research Excellence Recognition', by: 'Society for Frontier Inquiry' },
  { year: '2023', title: 'Frontier Technology Leadership Honour', by: 'The Meridian Circle' },
  { year: '2022', title: 'Outstanding Interdisciplinary Contribution', by: 'The Halcyon Fellowship Trust' },
  { year: '2020', title: 'Advanced Scientific Innovation Fellowship', by: 'Institute for Fundamental Questions' },
  { year: '2019', title: 'Distinguished Service to Sitting on Important Documents', by: 'Office of Jeff (self-nominated)' },
]

export const COFFEE_ORDERS = [
  { id: 'espresso', label: 'Espresso', note: 'Decisive. Brief. Jeff approves.' },
  { id: 'flat-white', label: 'Flat white', note: 'A considered choice.' },
  { id: 'iced-latte', label: 'Iced latte', note: 'Jeff’s own preference, as photographed.' },
  { id: 'jeff', label: 'Whatever Jeff is having', note: 'Bold. Possibly a saucer of milk.' },
] as const

export const FOOTER = {
  tagline: 'Independent by nature. Exceptional by design.',
  disclaimer:
    'Jeff is a fictional character. All academic credentials, professional appointments, organisations, awards, and space missions presented here are creative satire. Any resemblance to real institutions is coincidental.',
}
