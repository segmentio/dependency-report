module.exports = {
  branches: ['master'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/exec',
      {
        generateNotesCmd:
          'yarn version --new-version ${nextRelease.version} --no-git-tag-version --no-commit-hooks --silent && git add -u',
        publishCmd: 'yarn publish'
      }
    ],
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ]
}
