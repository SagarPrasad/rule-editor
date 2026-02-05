# Rule Engine Editor

A React-based rule engine editor for business users to create, edit, and test business rules.

## Features

1. **Rule List Page**: View all rules for a tenant, with options to edit, enable, or disable rules
2. **Template Editor**: Manage JSON path templates with human-readable names
3. **Rules Editor**: Create and edit rules with support for:
   - Single conditions
   - OR rules (multiple conditions with OR logic)
   - AND rules (multiple conditions with AND logic)
   - Various operators: exists, equals, in, contains_any, contains_all, etc.
4. **Test Rule**: Test rules with custom JSON input and view results
5. **Facts/Keys Viewer**: View all available facts/keys from sample payload

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Update `.env` file with your API endpoints (currently using mock data)

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
  ├── components/          # Reusable components
  │   ├── ConditionEditor.jsx
  │   ├── RulesTab.jsx
  │   ├── TemplateTab.jsx
  │   └── TestRulePanel.jsx
  ├── pages/                # Page components
  │   ├── RuleListPage.jsx
  │   ├── RuleEditorPage.jsx
  │   └── FactsPage.jsx
  ├── services/            # API services
  │   └── api.js
  ├── config/              # Configuration
  │   └── env.js
  ├── App.jsx
  └── main.jsx
```

## API Integration

The application currently uses mock data. To integrate with real APIs:

1. Update `src/services/api.js` to use actual API endpoints
2. Update environment variables in `.env` file
3. Replace mock methods with actual axios calls

## Supported Operators

- `exists`: Check if a path exists
- `equals`: Check if value equals
- `in`: Check if value is in a list
- `contains_any`: Check if array contains any of the values
- `contains_all`: Check if array contains all of the values
- `not_equals`: Check if value does not equal
- `greater_than`: Numeric comparison
- `less_than`: Numeric comparison
- `greater_than_or_equal`: Numeric comparison
- `less_than_or_equal`: Numeric comparison

## Usage

1. Navigate to the Rules List page
2. Select a tenant and optionally a key
3. Click "Edit" on a rule to modify it
4. In the Template tab, manage JSON paths and their display names
5. In the Rules tab, add and configure conditions
6. Use "Test Rule" to validate rules with sample data
7. View Facts/Keys page to see all available data paths

## Notes

- All API calls are currently mocked for development
- The application will need API contract updates when backend is ready
- Template extraction automatically generates paths from existing rules
- Test functionality uses the sample payload structure
