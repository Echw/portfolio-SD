export interface ExperienceProject {
  id: string;
  title: string;
  context: string;
  paragraphs: string[];
  references: { label: string; url: string }[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  arrangement?: string;
  summary?: string;
  description: string;
  overview: string;
  contributions?: string[];
  /** These describe the whole role, not each selected project. */
  technologies: string[];
  projects?: ExperienceProject[];
}

export const experienceHref = (id: string) => `/experience/${id}/`;

/** English copy from portfolio.md, 13 November 2026.
 * Project-specific contributions are consolidated into the selected work sections.
 * Order is shared by the homepage timeline and the generated routes.
 */
export const experience: Experience[] = [
  {
    id: 'flyps',
    company: 'Flyps',
    role: 'Senior Full-Stack Developer',
    period: 'Nov 2025–Present',
    summary: 'AI features and developer tools.',
    description: 'My work at Flyps: SaaS features, AI assistant integrations, developer tools, authentication and end-to-end testing.',
    overview: 'I build SaaS features across the interface, APIs and integrations, with recent work focused on AI assistants and developer tools. My work includes connecting assistants to external services, handling access and sessions, and giving users control over actions performed by AI.',
    contributions: [
      'Developed integrations through APIs and MCP to connect AI assistants with application data and external services.',
      'Built and maintained editor and browser extensions and CLI plugins, including installation, updates and automated releases.',
      'Worked on authentication, access control and session handling, including user approval of AI actions.',
      'Worked on document retrieval and evaluated the accuracy and completeness of AI-generated results.',
      'Expanded end-to-end coverage of key user flows and added CI checks to catch regressions before release.',
    ],
    technologies: ['TypeScript', 'React', 'Next.js', 'Node.js', 'MCP', 'Vercel AI SDK', 'Playwright'],
  },
  {
    id: 'thebrain',
    company: 'TheBrain Software House',
    role: 'Senior Full-Stack Developer',
    period: 'May 2025–Oct 2025',
    summary: 'Interactive learning with AI.',
    description: 'My work at TheBrain Software House: reading and learning applications, interfaces, APIs and AI assistance grounded in books and lesson steps.',
    overview: 'I worked on reading and learning applications, developing interfaces and APIs alongside AI features grounded in the content a person was using.',
    contributions: [
      'Developed an interactive book reader and its API, including a feature for asking AI questions about the book.',
      "Built interactive maths lessons with an AI assistant that answered questions in the context of the student's current lesson step.",
      'Worked across application interfaces and backend integration to connect the learning experience with model responses.',
    ],
    technologies: ['TypeScript', 'React', 'tRPC', 'OpenAI API', 'Phaser', 'Monaco Editor'],
  },
  {
    id: 'xolvio',
    company: 'Xolv.io',
    role: 'Full-Stack Developer',
    period: 'Jul 2021–Apr 2025',
    summary: '2K websites and browser-to-hardware tooling.',
    description: 'My contribution at Xolv.io to 2K publishing tools and Hatch Lighting’s Foundation Programming Portal, from shared components to browser-to-hardware integration.',
    overview: 'I worked on publishing tools for 2K and a browser-based platform for programming electronic boards. My responsibilities ranged from shared UI components and backend services to direct client collaboration, launch support and project handover.',
    contributions: [
      'Built a service connecting 2K player data with Zendesk for ticket tagging and routing.',
      'Worked directly with clients on requirements, design discussions, demos, launches and urgent fixes.',
    ],
    technologies: ['TypeScript', 'React', 'Vue.js', 'Node.js', 'GraphQL', 'AWS CDK/Lambda', 'Contentful', 'Web Serial', 'WebUSB'],
    projects: [
      {
        id: '2k',
        title: '2K: publishing tools across game websites',
        context: 'Team project at Xolv.io',
        paragraphs: [
          'As part of the core team working for 2K, I contributed to more than 80 shared components and the styling of more than 15 game websites, including NBA 2K, Borderlands and Civilization.',
          'I built the admin interface and extended its backend so the marketing team could manage content, roll back changes and schedule website releases. I also added visual regression tests to CI to catch unintended changes across game websites before publication.',
        ],
        references: [{ label: "Xolvio's 2K case study", url: 'https://www.xolv.io/case-studies/2k-games' }],
      },
      {
        id: 'hatch-lighting',
        title: 'Hatch Lighting: Foundation Programming Portal',
        context: 'Client project at Xolv.io',
        paragraphs: [
          'I led development of the Foundation Programming Portal for Hatch Lighting, from the initial concept to handover. It lets users program and configure Foundation Series LED drivers directly in the browser, connecting the web application to hardware through Web Serial and WebUSB.',
          "The portal supports setting output current and dimming parameters, saving programming profiles and keeping records of programming sessions. My work brought together the application interface, hardware communication and cloud infrastructure in a tool built for a manufacturer's programming workflow.",
        ],
        references: [
          { label: 'Foundation Programming Portal', url: 'https://foundation.hatchlighting.com/' },
          { label: "Hatch Lighting's Foundation Series", url: 'https://www.hatchlighting.com/our-products/led-drivers/constant-current-led-drivers/foundation-series-programmable-constant-current-led-drivers/' },
        ],
      },
    ],
  },
  {
    id: 'leaderna',
    company: 'Leaderna Platform',
    role: 'Full-Stack Developer',
    period: 'Oct 2022–May 2023',
    arrangement: 'Part-time alongside Xolv.io',
    description: 'My part-time contribution to Leaderna Platform: application features, research task-dependency visualisations and a drag-and-drop timeline for pharma and biotech teams.',
    overview: 'I built a substantial part of Leaderna Platform, an R&D project and portfolio management application for pharma and biotech teams. My work included interactive views for exploring research plans, task dependencies and timelines, alongside broader feature development across the application.',
    contributions: [
      'Built visualisations of task dependencies using React and D3.js.',
      'Helped design and implement a drag-and-drop timeline as an alternative to a conventional Gantt chart.',
      'Contributed features and fixes to the TypeScript and GraphQL application as part of the product team.',
    ],
    technologies: ['TypeScript', 'React', 'D3.js', 'GraphQL', 'MongoDB', 'Auth0'],
    projects: [
      {
        id: 'visual-planning',
        title: 'Leaderna: visual planning for research teams',
        context: 'Team project at Leaderna Platform',
        paragraphs: ['This work turned complex research plans into an interactive interface. My contribution spanned the planning views and broader application features as part of the product team.'],
        references: [{ label: 'Leaderna Platform', url: 'https://www.leadernaplatform.com/' }],
      },
    ],
  },
  {
    id: 'eleader',
    company: 'eLeader',
    role: 'Junior Software Developer',
    period: 'Jan 2020–May 2021',
    description: 'My work at eLeader: developing an application for field sales representatives and collaborating with marketing and design on the company website.',
    overview: "I developed and maintained an application supporting field sales representatives. I also worked with the marketing and design teams on the company's main website, combining application development with work on its public-facing presence.",
    technologies: ['C#', '.NET', 'JavaScript', 'T-SQL', 'WordPress', 'PHP'],
  },
  {
    id: 'plum',
    company: 'PLUM',
    role: 'Intern / Junior Developer',
    period: 'Jul 2018–Jun 2019',
    description: 'My work at PLUM: STM32 embedded development and an independently built C# WPF application for testing heating and ventilation units.',
    overview: 'I started in embedded development, programming STM32 microcontrollers and testing device functionality. I later independently built a C# WPF application for testing heating and ventilation units, taking it from concept to deployment.',
    contributions: [
      'Developed controller and display modules for heating equipment.',
      'Programmed microcontrollers and their peripherals, tested new functionality and wrote developer documentation.',
      'Built a desktop application to support device testing.',
    ],
    technologies: ['C', 'C++', 'STM32', 'C#', '.NET', 'WPF'],
  },
];
