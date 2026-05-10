import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace any double navigate declarations
# const navigate = useNavigate();
# const navigate = useNavigate();
# (ignoring leading whitespace)

pattern = r'(?:[ \t]*const navigate = useNavigate\(\);\n){2,}'
content = re.sub(pattern, '  const navigate = useNavigate();\n', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Duplicates removed.")
