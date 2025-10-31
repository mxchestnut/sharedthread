#!/usr/bin/env bash
# Cleanup GitHub Actions runs and artifacts
# Usage:
#   chmod +x scripts/cleanup-actions-runs.sh
#   scripts/cleanup-actions-runs.sh            # dry-run keep last 10 per workflow on main
#   MODE=older-than CUTOFF="2025-10-01T00:00:00Z" scripts/cleanup-actions-runs.sh
#   MODE=keep KEEP_PER_WORKFLOW=5 BRANCH=main scripts/cleanup-actions-runs.sh
#   MODE=artifacts scripts/cleanup-actions-runs.sh
#   MODE=logs scripts/cleanup-actions-runs.sh
#
# Requires: GitHub CLI (gh) authenticated (gh auth login)
# Notes: This script operates on the repository indicated by REPO or by auto-detecting origin remote.

set -euo pipefail

# Config via environment variables (override when invoking)
REPO="${REPO:-}"
BRANCH="${BRANCH:-main}"
STATUS="${STATUS:-completed}"        # typical values: completed, success, failure
MODE="${MODE:-keep}"                  # keep | older-than | artifacts | logs
KEEP_PER_WORKFLOW="${KEEP_PER_WORKFLOW:-10}"
CUTOFF="${CUTOFF:-}"                  # ISO 8601 timestamp, e.g., 2025-10-01T00:00:00Z
DRY_RUN="${DRY_RUN:-true}"            # true | false

# --- Helpers ---
err() { echo "[ERR] $*" >&2; }
log() { echo "[INFO] $*"; }

require_cmd() { command -v "$1" >/dev/null 2>&1 || { err "Missing command: $1"; exit 1; }; }

require_cmd gh

# Resolve REPO if not provided
if [[ -z "$REPO" ]]; then
  if git rev-parse --show-toplevel >/dev/null 2>&1; then
    origin_url=$(git remote get-url origin 2>/dev/null || echo "")
    if [[ "$origin_url" =~ github.com[:/](.+/.+)\.git$ ]]; then
      REPO="${BASH_REMATCH[1]}"
    elif [[ "$origin_url" =~ github.com[:/](.+/.+)$ ]]; then
      REPO="${BASH_REMATCH[1]}"
    else
      err "Could not infer REPO from origin remote. Set REPO=owner/name."
      exit 1
    fi
  else
    err "Not in a git repo. Set REPO=owner/name."
    exit 1
  fi
fi

log "Repository: $REPO"
log "Mode: $MODE"
log "Branch filter: $BRANCH"
log "Status filter: $STATUS"
log "Keep per workflow: $KEEP_PER_WORKFLOW"
log "Cutoff: ${CUTOFF:-<none>}"
log "Dry run: $DRY_RUN"

# Confirm gh auth
if ! gh auth status >/dev/null 2>&1; then
  err "GitHub CLI not authenticated. Run: gh auth login"
  exit 1
fi

# Deletion wrappers
delete_run() {
  local id="$1"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "DRY RUN - would delete run $id"
  else
    gh api -X DELETE repos/$REPO/actions/runs/$id >/dev/null && echo "Deleted run $id" || echo "Failed to delete run $id"
  fi
}

delete_artifact() {
  local id="$1"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "DRY RUN - would delete artifact $id"
  else
    gh api -X DELETE repos/$REPO/actions/artifacts/$id >/dev/null && echo "Deleted artifact $id" || echo "Failed to delete artifact $id"
  fi
}

# --- Modes ---
if [[ "$MODE" == "artifacts" ]]; then
  log "Deleting all artifacts (respecting DRY_RUN)"
  gh api repos/$REPO/actions/artifacts --paginate -q '.artifacts[].id' | while read -r AID; do
    [[ -n "$AID" ]] && delete_artifact "$AID"
  done
  exit 0
fi

if [[ "$MODE" == "logs" ]]; then
  log "Deleting logs for all runs (respecting DRY_RUN)"
  gh api repos/$REPO/actions/runs --paginate -q '.workflow_runs[].id' | while read -r RID; do
    [[ -z "$RID" ]] && continue
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "DRY RUN - would delete logs for run $RID"
    else
      gh api -X DELETE repos/$REPO/actions/runs/$RID/logs >/dev/null && echo "Deleted logs for $RID" || echo "Failed logs delete for $RID"
    fi
  done
  exit 0
fi

# For keep/older-than modes, iterate workflows for clearer control
log "Fetching workflows…"

if [[ "$MODE" == "keep" ]]; then
  log "Keeping last $KEEP_PER_WORKFLOW runs per workflow on branch=$BRANCH, status=$STATUS"
  gh api repos/$REPO/actions/workflows -q '.workflows[] | "\(.id)\t\(.name)"' \
  | while IFS=$'\t' read -r wid wname; do
      [[ -z "$wid" ]] && continue
      log "Workflow: $wname ($wid)"
      # Get runs newest first for this workflow, filtered to branch/status
      runs_json=$(gh api repos/$REPO/actions/workflows/$wid/runs --paginate)
      # Build list of run ids after keeping the most recent N
    echo "$runs_json" \
    | jq -r --arg branch "$BRANCH" --arg status "$STATUS" --argjson keep "$KEEP_PER_WORKFLOW" '
      .workflow_runs
      | map(select(.head_branch==$branch and (.status==$status or .conclusion!=null)))
      | sort_by(.created_at) | reverse | .[$keep:]
      | .[]? | "\(.id)\t\(.created_at)"' | while IFS=$'\t' read -r rid rts; do
          [[ -z "$rid" ]] && continue
          echo "Deleting run $rid ($rts)"
          delete_run "$rid"
        done
    done
  exit 0
fi

if [[ "$MODE" == "older-than" ]]; then
  if [[ -z "$CUTOFF" ]]; then
    err "CUTOFF is required for MODE=older-than (e.g., 2025-10-01T00:00:00Z)"
    exit 1
  fi
  log "Deleting runs older than $CUTOFF on branch=$BRANCH, status=$STATUS"
  gh api repos/$REPO/actions/workflows -q '.workflows[] | "\(.id)\t\(.name)"' \
  | while IFS=$'\t' read -r wid wname; do
      [[ -z "$wid" ]] && continue
      log "Workflow: $wname ($wid)"
      runs_json=$(gh api repos/$REPO/actions/workflows/$wid/runs --paginate)
      echo "$runs_json" \
      | jq -r --arg branch "$BRANCH" --arg status "$STATUS" --arg cutoff "$CUTOFF" '
        .workflow_runs
        | map(select(.head_branch==$branch and (.status==$status or .conclusion!=null) and (.created_at < $cutoff)))
        | sort_by(.created_at)
        | .[]? | "\(.id)\t\(.created_at)"' | while IFS=$'\t' read -r rid rts; do
          [[ -z "$rid" ]] && continue
          echo "Deleting run $rid ($rts)"
          delete_run "$rid"
        done
    done
  exit 0
fi

err "Unknown MODE: $MODE. Use keep | older-than | artifacts | logs"
exit 1
