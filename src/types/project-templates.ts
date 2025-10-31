export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: string;
  prompts: TemplatePrompt[];
}

export interface TemplatePrompt {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name as string
  category: string;
  estimatedTime: string;
  order: number;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'business-plan',
    name: 'Business Plan',
    description: 'Create a comprehensive business plan with market analysis, financial projections, and strategic planning',
    category: 'Business',
    estimatedDuration: '4-6 hours',
    prompts: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        description: 'Craft a compelling overview of your business concept, mission, and key success factors',
        icon: 'FileText',
        category: 'Overview',
        estimatedTime: '30-45 min',
        order: 1
      },
      {
        id: 'market-analysis',
        title: 'Market Analysis',
        description: 'Research your target market, analyze competitors, and identify market opportunities',
        icon: 'TrendingUp',
        category: 'Research',
        estimatedTime: '60-90 min',
        order: 2
      },
      {
        id: 'business-model',
        title: 'Business Model',
        description: 'Define your revenue streams, cost structure, and value proposition',
        icon: 'Building2',
        category: 'Strategy',
        estimatedTime: '45-60 min',
        order: 3
      },
      {
        id: 'marketing-strategy',
        title: 'Marketing Strategy',
        description: 'Develop your brand positioning, customer acquisition, and marketing channels',
        icon: 'Megaphone',
        category: 'Marketing',
        estimatedTime: '45-60 min',
        order: 4
      },
      {
        id: 'operations-plan',
        title: 'Operations Plan',
        description: 'Outline your operational processes, supply chain, and day-to-day management',
        icon: 'Settings',
        category: 'Operations',
        estimatedTime: '30-45 min',
        order: 5
      },
      {
        id: 'management-team',
        title: 'Management Team',
        description: 'Introduce key team members, their roles, and organizational structure',
        icon: 'Users',
        category: 'Team',
        estimatedTime: '20-30 min',
        order: 6
      },
      {
        id: 'financial-projections',
        title: 'Financial Projections',
        description: 'Create revenue forecasts, expense budgets, and break-even analysis',
        icon: 'Calculator',
        category: 'Finance',
        estimatedTime: '60-90 min',
        order: 7
      },
      {
        id: 'funding-request',
        title: 'Funding Request',
        description: 'Specify funding needs, use of funds, and repayment terms',
        icon: 'DollarSign',
        category: 'Finance',
        estimatedTime: '30-45 min',
        order: 8
      },
      {
        id: 'risk-analysis',
        title: 'Risk Analysis',
        description: 'Identify potential risks, mitigation strategies, and contingency plans',
        icon: 'Shield',
        category: 'Planning',
        estimatedTime: '30-45 min',
        order: 9
      }
    ]
  },
  {
    id: 'creative-writing',
    name: 'Creative Writing',
    description: 'Develop compelling stories with rich characters, immersive worlds, and engaging plots',
    category: 'Writing',
    estimatedDuration: '3-5 hours',
    prompts: [
      {
        id: 'character-development',
        title: 'Character Development',
        description: 'Dive deep into character backstories, motivations, and growth arcs',
        icon: 'Users',
        category: 'Characters',
        estimatedTime: '30-45 min',
        order: 1
      },
      {
        id: 'world-building',
        title: 'World Building',
        description: 'Create rich, detailed environments and settings for your story',
        icon: 'Globe',
        category: 'Setting',
        estimatedTime: '45-60 min',
        order: 2
      },
      {
        id: 'plot-structure',
        title: 'Plot Structure',
        description: 'Outline key story beats, conflicts, and narrative progression',
        icon: 'GitBranch',
        category: 'Structure',
        estimatedTime: '20-30 min',
        order: 3
      },
      {
        id: 'dialogue-voice',
        title: 'Dialogue & Voice',
        description: 'Develop authentic character voices and compelling dialogue',
        icon: 'MessageCircle',
        category: 'Style',
        estimatedTime: '30-45 min',
        order: 4
      },
      {
        id: 'themes-symbols',
        title: 'Themes & Symbols',
        description: 'Explore deeper meanings, motifs, and symbolic elements',
        icon: 'Lightbulb',
        category: 'Depth',
        estimatedTime: '25-35 min',
        order: 5
      },
      {
        id: 'pacing-tension',
        title: 'Pacing & Tension',
        description: 'Manage story rhythm, build suspense, and maintain reader engagement',
        icon: 'Zap',
        category: 'Flow',
        estimatedTime: '30-40 min',
        order: 6
      },
      {
        id: 'research-authenticity',
        title: 'Research & Authenticity',
        description: 'Gather background information and ensure story credibility',
        icon: 'BookOpen',
        category: 'Research',
        estimatedTime: '45-60 min',
        order: 7
      },
      {
        id: 'opening-hooks',
        title: 'Opening Hooks',
        description: 'Craft compelling beginnings that draw readers in immediately',
        icon: 'Play',
        category: 'Craft',
        estimatedTime: '20-30 min',
        order: 8
      },
      {
        id: 'revision-editing',
        title: 'Revision & Editing',
        description: 'Refine prose, strengthen weak points, and polish your work',
        icon: 'Edit3',
        category: 'Polish',
        estimatedTime: '60+ min',
        order: 9
      }
    ]
  },
  {
    id: 'research-project',
    name: 'Research Project',
    description: 'Comprehensive research project template with structured methodology, data collection, and analysis framework',
    category: 'Academic',
    estimatedDuration: '3-12 months',
    prompts: [
      // 1. Project Overview
      {
        id: 'research-question-hypothesis',
        title: 'Research Question/Hypothesis',
        description: 'Define your primary research question, hypothesis, and justify its importance',
        icon: 'HelpCircle',
        category: 'Project Overview',
        estimatedTime: '45-60 min',
        order: 1
      },
      {
        id: 'background-context',
        title: 'Background & Context',
        description: 'Establish the knowledge foundation and identify gaps that led to your research question',
        icon: 'BookOpen',
        category: 'Project Overview',
        estimatedTime: '60-90 min',
        order: 2
      },
      {
        id: 'objectives-goals',
        title: 'Objectives & Goals',
        description: 'Specify research objectives, success criteria, and project scope',
        icon: 'Target',
        category: 'Project Overview',
        estimatedTime: '30-45 min',
        order: 3
      },
      
      // 2. Literature Review
      {
        id: 'key-sources',
        title: 'Key Sources',
        description: 'Identify and analyze foundational papers, books, and leading researchers in your field',
        icon: 'BookMarked',
        category: 'Literature Review',
        estimatedTime: '90-120 min',
        order: 4
      },
      {
        id: 'theoretical-frameworks',
        title: 'Theoretical Frameworks',
        description: 'Map relevant theories and select your primary analytical framework',
        icon: 'Network',
        category: 'Literature Review',
        estimatedTime: '60-90 min',
        order: 5
      },
      {
        id: 'research-gaps',
        title: 'Research Gaps',
        description: 'Identify unstudied areas, contradictions, and new angles to explore',
        icon: 'Search',
        category: 'Literature Review',
        estimatedTime: '45-60 min',
        order: 6
      },
      
      // 3. Methodology
      {
        id: 'research-design',
        title: 'Research Design',
        description: 'Choose and justify your overall research approach and design',
        icon: 'Layout',
        category: 'Methodology',
        estimatedTime: '60-90 min',
        order: 7
      },
      {
        id: 'data-collection-methods',
        title: 'Data Collection Methods',
        description: 'Define data collection methods, tools, sampling strategy, and sample size',
        icon: 'Database',
        category: 'Methodology',
        estimatedTime: '75-90 min',
        order: 8
      },
      {
        id: 'data-analysis-plan',
        title: 'Data Analysis Plan',
        description: 'Plan analytical techniques, tools, coding strategies, and statistical tests',
        icon: 'BarChart3',
        category: 'Methodology',
        estimatedTime: '60-75 min',
        order: 9
      },
      {
        id: 'ethics-compliance',
        title: 'Ethics & Compliance',
        description: 'Address ethical considerations, IRB approval, consent, and risk mitigation',
        icon: 'Shield',
        category: 'Methodology',
        estimatedTime: '45-60 min',
        order: 10
      },
      
      // 4. Participants/Subjects/Samples
      {
        id: 'population-sampling',
        title: 'Population & Sampling',
        description: 'Define target population, criteria, recruitment strategy, and sample size',
        icon: 'Users',
        category: 'Participants/Subjects/Samples',
        estimatedTime: '45-60 min',
        order: 11
      },
      {
        id: 'participant-profiles',
        title: 'Participant Profiles',
        description: 'Create individual profiles for each participant with demographics and consent status',
        icon: 'UserCheck',
        category: 'Participants/Subjects/Samples',
        estimatedTime: '15-30 min per participant',
        order: 12
      },
      
      // 5. Data & Findings
      {
        id: 'raw-data-organization',
        title: 'Raw Data Organization',
        description: 'Establish data storage, naming conventions, backup strategy, and file formats',
        icon: 'FolderOpen',
        category: 'Data & Findings',
        estimatedTime: '30-45 min',
        order: 13
      },
      {
        id: 'preliminary-findings',
        title: 'Preliminary Findings',
        description: 'Document emerging patterns, unexpected results, and initial themes',
        icon: 'Eye',
        category: 'Data & Findings',
        estimatedTime: '60-90 min',
        order: 14
      },
      {
        id: 'key-results',
        title: 'Key Results',
        description: 'Document specific findings with evidence and confidence levels',
        icon: 'Award',
        category: 'Data & Findings',
        estimatedTime: '45-75 min per result',
        order: 15
      },
      
      // 6. Analysis & Interpretation
      {
        id: 'theme-pattern-analysis',
        title: 'Theme/Pattern Analysis',
        description: 'Analyze themes and patterns with supporting evidence and examples',
        icon: 'Puzzle',
        category: 'Analysis & Interpretation',
        estimatedTime: '60-90 min per theme',
        order: 16
      },
      {
        id: 'connections-to-literature',
        title: 'Connections to Literature',
        description: 'Compare findings to existing research and identify novel contributions',
        icon: 'Link',
        category: 'Analysis & Interpretation',
        estimatedTime: '75-90 min',
        order: 17
      },
      {
        id: 'alternative-interpretations',
        title: 'Alternative Interpretations',
        description: 'Explore different interpretations, biases, and rival hypotheses',
        icon: 'GitBranch',
        category: 'Analysis & Interpretation',
        estimatedTime: '45-60 min',
        order: 18
      },
      
      // 7. Timeline & Milestones
      {
        id: 'project-schedule',
        title: 'Project Schedule',
        description: 'Define milestones, deadlines, dependencies, and project phases',
        icon: 'Calendar',
        category: 'Timeline & Milestones',
        estimatedTime: '30-45 min',
        order: 19
      },
      {
        id: 'progress-tracking',
        title: 'Progress Tracking',
        description: 'Monitor task completion, current progress, delays, and timeline adjustments',
        icon: 'CheckSquare',
        category: 'Timeline & Milestones',
        estimatedTime: '15-30 min weekly',
        order: 20
      },
      
      // 8. Resources & Budget
      {
        id: 'funding-sources',
        title: 'Funding Sources',
        description: 'Document grants, funding terms, restrictions, and reporting requirements',
        icon: 'DollarSign',
        category: 'Resources & Budget',
        estimatedTime: '30-45 min',
        order: 21
      },
      {
        id: 'budget-allocation',
        title: 'Budget Allocation',
        description: 'Plan spending for equipment, compensation, software, and travel',
        icon: 'PieChart',
        category: 'Resources & Budget',
        estimatedTime: '45-60 min',
        order: 22
      },
      {
        id: 'equipment-tools',
        title: 'Equipment & Tools',
        description: 'List required equipment, software licenses, and facility access needs',
        icon: 'Wrench',
        category: 'Resources & Budget',
        estimatedTime: '30-45 min',
        order: 23
      },
      
      // 9. Collaboration & Team
      {
        id: 'team-members',
        title: 'Team Members',
        description: 'Document team roles, responsibilities, expertise, and contact information',
        icon: 'Users2',
        category: 'Collaboration & Team',
        estimatedTime: '20-30 min',
        order: 24
      },
      {
        id: 'advisors-consultants',
        title: 'Advisors & Consultants',
        description: 'Identify advisors, their expertise, meeting schedules, and consultation needs',
        icon: 'GraduationCap',
        category: 'Collaboration & Team',
        estimatedTime: '20-30 min',
        order: 25
      },
      {
        id: 'collaboration-agreements',
        title: 'Collaboration Agreements',
        description: 'Define authorship agreements, credit sharing, and data sharing protocols',
        icon: 'Handshake',
        category: 'Collaboration & Team',
        estimatedTime: '30-45 min',
        order: 26
      },
      
      // 10. Dissemination & Impact
      {
        id: 'publications-plan',
        title: 'Publications Plan',
        description: 'Plan journal submissions, conference presentations, and authorship order',
        icon: 'FileText',
        category: 'Dissemination & Impact',
        estimatedTime: '45-60 min',
        order: 27
      },
      {
        id: 'presentations',
        title: 'Presentations',
        description: 'Plan conference presentations, formats, key messages, and timelines',
        icon: 'Presentation',
        category: 'Dissemination & Impact',
        estimatedTime: '30-45 min',
        order: 28
      },
      {
        id: 'public-engagement',
        title: 'Public Engagement',
        description: 'Develop strategies for sharing findings with broader audiences',
        icon: 'Megaphone',
        category: 'Dissemination & Impact',
        estimatedTime: '30-45 min',
        order: 29
      },
      
      // 11. Challenges & Solutions
      {
        id: 'problems-encountered',
        title: 'Problems Encountered',
        description: 'Document challenges faced, their impact, solutions, and lessons learned',
        icon: 'AlertTriangle',
        category: 'Challenges & Solutions',
        estimatedTime: '30-45 min',
        order: 30
      },
      {
        id: 'limitations',
        title: 'Limitations',
        description: 'Acknowledge study limitations and their effect on conclusions',
        icon: 'Info',
        category: 'Challenges & Solutions',
        estimatedTime: '30-45 min',
        order: 31
      },
      
      // 12. References & Resources
      {
        id: 'bibliography',
        title: 'Bibliography',
        description: 'Maintain organized citations with relevance notes and categories',
        icon: 'Library',
        category: 'References & Resources',
        estimatedTime: 'Ongoing',
        order: 32
      },
      {
        id: 'useful-resources',
        title: 'Useful Resources',
        description: 'Compile links to datasets, tools, expert contacts, and databases',
        icon: 'ExternalLink',
        category: 'References & Resources',
        estimatedTime: '30-45 min',
        order: 33
      }
    ]
  },
  // Resume / CV
  {
    id: 'resume-cv',
    name: 'Resume / CV',
    description: 'A professional resume or curriculum vitae.',
    category: 'Professional',
    estimatedDuration: '1-2 hours',
    prompts: [
      { id: 'professional-summary', title: 'Professional Summary', description: 'Summarize your experience and goals.', icon: 'User', category: 'Overview', estimatedTime: '10-15 min', order: 1 },
      { id: 'work-experience', title: 'Work Experience', description: 'List your jobs and key achievements.', icon: 'Briefcase', category: 'Experience', estimatedTime: '20-30 min', order: 2 },
      { id: 'education', title: 'Education', description: 'List your degrees and certifications.', icon: 'Book', category: 'Education', estimatedTime: '10-15 min', order: 3 },
      { id: 'skills', title: 'Skills', description: 'Highlight your top skills.', icon: 'Star', category: 'Skills', estimatedTime: '10-15 min', order: 4 },
      { id: 'projects', title: 'Projects', description: 'Describe relevant projects or accomplishments.', icon: 'Folder', category: 'Projects', estimatedTime: '15-20 min', order: 5 },
      { id: 'references', title: 'References', description: 'List people who can vouch for you.', icon: 'Users', category: 'References', estimatedTime: '5-10 min', order: 6 }
    ]
  },
  // Portfolio
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Showcase your creative or professional work.',
    category: 'Professional',
    estimatedDuration: '2-4 hours',
    prompts: [
      { id: 'about-me', title: 'About Me', description: 'Write a short bio introducing yourself.', icon: 'User', category: 'Overview', estimatedTime: '10-15 min', order: 1 },
      { id: 'project-showcase', title: 'Project Showcase', description: 'Describe a project and your role in it.', icon: 'FolderOpen', category: 'Projects', estimatedTime: '20-30 min', order: 2 },
      { id: 'skills-tools', title: 'Skills & Tools', description: 'List your key skills and tools you use.', icon: 'Tool', category: 'Skills', estimatedTime: '10-15 min', order: 3 },
      { id: 'testimonials', title: 'Testimonials', description: 'Share feedback from clients or collaborators.', icon: 'MessageCircle', category: 'Feedback', estimatedTime: '10-15 min', order: 4 },
      { id: 'contact-info', title: 'Contact Info', description: 'How can people reach you?', icon: 'Mail', category: 'Contact', estimatedTime: '5-10 min', order: 5 }
    ]
  },
  // Marketing Plan
  {
    id: 'marketing-plan',
    name: 'Marketing Plan',
    description: 'A plan for marketing your product or service.',
    category: 'Business',
    estimatedDuration: '2-3 hours',
    prompts: [
      { id: 'market-overview', title: 'Market Overview', description: 'Describe your market and audience.', icon: 'Globe', category: 'Overview', estimatedTime: '15-20 min', order: 1 },
      { id: 'swot-analysis', title: 'SWOT Analysis', description: 'List your strengths, weaknesses, opportunities, threats.', icon: 'BarChart2', category: 'Analysis', estimatedTime: '20-30 min', order: 2 },
      { id: 'marketing-goals', title: 'Marketing Goals', description: 'What are your main objectives?', icon: 'Target', category: 'Goals', estimatedTime: '10-15 min', order: 3 },
      { id: 'strategies-tactics', title: 'Strategies & Tactics', description: 'How will you achieve your goals?', icon: 'ListChecks', category: 'Strategy', estimatedTime: '20-30 min', order: 4 },
      { id: 'budget', title: 'Budget', description: 'What is your marketing budget?', icon: 'DollarSign', category: 'Finance', estimatedTime: '10-15 min', order: 5 },
      { id: 'metrics', title: 'Metrics', description: 'How will you measure success?', icon: 'BarChart', category: 'Analysis', estimatedTime: '10-15 min', order: 6 }
    ]
  },
  // Event Plan
  {
    id: 'event-plan',
    name: 'Event Plan',
    description: 'A plan for organizing and running an event.',
    category: 'Planning',
    estimatedDuration: '2-4 hours',
    prompts: [
      { id: 'event-overview', title: 'Event Overview', description: 'What is the purpose of your event?', icon: 'Calendar', category: 'Overview', estimatedTime: '10-15 min', order: 1 },
      { id: 'agenda', title: 'Agenda', description: 'Outline the schedule and activities.', icon: 'Clock', category: 'Schedule', estimatedTime: '15-20 min', order: 2 },
      { id: 'event-budget', title: 'Budget', description: 'Estimate costs and funding sources.', icon: 'DollarSign', category: 'Finance', estimatedTime: '10-15 min', order: 3 },
      { id: 'logistics', title: 'Logistics', description: 'What are the venue, date, and resources needed?', icon: 'MapPin', category: 'Logistics', estimatedTime: '10-15 min', order: 4 },
      { id: 'promotion', title: 'Promotion', description: 'How will you publicize the event?', icon: 'Megaphone', category: 'Marketing', estimatedTime: '10-15 min', order: 5 },
      { id: 'post-event-review', title: 'Post-Event Review', description: 'How will you evaluate success?', icon: 'CheckCircle', category: 'Review', estimatedTime: '10-15 min', order: 6 }
    ]
  },
  // Goal Tracker / Vision Board
  {
    id: 'goal-tracker',
    name: 'Personal Goal Tracker / Vision Board',
    description: 'Track your goals and visualize your progress.',
    category: 'Personal',
    estimatedDuration: 'Ongoing',
    prompts: [
      { id: 'vision-statement', title: 'Vision Statement', description: 'Describe your ideal future or main goal.', icon: 'Eye', category: 'Vision', estimatedTime: '10-15 min', order: 1 },
      { id: 'goal-breakdown', title: 'Goal Breakdown', description: 'List your goals and break them into steps.', icon: 'List', category: 'Goals', estimatedTime: '10-15 min', order: 2 },
      { id: 'progress-log', title: 'Progress Log', description: 'Track your progress and milestones.', icon: 'TrendingUp', category: 'Progress', estimatedTime: 'Ongoing', order: 3 },
      { id: 'motivation-board', title: 'Motivation Board', description: 'Add quotes, images, or reasons for your goals.', icon: 'Heart', category: 'Motivation', estimatedTime: 'Ongoing', order: 4 }
    ]
  },
  // Travel Itinerary / Trip Planner
  {
    id: 'travel-itinerary',
    name: 'Travel Itinerary / Trip Planner',
    description: 'Plan your travel and organize your trip details.',
    category: 'Personal',
    estimatedDuration: '1-2 hours',
    prompts: [
      { id: 'trip-overview', title: 'Trip Overview', description: 'Where are you going and why?', icon: 'Map', category: 'Overview', estimatedTime: '10-15 min', order: 1 },
      { id: 'daily-schedule', title: 'Daily Schedule', description: 'Plan each day’s activities.', icon: 'CalendarDays', category: 'Schedule', estimatedTime: '10-15 min', order: 2 },
      { id: 'packing-list', title: 'Packing List', description: 'What do you need to bring?', icon: 'Package', category: 'Preparation', estimatedTime: '10-15 min', order: 3 },
      { id: 'travel-budget', title: 'Budget', description: 'Estimate travel costs.', icon: 'DollarSign', category: 'Finance', estimatedTime: '10-15 min', order: 4 },
      { id: 'emergency-info', title: 'Emergency Info', description: 'List important contacts and info.', icon: 'AlertCircle', category: 'Safety', estimatedTime: '5-10 min', order: 5 }
    ]
  },
  // Project Management / Task Tracker
  {
    id: 'project-management',
    name: 'Project Management / Task Tracker',
    description: 'Organize your project tasks and progress.',
    category: 'Business',
    estimatedDuration: 'Ongoing',
    prompts: [
      { id: 'project-overview', title: 'Project Overview', description: 'What is the project and its main goal?', icon: 'ClipboardList', category: 'Overview', estimatedTime: '10-15 min', order: 1 },
      { id: 'task-list', title: 'Task List', description: 'List all tasks and assign owners.', icon: 'ListTodo', category: 'Tasks', estimatedTime: 'Ongoing', order: 2 },
      { id: 'timeline', title: 'Timeline', description: 'What are the deadlines and milestones?', icon: 'Calendar', category: 'Timeline', estimatedTime: '10-15 min', order: 3 },
      { id: 'resources', title: 'Resources', description: 'What resources or tools are needed?', icon: 'Box', category: 'Resources', estimatedTime: '10-15 min', order: 4 },
      { id: 'risk-assessment', title: 'Risk Assessment', description: 'What are potential risks and how will you address them?', icon: 'AlertTriangle', category: 'Planning', estimatedTime: '10-15 min', order: 5 },
      { id: 'progress-updates', title: 'Progress Updates', description: 'Log updates and blockers.', icon: 'RefreshCw', category: 'Progress', estimatedTime: 'Ongoing', order: 6 }
    ]
  }
];

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(template => template.id === id);
}

export function getTemplatesByCategory(category: string): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter(template => template.category === category);
}