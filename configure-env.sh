#!/bin/bash
# Fills in .env and backend/.env: generates the JWT secret, and asks for the
# passwords (or generates them). Values already set can be kept. Safe to run
# again at any time.
set -e

cd "$(dirname "$0")"

ROOT_ENV=.env
BACKEND_ENV=backend/.env

# Letters and digits only: safe in .env files, URLs and shell commands.
random_secret() {
  LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c "$1" || true
}

# Current value of a variable in a .env file, without quotes.
get_var() {
  [ -f "$1" ] || return 0
  awk -v key="$2" 'index($0, key "=") == 1 { value = substr($0, length(key) + 2) } END { print value }' "$1" \
    | sed -e "s/^'\(.*\)'$/\1/" -e 's/^"\(.*\)"$/\1/'
}

# Sets a variable in a .env file, replacing its line or adding one. Values are
# single-quoted, so that dotenv and docker compose read them literally.
set_var() {
  KEY="$2" VALUE="'$3'" awk '
    BEGIN { key = ENVIRON["KEY"]; value = ENVIRON["VALUE"] }
    index($0, key "=") == 1 { print key "=" value; done = 1; next }
    { print }
    END { if (!done) print key "=" value }
  ' "$1" > "$1.tmp"
  mv "$1.tmp" "$1"
}

ask_yes_no() {
  local answer
  read -rp "$1 [y/N] " answer
  [[ "$answer" =~ ^[yY] ]]
}

# Asks for a password, or generates one when left empty. Sets $PASSWORD, and
# $GENERATED when it was generated.
ask_password() {
  local label="$1" min_length="$2" confirm
  GENERATED=

  while true; do
    read -rsp "$label (leave empty to generate one): " PASSWORD
    echo

    if [ -z "$PASSWORD" ]; then
      PASSWORD=$(random_secret 24)
      GENERATED=1
      return
    fi

    if [ "${#PASSWORD}" -lt "$min_length" ]; then
      echo "  Too short: at least $min_length characters."
      continue
    fi

    if [[ "$PASSWORD" == *"'"* ]]; then
      echo "  Single quotes are not allowed."
      continue
    fi

    read -rsp "Confirm: " confirm
    echo

    if [ "$PASSWORD" != "$confirm" ]; then
      echo "  The passwords do not match."
      continue
    fi

    return
  done
}

# Asks for a password unless one is already set and the user keeps it.
# Prints the generated ones at the end, since they are shown nowhere else.
SUMMARY=()

configure_password() {
  local file="$1" key="$2" label="$3" min_length="$4"

  if [ -n "$(get_var "$file" "$key")" ] && ! ask_yes_no "$label already set in $file. Change it?"; then
    return
  fi

  ask_password "$label" "$min_length"
  set_var "$file" "$key" "$PASSWORD"

  if [ -n "$GENERATED" ]; then
    SUMMARY+=("$label: $PASSWORD")
  fi
}

configure_jwt_secret() {
  local file="$1" current
  current=$(get_var "$file" JWT_SECRET)

  # The placeholder of backend/.env.example counts as unset.
  if [ -z "$current" ] || [ "$current" = "your-super-secret-key-change-in-production" ]; then
    set_var "$file" JWT_SECRET "$(random_secret 64)"
    echo "JWT secret generated in $file."
  fi
}

for file in "$ROOT_ENV" "$BACKEND_ENV"; do
  if [ ! -f "$file" ]; then
    cp "$file.example" "$file"
    echo "$file created from $file.example."
  fi
done

echo ""
echo "Environment to configure:"
echo "  1) Development (this machine)"
echo "  2) Production (server)"
read -rp "Choice [1]: " mode
echo ""

if [ "$mode" = "2" ]; then
  # docker-compose.yml takes these from the root .env; backend/.env only
  # gives the backend its MongoDB settings and public URLs.
  configure_jwt_secret "$ROOT_ENV"
  configure_password "$ROOT_ENV" ADMIN_PASSWORD "Admin password" 10
  echo "  (The MongoDB password only applies when the database is first created.)"
  configure_password "$ROOT_ENV" MONGO_ROOT_PASSWORD "MongoDB root password" 10
else
  configure_jwt_secret "$BACKEND_ENV"
  configure_password "$BACKEND_ENV" ADMIN_PASSWORD "Admin password" 10
fi

echo ""
echo "Configuration saved."

if [ "${#SUMMARY[@]}" -gt 0 ]; then
  echo ""
  echo "Generated passwords (write them down, they will not be shown again):"
  printf '  %s\n' "${SUMMARY[@]}"
fi

echo ""
echo "The admin password is only used to create the account on first start."
echo "After that, it is changed from the admin interface."
