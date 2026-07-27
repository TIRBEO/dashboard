import type { Intent } from './types';

export const COLLAB_INTENTS: Intent[] = [
  // ── What is Collab ──
  {
    patterns: [/what is tirbeo collab\b/i, /tell me about collab\b/i, /about collab\b/i, /collab platform\b/i, /tirbeo collab\b/i, /what'?s collab\b/i],
    reply: "Tirbeo Collab is a professional collaboration platform where founders, developers, designers, freelancers, creators, investors, and businesses can connect, build teams, and work together.",
  },
  {
    patterns: [/who uses tirbeo collab\b/i, /collab users\b/i, /who is collab for\b/i, /is collab for me\b/i],
    reply: "Tirbeo Collab is designed for founders, startups, developers, designers, freelancers, creators, students, investors, and businesses.",
  },

  // ── Founders & Co-founders ──
  {
    patterns: [/find cofounder\b/i, /find co.founder\b/i, /cofounder\b/i, /co-founder\b/i, /startup partner\b/i, /founding team\b/i],
    reply: "Tirbeo Collab helps builders discover potential collaborators, teammates, and people with shared goals.",
  },
  {
    patterns: [/find founder\b/i, /connect with founders\b/i, /founder network\b/i, /meet founders\b/i],
    reply: "You can connect with founders through Collab's community and networking features.",
  },
  {
    patterns: [/startup\b/i, /startups\b/i, /startup platform\b/i, /for founders\b/i],
    reply: "Tirbeo supports startup builders by helping them connect, collaborate, share ideas, and discover opportunities.",
  },

  // ── Investors ──
  {
    patterns: [/investor\b/i, /investors\b/i, /investor network\b/i, /find investors\b/i, /raise money\b/i, /funding\b/i, /pitch\b/i, /venture\b/i],
    reply: "Tirbeo Collab is designed to connect people across the startup ecosystem, including founders, builders, and investors.",
  },
  {
    patterns: [/angel investor\b/i, /seed round\b/i, /series a\b/i, /vc\b/i, /venture capital\b/i],
    reply: "Collab aims to help founders connect with potential investors as part of the broader startup ecosystem.",
  },

  // ── Freelancing ──
  {
    patterns: [/freelancer\b/i, /freelancing\b/i, /freelance\b/i, /freelancer platform\b/i, /contract work\b/i, /gig\b/i, /gigs\b/i],
    reply: "Freelancers can use Tirbeo Collab to showcase skills, connect with teams, and discover collaboration opportunities.",
  },
  {
    patterns: [/find work\b/i, /find clients\b/i, /get hired\b/i, /job search\b/i, /looking for work\b/i],
    reply: "Tirbeo Collab aims to help people discover professional opportunities, projects, and career connections.",
  },

  // ── Hiring & Jobs ──
  {
    patterns: [/hire\b/i, /hiring\b/i, /job\b/i, /jobs\b/i, /career\b/i, /careers\b/i, /job listing\b/i, /job board\b/i],
    reply: "Tirbeo Collab aims to help people discover professional opportunities, projects, and career connections.",
  },
  {
    patterns: [/recruitment\b/i, /recruiter\b/i, /talent\b/i, /find talent\b/i, /hire developers\b/i, /hire designers\b/i],
    reply: "Collab is designed to connect talent with opportunities through communities and collaboration features.",
  },
  {
    patterns: [/resume\b/i, /cv\b/i, /portfolio\b/i, /profile\b/i, /showcase\b/i],
    reply: "Your Tirbeo profile can serve as a showcase for your skills, projects, and collaboration interests.",
  },

  // ── Developers ──
  {
    patterns: [/developer\b/i, /developers\b/i, /coding\b/i, /programmer\b/i, /engineer\b/i, /dev\b/i, /software\b/i],
    reply: "Developers can use Collab to connect with teams, find projects, collaborate on open source, and build together.",
  },
  {
    patterns: [/open source project\b/i, /build in public\b/i, /side project\b/i, /hackathon\b/i],
    reply: "Collab supports builders who want to work on projects together, whether it's open source, side projects, or hackathons.",
  },

  // ── Designers ──
  {
    patterns: [/designer\b/i, /design\b/i, /ux\b/i, /ui\b/i, /graphic design\b/i, /branding\b/i],
    reply: "Designers can connect with teams and founders on Collab to collaborate on visual projects, branding, and product design.",
  },

  // ── Students ──
  {
    patterns: [/student\b/i, /students\b/i, /university\b/i, /college\b/i, /learning\b/i, /internship\b/i, /intern\b/i],
    reply: "Students can use Collab to connect with professionals, find mentors, discover internships, and build real-world experience.",
  },

  // ── Businesses ──
  {
    patterns: [/business\b/i, /companies\b/i, /company\b/i, /enterprise\b/i, /corporate\b/i],
    reply: "Businesses can use Tirbeo Collab to find talent, build partnerships, and connect with the startup ecosystem.",
  },

  // ── Teams ──
  {
    patterns: [/team\b/i, /build a team\b/i, /team building\b/i, /find teammates\b/i],
    reply: "Tirbeo Collab helps you build teams by connecting you with people who share your goals and complement your skills.",
  },
  {
    patterns: [/project\b/i, /projects\b/i, /collaborate on\b/i, /work on\b/i, /build\b/i],
    reply: "Collab makes it easy to find people for projects, whether you're building a product, starting a company, or working on a creative endeavor.",
  },

  // ── Skills ──
  {
    patterns: [/skill\b/i, /skills\b/i, /expertise\b/i, /specialty\b/i, /talent\b/i],
    reply: "Your Collab profile can highlight your skills so the right people can find you for collaboration opportunities.",
  },
  {
    patterns: [/mentoring\b/i, /mentor\b/i, /coaching\b/i, /guidance\b/i, /advice\b/i],
    reply: "Collab can connect you with mentors and experienced professionals who can provide guidance and support.",
  },

  // ── Networking ──
  {
    patterns: [/networking\b/i, /professional network\b/i, /professional connections\b/i, /industry connections\b/i],
    reply: "Collab helps you build a professional network through communities, projects, and shared interests.",
  },
  {
    patterns: [/event\b/i, /events\b/i, /meetup\b/i, /conference\b/i, /networking event\b/i],
    reply: "Events and meetups are a great way to connect with others in the Collab ecosystem.",
  },

  // ── How Collab Works ──
  {
    patterns: [/how does collab work\b/i, /how to use collab\b/i, /collab features\b/i, /what can you do on collab\b/i],
    reply: "On Collab you create a profile, join communities, connect with people, and collaborate on projects. It's designed for meaningful professional connections.",
  },
  {
    patterns: [/how is collab different\b/i, /collab vs\b/i, /why use collab\b/i, /what makes collab special\b/i],
    reply: "Collab focuses on real collaboration over superficial networking — connecting builders with builders, not just collecting contacts.",
  },

  // ── Pricing ──
  {
    patterns: [/is collab free\b/i, /collab pricing\b/i, /how much does collab cost\b/i, /collab plans\b/i],
    reply: "I don't have confirmed details about Collab pricing yet. Any pricing information will be announced officially.",
  },

  // ── Availability ──
  {
    patterns: [/when will collab launch\b/i, /is collab available\b/i, /collab launch\b/i, /when can i use collab\b/i],
    reply: "Official launch information for Tirbeo Collab will be shared through official announcements.",
  },
  {
    patterns: [/how to join collab\b/i, /sign up for collab\b/i, /get collab access\b/i],
    reply: "You can join the Tirbeo waitlist to receive updates and early access information when Collab becomes available.",
  },

  // ── Use Cases ──
  {
    patterns: [/find a co-founder for\b/i, /looking for a\b/i, /need a\b/i, /searching for\b/i],
    reply: "Try posting your needs in relevant Collab communities — describe what you're building and the skills you're looking for.",
  },
  {
    patterns: [/side hustle\b/i, /passion project\b/i, /hobby\b/i, /personal project\b/i],
    reply: "Collab is great for finding people who share your passion and want to collaborate on side projects.",
  },
  {
    patterns: [/validate idea\b/i, /idea validation\b/i, /market research\b/i, /test idea\b/i],
    reply: "You can use Collab communities to get feedback on your ideas from experienced founders and builders.",
  },
  {
    patterns: [/pivot\b/i, /rebrand\b/i, /launch product\b/i, /ship\b/i, /mvp\b/i, /minimum viable\b/i],
    reply: "Collab connects you with the right people to help you ship your MVP, pivot, or launch your product.",
  },
];
