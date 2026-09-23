#!/bin/sh
set -e

# Replace __VITE_*__ placeholders in static assets with runtime environment values.
# Do NOT use %VITE_*% — Vite's HTML env syntax and percent-encoding mangle those.
if [ -d /usr/share/nginx/html ]; then
  for file in $(find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.html' -o -name '*.css' \)); do
    for var in $(env | grep '^VITE_' | cut -d= -f1); do
      eval "value=\$$var"
      # Escape sed replacement specials: \ & |
      escaped=$(printf '%s' "$value" | sed -e 's/[\\|&]/\\&/g')
      sed -i "s|__${var}__|${escaped}|g" "$file"
    done
  done
fi
