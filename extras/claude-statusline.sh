#!/usr/bin/env bash
# Claude Code durum satiri: model · effort | branch | context kullanimi/limit | oturum token | 5s limit
in=$(cat)

j() { jq -r "$1 // empty" <<<"$in" 2>/dev/null; }
k() { awk -v n="${1:-0}" 'BEGIN{ if(n>=1000000) printf "%.1fM", n/1000000; else if(n>=1000) printf "%.0fk", n/1000; else printf "%d", n }'; }

model=$(j '.model.display_name')
effort=$(j '.effort.level')
[ -z "$effort" ] && effort=${CLAUDE_EFFORT:-}
dir=$(j '.workspace.current_dir'); [ -z "$dir" ] && dir=$(j '.cwd')
branch=$(git -C "${dir:-.}" --no-optional-locks branch --show-current 2>/dev/null)
[ -z "$branch" ] && branch=$(git -C "${dir:-.}" --no-optional-locks rev-parse --short HEAD 2>/dev/null)

size=$(j '.context_window.context_window_size')
used=$(jq -r '.context_window.current_usage | if . == null then empty else ((.input_tokens//0)+(.cache_creation_input_tokens//0)+(.cache_read_input_tokens//0)) end' <<<"$in" 2>/dev/null)
pct=$(j '.context_window.used_percentage'); left=$(j '.context_window.remaining_percentage')
if [ -z "$pct" ] && [ -n "$used" ] && [ -n "$size" ] && [ "$size" -gt 0 ]; then pct=$(( used * 100 / size )); fi
tin=$(j '.context_window.total_input_tokens'); tout=$(j '.context_window.total_output_tokens')
rl=$(j '.rate_limits.five_hour.used_percentage'); rw=$(j '.rate_limits.seven_day.used_percentage')

c() { printf '\033[%sm%s\033[0m' "$1" "$2"; }
out="$(c 36 "${model:-?}")"
[ -n "$effort" ] && out+=" $(c 2 "·") $(c 35 "$effort")"
[ -n "$branch" ] && out+=" $(c 2 "|") $(c 33 " $branch")"
if [ -n "$size" ]; then
  p=${pct%.*}; l=${left%.*}; [ -z "$l" ] && l=$(( 100 - ${p:-0} ))
  # renk kalan context'e gore: turkuaz > %40, amber > %15, gul alti
  if [ "$l" -gt 40 ]; then fg="38;2;115;218;202"; elif [ "$l" -gt 15 ]; then fg="38;2;224;175;104"; else fg="38;2;247;118;142"; fi
  track="48;2;41;46;66"
  parts=("" "▏" "▎" "▍" "▌" "▋" "▊" "▉")
  e=$(( l * 80 / 100 )); bar=""
  for ((i=0;i<10;i++)); do r=$(( e - i*8 )); if [ $r -ge 8 ]; then bar+="█"; elif [ $r -gt 0 ]; then bar+="${parts[$r]}"; else bar+=" "; fi; done
  out+=" $(c 2 "|") $(c 2 ctx) $(c "$fg;$track" "$bar") $(c "1;$fg" "%$l") $(c 2 "$(k "${used:-0}")/$(k "$size")")"
fi
[ -n "$tin$tout" ] && out+=" $(c 2 "|") ↑$(k "${tin:-0}") ↓$(k "${tout:-0}")"
lim=""; [ -n "$rl" ] && lim+="5s ${rl%.*}%"; [ -n "$rw" ] && lim+="${lim:+ · }7g ${rw%.*}%"
[ -n "$lim" ] && out+=" $(c 2 "|") limit $lim"
printf '%s' "$out"
