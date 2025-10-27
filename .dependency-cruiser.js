/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-frontend-to-backend',
      severity: 'error',
      comment:
        'This rule prevents the frontend from depending on backend code (server or core).',
      from: {
        path: '^packages/frontend',
      },
      to: {
        path: ['^packages/server', '^packages/core'],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
