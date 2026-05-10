import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix desktop Contact link
content = content.replace(
    '<a href="/#contact" className={`relative font-medium text-[10px] uppercase tracking-widest transition-colors duration-300 group ${scrolled ? \'text-text hover:text-gold\' : \'text-white/90 hover:text-white\'}`}>',
    '<button type="button" onClick={() => { navigate(\'/\'); setTimeout(() => document.getElementById(\'contact\')?.scrollIntoView({ behavior: \'smooth\' }), 100); }} className={`relative font-medium text-[10px] uppercase tracking-widest transition-colors duration-300 group ${scrolled ? \'text-text hover:text-gold\' : \'text-white/90 hover:text-white\'}`}>'
)
content = content.replace(
    'Contact\n              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>\n            </a>',
    'Contact\n              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>\n            </button>'
)

# Fix mobile Contact link
content = content.replace(
    '<a href="/#contact" onClick={() => setMobileMenuOpen(false)} className="text-sm uppercase tracking-widest font-bold text-white hover:text-gold">',
    '<button type="button" onClick={() => { setMobileMenuOpen(false); navigate(\'/\'); setTimeout(() => document.getElementById(\'contact\')?.scrollIntoView({ behavior: \'smooth\' }), 100); }} className="text-sm uppercase tracking-widest font-bold text-white hover:text-gold text-left">'
)
# We also need to replace the </a> for the mobile link. Let's do it using regex for the mobile link block.
content = re.sub(
    r'<button type="button" onClick=\{\(\) => \{ setMobileMenuOpen\(false\); navigate\(\'/\'\); setTimeout\(\(\) => document\.getElementById\(\'contact\'\)\?\.scrollIntoView\(\{ behavior: \'smooth\' \}\), 100\); \}\} className="text-sm uppercase tracking-widest font-bold text-white hover:text-gold text-left">\s*Contact\s*</a>',
    r'<button type="button" onClick={() => { setMobileMenuOpen(false); navigate(\'/\'); setTimeout(() => document.getElementById(\'contact\')?.scrollIntoView({ behavior: \'smooth\' }), 100); }} className="text-sm uppercase tracking-widest font-bold text-white hover:text-gold text-left">\n              Contact\n            </button>',
    content
)

# Fix all <a href="#"> in footer and elsewhere
content = content.replace(
    '<a href="#"',
    '<button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: \'smooth\'}); }}'
)
# Close all </button> that were </a> for the replaced ones
# Since there are many, we can use a regex to match <button type="button" onClick=...>Text</a>
content = re.sub(
    r'(<button type="button" onClick=\{\(e\) => \{ e\.preventDefault\(\); window\.scrollTo\(\{top: 0, behavior: \'smooth\'\}\); \}\}[^>]*>.*?)</a>',
    r'\1</button>',
    content,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Anchor tags fixed.")
