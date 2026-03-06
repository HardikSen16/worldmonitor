import { DEFAULT_MAP_LAYERS, DEFAULT_PANELS, MOBILE_DEFAULT_MAP_LAYERS, STORAGE_KEYS } from '@/config';
import type { MapLayers, PanelConfig } from '@/types';
import type { DomainInterest, GeoFocus, PrimaryGoal, UserProfileInput, UserRole } from '@/types/profile';

const PANEL_ORDER_STORAGE_KEY = 'panel-order';

type PanelSettings = Record<string, PanelConfig>;

const DOMAIN_PANELS: Partial<Record<DomainInterest, string[]>> = {
  geopolitics: ['strategic-posture', 'cii', 'strategic-risk', 'gdelt-intel', 'intel', 'thinktanks', 'politics'],
  markets_macro: ['markets', 'economic', 'macro-signals', 'analysis', 'finance', 'heatmap'],
  equities: ['markets', 'markets-news', 'analysis', 'heatmap'],
  forex_rates: ['forex', 'economic', 'macro-signals', 'centralbanks'],
  commodities_energy: ['commodities', 'commodities-news', 'energy', 'economic'],
  crypto_digital_assets: ['crypto', 'crypto-news', 'etf-flows', 'stablecoins', 'polymarket'],
  technology_ai: ['ai', 'tech', 'insights', 'tech-readiness', 'events'],
  cybersecurity: ['security', 'service-status', 'insights'],
  climate_environment: ['climate', 'population-exposure', 'satellite-fires'],
  humanitarian_displacement: ['displacement', 'population-exposure', 'ucdp-events', 'climate'],
  supply_chain_logistics: ['cascade', 'energy', 'markets', 'commodities'],
  defense_security: ['strategic-posture', 'cii', 'strategic-risk', 'ucdp-events', 'gdelt-intel'],
  regulation_policy: ['policy', 'regulation', 'gov', 'thinktanks'],
  startup_vc: ['startups', 'funding', 'vcblogs', 'producthunt', 'unicorns'],
};

const GOAL_PANELS: Partial<Record<PrimaryGoal, string[]>> = {
  learn_basics: ['live-news', 'insights', 'politics', 'monitors'],
  monitor_global_risk: ['strategic-posture', 'cii', 'strategic-risk', 'gdelt-intel'],
  trade_markets: ['markets', 'macro-signals', 'analysis', 'etf-flows', 'stablecoins'],
  track_sector: ['tech', 'ai', 'energy', 'commodities', 'markets'],
  executive_brief: ['insights', 'live-news', 'gdelt-intel', 'economic'],
  incident_response: ['gdelt-intel', 'cascade', 'service-status', 'ucdp-events'],
  policy_research: ['policy', 'regulation', 'thinktanks', 'gov'],
  country_watch: ['politics', 'middleeast', 'africa', 'latam', 'asia'],
};

const ROLE_PANELS: Partial<Record<UserRole, string[]>> = {
  student: ['live-news', 'insights', 'monitors'],
  researcher: ['insights', 'gdelt-intel', 'thinktanks', 'monitors'],
  journalist: ['live-news', 'gdelt-intel', 'politics', 'insights'],
  policy_analyst: ['policy', 'regulation', 'thinktanks', 'strategic-risk'],
  security_analyst: ['strategic-posture', 'cii', 'strategic-risk', 'ucdp-events'],
  humanitarian_worker: ['displacement', 'population-exposure', 'climate'],
  energy_analyst: ['energy', 'commodities', 'economic', 'markets'],
  supply_chain_manager: ['cascade', 'commodities', 'markets', 'economic'],
  risk_manager: ['strategic-risk', 'cii', 'economic', 'insights'],
  investor: ['markets', 'macro-signals', 'economic', 'analysis'],
  trader: ['markets', 'forex', 'commodities', 'macro-signals', 'analysis'],
  founder_operator: ['tech', 'markets', 'insights', 'funding'],
  developer_engineer: ['tech', 'ai', 'github', 'service-status'],
  academic: ['insights', 'thinktanks', 'economic', 'climate'],
  general_user: ['live-news', 'insights', 'politics'],
};

const GEO_REGION_PANELS: Partial<Record<GeoFocus, string[]>> = {
  middleeast: ['middleeast'],
  africa: ['africa'],
  latam: ['latam'],
  asia_pacific: ['asia'],
};

const DOMAIN_LAYERS: Partial<Record<DomainInterest, Array<keyof MapLayers>>> = {
  geopolitics: ['conflicts', 'hotspots', 'bases', 'military', 'sanctions'],
  markets_macro: ['economic', 'stockExchanges', 'financialCenters', 'centralBanks'],
  equities: ['stockExchanges', 'financialCenters', 'economic'],
  forex_rates: ['centralBanks', 'financialCenters', 'economic'],
  commodities_energy: ['pipelines', 'waterways', 'commodityHubs', 'economic'],
  crypto_digital_assets: ['economic'],
  technology_ai: ['datacenters', 'startupHubs', 'cloudRegions', 'techHQs', 'techEvents'],
  cybersecurity: ['outages', 'cables'],
  climate_environment: ['weather', 'natural', 'climate'],
  humanitarian_displacement: ['displacement', 'ucdpEvents', 'climate'],
  supply_chain_logistics: ['cables', 'pipelines', 'waterways', 'outages', 'flights', 'ais'],
  defense_security: ['conflicts', 'bases', 'military', 'ucdpEvents', 'sanctions'],
  regulation_policy: ['economic', 'centralBanks'],
  startup_vc: ['startupHubs', 'techHQs', 'techEvents'],
};

