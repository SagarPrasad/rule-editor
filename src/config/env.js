export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  rulesEndpoint: import.meta.env.VITE_RULES_ENDPOINT || '/rules',
  templatesEndpoint: import.meta.env.VITE_TEMPLATES_ENDPOINT || '/templates',
  testRuleEndpoint: import.meta.env.VITE_TEST_RULE_ENDPOINT || '/gateway/json-definition/try?type=rules',
}
