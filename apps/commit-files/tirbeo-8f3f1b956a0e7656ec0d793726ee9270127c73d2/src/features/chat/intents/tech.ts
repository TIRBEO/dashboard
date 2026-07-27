import type { Intent } from './types';

export const TECH_INTENTS: Intent[] = [
  // ── AI ──
  {
    patterns: [/ai\b/i, /artificial intelligence\b/i, /machine learning\b/i, /ml\b/i, /deep learning\b/i],
    reply: "AI and machine learning are transformative technologies. Tirbeo communities discuss practical AI applications and building with AI.",
  },
  {
    patterns: [/chatgpt\b/i, /gpt\b/i, /llm\b/i, /large language model\b/i, /openai\b/i, /claude\b/i, /gemini\b/i, /copilot\b/i],
    reply: "LLMs and AI assistants are powerful tools for developers and creators. Tirbeo communities discuss practical AI applications.",
  },
  {
    patterns: [/ai assistant\b/i, /chatbot\b/i, /ai chat\b/i, /ai tool\b/i, /ai tool/i],
    reply: "AI tools are becoming essential for productivity. Communities on Tirbeo discuss the best ways to leverage them.",
  },
  {
    patterns: [/ai replace\b/i, /ai take over\b/i, /ai job\b/i, /future of work\b/i, /ai threat\b/i, /ai safety\b/i],
    reply: "The future of work is evolving with AI. Tirbeo communities discuss how to adapt and thrive in an AI-augmented world.",
  },
  {
    patterns: [/prompt engineering\b/i, /prompting\b/i, /prompt\b/i],
    reply: "Prompt engineering is a valuable skill. Communities on Tirbeo share tips and best practices for working with AI.",
  },
  {
    patterns: [/generate image\b/i, /ai art\b/i, /stable diffusion\b/i, /midjourney\b/i, /dall.e\b/i, /ai image\b/i],
    reply: "AI-generated art and images are a growing field. Tirbeo communities discuss tools and creative applications.",
  },

  // ── Programming ──
  {
    patterns: [/programming\b/i, /coding\b/i, /code\b/i, /developer\b/i, /software engineer\b/i, /developer\b/i],
    reply: "Software development communities on Tirbeo cover everything from frontend to backend, DevOps, and architecture.",
  },
  {
    patterns: [/javascript\b/i, /typescript\b/i, /python\b/i, /rust\b/i, /golang\b/i, /java\b/i, /c\+\+\b/i, /react\b/i, /vue\b/i, /node\b/i],
    reply: "Tirbeo has communities for various programming languages and frameworks. Find your niche and connect with other developers.",
  },
  {
    patterns: [/frontend\b/i, /backend\b/i, /fullstack\b/i, /full.stack\b/i, /web development\b/i, /web dev\b/i],
    reply: "Web development communities on Tirbeo cover frontend, backend, and full-stack topics.",
  },
  {
    patterns: [/mobile development\b/i, /ios development\b/i, /android development\b/i, /flutter\b/i, /react native\b/i],
    reply: "Mobile development communities on Tirbeo discuss iOS, Android, and cross-platform development.",
  },
  {
    patterns: [/database\b/i, /sql\b/i, /nosql\b/i, /postgresql\b/i, /mongodb\b/i, /redis\b/i],
    reply: "Database and data management topics are discussed in relevant Tirbeo communities.",
  },
  {
    patterns: [/api\b/i, /rest api\b/i, /graphql\b/i, /webhook\b/i, /sdk\b/i],
    reply: "API design and integration topics are covered in developer communities on Tirbeo.",
  },
  {
    patterns: [/git\b/i, /github\b/i, /version control\b/i, /gitlab\b/i, /bitbucket\b/i],
    reply: "Version control and collaboration tools are essential for development teams. Discuss best practices in Tirbeo communities.",
  },
  {
    patterns: [/devops\b/i, /ci.cd\b/i, /continuous integration\b/i, /deployment\b/i, /docker\b/i, /kubernetes\b/i, /k8s\b/i],
    reply: "DevOps and infrastructure topics are discussed in relevant Tirbeo communities.",
  },

  // ── Cybersecurity ──
  {
    patterns: [/cybersecurity\b/i, /security\b/i, /infosec\b/i, /information security\b/i],
    reply: "Cybersecurity communities on Tirbeo discuss best practices, threat awareness, and building secure systems.",
  },
  {
    patterns: [/hacking\b/i, /ethical hacking\b/i, /penetration testing\b/i, /pentest\b/i, /bug bounty\b/i],
    reply: "Ethical hacking and penetration testing communities on Tirbeo discuss responsible security research.",
  },
  {
    patterns: [/phishing\b/i, /malware\b/i, /ransomware\b/i, /data breach\b/i, /vulnerability\b/i],
    reply: "Staying informed about security threats is important. Tirbeo communities share best practices for protection.",
  },
  {
    patterns: [/privacy\b/i, /data privacy\b/i, /gdpr\b/i, /ccpa\b/i, /compliance\b/i],
    reply: "Privacy and compliance topics are discussed in Tirbeo communities focused on security and responsible technology.",
  },

  // ── Technology Trends ──
  {
    patterns: [/blockchain\b/i, /crypto\b/i, /bitcoin\b/i, /ethereum\b/i, /web3\b/i, /defi\b/i, /nft\b/i, /web 3\b/i],
    reply: "Blockchain and Web3 topics are discussed in relevant Tirbeo communities.",
  },
  {
    patterns: [/cloud computing\b/i, /aws\b/i, /azure\b/i, /gcp\b/i, /serverless\b/i, /cloud\b/i],
    reply: "Cloud computing and infrastructure topics are covered in developer communities on Tirbeo.",
  },
  {
    patterns: [/data science\b/i, /analytics\b/i, /big data\b/i, /data analysis\b/i, /visualization\b/i],
    reply: "Data science and analytics communities on Tirbeo discuss tools, techniques, and applications.",
  },
  {
    patterns: [/iot\b/i, /internet of things\b/i, /embedded\b/i, /hardware\b/i, /electronics\b/i],
    reply: "IoT and hardware communities on Tirbeo discuss embedded systems and connected devices.",
  },
  {
    patterns: [/vr\b/i, /ar\b/i, /virtual reality\b/i, /augmented reality\b/i, /mixed reality\b/i, /xr\b/i, /metaverse\b/i],
    reply: "VR/AR and spatial computing topics are discussed in relevant Tirbeo communities.",
  },

  // ── Product & Design ──
  {
    patterns: [/product management\b/i, /product manager\b/i, /pm\b/i, /product design\b/i, /ux\b/i, /ui\b/i],
    reply: "Product management and design communities on Tirbeo discuss strategy, user experience, and building great products.",
  },
  {
    patterns: [/design system\b/i, /component library\b/i, /ui kit\b/i, /design tokens\b/i],
    reply: "Design systems and component libraries are key topics in product design communities.",
  },
  {
    patterns: [/figma\b/i, /sketch\b/i, /adobe xd\b/i, /design tool\b/i],
    reply: "Design tool discussions happen in Tirbeo's product design and UI/UX communities.",
  },
  {
    patterns: [/startup tool\b/i, /dev tool\b/i, /saas tool\b/i, /productivity tool\b/i, /developer tool\b/i],
    reply: "Tool recommendations and reviews are shared across various Tirbeo communities.",
  },

  // ── Emerging Tech ──
  {
    patterns: [/quantum computing\b/i, /quantum\b/i],
    reply: "Quantum computing is an emerging field. Tirbeo communities may discuss its implications and developments.",
  },
  {
    patterns: [/robotics\b/i, /robot\b/i, /automation\b/i, /rpa\b/i],
    reply: "Robotics and automation topics are discussed in relevant Tirbeo communities.",
  },
  {
    patterns: [/biotech\b/i, /biotechnology\b/i, /health tech\b/i, /medtech\b/i, /digital health\b/i],
    reply: "Health tech and biotech discussions happen in relevant Tirbeo communities.",
  },
  {
    patterns: [/sustainability\b/i, /climate tech\b/i, /green tech\b/i, /clean tech\b/i, /environment\b/i],
    reply: "Sustainability and climate tech communities on Tirbeo discuss building for a better future.",
  },
];
