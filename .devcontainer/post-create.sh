#!/usr/bin/env bash
# Prepares a squad's Codespace: tools, the Context Nexus cloned next to the starter, assembled context.
# Also usable locally on macOS / Linux from the starter folder: bash .devcontainer/post-create.sh
set -euo pipefail

NEXUS_URL="${NEXUS_URL:-https://github.com/Zenika-Training/kolecto-sdlc-workshop-context-nexus.git}"
STARTER_DIR="$(pwd)"
SQUAD="${SQUAD:-$(cat .hackathon/squad 2>/dev/null || basename "$STARTER_DIR" | sed 's/^starter-//')}"
export PATH="$HOME/.local/bin:$PATH"

echo "▸ uv and Graphify"
command -v uv >/dev/null || curl -LsSf https://astral.sh/uv/install.sh | env UV_NO_MODIFY_PATH=1 sh
uv tool install --quiet "graphifyy==0.9.99" || echo "⚠ Graphify not installed: uv tool install graphifyy==0.9.99"

echo "▸ Claude Code"
# Pinned to the version tested in the Codespace crash test, so every participant gets the same one.
CLAUDE_VERSION="${CLAUDE_VERSION:-2.1.316}"
command -v claude >/dev/null || curl -fsSL https://claude.ai/install.sh | bash -s "$CLAUDE_VERSION"

# PATH, and empty secrets removed, for every new terminal.
grep -q 'AI-PDLC hackathon' "$HOME/.bashrc" 2>/dev/null || cat >> "$HOME/.bashrc" <<'RC'
# AI-PDLC hackathon
export PATH="$HOME/.local/bin:$PATH"
for v in ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN ANTHROPIC_BASE_URL; do [ -z "${!v:-}" ] && unset "$v"; done
RC

echo "▸ Context Nexus"
# A real folder inside the project (visible in the explorer), ignored by git; ../context-nexus links to it,
# so every command and instruction uses the same path, in a Codespace or locally.
NEXUS_REAL="$STARTER_DIR/context-nexus"
NEXUS_LINK="$(dirname "$STARTER_DIR")/context-nexus"
if [ -d "$NEXUS_LINK/teams" ] && [ ! -e "$NEXUS_REAL" ]; then
  echo "  using the existing $NEXUS_LINK"
else
  [ -d "$NEXUS_REAL/.git" ] || git clone --quiet "$NEXUS_URL" "$NEXUS_REAL"
  [ -e "$NEXUS_LINK" ] || ln -s "$NEXUS_REAL" "$NEXUS_LINK"
fi

# npm ci installs exactly the committed lockfile and leaves it untouched (npm install rewrote it in the container).
if [ -f package.json ]; then echo "▸ npm ci"; npm ci --silent || npm install --silent; fi

echo "▸ Context of $SQUAD"
npm run --silent context | tail -2

mkdir -p .hackathon && date -u +%FT%TZ > .hackathon/ready

echo
echo "✓ Ready."
echo "  1. Open a NEW terminal (+), then connect Claude: claude auth login"
echo "     Choose your Claude account, sign in, copy the code shown, paste it into the terminal."
echo "  2. Run claude, choose \"Yes, I trust this folder\" (the default is \"No, exit\"), then type /welcome"
