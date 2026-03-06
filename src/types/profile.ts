export type UserRole =
  | 'student'
  | 'researcher'
  | 'journalist'
  | 'policy_analyst'
  | 'security_analyst'
  | 'humanitarian_worker'
  | 'energy_analyst'
  | 'supply_chain_manager'
  | 'risk_manager'
  | 'investor'
  | 'trader'
  | 'founder_operator'
  | 'developer_engineer'
  | 'academic'
  | 'general_user';

export type PrimaryGoal =
  | 'learn_basics'
  | 'monitor_global_risk'
  | 'trade_markets'
  | 'track_sector'
  | 'executive_brief'
  | 'incident_response'
  | 'policy_research'
  | 'country_watch';

export type DomainInterest =
  | 'geopolitics'
  | 'markets_macro'
  | 'equities'
  | 'forex_rates'
  | 'commodities_energy'
  | 'crypto_digital_assets'
  | 'technology_ai'
  | 'cybersecurity'
  | 'climate_environment'
  | 'humanitarian_displacement'
  | 'supply_chain_logistics'
  | 'defense_security'
  | 'regulation_policy'
  | 'startup_vc';

export type GeoFocus =
  | 'global'
  | 'middleeast'
  | 'africa'
  | 'latam'
  | 'asia_pacific'
  | 'europe'
  | 'north_america';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type UpdateFrequency = 'realtime' | 'daily' | 'weekly';
export type MarketInvolvement = 'none' | 'casual' | 'active_trader' | 'institutional';
export type WorkspaceStyle = 'simple' | 'balanced' | 'power_user';

export interface UserProfileInput {
  role: UserRole;
  primaryGoal: PrimaryGoal;
  domainsOfInterest: DomainInterest[];
  geoFocus: GeoFocus[];
  experienceLevel: ExperienceLevel;
  updateFrequency: UpdateFrequency;
  marketInvolvement: MarketInvolvement;
  workspaceStyle: WorkspaceStyle;
  wantsMapIntel: boolean;
}

export interface ProfileOption<T extends string> {
  value: T;
  label: string;
  description: string;
}

export interface ProfileQuestion<T extends string> {
  id: string;
  title: string;
  helpText: string;
  multiSelect: boolean;
  required: boolean;
  options: Array<ProfileOption<T>>;
}
