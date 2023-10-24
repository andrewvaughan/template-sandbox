# Test payloads

These payloads provide event scenarios to `act` to test. More details hre:

<https://github.com/nektos/act/blob/master/README.md#events>

For information on GitHub payloads:

https://docs.github.com/en/webhooks/webhook-events-and-payloads

## Running with payloads

Event payloads are loaded with the `-e` command. To test an issue being assigned, for instance:

```sh
act \
  -rm \
  -s GITHUB_TOKEN=$(gh auth token) \
  -e .github/workflows/tests/payloads/issue-assigned.json \
  -j auto-issue-assign-user \
  issues
```

## Payloads

| Payload               |  Event   | Purpose                                     |
| :-------------------- | :------: | :------------------------------------------ |
| `issue-assigned.json` | `issues` | Mocks assigning Issue #1 to `andrewvaughan` |
