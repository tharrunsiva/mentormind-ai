const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const {
  User,
  LearnerProfile,
  Skill,
  CareerPath,
  SkillAssessment,
  AssessmentResult,
  SkillGapReport,
  LearningRoadmap,
  RoadmapTask,
  LearningResource,
  PeerConnection,
  StudyGroup,
  MockInterview,
  InterviewQuestion,
  InterviewAnswer,
  ProgressRecord,
  Notification,
} = require('../models');

dotenv.config();

const skillsData = [
  // Frontend
  { name: 'JavaScript', category: 'Frontend', description: 'Core language of modern web browsers and interactive applications', tags: ['Web', 'Scripting', 'ES6+'], icon: 'bi-filetype-js' },
  { name: 'TypeScript', category: 'Frontend', description: 'Typed superset of JavaScript providing compile-time type safety', tags: ['Web', 'Typed', 'Frontend', 'Backend'], icon: 'bi-filetype-tsx' },
  { name: 'React.js', category: 'Frontend', description: 'Declarative component-based UI library for modern web apps', tags: ['SPA', 'UI', 'Components', 'Frontend'], icon: 'bi-code-square' },
  { name: 'HTML5 & CSS3', category: 'Frontend', description: 'Core semantic structuring and styling foundations of the web', tags: ['Web', 'Markup', 'Styling'], icon: 'bi-filetype-html' },
  { name: 'Bootstrap & Tailwind', category: 'Frontend', description: 'Responsive CSS frameworks for rapid UI composition', tags: ['CSS', 'Responsive', 'UI'], icon: 'bi-bootstrap' },
  { name: 'Next.js', category: 'Frontend', description: 'Production React framework featuring SSR, SSG, and API routes', tags: ['SSR', 'FullStack', 'React'], icon: 'bi-window-stack' },

  // Backend
  { name: 'Node.js', category: 'Backend', description: 'Asynchronous event-driven JavaScript runtime environment', tags: ['Server', 'Runtime', 'Backend'], icon: 'bi-hdd-network' },
  { name: 'Express.js', category: 'Backend', description: 'Fast, minimalist web application framework for Node.js', tags: ['REST API', 'Routing', 'Middleware'], icon: 'bi-signpost-split' },
  { name: 'Python', category: 'Backend', description: 'High-level general-purpose programming language for web, scripting, and AI', tags: ['General', 'Scripting', 'Backend', 'AI'], icon: 'bi-filetype-py' },
  { name: 'FastAPI', category: 'Backend', description: 'High-performance modern Python web framework based on ASGI and Pydantic', tags: ['Python', 'ASGI', 'Microservices'], icon: 'bi-lightning-charge' },
  { name: 'Java', category: 'Backend', description: 'Object-oriented enterprise language and runtime ecosystem', tags: ['Enterprise', 'OOP', 'Spring'], icon: 'bi-cup-hot' },
  { name: 'REST APIs', category: 'Backend', description: 'Architectural pattern for stateless client-server communication', tags: ['Architecture', 'HTTP', 'API'], icon: 'bi-arrow-left-right' },
  { name: 'GraphQL', category: 'Backend', description: 'Query language for APIs offering declarative data fetching', tags: ['API', 'Query', 'Backend'], icon: 'bi-diagram-3' },

  // Database
  { name: 'MongoDB', category: 'Database', description: 'Document-oriented NoSQL database for flexible JSON schemas', tags: ['NoSQL', 'Document', 'Mongoose'], icon: 'bi-database' },
  { name: 'PostgreSQL', category: 'Database', description: 'Powerful open-source relational database with advanced SQL capabilities', tags: ['SQL', 'Relational', 'ACID'], icon: 'bi-database-fill-check' },
  { name: 'Redis', category: 'Database', description: 'In-memory key-value data store used for caching and pub/sub', tags: ['Cache', 'In-Memory', 'NoSQL'], icon: 'bi-memory' },

  // DevOps & Cloud
  { name: 'Git & GitHub', category: 'DevOps', description: 'Distributed version control and collaborative code review platforms', tags: ['VCS', 'Collaboration', 'CI/CD'], icon: 'bi-git' },
  { name: 'Docker', category: 'DevOps', description: 'Containerization engine for isolating and deploying application packages', tags: ['Containers', 'DevOps', 'Microservices'], icon: 'bi-box-seam' },
  { name: 'Kubernetes', category: 'DevOps', description: 'Production-grade container orchestration and automated scaling platform', tags: ['Orchestration', 'Scaling', 'Cloud'], icon: 'bi-boxes' },
  { name: 'CI/CD Pipelines', category: 'DevOps', description: 'Automated continuous integration and continuous deployment workflows', tags: ['Automation', 'DevOps', 'GitHub Actions'], icon: 'bi-arrow-repeat' },
  { name: 'AWS Cloud', category: 'Cloud', description: 'Comprehensive cloud computing infrastructure platform (EC2, S3, Lambda)', tags: ['Cloud', 'Infrastructure', 'Hosting'], icon: 'bi-cloud-check' },
  { name: 'Linux Administration', category: 'DevOps', description: 'POSIX operating system fundamentals, shell scripting, and server setup', tags: ['OS', 'Bash', 'SysAdmin'], icon: 'bi-terminal' },

  // AI & Data
  { name: 'Machine Learning', category: 'AI/ML', description: 'Supervised and unsupervised statistical modeling techniques', tags: ['AI', 'Data', 'Scikit-Learn'], icon: 'bi-cpu' },
  { name: 'Deep Learning', category: 'AI/ML', description: 'Neural network architectures (CNNs, RNNs, Transformers)', tags: ['AI', 'PyTorch', 'TensorFlow'], icon: 'bi-diagram-2' },
  { name: 'Data Analysis (Pandas & NumPy)', category: 'AI/ML', description: 'Tabular data wrangling, cleaning, and mathematical matrix computation', tags: ['Data', 'Python', 'Analytics'], icon: 'bi-table' },
  { name: 'Generative AI & LLMs', category: 'AI/ML', description: 'Large language models, prompt engineering, RAG, and agentic systems', tags: ['AI', 'LLM', 'LangChain', 'LangGraph'], icon: 'bi-robot' },
  { name: 'Data Visualization', category: 'AI/ML', description: 'Communicating quantitative insights through dashboards and visual analytics', tags: ['BI', 'Tableau', 'Recharts', 'Plotly'], icon: 'bi-bar-chart-line' },

  // Design & Security
  { name: 'UI/UX Design & Figma', category: 'Design', description: 'Wireframing, prototyping, design systems, and human-centered design', tags: ['Design', 'Figma', 'UX Research'], icon: 'bi-palette' },
  { name: 'Web Security & OWASP', category: 'Security', description: 'Defending web applications against injections, XSS, CSRF, and broken auth', tags: ['Security', 'Auth', 'Encryption'], icon: 'bi-shield-check' },
  { name: 'Mobile App Dev (React Native/Flutter)', category: 'Mobile', description: 'Cross-platform mobile application development for iOS and Android', tags: ['Mobile', 'iOS', 'Android'], icon: 'bi-phone' },
];

