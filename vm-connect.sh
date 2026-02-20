#!/usr/bin/env bash
set -euo pipefail

# Default connection values (can be overridden by env vars or CLI args)
SSH_IP="${SSH_IP:-20.157.92.3}"
SSH_PORT="${SSH_PORT:-22}"
SSH_USER="${SSH_USER:-vsn}"
SSH_PASSWORD="${SSH_PASSWORD:-Vsnint@2026+}"

usage() {
  cat <<EOF
Usage: ${0##*/} [user@]host [port] [password]
Environment variables SSH_IP, SSH_USER, SSH_PORT, SSH_PASSWORD override defaults.
EOF
}

# allow overriding via positional args
if [ "$#" -ge 1 ]; then
  input="$1"
  if [[ "$input" == *@* ]]; then
    SSH_USER="${input%@*}"
    SSH_IP="${input#*@}"
  else
    SSH_IP="$input"
  fi
fi
[ "$#" -ge 2 ] && SSH_PORT="$2"
[ "$#" -ge 3 ] && SSH_PASSWORD="$3"

if [ -z "${SSH_IP:-}" ] || [ -z "${SSH_USER:-}" ]; then
  echo "ERROR: SSH_IP and SSH_USER must be set (env or args)."
  usage
  exit 1
fi

# Prefer sshpass if available
if command -v sshpass >/dev/null 2>&1; then
  sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_IP"
  exit $?
fi

# Fallback to expect (inline) if available
if command -v expect >/dev/null 2>&1; then
  expect <<EXPECT_EOF
set timeout -1
spawn ssh -o StrictHostKeyChecking=no -p $SSH_PORT $SSH_USER@$SSH_IP
expect {
  -re "Are you sure you want to continue connecting" { send "yes\r"; exp_continue }
  -re "(P|p)assword:" { send "$SSH_PASSWORD\r" }
}
interact
EXPECT_EOF
  exit $?
fi

# Final fallback: interactive ssh (user will be prompted)
cat <<-MSG
Neither 'sshpass' nor 'expect' are installed. Falling back to interactive ssh (you'll be prompted for the password).
To automate password login install one of:
  - sshpass (Debian/Ubuntu: sudo apt install sshpass)
  - expect  (Debian/Ubuntu: sudo apt install expect)
MSG
ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_IP"
