#!/usr/bin/env bash
# Demo agent for the Quantum preview: prints a Claude-Code-like screen and reports a status (OSC 7501).
state=${1:-working}
osc(){ printf '\e]7501;state=%s:app=claude-code\a' "$1"; }
osc "$state"
G=$'\e[32m'; R=$'\e[0m'; D=$'\e[2m'; C=$'\e[36m'; Y=$'\e[33m'; B=$'\e[1m'; M=$'\e[35m'
draw(){
clear
if [ "$state" = working ]; then cat <<T
${B}●${R} Update(app.json)
  ⎿  Updated ${B}app.json${R} with 2 additions
      3      "version": "0.1.0",
      4      "icon": "./assets/app-icon-1024.png",
      5      "userInterfaceStyle": "light"

${B}●${R} Write(eas.json)
  ⎿  Created ${B}eas.json${R} (+24 -0)
${G}      1 + {${R}
${G}      2 +   "cli": {${R}
${G}      3 +     "version": ">=16.0.0",${R}
${G}      4 +     "appVersionSource": "remote"${R}
${G}      5 +   },${R}
${G}      6 +   "build": {${R}
${G}      7 +     "development": {${R}
${G}      8 +       "developmentClient": true,${R}
${G}      9 +       "distribution": "internal"${R}
${G}     10 +     },${R}
${G}     11 +     "production": { "autoIncrement": true }${R}
${G}     12 +   }${R}
${G}     13 + }${R}
  ⎿  ${D}Allowed by auto mode${R}

${B}●${R} Bash(git status)
  ⎿  On branch feat/warp-drive

${B}●${R} Bash(pnpm test)
  ⎿  ✓ 42 tests passed

${B}●${R} Bash(grep -E "not ok|^(pass|fail)" test.log)
  ⎿  pass 17

${B}●${R} Bash(npx tsx --test tests/integration.test.ts tests/sdk.test.ts)
  ⎿  Discovering tests… ✓
     Running 3 test suites… ✓
     config-reading tests…

${M}✻${R} Doing… (1m 17s · ↓ 4.3k tokens · thinking with medium effort)
T
else cat <<T
${B}●${R} The warp-drive endpoint is in place and all 42 tests pass.

  - Added the /v1/warp route with request validation.
  - Wrote integration tests for the happy path and two failure modes.

✻ Baked for 2m 4s · done 11:30 AM
T
fi
cols=$(tput cols)
line=$(printf '─%.0s' $(seq 1 $cols))
printf '%s\n%s\n%s\n' "$D$line$R" "${B}❯${R} " "$D$line$R"
printf '  %sOpus 5.5%s · %smedium%s %s|%s %s %sfeat/warp-drive%s %s|%s %sctx%s %s██████▊   %%68%s %s320k/1.0M%s %s|%s ↑320k ↓4k %s|%s limit 5s 34%% · 7g 31%%\n' "$C" "$R" "$M" "$R" "$D" "$R" "" "$Y" "$R" "$D" "$R" "$D" "$R" "$C" "$R" "$D" "$R" "$D" "$R" "$D" "$R"
printf '  %s⏵⏵ auto mode on%s (shift+tab to cycle)' "$Y" "$R"
}
trap draw WINCH
sleep 0.3; draw
while :; do sleep 20 & wait $!; osc "$state"; done
