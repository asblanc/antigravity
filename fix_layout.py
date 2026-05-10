import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix MemberDashboardView
content = content.replace("""      {/* Dashboard Nav */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gold hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" /> Retour au site
          </button>

      <div className="sticky top-0 z-40 bg-green-darker/80 backdrop-blur-md border-b border-gold/10 px-6 py-6">
        <div className="flex items-center justify-between max-w-lg mx-auto">""", 
"""      {/* Dashboard Nav */}
      <div className="sticky top-0 z-40 bg-green-darker/80 backdrop-blur-md border-b border-gold/10 px-6 py-6">
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="self-start flex items-center gap-2 text-gold hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
          </button>
          <div className="flex items-center justify-between">""")

# Fix PartnerDashboardView
content = content.replace("""      {/* Partner Nav */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gold hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" /> Retour au site
          </button>

      <div className="sticky top-0 z-40 bg-green-darker/80 backdrop-blur-md border-b border-gold/10 px-6 py-6">
        <div className="flex items-center justify-between max-w-lg mx-auto">""", 
"""      {/* Partner Nav */}
      <div className="sticky top-0 z-40 bg-green-darker/80 backdrop-blur-md border-b border-gold/10 px-6 py-6">
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="self-start flex items-center gap-2 text-gold hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
          </button>
          <div className="flex items-center justify-between">""")

# In the components we changed from div flex to div flex-col -> div flex. 
# We need to close the extra div we wrapped around them? No, we just added a button and wrapped the existing flex in a flex-col, but the existing flex row needs its closing tags to be correct.
# Wait, let's just make it simpler. I'll use multi_replace_file_content.
