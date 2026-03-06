import type {
  DomainInterest,
  ExperienceLevel,
  GeoFocus,
  MarketInvolvement,
  PrimaryGoal,
  ProfileQuestion,
  UpdateFrequency,
  UserRole,
  WorkspaceStyle,
} from '@/types/profile';

export const ROLE_OPTIONS: ProfileQuestion<UserRole>['options'] = [
  { value: 'student', label: 'Student', description: 'Learning and exploration with simple views.' },
  { value: 'researcher', label: 'Researcher', description: 'Cross-topic analysis and evidence tracking.' },
  { value: 'journalist', label: 'Journalist', description: 'Fast situational awareness and source discovery.' },
  { value: 'policy_analyst', label: 'Policy Analyst', description: 'Regulation, governance, and country-level context.' },
  { value: 'security_analyst', label: 'Security Analyst', description: 'Threat, conflict, and tactical monitoring.' },
  { value: 'humanitarian_worker', label: 'Humanitarian Worker', description: 'Displacement, climate, and crisis signals.' },
  { value: 'energy_analyst', label: 'Energy Analyst', description: 'Energy markets, infrastructure, and disruptions.' },
  { value: 'supply_chain_manager', label: 'Supply Chain', description: 'Transport, chokepoints, and operational risk.' },
  { value: 'risk_manager', label: 'Risk Manager', description: 'Enterprise risk and cross-domain early warning.' },
  { value: 'investor', label: 'Investor', description: 'Macro and thematic investing signals.' },
  { value: 'trader', label: 'Trader', description: 'High-frequency market and volatility signals.' },
  { value: 'founder_operator', label: 'Founder / Operator', description: 'Business strategy and market opportunities.' },
  { value: 'developer_engineer', label: 'Developer / Engineer', description: 'Tech ecosystem and infrastructure changes.' },
  { value: 'academic', label: 'Academic', description: 'Structured data for study and long-term trends.' },
  { value: 'general_user', label: 'General User', description: 'Broad awareness with a lightweight setup.' },
];

export const PRIMARY_GOAL_OPTIONS: ProfileQuestion<PrimaryGoal>['options'] = [
  { value: 'learn_basics', label: 'Learn Basics', description: 'Understand key events without overload.' },
  { value: 'monitor_global_risk', label: 'Monitor Global Risk', description: 'Track high-impact developments continuously.' },
  { value: 'trade_markets', label: 'Trade Markets', description: 'Focus on actionable financial signals.' },
  { value: 'track_sector', label: 'Track Specific Sector', description: 'Follow selected industries deeply.' },
  { value: 'executive_brief', label: 'Executive Briefing', description: 'Condensed summaries for decision-making.' },
  { value: 'incident_response', label: 'Incident Response', description: 'Detect and respond to active disruptions.' },
  { value: 'policy_research', label: 'Policy Research', description: 'Follow policy, regulation, and institutions.' },
  { value: 'country_watch', label: 'Country Watch', description: 'Monitor selected countries and regions.' },
];

export const DOMAIN_INTEREST_OPTIONS: ProfileQuestion<DomainInterest>['options'] = [
  { value: 'geopolitics', label: 'Geopolitics', description: 'State conflict, diplomacy, and strategic posture.' },
  { value: 'markets_macro', label: 'Macro Markets', description: 'Rate, inflation, and macro cross-asset signals.' },
  { value: 'equities', label: 'Equities', description: 'Stock market and sector movements.' },
  { value: 'forex_rates', label: 'FX / Rates', description: 'Currencies and central-bank-linked moves.' },
  { value: 'commodities_energy', label: 'Commodities & Energy', description: 'Oil, gas, and commodity disruptions.' },
  { value: 'crypto_digital_assets', label: 'Crypto', description: 'Digital asset markets and ecosystem shifts.' },
  { value: 'technology_ai', label: 'Technology & AI', description: 'AI, startups, and platform ecosystem trends.' },
  { value: 'cybersecurity', label: 'Cybersecurity', description: 'Cyber threats and infra reliability risks.' },
  { value: 'climate_environment', label: 'Climate', description: 'Weather anomalies and natural hazard patterns.' },
  { value: 'humanitarian_displacement', label: 'Humanitarian', description: 'Displacement and population vulnerability.' },
  { value: 'supply_chain_logistics', label: 'Supply Chain', description: 'Ports, routes, and logistics pressure points.' },
  { value: 'defense_security', label: 'Defense & Security', description: 'Military activity and tactical developments.' },
  { value: 'regulation_policy', label: 'Regulation', description: 'Policy and rule changes affecting markets/sectors.' },
  { value: 'startup_vc', label: 'Startup & VC', description: 'Funding, innovation hubs, and venture trends.' },
];

