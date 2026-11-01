// Set these in .env, or edit the project repository URLs below.
export const profile = {
 email: import.meta.env.VITE_CONTACT_EMAIL || 'divyu931@gmail.com',
 whatsapp: '918937096797',
 linkedin: import.meta.env.VITE_LINKEDIN_URL || 'https://www.linkedin.com/in/divyansh-aggarwal-88850a355',
 github: import.meta.env.VITE_GITHUB_URL || 'https://github.com/divyu931-eng',
 resume: import.meta.env.VITE_RESUME_URL || ''
};
export const projects = [
 {id:'01', name:'TrustGuard AI', category:'AI FOR DIGITAL SAFETY', year:'2026', description:'An AI-powered scam detection platform helping people identify suspicious messages, links, and online threats.', detail:'Built around digital safety and intelligent investigation, TrustGuard AI explores how technology can make the online world a little more trustworthy. Winner of InnoTech 2026.', tags:['AI / ML','Digital Safety','Web App'], live:'https://feature-login.trustguard-pb3.pages.dev', repo:import.meta.env.VITE_TRUSTGUARD_REPO || 'https://github.com/divyu931-eng/trust-guard-ai-scam-detector', type:'trust', image:'/trustguard-project.webp', award:'INNOTECH 2026 WINNER'},
 {id:'02', name:'Bright Minds', category:'EDUCATION TECHNOLOGY', year:'PROJECT', description:'A modern tuition management platform that brings students, administration, and everyday operations together.', detail:'From student registration to an administrative dashboard and backend integration, Bright Minds brings functional interfaces to a practical educational application.', tags:['Full-Stack','Dashboard','Education'], live:'https://feature-login.bright-minds-b2u.pages.dev', repo:import.meta.env.VITE_BRIGHTMINDS_REPO || 'https://github.com/divyu931-eng/bright-minds-tuition-management', type:'bright', image:'/bright-project.webp'},
 {id:'03', name:'Mausam Mind', category:'WEATHER INTELLIGENCE', year:'PROJECT', description:'An intelligent weather platform turning environmental insights into clearer, more informed decisions.', detail:'Mausam Mind presents weather insights, environmental conflicts, impact visualizations, and route comparisons in an interactive dashboard designed for real-world decisions.', tags:['Data Visualization','Weather','Web App'], live:'https://kiettians-mausum-design-personalizati.netlify.app', repo:import.meta.env.VITE_MAUSAM_REPO || 'https://github.com/divyu931-eng/mausam-weather-personalization', type:'weather', image:'/mausam-project.webp'}
];

// Public defaults, used until the owner saves a version in Supabase.
export const defaultSettings = {
 firstName:'Divyansh', lastName:'Aggarwal', portrait:'/divyansh-portrait.webp', heroImage:'/hero-art.webp',
 headline1:'BUILDING IDEAS INTO', headline2:'DIGITAL', headlineEm:'EXPERIENCES.',
 aboutLead:'I’m Divyansh, a curious mind at the intersection of technology and creativity.',
 aboutBody:'I believe the best ideas become meaningful when you bring them to life. I love exploring artificial intelligence, experimenting with emerging technologies, and building interactive digital experiences that solve real-world problems.',
 education:'Currently pursuing a B.Tech in Computer Science and Engineering (AI & ML) at KIET Group of Institutions, India. Always learning, always making, and always looking for what’s next.',
 roles:'AI/ML Enthusiast\nCreative Developer\nAI Automation Explorer\nFull-Stack Developer',
 skills:'Python\nC++\nHTML\nCSS\nJavaScript\nReact\nAPI Integration\nAI / ML\nAI Automation\nBackend Development\nGit & GitHub',
 achievements:'InnoTech 2026 Winner | Recognized for TrustGuard AI.\nAI / ML academic journey | Building foundations at KIET Group of Institutions.\nHackathon projects | Exploring ideas and solving problems through collaboration.\nTechnical development | Learning by making functional digital products.',
 sections:{about:true,skills:true,projects:true,achievements:true,beyond:true},
 profile,
 projects:projects.map(({name,category,description,detail,live,repo,image,tags,type,award})=>({name,category,description,detail,live,repo,image,tags:tags.join(', '),type,award:award||''}))
};

// Also supports portfolios saved with an earlier version of the editor.
export function normalizeSettings(input){
 if(!input || typeof input!=='object') return structuredClone(defaultSettings);
 return {...defaultSettings,...input,sections:{...defaultSettings.sections,...input.sections},profile:{...defaultSettings.profile,...input.profile},projects:Array.isArray(input.projects)?input.projects.map((p,i)=>({...defaultSettings.projects[i%defaultSettings.projects.length],...p})):structuredClone(defaultSettings.projects)};
}
