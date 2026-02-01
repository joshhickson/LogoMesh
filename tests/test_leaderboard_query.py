
import unittest
import duckdb
import json
import os

class TestLeaderboardQuery(unittest.TestCase):
    def setUp(self):
        # Create an in-memory DuckDB connection
        self.con = duckdb.connect(database=':memory:')

        # Load the leaderboard configuration
        with open('leaderboard.json', 'r') as f:
            self.config = json.load(f)

        # Create a mock 'results' table matching the schema implied by the query
        self.con.execute("""
            CREATE TABLE results (
                submission_name VARCHAR,
                rationale_score DOUBLE,
                architecture_score DOUBLE,
                testing_score DOUBLE,
                logic_score DOUBLE,
                red_penalty_applied DOUBLE,
                timestamp TIMESTAMP,
                red_analysis STRUCT(vulnerability_count INTEGER, max_severity VARCHAR)
            )
        """)

        # Insert sample data
        # Case 1: Perfect score (all 1.0, no penalty)
        # Case 2: Good score (0.8s, no penalty)
        # Case 3: Penalized score (0.8s, 0.5 penalty)
        self.con.execute("""
            INSERT INTO results VALUES
            ('perfect_agent', 1.0, 1.0, 1.0, 1.0, 1.0, '2026-02-05 10:00:00', {'vulnerability_count': 0, 'max_severity': 'none'}),
            ('good_agent', 0.8, 0.8, 0.8, 0.8, 1.0, '2026-02-05 10:05:00', {'vulnerability_count': 0, 'max_severity': 'none'}),
            ('vulnerable_agent', 0.8, 0.8, 0.8, 0.8, 0.5, '2026-02-05 10:10:00', {'vulnerability_count': 5, 'max_severity': 'critical'})
        """)

    def test_main_leaderboard_calculation(self):
        """Test that the main leaderboard query correctly calculates CIS."""
        query = self.config['queries']['main_leaderboard']
        df = self.con.execute(query).df()

        # Check Perfect Agent: (1.0 * 0.25 * 4) * 1.0 = 1.0
        row_perfect = df[df['submission_name'] == 'perfect_agent'].iloc[0]
        self.assertAlmostEqual(row_perfect['cis_score'], 1.0)

        # Check Good Agent: (0.8 * 0.25 * 4) * 1.0 = 0.8
        row_good = df[df['submission_name'] == 'good_agent'].iloc[0]
        self.assertAlmostEqual(row_good['cis_score'], 0.8)

        # Check Vulnerable Agent: (0.8 * 0.25 * 4) * 0.5 = 0.4
        row_vuln = df[df['submission_name'] == 'vulnerable_agent'].iloc[0]
        self.assertAlmostEqual(row_vuln['cis_score'], 0.4)

    def test_security_audit_view(self):
        """Test that the security audit view filters correctly."""
        query = self.config['queries']['security_audit']
        df = self.con.execute(query).df()

        # Should only contain the vulnerable agent
        self.assertEqual(len(df), 1)
        self.assertEqual(df.iloc[0]['submission_name'], 'vulnerable_agent')
        self.assertEqual(df.iloc[0]['vulnerability_count'], 5)

if __name__ == '__main__':
    unittest.main()
