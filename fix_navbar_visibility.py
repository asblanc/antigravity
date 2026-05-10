import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove `{currentView === '/' && (` around the desktop menu
# Find: {currentView === '/' && (\n          <div className="hidden md:flex items-center gap-10">
# ... up to ... </a>\n          </div>\n        )}

old_desktop_menu_start = """        {currentView === '/' && (
          <div className="hidden md:flex items-center gap-10">"""
new_desktop_menu_start = """        <div className="hidden md:flex items-center gap-10">"""

content = content.replace(old_desktop_menu_start, new_desktop_menu_start)

# Now we need to remove the closing `)}` for that block.
# Let's just find the exact block if possible.
# Actually, a regex replacement is safer for this.

content = re.sub(r'\{currentView === \'/\' && \(\s*(<div className="hidden md:flex items-center gap-10">.*?</div>)\s*\)\}', r'\1', content, flags=re.DOTALL)

# Remove `{currentView === '/' && (` around the mobile menu button
old_mobile_btn = """          {currentView === '/' && (
            <button 
              className="md:hidden text-gold"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}"""

new_mobile_btn = """          <button 
            className="md:hidden text-gold"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>"""

content = content.replace(old_mobile_btn, new_mobile_btn)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Menu visibility fixed.")