function clonePanelSettings(): PanelSettings {
  return Object.fromEntries(
    Object.entries(DEFAULT_PANELS).map(([key, config]) => [key, { ...config }])
  );
}

function cloneLayerSettings(isMobile: boolean): MapLayers {
  const base = isMobile ? MOBILE_DEFAULT_MAP_LAYERS : DEFAULT_MAP_LAYERS;
  return { ...base };
}

function setAllPanelsDisabled(panels: PanelSettings): void {
  for (const panel of Object.values(panels)) {
    panel.enabled = false;
  }
}

function setAllLayersDisabled(layers: MapLayers): void {
  (Object.keys(layers) as Array<keyof MapLayers>).forEach((key) => {
    layers[key] = false;
  });
}

function enablePanels(panels: PanelSettings, keys: string[]): void {
  keys.forEach((key) => {
    if (panels[key]) panels[key].enabled = true;
  });
}

function enableLayers(layers: MapLayers, keys: Array<keyof MapLayers>): void {
  keys.forEach((key) => {
    if (key in layers) layers[key] = true;
  });
}

function applyComplexityCap(panels: PanelSettings, profile: UserProfileInput): void {
  if (profile.workspaceStyle === 'power_user' && profile.experienceLevel === 'advanced') return;

  const baseCap = profile.workspaceStyle === 'simple' ? 8 : 14;
  const cap = profile.experienceLevel === 'beginner' ? Math.max(6, baseCap - 2) : baseCap;
  const orderedKeys = Object.keys(DEFAULT_PANELS).filter((key) => key !== 'map');
  const enabledKeys = orderedKeys.filter((key) => panels[key]?.enabled);

  if (enabledKeys.length <= cap) return;

  enabledKeys.slice(cap).forEach((key) => {
    const panel = panels[key];
    if (panel) panel.enabled = false;
  });
}

function applyLayerCap(layers: MapLayers, profile: UserProfileInput): void {
  if (profile.workspaceStyle === 'power_user' && profile.experienceLevel !== 'beginner') return;

  const cap = profile.workspaceStyle === 'simple' || profile.experienceLevel === 'beginner' ? 7 : 11;
  const preferredOrder: Array<keyof MapLayers> = [
    'economic',
    'weather',
    'outages',
    'conflicts',
    'hotspots',
    'datacenters',
    'stockExchanges',
    'centralBanks',
    'pipelines',
    'waterways',
    'natural',
    'techEvents',
    'startupHubs',
    'military',
    'ucdpEvents',
    'displacement',
    'climate',
    'cables',
    'flights',
    'ais',
  ];
  const enabled = preferredOrder.filter((key) => layers[key]);
  if (enabled.length <= cap) return;
  enabled.slice(cap).forEach((key) => {
    layers[key] = false;
  });
}

function buildPanels(profile: UserProfileInput): PanelSettings {
  const panels = clonePanelSettings();
  setAllPanelsDisabled(panels);

  enablePanels(panels, ['map', 'live-news', 'insights', 'monitors']);
  enablePanels(panels, ROLE_PANELS[profile.role] ?? []);
  enablePanels(panels, GOAL_PANELS[profile.primaryGoal] ?? []);
  profile.domainsOfInterest.forEach((domain) => enablePanels(panels, DOMAIN_PANELS[domain] ?? []));
  profile.geoFocus.forEach((region) => enablePanels(panels, GEO_REGION_PANELS[region] ?? []));

  if (profile.marketInvolvement === 'active_trader' || profile.marketInvolvement === 'institutional') {
    enablePanels(panels, ['markets', 'forex', 'bonds', 'commodities', 'analysis', 'macro-signals']);
  } else if (profile.marketInvolvement === 'casual') {
    enablePanels(panels, ['markets', 'economic', 'macro-signals']);
  }

  applyComplexityCap(panels, profile);
  return panels;
}

function buildLayers(profile: UserProfileInput, isMobile: boolean): MapLayers {
  const layers = cloneLayerSettings(isMobile);
  setAllLayersDisabled(layers);

  if (!profile.wantsMapIntel) {
    if (profile.marketInvolvement !== 'none') {
      enableLayers(layers, ['economic', 'stockExchanges', 'centralBanks']);
    }
    applyLayerCap(layers, profile);
    return layers;
  }

  enableLayers(layers, ['weather', 'outages', 'natural']);
  profile.domainsOfInterest.forEach((domain) => enableLayers(layers, DOMAIN_LAYERS[domain] ?? []));

  if (profile.marketInvolvement === 'active_trader' || profile.marketInvolvement === 'institutional') {
    enableLayers(layers, ['economic', 'stockExchanges', 'financialCenters', 'centralBanks']);
  }

  applyLayerCap(layers, profile);
  return layers;
}

export function applyUserPersonalization(profile: UserProfileInput, isMobile: boolean): void {
  const panelSettings = buildPanels(profile);
  const layerSettings = buildLayers(profile, isMobile);
  const panelOrder = Object.keys(DEFAULT_PANELS)
    .filter((key) => key !== 'map' && panelSettings[key]?.enabled);

  localStorage.setItem(STORAGE_KEYS.panels, JSON.stringify(panelSettings));
  localStorage.setItem(STORAGE_KEYS.mapLayers, JSON.stringify(layerSettings));
  localStorage.setItem(PANEL_ORDER_STORAGE_KEY, JSON.stringify(panelOrder));
}
