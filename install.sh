#!/bin/bash
# Claude Code Setup — установка на новое устройство
# Использование: bash install.sh

set -e

GITHUB_USER="Tangriznir"
CLAUDE_DIR="$HOME/.claude"
WORK_DIR="$HOME/Claude"

echo "=== Claude Code Setup ==="
echo ""
echo "Репозитории приватные. Нужен GitHub Personal Access Token."
echo "Создать токен: https://github.com/settings/tokens/new"
echo "Нужны права: repo (полный доступ к приватным репо)"
echo ""
read -rsp "Вставь токен (ввод скрыт): " GH_TOKEN < /dev/tty
echo ""

if [ -z "$GH_TOKEN" ]; then
    echo "Токен не введён. Выход."
    exit 1
fi

# Проверяем токен
echo "Проверяю токен..."
GH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GH_TOKEN" https://api.github.com/user)
if [ "$GH_STATUS" != "200" ]; then
    echo "Токен неверный (статус $GH_STATUS). Выход."
    exit 1
fi
echo "Токен OK."
echo ""

# Создаём папки
mkdir -p "$CLAUDE_DIR/skills"
mkdir -p "$WORK_DIR"

SETUP_DIR=$(mktemp -d)
MEMORY_DIR=$(mktemp -d)

# Клонируем через токен
echo "[1/3] Клонирую claude-setup..."
git clone "https://$GH_TOKEN@github.com/$GITHUB_USER/claude-setup.git" "$SETUP_DIR/claude-setup" --quiet

echo "[2/3] Клонирую claude-memory..."
git clone "https://$GH_TOKEN@github.com/$GITHUB_USER/claude-memory.git" "$MEMORY_DIR/claude-memory" --quiet

# Копируем навыки
echo "[3/3] Устанавливаю..."
cp -r "$SETUP_DIR/claude-setup/skills/"* "$CLAUDE_DIR/skills/"

# CLAUDE.md
cp "$SETUP_DIR/claude-setup/CLAUDE.md" "$WORK_DIR/CLAUDE.md"

# .mcp.json
if [ -f "$SETUP_DIR/claude-setup/.mcp.json" ]; then
    cp "$SETUP_DIR/claude-setup/.mcp.json" "$WORK_DIR/.mcp.json"
elif [ -f "$SETUP_DIR/claude-setup/mcp-config/.mcp.json" ]; then
    cp "$SETUP_DIR/claude-setup/mcp-config/.mcp.json" "$WORK_DIR/.mcp.json"
fi

# Память
MEMORY_TARGET="$CLAUDE_DIR/memory-backup"
mkdir -p "$MEMORY_TARGET"
cp "$MEMORY_DIR/claude-memory/"*.md "$MEMORY_TARGET/"

# Чистим временные папки (токен нигде не сохраняется)
rm -rf "$SETUP_DIR" "$MEMORY_DIR"

echo ""
echo "=== Готово! ==="
echo ""
echo "  Навыки:  $CLAUDE_DIR/skills/"
echo "  Конфиг:  $WORK_DIR/CLAUDE.md"
echo "  MCP:     $WORK_DIR/.mcp.json"
echo "  Память:  $MEMORY_TARGET/"
echo ""
echo "Запуск:"
echo "  cd $WORK_DIR && claude"
