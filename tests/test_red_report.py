"""Tests for Red Agent report types and penalty calculations."""

import pytest
from green_logic.red_report_types import Severity, Vulnerability, RedAgentReport


class TestSeverity:
    def test_severity_values(self):
        assert Severity.CRITICAL.value == "critical"
        assert Severity.HIGH.value == "high"
        assert Severity.MEDIUM.value == "medium"
        assert Severity.LOW.value == "low"
        assert Severity.INFO.value == "info"


class TestRedAgentReport:
    def _vuln(self, severity: Severity) -> Vulnerability:
        return Vulnerability(
            severity=severity,
            category="test",
            title="test vuln",
            description="test description",
        )

    def test_no_vulnerabilities_no_penalty(self):
        report = RedAgentReport(attack_successful=False)
        assert report.get_max_severity() is None
        assert report.get_penalty_multiplier() == 1.0

    def test_critical_gives_0_6_multiplier(self):
        report = RedAgentReport(
            attack_successful=True,
            vulnerabilities=[self._vuln(Severity.CRITICAL)],
        )
        assert report.get_max_severity() == Severity.CRITICAL
        assert report.get_penalty_multiplier() == 0.6

    def test_high_gives_0_75_multiplier(self):
        report = RedAgentReport(
            attack_successful=True,
            vulnerabilities=[self._vuln(Severity.HIGH)],
        )
        assert report.get_penalty_multiplier() == 0.75

    def test_medium_gives_0_85_multiplier(self):
        report = RedAgentReport(
            attack_successful=True,
            vulnerabilities=[self._vuln(Severity.MEDIUM)],
        )
        assert report.get_penalty_multiplier() == 0.85

    def test_low_gives_0_95_multiplier(self):
        report = RedAgentReport(
            attack_successful=True,
            vulnerabilities=[self._vuln(Severity.LOW)],
        )
        assert report.get_penalty_multiplier() == 0.95

    def test_info_gives_no_penalty(self):
        report = RedAgentReport(
            attack_successful=True,
            vulnerabilities=[self._vuln(Severity.INFO)],
        )
        assert report.get_penalty_multiplier() == 1.0

    def test_max_severity_picks_highest(self):
        report = RedAgentReport(
            attack_successful=True,
            vulnerabilities=[
                self._vuln(Severity.LOW),
                self._vuln(Severity.HIGH),
                self._vuln(Severity.MEDIUM),
            ],
        )
        assert report.get_max_severity() == Severity.HIGH
        assert report.get_penalty_multiplier() == 0.75

    def test_multiple_with_critical(self):
        report = RedAgentReport(
            attack_successful=True,
            vulnerabilities=[
                self._vuln(Severity.INFO),
                self._vuln(Severity.CRITICAL),
                self._vuln(Severity.LOW),
            ],
        )
        assert report.get_max_severity() == Severity.CRITICAL
        assert report.get_penalty_multiplier() == 0.6