const careersData = [
  {
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    category: 'Software Engineering',
    badgeColor: 'primary',
    icon: 'bi-layers',
    description: 'Builds responsive frontends and scalable backend server APIs, integrating databases and cloud infrastructure into unified full-stack software products.',
    requiredTechnicalSkills: [
      { name: 'JavaScript', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'React.js', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'Node.js', requiredLevel: 'Intermediate', weight: 3, minProficiencyValue: 70 },
      { name: 'Express.js', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
      { name: 'MongoDB', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 65 },
      { name: 'HTML5 & CSS3', requiredLevel: 'Advanced', weight: 2, minProficiencyValue: 80 },
      { name: 'REST APIs', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'Git & GitHub', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
    ],
    requiredSoftSkills: ['Problem Solving', 'System Design Communication', 'Agile Collaboration', 'Time Management'],
    responsibilities: [
      'Design modular and reusable frontend components using React and responsive CSS',
      'Implement secure RESTful and GraphQL backend endpoints with authentication and authorization',
      'Architect relational and document database schemas with optimized indexing',
      'Maintain automated testing suites and CI/CD deployment pipelines'
    ],
    toolsAndTechnologies: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'Git', 'Vite', 'Postman'],
    exampleProjects: [
      { title: 'SaaS Collaborative Project Management Tool', description: 'Real-time kanban board with websockets and team workspaces', techStack: ['React', 'Node.js', 'Socket.IO', 'MongoDB'] },
      { title: 'E-Commerce Platform with Stripe Checkout', description: 'Product catalog, user cart, authentication, and payment webhooks', techStack: ['React', 'Express', 'JWT', 'Stripe API'] }
    ],
    prerequisites: ['Basic programming logic', 'Fundamental web knowledge (HTTP, browsers)'],
    suggestedCertifications: ['Meta Front-End & Back-End Developer Professional Certificates', 'AWS Certified Developer Associate'],
    averageSalaryRange: '$85,000 - $145,000',
    jobGrowthOutlook: '+25% (Extremely high demand)'
  },
  {
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    category: 'Web Development',
    badgeColor: 'info',
    icon: 'bi-browser-chrome',
    description: 'Crafts accessible, performant, and delightful user experiences across web and mobile platforms with modern component frameworks.',
    requiredTechnicalSkills: [
      { name: 'JavaScript', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 85 },
      { name: 'React.js', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 85 },
      { name: 'TypeScript', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
      { name: 'HTML5 & CSS3', requiredLevel: 'Expert', weight: 3, minProficiencyValue: 90 },
      { name: 'Bootstrap & Tailwind', requiredLevel: 'Advanced', weight: 2, minProficiencyValue: 80 },
      { name: 'Git & GitHub', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
    ],
    requiredSoftSkills: ['Empathy for End Users', 'Design Sensitivity', 'Attention to Detail'],
    responsibilities: [
      'Translate Figma wireframes into high-fidelity responsive web applications',
      'Optimize client-side rendering performance, Core Web Vitals, and accessibility (a11y)',
      'Consume asynchronous backend REST/GraphQL APIs with robust error handling'
    ],
    toolsAndTechnologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Next.js', 'Figma'],
    exampleProjects: [
      { title: 'Design System & Component Library', description: 'Accessible atomic design components with documentation and storybook', techStack: ['React', 'TypeScript', 'CSS Modules'] }
    ],
    prerequisites: ['Basic HTML/CSS'],
    suggestedCertifications: ['Meta Front-End Developer Certificate'],
    averageSalaryRange: '$75,000 - $130,000',
    jobGrowthOutlook: '+20% (High)'
  },
  {
    title: 'Backend Developer',
    slug: 'backend-developer',
    category: 'Software Engineering',
    badgeColor: 'dark',
    icon: 'bi-server',
    description: 'Architects robust server backends, microservices, database schemas, and integration pipelines capable of scaling to millions of requests.',
    requiredTechnicalSkills: [
      { name: 'Node.js', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'Express.js', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'Python', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
      { name: 'PostgreSQL', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'MongoDB', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
      { name: 'REST APIs', requiredLevel: 'Expert', weight: 3, minProficiencyValue: 90 },
      { name: 'Docker', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 65 },
    ],
    requiredSoftSkills: ['System Thinking', 'Security Mindset', 'Debugging Resilience'],
    responsibilities: [
      'Design fault-tolerant backend architectures and microservice boundaries',
      'Optimize database queries, indexing, and connection pools for low-latency workloads',
      'Implement authentication, rate limiting, logging, and security best practices'
    ],
    toolsAndTechnologies: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'Postman'],
    exampleProjects: [
      { title: 'High-Concurrency Order Processing Engine', description: 'Event-driven queue architecture handling distributed transactions', techStack: ['Node.js', 'Redis', 'PostgreSQL'] }
    ],
    prerequisites: ['Core computer science fundamentals', 'Data structures and algorithms'],
    suggestedCertifications: ['AWS Certified Solutions Architect', 'Node.js Certified Developer'],
    averageSalaryRange: '$85,000 - $140,000',
    jobGrowthOutlook: '+22% (High)'
  },
  {
    title: 'AI/ML Engineer',
    slug: 'ai-ml-engineer',
    category: 'Artificial Intelligence',
    badgeColor: 'purple',
    icon: 'bi-cpu-fill',
    description: 'Designs, trains, fine-tunes, and deploys intelligent models and multi-agent AI systems into production workflows.',
    requiredTechnicalSkills: [
      { name: 'Python', requiredLevel: 'Expert', weight: 3, minProficiencyValue: 90 },
      { name: 'Machine Learning', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 85 },
      { name: 'Deep Learning', requiredLevel: 'Intermediate', weight: 3, minProficiencyValue: 75 },
      { name: 'Generative AI & LLMs', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'FastAPI', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
      { name: 'Data Analysis (Pandas & NumPy)', requiredLevel: 'Advanced', weight: 2, minProficiencyValue: 80 },
    ],
    requiredSoftSkills: ['Experimental Rigor', 'Statistical Intuition', 'Ethics in AI'],
    responsibilities: [
      'Build end-to-end machine learning pipelines from data ingestion to model serving',
      'Fine-tune open-weights LLMs and engineer multi-agent orchestration graphs',
      'Monitor model drift, latency, hallucinations, and inference cost in production'
    ],
    toolsAndTechnologies: ['PyTorch', 'Hugging Face', 'LangGraph', 'Scikit-Learn', 'FastAPI', 'Pandas'],
    exampleProjects: [
      { title: 'Intelligent Multi-Agent Knowledge Co-Pilot', description: 'Retrieval-Augmented Generation agent with LangGraph memory and tool use', techStack: ['Python', 'LangGraph', 'FastAPI', 'Qdrant'] }
    ],
    prerequisites: ['Linear algebra', 'Calculus and probability', 'Proficiency in Python'],
    suggestedCertifications: ['DeepLearning.AI Machine Learning Specialization', 'TensorFlow Developer Certificate'],
    averageSalaryRange: '$110,000 - $175,000',
    jobGrowthOutlook: '+38% (Explosive growth)'
  },
  {
    title: 'Data Analyst',
    slug: 'data-analyst',
    category: 'Data & Analytics',
    badgeColor: 'success',
    icon: 'bi-graph-up-arrow',
    description: 'Transforms raw operational datasets into actionable strategic intelligence through statistical exploration and storytelling visualizations.',
    requiredTechnicalSkills: [
      { name: 'PostgreSQL', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 85 },
      { name: 'Data Analysis (Pandas & NumPy)', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'Python', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
      { name: 'Data Visualization', requiredLevel: 'Expert', weight: 3, minProficiencyValue: 85 },
    ],
    requiredSoftSkills: ['Business Acumen', 'Executive Storytelling', 'Critical Inquiry'],
    responsibilities: [
      'Write complex SQL queries for cohort analyses, retention curves, and financial metrics',
      'Build automated executive dashboards tracking KPIs and leading business indicators',
      'Synthesize findings into concise presentations with clear strategic recommendations'
    ],
    toolsAndTechnologies: ['SQL', 'Tableau', 'PowerBI', 'Pandas', 'Excel', 'Jupyter'],
    exampleProjects: [
      { title: 'Customer Churn & Lifetime Value Prediction Dashboard', description: 'Exploratory data analysis identifying key customer drop-off cohorts', techStack: ['SQL', 'Python', 'Tableau'] }
    ],
    prerequisites: ['Basic statistics', 'Spreadsheet modeling'],
    suggestedCertifications: ['Google Data Analytics Professional Certificate'],
    averageSalaryRange: '$68,000 - $105,000',
    jobGrowthOutlook: '+23% (High)'
  },
  {
    title: 'Data Scientist',
    slug: 'data-scientist',
    category: 'Data Science',
    badgeColor: 'primary',
    icon: 'bi-clipboard-data',
    description: 'Applies rigorous statistical modeling, hypothesis testing, and predictive machine learning to uncover hidden patterns and optimize business operations.',
    requiredTechnicalSkills: [
      { name: 'Python', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 85 },
      { name: 'Machine Learning', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'PostgreSQL', requiredLevel: 'Advanced', weight: 2, minProficiencyValue: 75 },
      { name: 'Data Analysis (Pandas & NumPy)', requiredLevel: 'Expert', weight: 3, minProficiencyValue: 90 },
      { name: 'Data Visualization', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
    ],
    requiredSoftSkills: ['Hypothesis-Driven Thinking', 'Communication of Uncertainty'],
    responsibilities: [
      'Formulate analytical hypotheses and conduct rigorous A/B experiments',
      'Train predictive models for pricing elasticity, risk assessment, and recommendation',
      'Cleanse messy unstructured data and engineer novel feature representations'
    ],
    toolsAndTechnologies: ['Python', 'Scikit-learn', 'SQL', 'Statsmodels', 'Jupyter', 'XGBoost'],
    exampleProjects: [
      { title: 'Dynamic Pricing Recommendation Engine', description: 'Time-series forecasting and regression models balancing supply and demand', techStack: ['Python', 'XGBoost', 'PostgreSQL'] }
    ],
    prerequisites: ['Advanced probability and statistics', 'Python programming'],
    suggestedCertifications: ['IBM Data Science Professional Certificate'],
    averageSalaryRange: '$95,000 - $155,000',
    jobGrowthOutlook: '+28% (Very high)'
  },
  {
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    category: 'Cloud & Infrastructure',
    badgeColor: 'warning',
    icon: 'bi-gear-wide-connected',
    description: 'Bridges software engineering and IT operations, automating build, test, containerization, and release infrastructure.',
    requiredTechnicalSkills: [
      { name: 'Git & GitHub', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'Docker', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 85 },
      { name: 'Kubernetes', requiredLevel: 'Intermediate', weight: 3, minProficiencyValue: 75 },
      { name: 'CI/CD Pipelines', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 85 },
      { name: 'Linux Administration', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'AWS Cloud', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
    ],
    requiredSoftSkills: ['Incident Response Calmnness', 'Automation Obsession', 'Cross-team Advocacy'],
    responsibilities: [
      'Design and manage robust CI/CD deployment pipelines using GitHub Actions',
      'Package microservices into optimized Docker images and maintain Kubernetes clusters',
      'Configure infrastructure as code (Terraform) and real-time observability telemetry'
    ],
    toolsAndTechnologies: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'Prometheus', 'Grafana', 'Bash'],
    exampleProjects: [
      { title: 'Zero-Downtime Multi-Region Kubernetes Deployment', description: 'GitOps pipeline featuring automated canary rollouts and rollback triggers', techStack: ['Kubernetes', 'ArgoCD', 'Terraform', 'AWS'] }
    ],
    prerequisites: ['Linux fundamentals', 'Basic networking principles'],
    suggestedCertifications: ['Certified Kubernetes Administrator (CKA)', 'AWS Certified DevOps Engineer'],
    averageSalaryRange: '$95,000 - $155,000',
    jobGrowthOutlook: '+26% (High)'
  },
  {
    title: 'Cloud Engineer',
    slug: 'cloud-engineer',
    category: 'Cloud & Infrastructure',
    badgeColor: 'info',
    icon: 'bi-cloud-arrow-up',
    description: 'Architects and maintains secure, highly available, and cost-efficient cloud environments across major hyperscalers.',
    requiredTechnicalSkills: [
      { name: 'AWS Cloud', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 85 },
      { name: 'Docker', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
      { name: 'Linux Administration', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'CI/CD Pipelines', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
      { name: 'Web Security & OWASP', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
    ],
    requiredSoftSkills: ['Cost Consciousness', 'Architectural Prudence', 'Documentation'],
    responsibilities: [
      'Provision multi-tier virtual private clouds (VPCs), IAM roles, and storage buckets',
      'Implement auto-scaling policies and disaster recovery failover protocols',
      'Audit cloud spending and enforce least-privilege identity access boundaries'
    ],
    toolsAndTechnologies: ['AWS', 'Terraform', 'CloudWatch', 'Docker', 'Linux', 'Python'],
    exampleProjects: [
      { title: 'Enterprise Serverless Microservices Mesh', description: 'Event-driven architecture using AWS Lambda, API Gateway, and DynamoDB', techStack: ['AWS Lambda', 'Terraform', 'DynamoDB'] }
    ],
    prerequisites: ['Networking basics (DNS, TCP/IP, subnets)'],
    suggestedCertifications: ['AWS Solutions Architect Professional', 'Google Cloud Certified Professional'],
    averageSalaryRange: '$90,000 - $150,000',
    jobGrowthOutlook: '+24% (High)'
  },
  {
    title: 'Cybersecurity Analyst',
    slug: 'cybersecurity-analyst',
    category: 'Security',
    badgeColor: 'danger',
    icon: 'bi-shield-lock-fill',
    description: 'Monitors, investigates, and hardens software architectures against intrusions, vulnerabilities, and digital security threats.',
    requiredTechnicalSkills: [
      { name: 'Web Security & OWASP', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 85 },
      { name: 'Linux Administration', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'Python', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
      { name: 'Git & GitHub', requiredLevel: 'Intermediate', weight: 1, minProficiencyValue: 60 },
    ],
    requiredSoftSkills: ['Investigative Mindset', 'Discretion', 'Ethical Standards'],
    responsibilities: [
      'Conduct regular vulnerability assessments and dynamic penetration testing',
      'Analyze security logs, SIEM telemetry, and anomalous network traffic patterns',
      'Enforce zero-trust architecture and cryptographic token management standards'
    ],
    toolsAndTechnologies: ['Wireshark', 'Burp Suite', 'Metasploit', 'Linux', 'Python', 'SIEM'],
    exampleProjects: [
      { title: 'Automated Web Vulnerability Scanner', description: 'Script scanning target endpoints for common OWASP Top 10 security holes', techStack: ['Python', 'Requests', 'OWASP ZAP'] }
    ],
    prerequisites: ['Computer networking fundamentals', 'Operating system internals'],
    suggestedCertifications: ['CompTIA Security+', 'Certified Information Systems Security Professional (CISSP)'],
    averageSalaryRange: '$85,000 - $140,000',
    jobGrowthOutlook: '+32% (Very high)'
  },
  {
    title: 'UI/UX Designer',
    slug: 'ui-ux-designer',
    category: 'Design & Product',
    badgeColor: 'success',
    icon: 'bi-palette2',
    description: 'Researches user needs and creates intuitive, visually engaging product interfaces and unified design systems.',
    requiredTechnicalSkills: [
      { name: 'UI/UX Design & Figma', requiredLevel: 'Expert', weight: 3, minProficiencyValue: 90 },
      { name: 'HTML5 & CSS3', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 65 },
      { name: 'Bootstrap & Tailwind', requiredLevel: 'Intermediate', weight: 1, minProficiencyValue: 60 },
    ],
    requiredSoftSkills: ['User Empathy', 'Design Critique Facilitation', 'Creative Ideation'],
    responsibilities: [
      'Conduct user interviews, usability tests, and competitor product analyses',
      'Design responsive wireframes, high-fidelity prototypes, and design tokens in Figma',
      'Collaborate closely with frontend engineers to guarantee design fidelity'
    ],
    toolsAndTechnologies: ['Figma', 'FigJam', 'Adobe Creative Cloud', 'Miro', 'CSS'],
    exampleProjects: [
      { title: 'Comprehensive FinTech Mobile App Design System', description: 'Multi-brand design library with 200+ accessible components and micro-interactions', techStack: ['Figma', 'Design Tokens', 'Prototyping'] }
    ],
    prerequisites: ['Design principles (typography, color, hierarchy, layout)'],
    suggestedCertifications: ['Google UX Design Professional Certificate'],
    averageSalaryRange: '$75,000 - $125,000',
    jobGrowthOutlook: '+18% (Steady)'
  },
  {
    title: 'Mobile Application Developer',
    slug: 'mobile-application-developer',
    category: 'Mobile Development',
    badgeColor: 'primary',
    icon: 'bi-phone',
    description: 'Constructs fast, responsive mobile applications for iOS and Android devices utilizing modern cross-platform frameworks.',
    requiredTechnicalSkills: [
      { name: 'Mobile App Dev (React Native/Flutter)', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 85 },
      { name: 'JavaScript', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'TypeScript', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
      { name: 'REST APIs', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 75 },
    ],
    requiredSoftSkills: ['Performance Focus', 'Platform Idiom Awareness'],
    responsibilities: [
      'Build native-feeling UI screens with animations and touch gestures',
      'Implement offline storage, background sync, and push notifications',
      'Manage app store submission, beta testing, and app performance telemetry'
    ],
    toolsAndTechnologies: ['React Native', 'Expo', 'TypeScript', 'Redux', 'Firebase'],
    exampleProjects: [
      { title: 'Habit Tracker with Offline Sync & Push Reminders', description: 'Smooth cross-platform mobile app featuring local SQLite sync and notification scheduling', techStack: ['React Native', 'Expo', 'SQLite'] }
    ],
    prerequisites: ['Basic JavaScript or Dart syntax', 'Mobile UI concepts'],
    suggestedCertifications: ['Meta Android Developer Certificate', 'Meta iOS Developer Certificate'],
    averageSalaryRange: '$80,000 - $135,000',
    jobGrowthOutlook: '+21% (High)'
  },
  {
    title: 'Software Engineer',
    slug: 'software-engineer',
    category: 'Software Engineering',
    badgeColor: 'secondary',
    icon: 'bi-terminal-split',
    description: 'Solves complex algorithmic challenges and writes resilient, well-tested code across the software development lifecycle.',
    requiredTechnicalSkills: [
      { name: 'JavaScript', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'Python', requiredLevel: 'Advanced', weight: 3, minProficiencyValue: 80 },
      { name: 'Git & GitHub', requiredLevel: 'Advanced', weight: 2, minProficiencyValue: 80 },
      { name: 'REST APIs', requiredLevel: 'Advanced', weight: 2, minProficiencyValue: 75 },
      { name: 'PostgreSQL', requiredLevel: 'Intermediate', weight: 2, minProficiencyValue: 70 },
    ],
    requiredSoftSkills: ['Algorithmic Rigor', 'Code Review Etiquette', 'Technical Writing'],
    responsibilities: [
      'Write clean, modular, and maintainable software according to SOLID principles',
      'Conduct rigorous peer code reviews and author automated unit and integration tests',
      'Optimize algorithmic time and space complexity in core software paths'
    ],
    toolsAndTechnologies: ['Git', 'Docker', 'Linux', 'PostgreSQL', 'Jest', 'PyTest'],
    exampleProjects: [
      { title: 'Distributed Rate Limiting Gateway', description: 'Token bucket rate-limiting middleware capable of handling thousands of requests per second', techStack: ['Node.js', 'Redis', 'Docker'] }
    ],
    prerequisites: ['Data structures', 'Algorithms', 'Object-Oriented Programming'],
    suggestedCertifications: ['AWS Certified Developer', 'Oracle Certified Professional Java Programmer'],
    averageSalaryRange: '$90,000 - $150,000',
    jobGrowthOutlook: '+25% (High)'
  }
];

const sampleAssessments = [
  {
    title: 'JavaScript Core & ES6+ Proficiency Assessment',
    skillName: 'JavaScript',
    targetLevel: 'Intermediate',
    timeLimitMinutes: 15,
    totalPoints: 100,
    questions: [
      {
        id: 'js-1',
        type: 'mcq',
        question: 'What is the primary difference between let/const and var in JavaScript variable declaration?',
        options: [
          'var is block-scoped, while let and const are function-scoped',
          'let and const are block-scoped, while var is function-scoped (or globally scoped)',
          'const allows re-assignment but prevents redeclaration',
          'There is no functional difference in ES6+'
        ],
        correctAnswer: 'let and const are block-scoped, while var is function-scoped (or globally scoped)',
        explanation: 'Variables declared with let and const are confined to the enclosing block {...} and are subject to the Temporal Dead Zone (TDZ), whereas var is hoisted and scoped to the enclosing function.',
        points: 20
      },
      {
        id: 'js-2',
        type: 'technical',
        question: 'What will `console.log(typeof null)` and `console.log([] == ![])` evaluate to in standard JavaScript?',
        options: [
          '"null" and false',
          '"object" and true',
          '"undefined" and false',
          '"object" and false'
        ],
        correctAnswer: '"object" and true',
        explanation: 'typeof null is "object" due to a legacy bug in JavaScript first release. `![]` evaluates to false, and `[] == false` converts both to 0 == 0 which yields true.',
        points: 20
      },
      {
        id: 'js-3',
        type: 'scenario',
        question: 'You have an array of asynchronous tasks that must execute concurrently, but you need all results together or an immediate failure if any fails. Which method should you choose?',
        options: [
          'Promise.allSettled()',
          'Promise.race()',
          'Promise.all()',
          'Promise.any()'
        ],
        correctAnswer: 'Promise.all()',
        explanation: 'Promise.all rejects immediately upon the first rejected promise, or resolves with an array of all results if every promise succeeds.',
        points: 20
      },
      {
        id: 'js-4',
        type: 'scenario',
        question: 'In modern JavaScript, what does a Closure allow an inner function to do?',
        options: [
          'Directly modify the browser window object without permissions',
          'Access variables from its outer (enclosing) lexical scope even after the outer function has closed',
          'Execute synchronously in a separate OS thread',
          'Bypass the garbage collector permanently'
        ],
        correctAnswer: 'Access variables from its outer (enclosing) lexical scope even after the outer function has closed',
        explanation: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment.',
        points: 20
      },
      {
        id: 'js-5',
        type: 'short_answer',
        question: 'Briefly explain what the JavaScript Event Loop does in relation to the Call Stack and Task/Microtask Queue.',
        options: [
          'It continuously checks if the Call Stack is empty; if empty, it pushes jobs from Microtasks (Promises) then Macrotasks (setTimeout) onto the stack',
          'It runs all setTimeout callbacks before executing synchronous code',
          'It compiles JavaScript into C++ binary code on the fly',
          'It pauses browser rendering until all network requests resolve'
        ],
        correctAnswer: 'It continuously checks if the Call Stack is empty; if empty, it pushes jobs from Microtasks (Promises) then Macrotasks (setTimeout) onto the stack',
        explanation: 'The event loop monitors the call stack. When the stack is empty, microtasks (like resolved promises) are drained completely before the next macrotask is dequeued.',
        points: 20
      }
    ]
  },
  {
    title: 'React.js Component Architecture & State Assessment',
    skillName: 'React.js',
    targetLevel: 'Intermediate',
    timeLimitMinutes: 15,
    totalPoints: 100,
    questions: [
      {
        id: 'react-1',
        type: 'mcq',
        question: 'Why should you never mutate state directly in React (e.g. `state.items.push(newItem)`)?',
        options: [
          'Direct mutation throws a fatal runtime SyntaxError in modern browsers',
          'React relies on shallow reference equality comparison to detect state changes and schedule re-renders',
          'State objects are frozen and immutable at the hardware CPU level',
          'Direct mutation only works in Class components, not functional components'
        ],
        correctAnswer: 'React relies on shallow reference equality comparison to detect state changes and schedule re-renders',
        explanation: 'React compares previous and new state references (`Object.is`). Mutating an existing array/object preserves the memory reference, preventing React from detecting the change and triggering a re-render.',
        points: 20
      },
      {
        id: 'react-2',
        type: 'scenario',
        question: 'When should you use `useCallback` instead of declaring a plain inline function in a React component?',
        options: [
          'In every single function declaration to improve CPU clock speed',
          'When passing the callback to an optimized child component wrapped in React.memo or as a dependency to useEffect',
          'To make asynchronous HTTP fetch calls run faster',
          'Only when handling form submit buttons'
        ],
        correctAnswer: 'When passing the callback to an optimized child component wrapped in React.memo or as a dependency to useEffect',
        explanation: 'useCallback memoizes the function reference across renders. Its primary benefit is preventing unnecessary re-renders of memoized child components that rely on referential identity.',
        points: 20
      },
      {
        id: 'react-3',
        type: 'technical',
        question: 'What is the cleanup function returned inside a `useEffect` hook used for?',
        options: [
          'To reset component state to null',
          'To unsubscribe from event listeners, clear timers, or abort in-flight network requests before unmount or re-running the effect',
          'To clear browser local storage automatically',
          'To trigger a garbage collection cycle'
        ],
        correctAnswer: 'To unsubscribe from event listeners, clear timers, or abort in-flight network requests before unmount or re-running the effect',
        explanation: 'The cleanup function executes before the component unmounts and before subsequent runs of the effect when dependencies update, preventing memory leaks.',
        points: 20
      },
      {
        id: 'react-4',
        type: 'mcq',
        question: 'What is the purpose of the `key` prop when rendering a list of items in React?',
        options: [
          'It is a required CSS selector used for styling list items',
          'It provides a stable identity to list elements so React Virtual DOM reconciliation can efficiently add, remove, and reorder elements',
          'It encrypts item data stored in the client cache',
          'It sets the HTML `id` attribute on the DOM node'
        ],
        correctAnswer: 'It provides a stable identity to list elements so React Virtual DOM reconciliation can efficiently add, remove, and reorder elements',
        explanation: 'Keys give elements a stable identity between renders, allowing React to match existing elements rather than recreating them unnecessarily.',
        points: 20
      },
      {
        id: 'react-5',
        type: 'scenario',
        question: 'You notice an expensive calculation running on every keystroke in a form component even when unrelated props change. What React hook should you use to cache this calculated value?',
        options: [
          'useState',
          'useRef',
          'useMemo',
          'useLayoutEffect'
        ],
        correctAnswer: 'useMemo',
        explanation: '`useMemo` caches the calculated result of an expensive function between renders until its declared dependencies change.',
        points: 20
      }
    ]
  },
  {
    title: 'Python Fundamentals & Data Structures Assessment',
    skillName: 'Python',
    targetLevel: 'Intermediate',
    timeLimitMinutes: 15,
    totalPoints: 100,
    questions: [
      {
        id: 'py-1',
        type: 'mcq',
        question: 'What is the key difference between a Python `list` and a `tuple`?',
        options: [
          'Lists can only hold numbers; tuples can hold any datatype',
          'Lists are mutable (can be modified in-place); tuples are immutable and hashable',
          'Tuples do not support indexing or slicing',
          'Lists use parentheses () while tuples use square brackets []'
        ],
        correctAnswer: 'Lists are mutable (can be modified in-place); tuples are immutable and hashable',
        explanation: 'Lists are mutable sequences that can grow or shrink. Tuples are immutable and can therefore be used as dictionary keys when containing hashable elements.',
        points: 20
      },
      {
        id: 'py-2',
        type: 'technical',
        question: 'What does a generator function using `yield` provide compared to returning a full list?',
        options: [
          'It executes code in parallel on all CPU cores',
          'It evaluates items lazily on-demand, consuming minimal memory for large or infinite sequences',
          'It encrypts data before storing it in RAM',
          'It guarantees type safety at compile time'
        ],
        correctAnswer: 'It evaluates items lazily on-demand, consuming minimal memory for large or infinite sequences',
        explanation: 'Generators produce values one by one on each iteration, avoiding the allocation of large memory buffers required by comprehensive lists.',
        points: 20
      },
      {
        id: 'py-3',
        type: 'scenario',
        question: 'Which built-in Python data structure provides O(1) average time complexity for lookups and insertions?',
        options: [
          'List',
          'Tuple',
          'Dict (and Set)',
          'Deque'
        ],
        correctAnswer: 'Dict (and Set)',
        explanation: 'Dictionaries and sets in Python use hash tables internally, achieving constant time O(1) average lookup and insertion performance.',
        points: 20
      },
      {
        id: 'py-4',
        type: 'mcq',
        question: 'What does the `*args` and `**kwargs` syntax in a Python function definition allow?',
        options: [
          'Pointers to memory addresses as in C++',
          'Accepting an arbitrary number of positional arguments (*args) and keyword arguments (**kwargs)',
          'Automatic parallel execution across multiple threads',
          'Strict mathematical matrix multiplication'
        ],
        correctAnswer: 'Accepting an arbitrary number of positional arguments (*args) and keyword arguments (**kwargs)',
        explanation: '*args packs variable positional arguments into a tuple, while **kwargs packs variable keyword arguments into a dictionary.',
        points: 20
      },
      {
        id: 'py-5',
        type: 'technical',
        question: 'In Python, what is the Global Interpreter Lock (GIL)?',
        options: [
          'A security sandbox that prevents unauthorized disk access',
          'A mutex that allows only one native thread to execute Python bytecode at a time in CPython',
          'A package manager that locks dependencies in requirements.txt',
          'An operating system firewall rule'
        ],
        correctAnswer: 'A mutex that allows only one native thread to execute Python bytecode at a time in CPython',
        explanation: 'The GIL in CPython prevents simultaneous multi-threaded execution of Python bytecodes, making multiprocessing necessary for CPU-bound tasks.',
        points: 20
      }
    ]
  }
];

const sampleResources = [
  // JavaScript
  {
    title: 'The Modern JavaScript Tutorial (javascript.info)',
    platform: 'Official Docs',
    skillName: 'JavaScript',
    difficulty: 'Beginner',
    estimatedDuration: '4 hours',
    description: 'Comprehensive, deep-dive guide from basic fundamentals to advanced closures, promises, prototypes, and asynchronous patterns.',
    url: 'https://javascript.info/',
    isCurated: true,
    rating: 4.9,
    tags: ['JavaScript', 'ES6', 'Closures', 'Async']
  },
  {
    title: 'MDN Web Docs — JavaScript Guide',
    platform: 'MDN',
    skillName: 'JavaScript',
    difficulty: 'Intermediate',
    estimatedDuration: '3 hours',
    description: 'The authoritative reference documentation for JavaScript language specifications, standard library, and browser APIs.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    isCurated: true,
    rating: 5.0,
    tags: ['MDN', 'Reference', 'Standards']
  },
  {
    title: 'JavaScript Async / Await and Event Loop in Depth',
    platform: 'freeCodeCamp',
    skillName: 'JavaScript',
    difficulty: 'Intermediate',
    estimatedDuration: '1.5 hours',
    description: 'Visual masterclass explaining microtasks, macrotasks, and writing clean asynchronous async/await code.',
    url: 'https://www.freecodecamp.org/news/javascript-async-await-tutorial-learn-callbacks-promises-and-async-await-in-js/',
    isCurated: true,
    rating: 4.8,
    tags: ['Async', 'Promises', 'EventLoop']
  },

  // React
  {
    title: 'Official React Documentation (react.dev)',
    platform: 'Official Docs',
    skillName: 'React.js',
    difficulty: 'Beginner',
    estimatedDuration: '3 hours',
    description: 'Modern, interactive React docs focusing on components, hooks, state modeling, and thinking in React.',
    url: 'https://react.dev/learn',
    isCurated: true,
    rating: 5.0,
    tags: ['React', 'Hooks', 'Components']
  },
  {
    title: 'Complete React 18 Course with Projects',
    platform: 'freeCodeCamp',
    skillName: 'React.js',
    difficulty: 'Intermediate',
    estimatedDuration: '5 hours',
    description: 'Hands-on practical video course building production-ready apps with custom hooks, Context API, and routing.',
    url: 'https://www.freecodecamp.org/news/full-react-course-2020/',
    isCurated: true,
    rating: 4.8,
    tags: ['React', 'Projects', 'SPA']
  },

  // Node & Express
  {
    title: 'Express.js Official Guide & Routing Documentation',
    platform: 'Official Docs',
    skillName: 'Express.js',
    difficulty: 'Beginner',
    estimatedDuration: '2 hours',
    description: 'Official guide on configuring Express routing, writing custom middleware, error handling, and parameter parsing.',
    url: 'https://expressjs.com/en/guide/routing.html',
    isCurated: true,
    rating: 4.7,
    tags: ['Express', 'Node', 'Backend', 'Middleware']
  },
  {
    title: 'Node.js Design Patterns and Clean Architecture',
    platform: 'Medium',
    skillName: 'Node.js',
    difficulty: 'Advanced',
    estimatedDuration: '2.5 hours',
    description: 'Architecting scalable server-side systems with modular service layers, repository patterns, and dependency injection.',
    url: 'https://nodejs.org/en/learn',
    isCurated: true,
    rating: 4.8,
    tags: ['Node', 'Architecture', 'Patterns']
  },

  // MongoDB
  {
    title: 'MongoDB University — M001: Basics of Document Data',
    platform: 'Interactive',
    skillName: 'MongoDB',
    difficulty: 'Beginner',
    estimatedDuration: '3 hours',
    description: 'Interactive course on document data modeling, CRUD queries, indexing, and aggregation pipelines.',
    url: 'https://www.mongodb.com/docs/manual/tutorial/getting-started/',
    isCurated: true,
    rating: 4.9,
    tags: ['Database', 'NoSQL', 'MongoDB']
  },

  // Python & AI
  {
    title: 'Official Python Tutorial and Standard Library Reference',
    platform: 'Official Docs',
    skillName: 'Python',
    difficulty: 'Beginner',
    estimatedDuration: '4 hours',
    description: 'The definitive guide to Python syntax, data structures, object-oriented programming, and standard modules.',
    url: 'https://docs.python.org/3/tutorial/',
    isCurated: true,
    rating: 4.9,
    tags: ['Python', 'Language', 'Official']
  },
  {
    title: 'FastAPI — Modern Python Web APIs',
    platform: 'Official Docs',
    skillName: 'FastAPI',
    difficulty: 'Intermediate',
    estimatedDuration: '2 hours',
    description: 'Building type-safe, auto-documenting microservices with Pydantic schemas and ASGI async concurrency.',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    isCurated: true,
    rating: 4.9,
    tags: ['Python', 'FastAPI', 'Microservices']
  },
  {
    title: 'Scikit-Learn Machine Learning in Python',
    platform: 'Official Docs',
    skillName: 'Machine Learning',
    difficulty: 'Intermediate',
    estimatedDuration: '4 hours',
    description: 'Hands-on guide to model evaluation, cross-validation, feature preprocessing, classification, and regression.',
    url: 'https://scikit-learn.org/stable/tutorial/index.html',
    isCurated: true,
    rating: 4.9,
    tags: ['AI', 'ML', 'Scikit-Learn']
  }
];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Starting database seeding...');

    // 1. Seed Skills
    console.log('[Seed] Seeding Skills...');
    const createdSkills = [];
    for (const skillItem of skillsData) {
      let skill = await Skill.findOne({ name: skillItem.name });
      if (!skill) {
        skill = await Skill.create({
          ...skillItem,
          proficiencyLevels: [
            { level: 'Beginner', numericalValue: 20, criteria: 'Knows basic definitions and syntax' },
            { level: 'Basic', numericalValue: 40, criteria: 'Can complete guided exercises and simple scripts' },
            { level: 'Intermediate', numericalValue: 60, criteria: 'Builds independent features and troubleshoots errors' },
            { level: 'Advanced', numericalValue: 80, criteria: 'Optimizes performance and architects complex systems' },
            { level: 'Expert', numericalValue: 100, criteria: 'Subject matter expert who sets team best practices' },
          ]
        });
      }
      createdSkills.push(skill);
    }
    console.log(`[Seed] Seeded ${createdSkills.length} skills.`);

    // 2. Seed Careers
    console.log('[Seed] Seeding Career Paths...');
    const createdCareers = [];
    for (const career of careersData) {
      // Map skill names to skill ObjectIds
      const mappedSkills = career.requiredTechnicalSkills.map(reqSkill => {
        const found = createdSkills.find(s => s.name === reqSkill.name);
        return {
          skill: found ? found._id : null,
          name: reqSkill.name,
          requiredLevel: reqSkill.requiredLevel,
          weight: reqSkill.weight,
          minProficiencyValue: reqSkill.minProficiencyValue,
        };
      });

      let careerDoc = await CareerPath.findOne({ slug: career.slug });
      if (!careerDoc) {
        careerDoc = await CareerPath.create({
          ...career,
          requiredTechnicalSkills: mappedSkills,
        });
      }
      createdCareers.push(careerDoc);
    }
    console.log(`[Seed] Seeded ${createdCareers.length} career paths.`);

    // 3. Seed Skill Assessments
    console.log('[Seed] Seeding Skill Assessments...');
    for (const assessment of sampleAssessments) {
      const skillDoc = createdSkills.find(s => s.name === assessment.skillName);
      let existingAssessment = await SkillAssessment.findOne({ title: assessment.title });
      if (!existingAssessment) {
        await SkillAssessment.create({
          ...assessment,
          skill: skillDoc ? skillDoc._id : null,
        });
      }
    }
    console.log('[Seed] Seeded assessments.');

    // 4. Seed Curated Resources
    console.log('[Seed] Seeding Learning Resources...');
    for (const resItem of sampleResources) {
      let existingResource = await LearningResource.findOne({ title: resItem.title });
      if (!existingResource) {
        await LearningResource.create(resItem);
      }
    }
    console.log('[Seed] Seeded learning resources.');

    // 5. Seed Users & Profiles
    console.log('[Seed] Seeding Demo Users & Profiles...');

    // Demo Admin
    let adminUser = await User.findOne({ email: 'admin@mentormind.ai' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'MentorMind Admin',
        email: 'admin@mentormind.ai',
        password: 'AdminPassword123!',
        role: 'admin',
        educationLevel: 'Postgraduate',
        institution: 'MentorMind Academy',
        currentYear: 'Staff',
        careerStatus: 'Working Professional',
        profileCompleted: true,
      });
      console.log('[Seed] Created Admin User: admin@mentormind.ai');
    }

    // Demo Learner 1 (Primary Test Account)
    let demoLearner = await User.findOne({ email: 'demo@mentormind.ai' });
    if (!demoLearner) {
      demoLearner = await User.create({
        name: 'Jordan Rivera',
        email: 'demo@mentormind.ai',
        password: 'Password123!',
        role: 'learner',
        educationLevel: 'Undergraduate',
        institution: 'State University of Technology',
        currentYear: '3rd Year Computer Science',
        careerStatus: 'Student',
        profileCompleted: true,
      });
      console.log('[Seed] Created Primary Demo Learner: demo@mentormind.ai / Password123!');
    }

    // Connect Demo Learner Profile
    const fullStackCareer = createdCareers.find(c => c.slug === 'full-stack-developer') || createdCareers[0];
    let demoProfile = await LearnerProfile.findOne({ user: demoLearner._id });
    if (!demoProfile) {
      demoProfile = await LearnerProfile.create({
        user: demoLearner._id,
        fullName: 'Jordan Rivera',
        education: 'B.S. Computer Science',
        institution: 'State University of Technology',
        degree: 'Bachelor of Science',
        currentYear: '3rd Year',
        experienceLevel: 'Intermediate',
        targetCareer: fullStackCareer._id,
        targetCareerName: fullStackCareer.title,
        careerReadinessScore: 48,
        streakDays: 5,
        totalHoursStudied: 28,
        weeklyHoursAvailable: 12,
        preferredLearningStyle: 'Hands-on',
        existingTechnicalSkills: [
          { name: 'JavaScript', proficiencyLevel: 'Intermediate', score: 65, verified: true },
          { name: 'HTML5 & CSS3', proficiencyLevel: 'Advanced', score: 85, verified: true },
          { name: 'React.js', proficiencyLevel: 'Intermediate', score: 60, verified: true },
          { name: 'Python', proficiencyLevel: 'Basic', score: 40, verified: false },
          { name: 'Git & GitHub', proficiencyLevel: 'Intermediate', score: 70, verified: true },
        ],
        existingSoftSkills: ['Critical Thinking', 'Team Collaboration', 'Presentation'],
        shortTermGoals: ['Master Node.js and Express backend architecture', 'Build and deploy a full-stack SaaS project'],
        longTermGoals: ['Become a Senior Full Stack Engineer at a top product firm'],
      });
      console.log('[Seed] Created Profile for Jordan Rivera');

      // Create an initial roadmap for Jordan
      const roadmapDoc = await LearningRoadmap.create({
        user: demoLearner._id,
        careerPath: fullStackCareer._id,
        careerTitle: fullStackCareer.title,
        title: 'Full Stack Developer Adaptive Mastery Path',
        overallProgress: 35,
        phases: [
          {
            phaseNumber: 1,
            title: 'Modern Frontend Foundations & React Architecture',
            description: 'Master component composition, hooks, client-side routing, and state lifecycles.',
            estimatedDurationWeeks: 2,
            status: 'completed',
            milestones: ['Completed React SPA with responsive layout', 'Passed React component assessment'],
            tasks: []
          },
          {
            phaseNumber: 2,
            title: 'Node.js & Express RESTful Backend Systems',
            description: 'Design robust asynchronous APIs with JWT authentication, validation, and error middleware.',
            estimatedDurationWeeks: 3,
            status: 'in_progress',
            milestones: ['Build secure auth API', 'Implement database models and relational queries'],
            tasks: []
          },
          {
            phaseNumber: 3,
            title: 'Database Architecture & MongoDB Schemas',
            description: 'Structure document schemas, write aggregation pipelines, and optimize queries with indexes.',
            estimatedDurationWeeks: 2,
            status: 'pending',
            milestones: ['Configure production MongoDB Atlas cluster', 'Design indexing strategy'],
            tasks: []
          },
          {
            phaseNumber: 4,
            title: 'End-to-End Capstone Project & Cloud Deployment',
            description: 'Deploy full-stack monorepo with CI/CD GitHub Actions and monitoring.',
            estimatedDurationWeeks: 3,
            status: 'pending',
            milestones: ['Ship live URL to production', 'Conduct automated mock interview'],
            tasks: []
          }
        ]
      });

      // Create tasks for the roadmap
      const task1 = await RoadmapTask.create({
        user: demoLearner._id,
        roadmap: roadmapDoc._id,
        phaseNumber: 2,
        topic: 'JWT Authentication & Authorization Middleware',
        description: 'Implement token signing, cookie storage, and role-based route guard middleware in Express.',
        skillName: 'Node.js',
        estimatedHours: 4,
        priority: 'High',
        status: 'in_progress',
        resources: [{
          title: 'Express JWT Auth Tutorial',
          url: 'https://expressjs.com/en/guide/routing.html',
          type: 'Documentation',
          platform: 'Official Docs',
          duration: '45 mins'
        }]
      });

      const task2 = await RoadmapTask.create({
        user: demoLearner._id,
        roadmap: roadmapDoc._id,
        phaseNumber: 2,
        topic: 'RESTful API Error Handling & Validation Patterns',
        description: 'Create centralized error handling middleware and integrate input sanitizers.',
        skillName: 'Express.js',
        estimatedHours: 5,
        priority: 'High',
        status: 'todo',
        resources: [{
          title: 'Node.js Clean Error Handling Patterns',
          url: 'https://nodejs.org/en/learn',
          type: 'Article',
          platform: 'MDN',
          duration: '35 mins'
        }]
      });

      // Add task references to phase
      roadmapDoc.phases[1].tasks.push(task1._id, task2._id);
      await roadmapDoc.save();

      // Seed Skill Gap Report for Jordan
      await SkillGapReport.create({
        user: demoLearner._id,
        careerPath: fullStackCareer._id,
        careerTitle: fullStackCareer.title,
        overallReadinessPercentage: 48,
        strongSkills: [
          { skillName: 'HTML5 & CSS3', currentScore: 85, requiredScore: 80, status: 'Strong' },
          { skillName: 'Git & GitHub', currentScore: 70, requiredScore: 70, status: 'Strong' }
        ],
        partialSkills: [
          { skillName: 'JavaScript', currentScore: 65, requiredScore: 80, gap: 15, status: 'Developing' },
          { skillName: 'React.js', currentScore: 60, requiredScore: 80, gap: 20, status: 'Developing' }
        ],
        missingSkills: [
          { skillName: 'Node.js', currentScore: 0, requiredScore: 70, gap: 70, priority: 'High' },
          { skillName: 'Express.js', currentScore: 0, requiredScore: 70, gap: 70, priority: 'High' },
          { skillName: 'MongoDB', currentScore: 0, requiredScore: 65, gap: 65, priority: 'High' },
          { skillName: 'REST APIs', currentScore: 0, requiredScore: 80, gap: 80, priority: 'High' }
        ],
        recommendedNextActions: [
          'Complete the JavaScript Core assessment to verify async/await competency.',
          'Start Phase 2 Roadmap: Node.js & Express RESTful Backend Systems.',
          'Connect with peer Maya Chen who has backend strengths in Node.js and wants to learn React.'
        ]
      });

      // Seed Notifications for Jordan
      await Notification.create([
        {
          user: demoLearner._id,
          title: 'Welcome to MentorMind AI!',
          message: 'Your profile has been created and your initial Full Stack Developer learning path is generated.',
          type: 'system',
          link: '/dashboard'
        },
        {
          user: demoLearner._id,
          title: 'Compatible Study Partner Found',
          message: 'Maya Chen has complementary backend skills and wants to collaborate on Full Stack projects.',
          type: 'peer_request',
          link: '/peers'
        }
      ]);

      // Seed Progress Records
      await ProgressRecord.create([
        { user: demoLearner._id, date: new Date(Date.now() - 6 * 86400000), studyHours: 2.5, tasksCompleted: 1, assessmentsTaken: 0, avgScore: 0, streakCount: 1, readinessScore: 42 },
        { user: demoLearner._id, date: new Date(Date.now() - 5 * 86400000), studyHours: 3.0, tasksCompleted: 2, assessmentsTaken: 1, avgScore: 80, streakCount: 2, readinessScore: 44 },
        { user: demoLearner._id, date: new Date(Date.now() - 4 * 86400000), studyHours: 1.5, tasksCompleted: 1, assessmentsTaken: 0, avgScore: 0, streakCount: 3, readinessScore: 45 },
        { user: demoLearner._id, date: new Date(Date.now() - 3 * 86400000), studyHours: 4.0, tasksCompleted: 2, assessmentsTaken: 0, avgScore: 0, streakCount: 4, readinessScore: 46 },
        { user: demoLearner._id, date: new Date(Date.now() - 2 * 86400000), studyHours: 3.5, tasksCompleted: 1, assessmentsTaken: 1, avgScore: 85, streakCount: 5, readinessScore: 48 },
      ]);
    }

    // Seed Sample Peers (for AI Peer Matching)
    const peersData = [
      {
        name: 'Maya Chen',
        email: 'maya.backend@mentormind.ai',
        institution: 'University of Washington',
        degree: 'B.S. Software Engineering',
        targetCareerName: 'Full Stack Developer',
        skills: [
          { name: 'Node.js', proficiencyLevel: 'Advanced', score: 85, verified: true },
          { name: 'MongoDB', proficiencyLevel: 'Advanced', score: 80, verified: true },
          { name: 'Express.js', proficiencyLevel: 'Advanced', score: 80, verified: true },
          { name: 'JavaScript', proficiencyLevel: 'Intermediate', score: 70, verified: true },
          { name: 'React.js', proficiencyLevel: 'Basic', score: 35, verified: false },
        ],
        teaches: 'Node.js & MongoDB Database Schemas',
        wantsToLearn: 'React.js & Frontend State Management',
        compatibility: 94,
        goals: ['Build a real-time team collaboration app', 'Prepare for technical full-stack interviews']
      },
      {
        name: 'Carlos Mendez',
        email: 'carlos.dev@mentormind.ai',
        institution: 'Georgia Tech',
        degree: 'B.S. Computer Science',
        targetCareerName: 'Full Stack Developer',
        skills: [
          { name: 'TypeScript', proficiencyLevel: 'Advanced', score: 85, verified: true },
          { name: 'PostgreSQL', proficiencyLevel: 'Advanced', score: 85, verified: true },
          { name: 'Docker', proficiencyLevel: 'Intermediate', score: 65, verified: true },
          { name: 'React.js', proficiencyLevel: 'Intermediate', score: 65, verified: true },
        ],
        teaches: 'PostgreSQL Query Optimization & TypeScript',
        wantsToLearn: 'Advanced React Hooks & UI Systems',
        compatibility: 88,
        goals: ['Contribute to open-source software', 'Master microservices architecture']
      },
      {
        name: 'Aisha Al-Mansoor',
        email: 'aisha.ai@mentormind.ai',
        institution: 'MIT Online',
        degree: 'M.S. Artificial Intelligence',
        targetCareerName: 'AI/ML Engineer',
        skills: [
          { name: 'Python', proficiencyLevel: 'Expert', score: 95, verified: true },
          { name: 'Machine Learning', proficiencyLevel: 'Advanced', score: 85, verified: true },
          { name: 'FastAPI', proficiencyLevel: 'Intermediate', score: 70, verified: true },
          { name: 'JavaScript', proficiencyLevel: 'Basic', score: 30, verified: false },
        ],
        teaches: 'Python ML Models & Scikit-Learn',
        wantsToLearn: 'Full-Stack Web Integration for AI Models',
        compatibility: 82,
        goals: ['Deploy production LLM agents with clean web interfaces']
      }
    ];

    for (const peer of peersData) {
      let pUser = await User.findOne({ email: peer.email });
      if (!pUser) {
        pUser = await User.create({
          name: peer.name,
          email: peer.email,
          password: 'Password123!',
          role: 'learner',
          educationLevel: 'Undergraduate',
          institution: peer.institution,
          currentYear: 'Senior',
          careerStatus: 'Student',
          profileCompleted: true,
        });

        const peerCareer = createdCareers.find(c => c.title === peer.targetCareerName) || fullStackCareer;

        await LearnerProfile.create({
          user: pUser._id,
          fullName: peer.name,
          education: peer.degree,
          institution: peer.institution,
          degree: peer.degree,
          currentYear: 'Senior',
          experienceLevel: 'Intermediate',
          targetCareer: peerCareer._id,
          targetCareerName: peer.targetCareerName,
          careerReadinessScore: 68,
          streakDays: 8,
          totalHoursStudied: 45,
          weeklyHoursAvailable: 10,
          preferredLearningStyle: 'Hands-on',
          existingTechnicalSkills: peer.skills,
          existingSoftSkills: ['Clear Communication', 'Collaborative Problem Solving'],
          shortTermGoals: peer.goals,
          longTermGoals: ['Senior Software Architect'],
        });

        // Create study group if not exists
        if (peer.name === 'Maya Chen') {
          const studyGroup = await StudyGroup.findOne({ name: 'Full-Stack Architects Sprint' });
          if (!studyGroup) {
            await StudyGroup.create({
              name: 'Full-Stack Architects Sprint',
              description: 'Collaborative group building full-stack web applications and preparing for upcoming technical interviews.',
              targetCareer: fullStackCareer._id,
              targetCareerName: fullStackCareer.title,
              creator: pUser._id,
              members: [pUser._id, demoLearner._id],
              maxMembers: 6,
              sharedGoals: ['Complete 3 full-stack projects', 'Pair program on weekly algorithm challenges'],
              activeChallenge: {
                title: 'Build a Secure JWT Authentication API',
                description: 'Implement refresh tokens, password salting, and role guards in Express or FastAPI.',
                deadline: new Date(Date.now() + 7 * 86400000),
                completedBy: [pUser._id]
              }
            });
          }
        }
      }
    }
    console.log('[Seed] Seeded sample peers and study groups.');

    console.log('[Seed] Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    throw error;
  }
};

module.exports = seedDatabase;

if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB().then(() => {
    seedDatabase().then(() => {
      console.log('[Seed] Done. Exiting.');
      process.exit(0);
    }).catch(() => process.exit(1));
  });
}
