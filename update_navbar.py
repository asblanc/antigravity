import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Extract Navbar component and replace it
# We need to find `const Navbar` down to its closing `};`
# Using regex for this can be tricky, let's just replace the specific link mapping block

old_nav_links_desktop = """            {['Accueil', 'Partenaires', 'Privilèges', 'Contact'].map((item) => (
              <a 
                key={item}
                href={item === 'Partenaires' ? '#' : `#${item.toLowerCase()}`}
                onClick={item === 'Partenaires' ? (e) => { e.preventDefault(); navigate('/establishments'); } : undefined}
                className={`relative font-medium text-[10px] uppercase tracking-widest transition-colors duration-300 group ${
                  scrolled ? 'text-text hover:text-gold' : 'text-white/90 hover:text-white'
                }`}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
            ))}"""

new_nav_links_desktop = """            {[
              { name: 'Accueil', path: '/' },
              { name: 'Partenaires', path: '/establishments' },
              { name: 'Privilèges', path: '/offers' },
            ].map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                className={`relative font-medium text-[10px] uppercase tracking-widest transition-colors duration-300 group ${
                  currentView === item.path ? 'text-gold' : (scrolled ? 'text-text hover:text-gold' : 'text-white/90 hover:text-white')
                }`}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gold transition-transform duration-300 origin-left ${currentView === item.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
            ))}
            <a href="/#contact" className={`relative font-medium text-[10px] uppercase tracking-widest transition-colors duration-300 group ${scrolled ? 'text-text hover:text-gold' : 'text-white/90 hover:text-white'}`}>
              Contact
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>"""

content = content.replace(old_nav_links_desktop, new_nav_links_desktop)

old_nav_links_mobile = """                {['Accueil', 'Partenaires', 'Privilèges', 'Contact'].map((item) => (
                  <a 
                    key={item}
                    href={item === 'Partenaires' ? '#' : `#${item.toLowerCase()}`}
                    onClick={(e) => {
                      if (item === 'Partenaires') {
                        e.preventDefault();
                        navigate('/establishments');
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="text-2xl font-serif text-white hover:text-gold transition-colors"
                  >
                    {item}
                  </a>
                ))}"""

new_nav_links_mobile = """                {[
                  { name: 'Accueil', path: '/' },
                  { name: 'Partenaires', path: '/establishments' },
                  { name: 'Privilèges', path: '/offers' },
                ].map((item) => (
                  <Link 
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-2xl font-serif transition-colors ${currentView === item.path ? 'text-gold' : 'text-white hover:text-gold'}`}
                  >
                    {item.name}
                  </Link>
                ))}
                <a 
                  href="/#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-serif text-white hover:text-gold transition-colors"
                >
                  Contact
                </a>"""

content = content.replace(old_nav_links_mobile, new_nav_links_mobile)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Navbar updated.")
