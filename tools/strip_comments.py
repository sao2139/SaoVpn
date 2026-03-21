import os
import re

def strip_js_comments(content):
    # Matches /* ... */ and // ...
    # but carefully avoids matching URLs (http://)
    pattern = r'(\/\*[\s\S]*?\*\/)|(\/\/(?!\/).*)'
    def replacer(match):
        # if the match is part of a URL, keep it
        return ''
    
    # Actually, a simpler approach that ignores strings is safer, but standard quick regex:
    # We will use standard substitution for quick stripping, but handle http:// carefully
    content = re.sub(r'(?<!:)\/\/.*', '', content)
    content = re.sub(r'\/\*[\s\S]*?\*\/', '', content)
    return content

def strip_py_comments(content):
    # Remove # comments
    content = re.sub(r'(?<!["\'])#.*', '', content)
    # Remove triple quotes docstrings
    content = re.sub(r'\'\'\'[\s\S]*?\'\'\'', '', content)
    content = re.sub(r'\"\"\"[\s\S]*?\"\"\"', '', content)
    return content

files_to_clean = [
    r"c:\Users\Display\OneDrive\python felipe\SaoVpn\vpn_node\sao_vpn_router.js",
    r"c:\Users\Display\OneDrive\python felipe\SaoVpn\client_js\main.js",
    r"c:\Users\Display\OneDrive\python felipe\SaoVpn\quantum_core\quantum_random.py",
    r"c:\Users\Display\OneDrive\python felipe\SaoVpn\quantum_core\post_quantum.py",
    r"c:\Users\Display\OneDrive\python felipe\SaoVpn\quantum_core\quantum_keygen.py"
]

for fp in files_to_clean:
    if os.path.exists(fp):
        with open(fp, 'r', encoding='utf-8') as f:
            data = f.read()
        
        if fp.endswith('.js'):
            data = strip_js_comments(data)
        elif fp.endswith('.py'):
            data = strip_py_comments(data)

        # clean up multi-blank lines
        data = re.sub(r'\n\s*\n', '\n\n', data)

        with open(fp, 'w', encoding='utf-8') as f:
            f.write(data)
        print(f"Cleaned {fp}")
