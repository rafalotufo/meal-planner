"""Plan lookup regression checks using real Git snapshots and staged files."""

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


CHECKER = Path(__file__).resolve().parents[1] / "scripts" / "check_plan_sync.py"
NESTED_PLAN = "intent/home-page/plan.md"


class PlanLookupTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.repo = Path(self.directory.name)
        self.git("init", "-q")
        self.git("config", "user.name", "Plan Test")
        self.git("config", "user.email", "plan-test@example.invalid")
        self.write("README.md", "Fixture\n")
        self.git("add", ".")
        self.git("commit", "-qm", "initial")
        self.base = self.git("rev-parse", "HEAD").strip()

    def git(self, *args):
        return subprocess.check_output(
            ["git", "-C", str(self.repo), *args], text=True
        )

    def write(self, path, text):
        target = self.repo / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text)

    def plan(self, path=NESTED_PLAN, status="Approved", manifest="app/page.tsx"):
        self.write(path, f"# Plan\n- Status: {status}\n\n## Files that change\n- {manifest}\n")

    def graph(self, artifact=NESTED_PLAN):
        self.write(
            "workflow-graph.yaml",
            f"nodes:\n  plan:\n    artifact: {artifact}\n    gate: engineer_approve\n",
        )

    def implementation(self):
        self.write("app/page.tsx", "export default function Page() { return null; }\n")
        self.git("add", ".")

    def check(self, mode="hook", *extra):
        if mode == "pr":
            self.git("commit", "-qm", "implementation")
            options = ["--base", self.base, "--head", "HEAD"]
        else:
            options = ["--hook"]
        return subprocess.run(
            [sys.executable, str(CHECKER), *options, *extra],
            cwd=self.repo, capture_output=True, text=True,
        )

    def test_nested_plan_selected_by_graph_in_pr_mode(self):
        self.graph()
        self.plan()
        self.implementation()
        result = self.check("pr", "--graph", "workflow-graph.yaml")
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_nested_plan_selected_by_default_graph_in_hook_mode(self):
        self.graph()
        self.plan()
        self.implementation()
        self.plan(status="Draft")  # The staged approved version is authoritative.
        result = self.check()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_explicit_plan_overrides_graph(self):
        self.graph("intent/other/missing.md")
        self.plan()
        self.implementation()
        result = self.check("hook", "--plan", NESTED_PLAN)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_root_plan_remains_supported_without_graph(self):
        self.plan("plan.md")
        self.implementation()
        result = self.check()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_missing_selected_plan_does_not_fall_back_to_root(self):
        self.graph()
        self.plan("plan.md")
        self.implementation()
        result = self.check()
        self.assertEqual(result.returncode, 1)
        self.assertIn(NESTED_PLAN, result.stderr)

    def test_unapproved_nested_plan_is_rejected(self):
        self.graph()
        self.plan(status="Draft")
        self.implementation()
        result = self.check()
        self.assertEqual(result.returncode, 1)
        self.assertIn("not Approved", result.stderr)

    def test_nested_manifest_still_rejects_unplanned_file(self):
        self.graph()
        self.plan(manifest="app/layout.tsx")
        self.implementation()
        result = self.check()
        self.assertEqual(result.returncode, 1)
        self.assertIn("unplanned files", result.stderr)


if __name__ == "__main__":
    unittest.main()
