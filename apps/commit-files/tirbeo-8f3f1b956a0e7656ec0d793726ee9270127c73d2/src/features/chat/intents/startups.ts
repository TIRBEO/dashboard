import type { Intent } from './types';

export const STARTUP_INTENTS: Intent[] = [
  // ── Startups ──
  {
    patterns: [/startup\b/i, /startups\b/i, /startup ecosystem\b/i, /building a startup\b/i, /start a company\b/i],
    reply: "Tirbeo supports startup builders by helping them connect, collaborate, share ideas, and discover opportunities.",
  },
  {
    patterns: [/founder\b/i, /co-founder\b/i, /cofounder\b/i, /founding team\b/i, /solo founder\b/i, /first time founder\b/i],
    reply: "Tirbeo Collab helps founders connect with co-founders, team members, and the broader startup community.",
  },
  {
    patterns: [/mvp\b/i, /minimum viable product\b/i, /prototype\b/i, /build mvp\b/i, /ship mvp\b/i],
    reply: "Collab connects you with the right people to help you build and ship your MVP.",
  },
  {
    patterns: [/pivot\b/i, /pivoting\b/i, /change direction\b/i, /reinvent\b/i],
    reply: "Pivoting is a natural part of the startup journey. Collab communities can help you get feedback on your new direction.",
  },
  {
    patterns: [/validate\b/i, /validation\b/i, /validate idea\b/i, /idea validation\b/i, /market fit\b/i, /product market fit\b/i],
    reply: "You can validate ideas by sharing them in Collab communities and getting feedback from experienced founders and builders.",
  },
  {
    patterns: [/bootstrapping\b/i, /bootstrap\b/i, /self.funded\b/i, /bootstrapped\b/i, /no funding\b/i],
    reply: "Bootstrapping is a valid approach to building a company. Collab connects you with others who've done the same.",
  },
  {
    patterns: [/saas\b/i, /software as a service\b/i, /b2b\b/i, /b2c\b/i, /marketplace\b/i],
    reply: "Collab has communities for SaaS builders, B2B, B2C, and marketplace founders.",
  },
  {
    patterns: [/indie hacker\b/i, /indie maker\b/i, /solo builder\b/i, /side project\b/i, /passion project\b/i],
    reply: "Indie hackers and solo builders can find community, feedback, and collaboration on Tirbeo.",
  },
  {
    patterns: [/idea\b/i, /business idea\b/i, /startup idea\b/i, /idea stage\b/i, /pre.product\b/i],
    reply: "Share your startup idea in Collab communities to get feedback and potentially find collaborators.",
  },

  // ── Fundraising ──
  {
    patterns: [/raise money\b/i, /raising\b/i, /fundraising\b/i, /fund raise\b/i, /raise capital\b/i],
    reply: "Tirbeo Collab connects founders with the broader startup ecosystem, including potential investors.",
  },
  {
    patterns: [/investor\b/i, /investors\b/i, /find investors\b/i, /investor network\b/i, /meet investors\b/i],
    reply: "Tirbeo Collab is designed to connect people across the startup ecosystem, including founders, builders, and investors.",
  },
  {
    patterns: [/pitch\b/i, /pitch deck\b/i, /pitching\b/i, /elevator pitch\b/i, /investor pitch\b/i],
    reply: "You can refine your pitch by sharing it in Collab communities and getting feedback from experienced founders.",
  },
  {
    patterns: [/vc\b/i, /venture capital\b/i, /angel investor\b/i, /seed round\b/i, /series a\b/i, /pre-seed\b/i, /series b\b/i],
    reply: "Collab aims to help founders connect with potential investors as part of the broader startup ecosystem.",
  },
  {
    patterns: [/term sheet\b/i, /valuation\b/i, /dilution\b/i, /equity\b/i, /cap table\b/i],
    reply: "For legal and financial questions about fundraising, consult with qualified professionals.",
  },
  {
    patterns: [/grant\b/i, /grants\b/i, /government grant\b/i, /non-dilutive funding\b/i],
    reply: "Non-dilutive funding options like grants are worth exploring. Collab communities may have insights on available opportunities.",
  },

  // ── Freelancing ──
  {
    patterns: [/freelancer\b/i, /freelancing\b/i, /freelance\b/i, /contract work\b/i, /gig\b/i, /gigs\b/i],
    reply: "Freelancers can use Tirbeo Collab to showcase skills, connect with teams, and discover collaboration opportunities.",
  },
  {
    patterns: [/find work\b/i, /find clients\b/i, /client\b/i, /clients\b/i, /get hired\b/i, /job search\b/i],
    reply: "Tirbeo Collab aims to help people discover professional opportunities, projects, and career connections.",
  },
  {
    patterns: [/hourly rate\b/i, /pricing freelance\b/i, /how much to charge\b/i, /rate\b/i, /rates\b/i],
    reply: "Pricing strategies vary by skill, experience, and market. Collab communities can share insights on competitive rates.",
  },
  {
    patterns: [/portfolio\b/i, /showcase work\b/i, /previous work\b/i, /case study\b/i, /work samples\b/i],
    reply: "Your Tirbeo profile can serve as a showcase for your skills, projects, and collaboration interests.",
  },

  // ── Jobs & Careers ──
  {
    patterns: [/job\b/i, /jobs\b/i, /career\b/i, /careers\b/i, /job listing\b/i, /job board\b/i, /hiring\b/i],
    reply: "Tirbeo Collab aims to help people discover professional opportunities, projects, and career connections.",
  },
  {
    patterns: [/remote work\b/i, /remote job\b/i, /work from home\b/i, /wfh\b/i, /remote\b/i],
    reply: "Remote work opportunities and distributed teams are part of the Tirbeo ecosystem.",
  },
  {
    patterns: [/internship\b/i, /intern\b/i, /internships\b/i, /apprentice\b/i, /apprenticeship\b/i],
    reply: "Students can find internship opportunities and connect with mentors through Collab communities.",
  },
  {
    patterns: [/salary\b/i, /compensation\b/i, /pay\b/i, /how much does\b/i, /income\b/i],
    reply: "Compensation varies widely by role, experience, and location. Collab communities can share market insights.",
  },
  {
    patterns: [/resume\b/i, /cv\b/i, /job application\b/i, /cover letter\b/i, /apply\b/i],
    reply: "Your Tirbeo profile can complement your resume and showcase your work to potential collaborators and employers.",
  },
  {
    patterns: [/interview\b/i, /interviewing\b/i, /job interview\b/i, /interview tips\b/i],
    reply: "Collab communities can share interview tips and preparation strategies for various roles and industries.",
  },
  {
    patterns: [/quit job\b/i, /resign\b/i, /career change\b/i, /switch career\b/i, /transition\b/i],
    reply: "Career transitions are easier when you have a network. Collab connects you with people who've made similar moves.",
  },

  // ── Skills & Learning ──
  {
    patterns: [/learn\b/i, /learning\b/i, /tutorial\b/i, /course\b/i, /education\b/i, /training\b/i],
    reply: "Learning and growth are core to Tirbeo's mission. Communities offer shared knowledge and mentorship.",
  },
  {
    patterns: [/skill\b/i, /skills\b/i, /improve skills\b/i, /learn to code\b/i, /new skill\b/i],
    reply: "Communities on Tirbeo are great places to learn new skills, share knowledge, and grow together.",
  },
  {
    patterns: [/mentor\b/i, /mentoring\b/i, /mentorship\b/i, /find a mentor\b/i, /coaching\b/i],
    reply: "Collab can connect you with mentors and experienced professionals who can provide guidance and support.",
  },
  {
    patterns: [/networking\b/i, /professional network\b/i, /build network\b/i, /grow network\b/i],
    reply: "You build your network naturally through communities, projects, and shared interests on Tirbeo.",
  },

  // ── Building ──
  {
    patterns: [/build in public\b/i, /building in public\b/i, /ship\b/i, /shipping\b/i, /launch\b/i, /launched\b/i],
    reply: "Building in public is a great way to get feedback and connect with others. Share your progress in Collab communities.",
  },
  {
    patterns: [/open source\b/i, /oss\b/i, /contributor\b/i, /contribute\b/i, /open source project\b/i],
    reply: "Open source builders can find collaborators, contributors, and community on Tirbeo.",
  },
  {
    patterns: [/hackathon\b/i, /hackathon project\b/i, /competition\b/i, /challenge\b/i],
    reply: "Hackathons are great for meeting collaborators. Collab can connect you with teams and projects.",
  },
  {
    patterns: [/no code\b/i, /nocode\b/i, /no code tools\b/i, /without coding\b/i],
    reply: "No-code builders can find communities and collaborators on Tirbeo regardless of technical background.",
  },
  {
    patterns: [/ai startup\b/i, /machine learning startup\b/i, /ai company\b/i],
    reply: "AI startups and machine learning projects can find collaborators and communities on Tirbeo.",
  },
  {
    patterns: [/product launch\b/i, /launch day\b/i, /launching\b/i, /product hunt\b/i, /launch strategy\b/i],
    reply: "Collab communities can help you plan and execute a successful product launch.",
  },
  {
    patterns: [/growth\b/i, /growth hacking\b/i, /user acquisition\b/i, /acquisition\b/i, /marketing\b/i, /seo\b/i, /content marketing\b/i],
    reply: "Growth strategies and marketing insights can be found in Collab communities focused on business growth.",
  },
  {
    patterns: [/revenue\b/i, /monetize\b/i, /monetization\b/i, /business model\b/i, /pricing model\b/i],
    reply: "Revenue and monetization strategies are discussed in Collab communities focused on business building.",
  },
];
