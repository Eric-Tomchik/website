import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  DollarSign,
  Layers,
  Globe,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Platform Guide Resources — 153 Platforms, Pricing & Stacks',
  description:
    'Live companion resources for "The Complete AI Platform Guide 2026" by Eric Tomchik. 153 platform URLs, pricing matrix, recommended stacks by budget, and category comparison charts — updated regularly.',
  openGraph: {
    title: 'AI Platform Guide Resources — Eric Tomchik',
    description:
      '153 AI platforms with live URLs, current pricing, recommended stacks, and comparison charts.',
    url: 'https://erictomchik.com/resources/ai-guide',
    type: 'website',
  },
  alternates: {
    canonical: 'https://erictomchik.com/resources/ai-guide',
  },
};

const LAST_UPDATED = 'May 2026';

/* ------------------------------------------------------------------ */
/*  DATA — Platform Directory                                          */
/* ------------------------------------------------------------------ */

interface Platform {
  name: string;
  url: string;
  company: string;
  free: boolean;
  paidFrom: string;
  audience: string;
}

interface Category {
  name: string;
  id: string;
  platforms: Platform[];
}

const categories: Category[] = [
  {
    name: 'Conversational AI & Large Language Models',
    id: 'llms',
    platforms: [
      { name: 'ChatGPT', url: 'chat.openai.com', company: 'OpenAI', free: true, paidFrom: '$20/mo', audience: 'Business, Creative, Personal' },
      { name: 'Claude', url: 'claude.ai', company: 'Anthropic', free: true, paidFrom: '$20/mo', audience: 'Business, Creative, Developers' },
      { name: 'Google Gemini', url: 'gemini.google.com', company: 'Google DeepMind', free: true, paidFrom: '$19.99/mo', audience: 'Business, Personal, Enterprise' },
      { name: 'Perplexity', url: 'perplexity.ai', company: 'Perplexity AI', free: true, paidFrom: '$20/mo', audience: 'Research, Business, Education' },
      { name: 'Grok', url: 'grok.x.ai', company: 'xAI', free: false, paidFrom: '$8/mo', audience: 'Personal, Business' },
      { name: 'Microsoft Copilot', url: 'copilot.microsoft.com', company: 'Microsoft', free: true, paidFrom: '$20/mo', audience: 'Business, Enterprise' },
      { name: 'DeepSeek', url: 'chat.deepseek.com', company: 'DeepSeek', free: true, paidFrom: 'Custom', audience: 'Developers, Business, Research' },
      { name: 'Mistral AI', url: 'chat.mistral.ai', company: 'Mistral AI', free: true, paidFrom: 'Custom', audience: 'Developers, Enterprise' },
      { name: 'Meta AI', url: 'meta.ai', company: 'Meta', free: true, paidFrom: 'Custom', audience: 'Personal, Social' },
      { name: 'Poe', url: 'poe.com', company: 'Quora', free: true, paidFrom: '$19.99/mo', audience: 'Power Users, Enthusiasts' },
      { name: 'Character.AI', url: 'character.ai', company: 'Character Technologies', free: true, paidFrom: '$9.99/mo', audience: 'Personal, Entertainment' },
      { name: 'Pi', url: 'pi.ai', company: 'Inflection AI', free: true, paidFrom: 'Custom', audience: 'Personal, Wellness' },
      { name: 'HuggingChat', url: 'huggingface.co/chat', company: 'Hugging Face', free: true, paidFrom: '$9/mo', audience: 'Developers, Researchers' },
      { name: 'Cohere', url: 'cohere.com', company: 'Cohere', free: true, paidFrom: 'Pay-per-use', audience: 'Enterprise, Developers' },
      { name: 'You.com', url: 'you.com', company: 'You.com', free: true, paidFrom: '$15/mo', audience: 'Personal, Business, Research' },
      { name: 'Phind', url: 'phind.com', company: 'Phind', free: true, paidFrom: '$20/mo', audience: 'Developers, Technical' },
      { name: 'Groq', url: 'groq.com', company: 'Groq Inc.', free: true, paidFrom: 'Custom', audience: 'Developers, Researchers' },
      { name: 'Together AI', url: 'together.ai', company: 'Together AI', free: true, paidFrom: 'Custom', audience: 'Developers, Enterprises' },
    ],
  },
  {
    name: 'Image Generation',
    id: 'image',
    platforms: [
      { name: 'Midjourney', url: 'midjourney.com', company: 'Midjourney, Inc.', free: false, paidFrom: '$10/mo', audience: 'Creative, Business, Marketing' },
      { name: 'DALL-E 3', url: 'openai.com', company: 'OpenAI', free: true, paidFrom: '$20/mo', audience: 'Everyone' },
      { name: 'Stable Diffusion / Flux', url: 'stability.ai', company: 'Stability AI / Black Forest Labs', free: true, paidFrom: '$10–$100/mo', audience: 'Developers, Creative Pros' },
      { name: 'Adobe Firefly', url: 'firefly.adobe.com', company: 'Adobe', free: true, paidFrom: '$54.99/mo', audience: 'Creative Pros, Business' },
      { name: 'Leonardo AI', url: 'leonardo.ai', company: 'Leonardo Interactive', free: true, paidFrom: '$12/mo', audience: 'Creative, Game Dev' },
      { name: 'Ideogram', url: 'ideogram.ai', company: 'Ideogram', free: true, paidFrom: '$8/mo', audience: 'Business, Marketing, Design' },
      { name: 'Playground AI', url: 'playground.ai', company: 'Playground AI', free: true, paidFrom: '$15/mo', audience: 'Personal, Small Business' },
      { name: 'NightCafe', url: 'nightcafe.studio', company: 'NightCafe', free: true, paidFrom: '$5.99/mo', audience: 'Artists, Creative' },
      { name: 'Canva AI (Magic Studio)', url: 'canva.com', company: 'Canva', free: true, paidFrom: '$12.99/mo', audience: 'Business, Marketing, Education' },
      { name: 'Krea AI', url: 'krea.ai', company: 'Krea', free: true, paidFrom: '$24/mo', audience: 'Designers, Creative Pros' },
      { name: 'Magnific AI', url: 'magnific.ai', company: 'Magnific', free: false, paidFrom: '$39/mo', audience: 'Photographers, Designers' },
      { name: 'Recraft', url: 'recraft.ai', company: 'Recraft AI', free: true, paidFrom: '$25/mo', audience: 'Designers, Brand Teams' },
    ],
  },
  {
    name: 'Video Generation',
    id: 'video',
    platforms: [
      { name: 'Runway', url: 'runwayml.com', company: 'Runway AI', free: true, paidFrom: '$15/mo', audience: 'Creative, Marketing, Film' },
      { name: 'OpenAI Sora', url: 'sora.com', company: 'OpenAI', free: false, paidFrom: '$20/mo', audience: 'Creative, Business' },
      { name: 'Kling AI', url: 'klingai.com', company: 'Kuaishou', free: true, paidFrom: '$10/mo', audience: 'Creative, Marketing' },
      { name: 'Synthesia', url: 'synthesia.io', company: 'Synthesia', free: false, paidFrom: '$29/mo', audience: 'Business, Training, Enterprise' },
      { name: 'HeyGen', url: 'heygen.com', company: 'HeyGen', free: true, paidFrom: '$29/mo', audience: 'Marketing, Sales, Business' },
      { name: 'Descript', url: 'descript.com', company: 'Descript', free: true, paidFrom: '$24/mo', audience: 'Creators, Podcasters' },
      { name: 'InVideo AI', url: 'invideo.io', company: 'InVideo', free: true, paidFrom: '$25/mo', audience: 'Marketing, Social Media' },
      { name: 'Luma Dream Machine', url: 'lumalabs.ai', company: 'Luma AI', free: true, paidFrom: '$9.99/mo', audience: 'Creative, Marketing' },
      { name: 'Pika', url: 'pika.art', company: 'Pika Labs', free: true, paidFrom: '$10/mo', audience: 'Creative, Social Media' },
      { name: 'Captions', url: 'captions.ai', company: 'Captions', free: true, paidFrom: '$9.99/mo', audience: 'Social Media, Marketing' },
      { name: 'Colossyan', url: 'colossyan.com', company: 'Colossyan', free: false, paidFrom: '$27/mo', audience: 'L&D, HR, Enterprise' },
    ],
  },
  {
    name: 'Audio, Music & Voice AI',
    id: 'audio',
    platforms: [
      { name: 'Suno', url: 'suno.com', company: 'Suno', free: true, paidFrom: '$10/mo', audience: 'Creative, Business' },
      { name: 'Udio', url: 'udio.com', company: 'Udio', free: true, paidFrom: '$10/mo', audience: 'Creative, Musicians' },
      { name: 'ElevenLabs', url: 'elevenlabs.io', company: 'ElevenLabs', free: true, paidFrom: '$5/mo', audience: 'Business, Creative, Developers' },
      { name: 'Murf AI', url: 'murf.ai', company: 'Murf', free: true, paidFrom: '$23/mo', audience: 'Business, Marketing, E-Learning' },
      { name: 'AIVA', url: 'aiva.ai', company: 'AIVA Technologies', free: true, paidFrom: '$15/mo', audience: 'Musicians, Film, Game Dev' },
      { name: 'Otter.ai', url: 'otter.ai', company: 'Otter.ai', free: true, paidFrom: '$16.99/mo', audience: 'Business, Education' },
      { name: 'Krisp', url: 'krisp.ai', company: 'Krisp', free: true, paidFrom: '$8/mo', audience: 'Business, Remote Workers' },
      { name: 'Speechify', url: 'speechify.com', company: 'Speechify', free: true, paidFrom: '$11.58/mo', audience: 'Education, Accessibility' },
      { name: 'Podcastle', url: 'podcastle.ai', company: 'Podcastle', free: true, paidFrom: '$14.99/mo', audience: 'Podcasters, Creators' },
      { name: 'Boomy', url: 'boomy.com', company: 'Boomy', free: true, paidFrom: '$2.99/mo', audience: 'Aspiring Musicians' },
      { name: 'Soundraw', url: 'soundraw.io', company: 'Soundraw Inc.', free: true, paidFrom: '$16.99/mo', audience: 'Creators, Filmmakers' },
    ],
  },
  {
    name: 'Coding & Development AI',
    id: 'coding',
    platforms: [
      { name: 'GitHub Copilot', url: 'github.com/copilot', company: 'GitHub / Microsoft', free: true, paidFrom: '$10/mo', audience: 'Developers' },
      { name: 'Cursor', url: 'cursor.com', company: 'Anysphere', free: true, paidFrom: '$20/mo', audience: 'Developers' },
      { name: 'Claude Code', url: 'docs.anthropic.com/claude-code', company: 'Anthropic', free: false, paidFrom: '$20/mo', audience: 'Developers' },
      { name: 'Amazon Q Developer', url: 'aws.amazon.com/q/developer', company: 'Amazon/AWS', free: true, paidFrom: '$19/user/mo', audience: 'Developers, AWS Users' },
      { name: 'Tabnine', url: 'tabnine.com', company: 'Tabnine', free: true, paidFrom: '$12/mo', audience: 'Enterprise Developers' },
      { name: 'Replit', url: 'replit.com', company: 'Replit', free: true, paidFrom: '$20/mo', audience: 'Students, Beginners' },
      { name: 'Windsurf (Codeium)', url: 'codeium.com', company: 'Codeium', free: true, paidFrom: '$15/mo', audience: 'Developers, Students' },
      { name: 'Devin', url: 'cognition.ai', company: 'Cognition AI', free: false, paidFrom: '$500/mo', audience: 'Engineering Teams' },
      { name: 'Bolt.new', url: 'bolt.new', company: 'StackBlitz', free: true, paidFrom: '$20/mo', audience: 'Developers, Non-Technical' },
      { name: 'Aider', url: 'aider.chat', company: 'Paul Gauthier', free: true, paidFrom: 'Custom', audience: 'Developers' },
      { name: 'Sourcegraph Cody', url: 'sourcegraph.com/cody', company: 'Sourcegraph', free: true, paidFrom: '$9/mo', audience: 'Enterprise Developers' },
      { name: 'v0 by Vercel', url: 'v0.dev', company: 'Vercel', free: true, paidFrom: '$20/mo', audience: 'Frontend Developers, Designers' },
      { name: 'Lovable', url: 'lovable.dev', company: 'Lovable', free: true, paidFrom: '$20/mo', audience: 'Entrepreneurs, Non-technical' },
    ],
  },
  {
    name: 'Writing & Content AI',
    id: 'writing',
    platforms: [
      { name: 'Jasper', url: 'jasper.ai', company: 'Jasper AI', free: false, paidFrom: '$49/mo', audience: 'Marketing Teams, Enterprise' },
      { name: 'Copy.ai', url: 'copy.ai', company: 'Copy.ai', free: true, paidFrom: '$36/mo', audience: 'Sales, Marketing' },
      { name: 'Grammarly', url: 'grammarly.com', company: 'Grammarly', free: true, paidFrom: '$12/mo', audience: 'Everyone' },
      { name: 'Sudowrite', url: 'sudowrite.com', company: 'Sudowrite', free: false, paidFrom: '$10/mo', audience: 'Novelists, Fiction Writers' },
      { name: 'Writesonic', url: 'writesonic.com', company: 'Writesonic', free: true, paidFrom: '$16/mo', audience: 'Marketing, SEO' },
      { name: 'QuillBot', url: 'quillbot.com', company: 'QuillBot', free: true, paidFrom: '$9.95/mo', audience: 'Students, Writers' },
      { name: 'Wordtune', url: 'wordtune.com', company: 'AI21 Labs', free: true, paidFrom: '$9.99/mo', audience: 'Business Writers' },
      { name: 'Writer', url: 'writer.com', company: 'Writer Inc.', free: false, paidFrom: '$18/user/mo', audience: 'Enterprise, Marketing' },
      { name: 'Rytr', url: 'rytr.me', company: 'Rytr LLC', free: true, paidFrom: '$9/mo', audience: 'Freelancers, Bloggers' },
      { name: 'Anyword', url: 'anyword.com', company: 'Anyword', free: false, paidFrom: '$49/mo', audience: 'Marketers, Ad Agencies' },
    ],
  },
  {
    name: 'Design & Creative AI',
    id: 'design',
    platforms: [
      { name: 'Canva AI', url: 'canva.com', company: 'Canva', free: true, paidFrom: '$13/mo', audience: 'Business, Marketing, Education' },
      { name: 'Gamma', url: 'gamma.app', company: 'Gamma', free: true, paidFrom: '$10/mo', audience: 'Business, Education' },
      { name: 'Figma AI', url: 'figma.com', company: 'Figma', free: true, paidFrom: '$15/user/mo', audience: 'Designers, Product Teams' },
      { name: 'Tome', url: 'tome.app', company: 'Tome', free: true, paidFrom: '$16/mo', audience: 'Business, Marketing, Sales' },
      { name: 'Beautiful.ai', url: 'beautiful.ai', company: 'Beautiful.ai', free: false, paidFrom: '$12/mo', audience: 'Business, Marketing' },
      { name: 'Looka', url: 'looka.com', company: 'Looka', free: true, paidFrom: '$20 one-time', audience: 'Small Business, Startups' },
      { name: 'Galileo AI', url: 'usegalileo.ai', company: 'Galileo Labs', free: true, paidFrom: '$19/mo', audience: 'Designers, Product Teams' },
      { name: 'Framer', url: 'framer.com', company: 'Framer', free: true, paidFrom: '$5/mo', audience: 'Designers, Agencies' },
      { name: 'Uizard', url: 'uizard.io', company: 'Uizard Technologies', free: true, paidFrom: '$19/mo', audience: 'Product Managers, Startups' },
    ],
  },
  {
    name: 'Productivity & Workspace AI',
    id: 'productivity',
    platforms: [
      { name: 'Notion AI', url: 'notion.so', company: 'Notion', free: true, paidFrom: '$10/mo', audience: 'Business, Personal, Teams' },
      { name: 'Obsidian + AI', url: 'obsidian.md', company: 'Obsidian', free: true, paidFrom: '$4/mo', audience: 'Writers, Researchers' },
      { name: 'Mem AI', url: 'mem.ai', company: 'Mem Labs', free: true, paidFrom: '$10/mo', audience: 'Knowledge Workers' },
      { name: 'Fireflies.ai', url: 'fireflies.ai', company: 'Fireflies.ai', free: true, paidFrom: '$10/mo', audience: 'Business, Sales, Teams' },
      { name: 'Reclaim.ai', url: 'reclaim.ai', company: 'Reclaim AI', free: true, paidFrom: '$8/user/mo', audience: 'Professionals, Teams' },
      { name: 'Granola', url: 'granola.so', company: 'Granola', free: true, paidFrom: '$10/mo', audience: 'Professionals, Consultants' },
      { name: 'Taskade', url: 'taskade.com', company: 'Taskade Inc.', free: true, paidFrom: '$8/user/mo', audience: 'Teams, Project Managers' },
      { name: 'Motion', url: 'usemotion.com', company: 'Motion Technologies', free: false, paidFrom: '$34/mo', audience: 'Professionals, Executives' },
    ],
  },
  {
    name: 'Marketing, Sales & CRM AI',
    id: 'marketing',
    platforms: [
      { name: 'HubSpot AI', url: 'hubspot.com', company: 'HubSpot', free: true, paidFrom: '$20/mo', audience: 'Marketing, Sales, SMB' },
      { name: 'Apollo.io', url: 'apollo.io', company: 'Apollo', free: true, paidFrom: '$49/user/mo', audience: 'Sales, Business Development' },
      { name: 'Surfer SEO', url: 'surferseo.com', company: 'Surfer', free: false, paidFrom: '$89/mo', audience: 'Content Marketers, SEO' },
      { name: 'Clay', url: 'clay.com', company: 'Clay', free: true, paidFrom: '$149/mo', audience: 'Sales, Marketing, Growth' },
      { name: 'Lavender', url: 'lavender.ai', company: 'Lavender AI', free: false, paidFrom: '$29/mo', audience: 'Sales Reps, SDRs' },
      { name: 'Instantly', url: 'instantly.ai', company: 'Instantly AI', free: false, paidFrom: '$37/mo', audience: 'Sales, Agencies, Lead Gen' },
    ],
  },
  {
    name: 'Data, Analytics & BI',
    id: 'analytics',
    platforms: [
      { name: 'Julius AI', url: 'julius.ai', company: 'Julius', free: true, paidFrom: '$20/mo', audience: 'Business, Analysts' },
      { name: 'Obviously AI', url: 'obviously.ai', company: 'Obviously AI', free: false, paidFrom: '$75/mo', audience: 'Business, Sales' },
      { name: 'Tableau AI', url: 'tableau.com', company: 'Salesforce', free: false, paidFrom: '$15/user/mo', audience: 'Enterprise, Analysts' },
      { name: 'Hex', url: 'hex.tech', company: 'Hex Technologies', free: true, paidFrom: '$30/user/mo', audience: 'Data Teams, Analysts' },
      { name: 'Akkio', url: 'akkio.com', company: 'Akkio Inc.', free: true, paidFrom: '$49/mo', audience: 'Business Analysts, SMBs' },
      { name: 'MindsDB', url: 'mindsdb.com', company: 'MindsDB Inc.', free: true, paidFrom: '$49/mo', audience: 'Data Engineers, Developers' },
    ],
  },
  {
    name: 'Customer Service & Support AI',
    id: 'support',
    platforms: [
      { name: 'Zendesk AI', url: 'zendesk.com', company: 'Zendesk', free: false, paidFrom: '$55/agent/mo', audience: 'Business, Enterprise' },
      { name: 'Intercom Fin', url: 'intercom.com', company: 'Intercom', free: true, paidFrom: '$39/seat/mo', audience: 'Business, SaaS' },
      { name: 'Tidio', url: 'tidio.com', company: 'Tidio', free: true, paidFrom: '$29/mo', audience: 'Small Business, E-commerce' },
      { name: 'Freshdesk AI', url: 'freshdesk.com', company: 'Freshworks', free: true, paidFrom: '$15/agent/mo', audience: 'Business, SMB' },
      { name: 'Ada', url: 'ada.cx', company: 'Ada', free: false, paidFrom: 'Custom', audience: 'Enterprise, E-Commerce' },
    ],
  },
  {
    name: 'Automation & Workflow AI',
    id: 'automation',
    platforms: [
      { name: 'Viktor', url: 'getviktor.com', company: 'Viktor AI', free: false, paidFrom: '$50/mo', audience: 'Teams, Business, Enterprise' },
      { name: 'Zapier', url: 'zapier.com', company: 'Zapier', free: true, paidFrom: '$19.99/mo', audience: 'Business, Marketing' },
      { name: 'Make (Integromat)', url: 'make.com', company: 'Make', free: true, paidFrom: '$9/mo', audience: 'Business, Developers' },
      { name: 'n8n', url: 'n8n.io', company: 'n8n', free: true, paidFrom: '$20/mo', audience: 'Developers, Technical' },
      { name: 'Bardeen', url: 'bardeen.ai', company: 'Bardeen', free: true, paidFrom: '$10/mo', audience: 'Business, Sales' },
      { name: 'LangChain', url: 'langchain.com', company: 'LangChain, Inc.', free: true, paidFrom: '$39/mo', audience: 'Developers, AI Engineers' },
      { name: 'Activepieces', url: 'activepieces.com', company: 'Activepieces', free: true, paidFrom: '$10/mo', audience: 'Developers, SMBs' },
    ],
  },
  {
    name: 'Industry-Specific AI',
    id: 'industry',
    platforms: [
      { name: 'Harvey', url: 'harvey.ai', company: 'Harvey AI', free: false, paidFrom: 'Custom', audience: 'Legal, Law Firms' },
      { name: 'AlphaSense', url: 'alpha-sense.com', company: 'AlphaSense', free: false, paidFrom: 'Custom', audience: 'Finance, Investment' },
      { name: 'Khanmigo', url: 'khanacademy.org/khan-labs', company: 'Khan Academy', free: true, paidFrom: '$44/yr', audience: 'Education, Students' },
      { name: 'Hippocratic AI', url: 'hippocratic.ai', company: 'Hippocratic AI', free: false, paidFrom: 'Custom', audience: 'Healthcare, Hospitals' },
      { name: 'Casetext (CoCounsel)', url: 'casetext.com', company: 'Thomson Reuters', free: false, paidFrom: 'Custom', audience: 'Legal Professionals' },
      { name: 'Docugami', url: 'docugami.com', company: 'Docugami Inc.', free: false, paidFrom: 'Custom', audience: 'Legal, Finance, Enterprise' },
    ],
  },
  {
    name: 'Open Source & Self-Hosted AI',
    id: 'open-source',
    platforms: [
      { name: 'Ollama', url: 'ollama.com', company: 'Ollama', free: true, paidFrom: 'Free', audience: 'Developers, Privacy-Conscious' },
      { name: 'LM Studio', url: 'lmstudio.ai', company: 'LM Studio', free: true, paidFrom: 'Free', audience: 'Everyone, Non-technical' },
      { name: 'GPT4All', url: 'gpt4all.io', company: 'Nomic AI', free: true, paidFrom: 'Free', audience: 'Privacy-focused' },
      { name: 'Open WebUI', url: 'openwebui.com', company: 'Open WebUI', free: true, paidFrom: 'Free', audience: 'Developers, Teams' },
      { name: 'Jan', url: 'jan.ai', company: 'Jan AI', free: true, paidFrom: 'Free', audience: 'Privacy-Conscious, Developers' },
      { name: 'Hugging Face', url: 'huggingface.co', company: 'Hugging Face', free: true, paidFrom: '$9/mo', audience: 'Developers, Researchers' },
      { name: 'AnythingLLM', url: 'anythingllm.com', company: 'Mintplex Labs', free: true, paidFrom: '$6.50/mo', audience: 'Developers, Teams' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  DATA — Recommended Stacks                                          */
/* ------------------------------------------------------------------ */

interface StackItem {
  need: string;
  tool: string;
  cost: string;
}

interface Stack {
  name: string;
  range: string;
  items: StackItem[];
}

const stacks: Stack[] = [
  {
    name: 'Starter Stack',
    range: 'Free – $20/mo',
    items: [
      { need: 'General assistant', tool: 'ChatGPT Free or Claude Free', cost: '$0' },
      { need: 'Research', tool: 'Perplexity Free', cost: '$0' },
      { need: 'Image creation', tool: 'ChatGPT (DALL-E)', cost: '$0' },
      { need: 'Writing help', tool: 'Grammarly Free', cost: '$0' },
    ],
  },
  {
    name: 'Professional Stack',
    range: '$40 – $60/mo',
    items: [
      { need: 'Primary AI', tool: 'ChatGPT Plus or Claude Pro', cost: '$20/mo' },
      { need: 'Research', tool: 'Perplexity Pro', cost: '$20/mo' },
      { need: 'Design', tool: 'Canva Pro', cost: '$13/mo' },
    ],
  },
  {
    name: 'Developer Stack',
    range: '$30 – $50/mo',
    items: [
      { need: 'Coding IDE', tool: 'Cursor Pro', cost: '$16/mo' },
      { need: 'General AI', tool: 'Claude Pro', cost: '$20/mo' },
      { need: 'Tech search', tool: 'Phind Free', cost: '$0' },
    ],
  },
  {
    name: 'Creator Stack',
    range: '$50 – $80/mo',
    items: [
      { need: 'Writing', tool: 'ChatGPT Plus', cost: '$20/mo' },
      { need: 'Images', tool: 'Midjourney Standard', cost: '$30/mo' },
      { need: 'Video', tool: 'Runway Standard', cost: '$15/mo' },
      { need: 'Music', tool: 'Suno Pro', cost: '$10/mo' },
    ],
  },
  {
    name: 'Enterprise Stack',
    range: '$50 – $100+/user/mo',
    items: [
      { need: 'Productivity', tool: 'M365 Copilot or Google AI', cost: '$20–30/user' },
      { need: 'AI assistant', tool: 'ChatGPT Team or Claude Team', cost: '$25/user' },
      { need: 'AI coworker', tool: 'Viktor', cost: '$50+/mo' },
      { need: 'Support', tool: 'Zendesk AI or Intercom Fin', cost: '$19+/agent' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  HELPER COMPONENTS                                                  */
/* ------------------------------------------------------------------ */

function SectionHeader({
  icon: Icon,
  title,
  description,
  id,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-violet-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h2>
      </div>
      <p className="text-surface-300 max-w-3xl">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function AIGuideResourcesPage() {
  return (
    <div className="py-16">
      <div className="section-container space-y-20">
        {/* Hero */}
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <BookOpen className="w-4 h-4" />
            <Link href="/resources" className="hover:text-brand-400 transition-colors">
              Book Resources
            </Link>
            <span>/</span>
            <span>AI Platform Guide</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="gradient-text">AI Platform Guide</span>
            <br />
            <span className="text-white text-2xl sm:text-3xl mt-2 block">2026 Companion Resources</span>
          </h1>
          <p className="text-lg text-surface-300 leading-relaxed">
            AI platforms ship updates weekly, change pricing monthly, and launch entirely new
            products quarterly. This companion page keeps all 153 platform URLs, pricing tiers,
            and recommended stacks current so the book stays accurate.
          </p>
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Last verified: {LAST_UPDATED}</span>
          </div>
        </div>

        {/* Quick Nav */}
        <nav className="card p-6 space-y-4" aria-label="Page sections">
          <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">Jump to Section</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: 'directory', label: 'Platform Directory', icon: Globe },
              { id: 'stacks', label: 'Recommended Stacks', icon: Layers },
              { id: 'pricing', label: 'Pricing Overview', icon: DollarSign },
              { id: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50 hover:border-surface-600 transition-all group"
              >
                <item.icon className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span className="text-sm text-surface-200 group-hover:text-white transition-colors">{item.label}</span>
              </a>
            ))}
          </div>
          {/* Category sub-nav */}
          <div className="pt-3 border-t border-surface-800">
            <p className="text-xs text-surface-500 mb-2">Platform Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.id}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-surface-800/60 text-surface-300 border border-surface-700/50 hover:border-violet-500/40 hover:text-white transition-all"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Section 1: Platform Directory */}
        <section className="space-y-12">
          <SectionHeader
            icon={Globe}
            title="Platform Directory"
            description="All 153 platforms from the book, organized by category. Each entry includes the live URL, parent company, free tier availability, and starting price."
            id="directory"
          />

          {categories.map((category) => (
            <div key={category.id} id={`cat-${category.id}`} className="scroll-mt-24 space-y-4">
              <h3 className="text-xl font-bold text-white border-b border-surface-800 pb-3">
                {category.name}
                <span className="text-sm font-normal text-surface-400 ml-3">
                  {category.platforms.length} platforms
                </span>
              </h3>
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-surface-700 bg-surface-900/40">
                        <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Platform</th>
                        <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">URL</th>
                        <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Company</th>
                        <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs text-center">Free?</th>
                        <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Paid From</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-800">
                      {category.platforms.map((p) => (
                        <tr key={p.name} className="hover:bg-surface-800/40 transition-colors">
                          <td className="py-3 px-4 text-white font-medium">{p.name}</td>
                          <td className="py-3 px-4">
                            <a
                              href={`https://${p.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-400 hover:text-brand-300 transition-colors text-xs font-mono inline-flex items-center gap-1"
                            >
                              {p.url}
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </td>
                          <td className="py-3 px-4 text-surface-300">{p.company}</td>
                          <td className="py-3 px-4 text-center">
                            {p.free ? (
                              <span className="text-green-400 text-xs font-semibold">✓</span>
                            ) : (
                              <span className="text-surface-500 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-surface-300 font-mono text-xs">{p.paidFrom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Section 2: Recommended Stacks */}
        <section className="space-y-10" id="stacks">
          <SectionHeader
            icon={Layers}
            title="Recommended Stacks"
            description="Pre-built tool combinations for different budgets and use cases. Start with the Starter Stack and upgrade as your needs grow."
            id="stacks"
          />

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {stacks.map((stack) => (
              <div key={stack.name} className="card p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">{stack.name}</h3>
                  <p className="text-sm text-violet-400 font-mono mt-1">{stack.range}</p>
                </div>
                <div className="space-y-3">
                  {stack.items.map((item) => (
                    <div key={item.need} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-surface-400 uppercase tracking-wider">{item.need}</p>
                        <p className="text-sm text-white font-medium">{item.tool}</p>
                      </div>
                      <span className="text-xs text-surface-300 font-mono whitespace-nowrap flex-shrink-0 mt-3">
                        {item.cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Pricing Overview */}
        <section className="space-y-8">
          <SectionHeader
            icon={DollarSign}
            title="Pricing Overview"
            description="Quick stats across all 153 platforms. Use the directory above for per-platform details."
            id="pricing"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Platforms Tracked', value: '153', sub: 'Across 14 categories' },
              { label: 'Offer Free Tier', value: `${categories.reduce((acc, c) => acc + c.platforms.filter((p) => p.free).length, 0)}`, sub: 'Of 153 platforms' },
              { label: 'Cheapest Paid Plan', value: '$2.99/mo', sub: 'Boomy (music)' },
              { label: 'Prices Verified', value: LAST_UPDATED, sub: 'Updated regularly' },
            ].map((stat) => (
              <div key={stat.label} className="card p-5 text-center space-y-1">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm font-medium text-surface-200">{stat.label}</p>
                <p className="text-xs text-surface-400">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section id="disclaimer" className="scroll-mt-24">
          <div className="card p-6 border-yellow-500/20 bg-yellow-500/5">
            <div className="flex gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white">Important Disclaimer</h2>
                <div className="text-sm text-surface-300 space-y-2">
                  <p>
                    AI platform pricing, features, and availability change frequently — sometimes
                    weekly. Prices shown were verified as of {LAST_UPDATED}. Always check the
                    platform&apos;s website for the most current pricing before subscribing.
                  </p>
                  <p>
                    Free tiers may have usage limits, feature restrictions, or data-handling policies
                    that differ from paid plans. Review each platform&apos;s terms of service and privacy
                    policy before uploading sensitive business data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-extrabold text-white">
            Want the full breakdown?
          </h2>
          <p className="text-surface-300 max-w-xl mx-auto">
            This page covers pricing and URLs. The book covers strategy — how to evaluate
            platforms, build your stack, avoid vendor lock-in, and implement AI without
            disrupting your workflow.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/books" className="btn-primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Get the Book
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/resources" className="btn-secondary">
              ← All Book Resources
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
