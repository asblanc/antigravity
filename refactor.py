import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add react-router-dom imports
if "react-router-dom" not in content:
    content = content.replace("import { motion, AnimatePresence } from 'framer-motion';", 
                              "import { motion, AnimatePresence } from 'framer-motion';\nimport { Routes, Route, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';")

# Remove type View
content = re.sub(r'type View = \n(?:  \| \'.*?\'\n)+;\n', '', content)

# Change App state
content = content.replace("const [view, setView] = useState<View>('home');", 
                          "const navigate = useNavigate();\n  const location = useLocation();")

# Replace setView calls in handleLogin, handleRegister, handleLogout
content = content.replace("setView('partner-dashboard')", "navigate('/partner-dashboard')")
content = content.replace("setView('admin-dashboard')", "navigate('/admin-dashboard')")
content = content.replace("setView('member-dashboard')", "navigate('/member-dashboard')")
content = content.replace("setView('home')", "navigate('/')")

# Handle Navbar properties
content = content.replace("const isDashboard = view.includes('dashboard');", "const isDashboard = location.pathname.includes('dashboard');")
content = content.replace("scrolled={scrolled || view !== 'home'}", "scrolled={scrolled || location.pathname !== '/'}")
content = content.replace("currentView={view}", "currentView={location.pathname}")
content = content.replace("setView={setView}", "")

# In the render block: Replace renderView() with Routes
routes_code = """<Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/member-registration" element={<MemberRegistrationView onRegister={handleRegister} />} />
          <Route path="/partner-registration" element={<HomeView />} />
          <Route path="/login" element={<LoginView onLogin={handleLogin} />} />
          <Route path="/member-dashboard" element={user ? <MemberDashboardView user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/partner-dashboard" element={<PartnerDashboardView onLogout={handleLogout} />} />
          <Route path="/admin-dashboard" element={<PartnerDashboardView onLogout={handleLogout} />} />
          <Route path="/establishments" element={<EstablishmentsView />} />
          <Route path="/offers" element={<EstablishmentsView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>"""

content = re.sub(r'const renderView = \(\) => \{.*?\} \};\n\n  const isDashboard', 
                 'const isDashboard', content, flags=re.DOTALL)
content = content.replace('{renderView()}', routes_code)

# Fix component props in definitions
content = re.sub(r'setView: \(v: View\) => void,?\s?', '', content)
content = re.sub(r'setView: \(v: any\) => void,?\s?', '', content)
content = re.sub(r'setView\s*,\s*', '', content)
content = re.sub(r'\{ setView \}', '{}', content)

# Replace all onClick={() => setView('xyz')} with navigate('/xyz') inside components
# Wait, inside components we need const navigate = useNavigate();
# Instead, we can just replace setView('xyz') with navigate('/xyz') and add navigate hook to those components.
# Actually, the user asked for navigation links, so using <Link> or navigate.
# Let's add const navigate = useNavigate(); to components that need it.

components_needing_navigate = ['HomeView', 'LoginView', 'MemberDashboardView', 'Navbar', 'EstablishmentsView']
for comp in components_needing_navigate:
    content = re.sub(r'(const ' + comp + r'(?:<.*?>)?(?: = \([^)]*\))? => \{)', 
                     r'\1\n  const navigate = useNavigate();', content)

content = content.replace("setView('establishments')", "navigate('/establishments')")
content = content.replace("setView('offers')", "navigate('/offers')")
content = content.replace("setView('member-registration')", "navigate('/member-registration')")
content = content.replace("setView('partner-registration')", "navigate('/partner-registration')")
content = content.replace("setView('login')", "navigate('/login')")

# Fix currentView comparisons in Navbar
content = content.replace("currentView === 'home'", "currentView === '/'")

# Add a "Back to Home" button for Dashboards to improve navigation as requested
dashboard_back_btn = """
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gold hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" /> Retour au site
          </button>
"""
content = content.replace('{/* Partner Nav */}', '{/* Partner Nav */}' + dashboard_back_btn)
content = content.replace('{/* Dashboard Nav */}', '{/* Dashboard Nav */}' + dashboard_back_btn)

# Write back
with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Refactoring complete.")