export const GEO_FOCUS_OPTIONS: ProfileQuestion<GeoFocus>['options'] = [
  { value: 'global', label: 'Global', description: 'Worldwide coverage.' },
  { value: 'middleeast', label: 'Middle East', description: 'Middle East regional focus.' },
  { value: 'africa', label: 'Africa', description: 'Africa regional focus.' },
  { value: 'latam', label: 'Latin America', description: 'Latin America regional focus.' },
  { value: 'asia_pacific', label: 'Asia Pacific', description: 'APAC regional focus.' },
  { value: 'europe', label: 'Europe', description: 'Europe regional focus.' },
  { value: 'north_america', label: 'North America', description: 'North America regional focus.' },
];

export const EXPERIENCE_LEVEL_OPTIONS: ProfileQuestion<ExperienceLevel>['options'] = [
  { value: 'beginner', label: 'Beginner', description: 'Simple layout, fewer advanced signals.' },
  { value: 'intermediate', label: 'Intermediate', description: 'Balanced detail with guided context.' },
  { value: 'advanced', label: 'Advanced', description: 'Dense layout with full signal depth.' },
];

export const UPDATE_FREQUENCY_OPTIONS: ProfileQuestion<UpdateFrequency>['options'] = [
  { value: 'realtime', label: 'Real-time', description: 'As updates arrive.' },
  { value: 'daily', label: 'Daily Summary', description: 'Condensed daily update cadence.' },
  { value: 'weekly', label: 'Weekly Brief', description: 'Lower-noise weekly digest behavior.' },
];

export const MARKET_INVOLVEMENT_OPTIONS: ProfileQuestion<MarketInvolvement>['options'] = [
  { value: 'none', label: 'No Market Focus', description: 'Minimize finance/trading-heavy views.' },
  { value: 'casual', label: 'Casual', description: 'Light market context and summaries.' },
  { value: 'active_trader', label: 'Active Trader', description: 'Fast and granular market visibility.' },
  { value: 'institutional', label: 'Institutional', description: 'Broader market structure and macro context.' },
];

export const WORKSPACE_STYLE_OPTIONS: ProfileQuestion<WorkspaceStyle>['options'] = [
  { value: 'simple', label: 'Simple', description: 'Few cards, low complexity, high clarity.' },
  { value: 'balanced', label: 'Balanced', description: 'Moderate card count and mixed depth.' },
  { value: 'power_user', label: 'Power User', description: 'High density with wide signal coverage.' },
];

export const PROFILE_QUESTIONS: Array<ProfileQuestion<string>> = [
  {
    id: 'role',
    title: 'What best describes you?',
    helpText: 'Used to shape your default dashboard depth and card types.',
    multiSelect: false,
    required: true,
    options: ROLE_OPTIONS,
  },
  {
    id: 'primaryGoal',
    title: 'What is your main goal?',
    helpText: 'This picks your default top panels.',
    multiSelect: false,
    required: true,
    options: PRIMARY_GOAL_OPTIONS,
  },
  {
    id: 'domainsOfInterest',
    title: 'Choose your key domains',
    helpText: 'Select up to 4 for best relevance.',
    multiSelect: true,
    required: true,
    options: DOMAIN_INTEREST_OPTIONS,
  },
  {
    id: 'geoFocus',
    title: 'Which regions matter most?',
    helpText: 'Used for regional panel and map defaults.',
    multiSelect: true,
    required: true,
    options: GEO_FOCUS_OPTIONS,
  },
  {
    id: 'experienceLevel',
    title: 'How experienced are you?',
    helpText: 'Controls complexity and language density.',
    multiSelect: false,
    required: true,
    options: EXPERIENCE_LEVEL_OPTIONS,
  },
  {
    id: 'updateFrequency',
    title: 'How often do you want updates?',
    helpText: 'Used for refresh and alert behavior defaults.',
    multiSelect: false,
    required: true,
    options: UPDATE_FREQUENCY_OPTIONS,
  },
  {
    id: 'marketInvolvement',
    title: 'How involved are you in markets?',
    helpText: 'Controls how much market-focused content appears.',
    multiSelect: false,
    required: true,
    options: MARKET_INVOLVEMENT_OPTIONS,
  },
  {
    id: 'workspaceStyle',
    title: 'How dense should your dashboard be?',
    helpText: 'You can change this later in settings.',
    multiSelect: false,
    required: true,
    options: WORKSPACE_STYLE_OPTIONS,
  },
];
