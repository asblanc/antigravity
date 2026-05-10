import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

components = ['Navbar', 'HomeView', 'MemberRegistrationView', 'LoginView', 'MemberDashboardView', 'EstablishmentsView']

for comp in components:
    # Match the start of the component function. Example:
    # const Navbar: React.FC<{ ... }> = ({ ... }) => {
    # const HomeView: React.FC<{ }> = ({}) => {
    
    # We will find the component definition
    pattern = r'(const ' + comp + r'(?:<.*?>)? *: *React\.FC(?:<.*?>)? *= *\(.*?\) *=> *\{)'
    
    match = re.search(pattern, content, flags=re.DOTALL)
    if match:
        original = match.group(1)
        # Check if it already has navigate
        block_start = match.end()
        next_code = content[block_start:block_start+200]
        if 'const navigate =' not in next_code:
            replacement = original + '\n  const navigate = useNavigate();'
            content = content.replace(original, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Navigation fixed in App.tsx")
