#!/usr/bin/env python3
"""Crea puzzlebee-offline.html: tutto il gioco in un solo file da scaricare e aprire senza internet."""
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
css = (root / 'css/style.css').read_text()
scripts = re.findall(r'<script src="([^"]+)"></script>', html)
js = '\n'.join((root / s).read_text() for s in scripts).replace('</script>', '<\\/script>')
head = html.split('<link rel="manifest"')[0]
out = f'''{head}<style>
{css}
</style>
</head>
<body>
  <div id="app"></div>
  <script>
{js}
  </script>
</body>
</html>
'''
(root / 'puzzlebee-offline.html').write_text(out)
print('puzzlebee-offline.html', len(out), 'byte')
