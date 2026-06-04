import type {
  KnowledgeDocumentId,
  PortfolioKnowledgeDocument,
} from '../../src/lib/firebase/types';
import { requiredKnowledgeDocumentIds } from '../../src/lib/firebase/types';

export { requiredKnowledgeDocumentIds };

export const portfolioKnowledgeSeed: Record<
  KnowledgeDocumentId,
  PortfolioKnowledgeDocument
> = {
  global_context: {
    id: 'global_context',
    scene: 'Global',
    title: 'Danish Sharma Global Context',
    summary:
      'Danish Sharma is a final-semester Computer Engineering student at TIET who builds AI-native products, spatial interfaces, and practical automation systems with a strong bias toward shipping.',
    facts: [
      'Guide recruiters through the portfolio like a confident technical storyteller: start with the hub, then route them to projects, education, experience, or music based on the question.',
      'When the visitor asks about technical depth, direct them toward the Tech-Dorm and highlight AI systems, product engineering, and cross-stack execution.',
      'When the visitor asks about background, academics, or leadership, route them toward Education and explain how research and student responsibilities supported engineering growth.',
      'When the visitor asks about internships or real-world work, route them toward Experience Row and focus on ownership, applied delivery, and domain breadth.',
      'When the visitor asks about personal discipline or creative identity, route them toward the Music Studio and connect musical training to patience, performance, and craft.',
    ],
    navigationHints: [
      'Tech-Dorm covers projects, tools, and AI engineering.',
      'Education covers TIET, school performance, research, and leadership.',
      'Experience Row covers LivPal, Tel-Aviv University, and TFU internships.',
      'Music Studio covers bansuri, performance, and classical training.',
    ],
    audience: 'recruiters',
  },
  scene_tech_dorm: {
    id: 'scene_tech_dorm',
    scene: 'Tech-Dorm',
    title: 'Tech Dorm Knowledge Base',
    summary:
      'This scene covers Danish Sharma’s strongest technical portfolio signals: AI agents, full-stack product building, and the ability to move from prototype to usable system.',
    facts: [
      'Highlight Omni-Agent and similar work as proof that Danish can design agentic workflows, orchestrate tools, and think in systems rather than isolated scripts.',
      'Call out Python, Node.js, React Native, and React as practical tools Danish uses to build end-to-end experiences across backend logic, interfaces, and automation.',
      'Frame technical work around outcomes: faster workflows, cleaner developer experience, real user value, and experimentation grounded in execution rather than theory alone.',
      'When a recruiter asks what makes Danish different, emphasize AI-native product thinking, comfort across frontend and backend surfaces, and a strong instinct for shipping.',
    ],
    navigationHints: [
      'If the visitor wants internships, suggest moving to Experience Row next.',
      'If the visitor wants academic context behind the technical work, suggest Education next.',
    ],
    audience: 'recruiters',
  },
  scene_education: {
    id: 'scene_education',
    scene: 'Education',
    title: 'Education Knowledge Base',
    summary:
      'This scene explains the academic foundation behind Danish Sharma’s engineering work, including school performance, TIET studies, research curiosity, and leadership growth.',
    facts: [
      'Mention that Danish completed CBSE schooling with an 83 percent score and is completing a B.E. in Computer Engineering at TIET with a 7.4 CGPA.',
      'Reference the EV intrusion detection whiteboard concept as a sign of interest in applied research and security-minded engineering thinking.',
      'Connect academic work to consistency: Danish combines coursework, experimentation, leadership responsibilities, and self-driven project building instead of treating them as separate tracks.',
      'If the recruiter is evaluating growth potential, emphasize curiosity, range, and the ability to learn across theory, systems, and product delivery.',
    ],
    navigationHints: [
      'Send visitors to the Tech-Dorm for hands-on technical execution.',
      'Send visitors to Experience Row for applied internship proof.',
    ],
    audience: 'recruiters',
  },
  scene_experience: {
    id: 'scene_experience',
    scene: 'Experience Row',
    title: 'Experience Row Knowledge Base',
    summary:
      'This scene captures Danish Sharma’s internship and applied-experience track, giving recruiters a faster way to understand how he works in real teams and delivery contexts.',
    facts: [
      'Reference LivPal, Tel-Aviv University, and TFU as the three anchor experience points in the portfolio, each representing applied learning in professional or research-driven environments.',
      'Use this scene to show that Danish is not only a builder in isolation: he can contribute in structured environments, adapt to domain constraints, and translate ideas into shipped work.',
      'When the visitor asks about readiness for industry, stress ownership, initiative, and the ability to connect technical systems work with product or research objectives.',
      'If a recruiter asks for the strongest proof of maturity, connect internship experience with the self-driven projects from the Tech-Dorm to show both external validation and internal drive.',
    ],
    navigationHints: [
      'Route to Tech-Dorm for project-level technical details.',
      'Route to Education for academic context or research questions.',
    ],
    audience: 'recruiters',
  },
  scene_music_studio: {
    id: 'scene_music_studio',
    scene: 'Music Studio',
    title: 'Music Studio Knowledge Base',
    summary:
      'This scene shows the creative and disciplined side of Danish Sharma through classical music training, performance experience, and long-horizon craft.',
    facts: [
      'Mention the Sangeet Visharad degree as a marker of formal musical study and sustained commitment beyond engineering coursework.',
      'Reference the TEDx performance as evidence of stage comfort, communication presence, and the ability to perform under pressure.',
      'Call out discipleship under Ustaad Mujtaba Hussain to show respect for rigor, mentorship, and mastery built through repetition over time.',
      'If the visitor asks why music matters in a portfolio, explain that it reinforces patience, discipline, creative confidence, and composure that also show up in engineering work.',
    ],
    navigationHints: [
      'Route back to the hub when the visitor wants a broader summary.',
      'Route to Experience Row or Tech-Dorm when they want the career-facing proof next.',
    ],
    audience: 'recruiters',
  },
};
