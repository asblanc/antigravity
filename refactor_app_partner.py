import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
if "PartnerDashboardView" not in content[:1000]:
    content = content.replace("import { validateMemberQR } from './lib/partner.service';",
                              "import { validateMemberQR } from './lib/partner.service';\nimport { PartnerDashboardView } from './components/PartnerDashboardView';")

# Extract PartnerDashboardView component
# It starts at `const PartnerDashboardView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {`
# And ends before `const EstablishmentsView: React.FC = () => {`

pattern = r'const PartnerDashboardView: React\.FC<\{ onLogout: \(\) => void \}> = \(\{ onLogout \}\) => \{.*?\n\};(?=\n\nconst EstablishmentsView)'

content = re.sub(pattern, '', content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App.tsx updated.")
