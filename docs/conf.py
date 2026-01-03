import os
import sys
sys.path.insert(0, os.path.abspath('..'))

project = 'LogoMesh'
copyright = '2026, LogoMesh Team'
author = 'Josh, Deepti, Alaa, Garrett, Samuel, Kuan, Mark'

extensions = [
    'myst_parser',
    'sphinx_rtd_theme',
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
    'sphinx_design',
    'sphinxcontrib.mermaid'
]

# MyST Configuration
myst_enable_extensions = [
    "colon_fence",
    "deflist",
]
source_suffix = {
    '.rst': 'restructuredtext',
    '.md': 'markdown',
}

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store', 'node_modules']

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
